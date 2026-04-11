"use client";

import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Match } from "@/data/mockData";
import { IntroLanding, type IntroPhase } from "@/components/IntroLanding";
import { createFallbackFootballSnapshot } from "@/lib/football/fallback";
import type { FootballSnapshot, RefreshResult } from "@/lib/football/types";
import {
  DEFAULT_LOCALE,
  HOME_COPY,
  LOCALE_STORAGE_KEY,
  normalizeLocale,
  translateRefreshMessage,
  type Locale
} from "@/lib/i18n/ui";

type ViewMode = "globe" | "flat";

const MapComponent = dynamic(
  () => import("@/components/MapComponent").then((module) => module.MapComponent),
  { ssr: false }
);
const TeamSidebar = dynamic(
  () => import("@/components/TeamSidebar").then((module) => module.TeamSidebar),
  { ssr: false }
);
const WorldDetailMap = dynamic(
  () => import("@/components/WorldDetailMap").then((module) => module.WorldDetailMap),
  { ssr: false }
);

export default function HomePage() {
  const AUTO_REFRESH_COOLDOWN_MS = 3 * 60 * 1000;
  const mainRef = useRef<HTMLElement | null>(null);
  const autoRefreshAtRef = useRef(new Map<string, number>());
  const inFlightRefreshRef = useRef(new Set<string>());
  const prefersReducedMotion = useReducedMotion();
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  const [snapshot, setSnapshot] = useState<FootballSnapshot>(() => createFallbackFootballSnapshot());
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("globe");
  const [introPhase, setIntroPhase] = useState<IntroPhase>("idle");
  const [introTarget, setIntroTarget] = useState<{ x: number; y: number; size: number } | null>(
    null
  );
  const [refreshMessages, setRefreshMessages] = useState<Record<string, string | null>>({});
  const [refreshingTeamIds, setRefreshingTeamIds] = useState<string[]>([]);
  const [shouldMountExperience, setShouldMountExperience] = useState(false);
  const copy = HOME_COPY[locale];
  const isCountryMode = viewMode === "flat";
  const isIntroVisible = introPhase !== "revealed";
  const languageDockClass = isIntroVisible
    ? "bottom-8 right-4 sm:bottom-10 sm:right-6"
    : isCountryMode
      ? "bottom-12 right-4 sm:bottom-14 sm:right-6"
      : "bottom-32 right-4 sm:bottom-32 sm:right-6";
  const languageDockStyle = selectedTeamId
    ? { right: "calc(min(24rem, calc(100vw - 2rem)) + 1rem)" }
    : undefined;
  const clubMap = useMemo(
    () => Object.fromEntries(snapshot.clubs.map((team) => [team.id, team])),
    [snapshot.clubs]
  );
  const nationalTeamMap = useMemo(
    () => Object.fromEntries(snapshot.nationalTeams.map((team) => [team.id, team])),
    [snapshot.nationalTeams]
  );
  const globeHotTeamIds = useMemo(
    () =>
      snapshot.globeHotNationalTeams
        .filter((entry) => entry.showInGlobeOverview)
        .map((entry) => entry.id),
    [snapshot.globeHotNationalTeams]
  );
  const activeNationalMatches = useMemo(() => {
    if (snapshot.source !== "api-football") {
      return snapshot.nationalMatches;
    }

    const hotTeams = snapshot.nationalTeams.filter((team) => globeHotTeamIds.includes(team.id));
    const aliasMap = new Map<string, string>();
    const today = new Date();
    const todayLabel = `${`${today.getMonth() + 1}`.padStart(2, "0")}-${`${today.getDate()}`.padStart(2, "0")}`;

    const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

    hotTeams.forEach((team) => {
      aliasMap.set(normalize(team.name), team.id);
      aliasMap.set(normalize(team.country), team.id);
      aliasMap.set(normalize(team.shortName), team.id);
    });

    const deduped = new Map<string, Match>();

    hotTeams.forEach((team, index) => {
      const detail = snapshot.nationalTeamDetails[team.id];
      const fixture = detail?.nextFixture;

      if (!fixture) {
        return;
      }

      const isMatchDay = fixture.status === "live" || fixture.dateLabel.startsWith(todayLabel);

      if (!isMatchDay) {
        return;
      }

      const opponentId = aliasMap.get(normalize(fixture.opponent));

      if (!opponentId || opponentId === team.id) {
        return;
      }

      const [homeTeamId, awayTeamId] = [team.id, opponentId].sort();
      const pairId = `${homeTeamId}__${awayTeamId}`;

      if (deduped.has(pairId)) {
        return;
      }

      deduped.set(pairId, {
        id: pairId,
        homeTeamId,
        awayTeamId,
        competition: fixture.competition,
        minute: fixture.minute ?? 0,
        score: fixture.score ?? "vs",
        narrative: fixture.note,
        intensity: fixture.status === "live" ? 0.92 : 0.74,
        phase: index * 0.37
      });
    });

    const liveMatches = Array.from(deduped.values());

    if (liveMatches.length >= 4) {
      return liveMatches;
    }

    const merged = new Map<string, Match>();

    [...liveMatches, ...snapshot.nationalMatches].forEach((match) => {
      const pairKey = [match.homeTeamId, match.awayTeamId].sort().join("__");

      if (!merged.has(pairKey)) {
        merged.set(pairKey, match);
      }
    });

    return Array.from(merged.values());
  }, [
    globeHotTeamIds,
    snapshot.nationalMatches,
    snapshot.nationalTeamDetails,
    snapshot.nationalTeams,
    snapshot.source
  ]);

  const handleSelectTeam = (teamId: string) => {
    setSelectedTeamId(teamId);
    setRefreshMessages((current) => ({
      ...current,
      [teamId]: null
    }));
  };

  const handleEnterFlatView = () => {
    setSelectedTeamId(null);
    setViewMode("flat");
  };

  const handleExitFlatView = () => {
    setViewMode("globe");
  };

  const handleStartIntro = () => {
    setSelectedTeamId(null);
    setViewMode("globe");
    setIntroPhase("launching");
  };

  const handleRefreshTeamRef = useRef<(teamId: string, options?: { force?: boolean }) => Promise<void>>(
    async () => undefined
  );

  handleRefreshTeamRef.current = async (teamId: string, options?: { force?: boolean }) => {
    const now = Date.now();
    const lastRefreshAt = autoRefreshAtRef.current.get(teamId) ?? 0;

    if (!options?.force && now - lastRefreshAt < AUTO_REFRESH_COOLDOWN_MS) {
      return;
    }

    if (inFlightRefreshRef.current.has(teamId)) {
      return;
    }

    inFlightRefreshRef.current.add(teamId);
    setRefreshingTeamIds((current) => (current.includes(teamId) ? current : [...current, teamId]));
    setRefreshMessages((current) => ({
      ...current,
      [teamId]: null
    }));

    try {
      const response = await fetch(`/api/football/refresh/${teamId}`, {
        method: "POST"
      });
      const payload = (await response.json()) as RefreshResult;

      setSnapshot((current) => {
        const nextClubs =
          payload.team && !payload.isNationalTeam
            ? current.clubs.map((entry) => (entry.id === payload.teamId ? payload.team! : entry))
            : current.clubs;
        const nextNationalTeams =
          payload.team && payload.isNationalTeam
            ? current.nationalTeams.map((entry) => (entry.id === payload.teamId ? payload.team! : entry))
            : current.nationalTeams;

        return {
          ...current,
          source: payload.source ?? current.source,
          updatedAt: payload.updatedAt ?? current.updatedAt,
          clubs: nextClubs,
          nationalTeams: nextNationalTeams,
          clubDetails:
            payload.detail && !payload.isNationalTeam
              ? { ...current.clubDetails, [payload.teamId]: payload.detail }
              : current.clubDetails,
          nationalTeamDetails:
            payload.detail && payload.isNationalTeam
              ? { ...current.nationalTeamDetails, [payload.teamId]: payload.detail }
              : current.nationalTeamDetails,
          nationalMatches: payload.nationalMatches ?? current.nationalMatches
        };
      });
      setRefreshMessages((current) => ({
        ...current,
        [teamId]: payload.message
      }));
    } catch (error) {
      setRefreshMessages((current) => ({
        ...current,
        [teamId]: error instanceof Error ? error.message : "同步失败，已保留当前缓存/历史档案"
      }));
    } finally {
      autoRefreshAtRef.current.set(teamId, Date.now());
      inFlightRefreshRef.current.delete(teamId);
      setRefreshingTeamIds((current) => current.filter((entry) => entry !== teamId));
    }
  };

  useEffect(() => {
    const storedLocale = normalizeLocale(window.localStorage.getItem(LOCALE_STORAGE_KEY));
    setLocale(storedLocale);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }, [locale]);

  useEffect(() => {
    const main = mainRef.current;

    if (!main) {
      return;
    }

    const preventPageZoom = (event: WheelEvent) => {
      if (event.ctrlKey) {
        event.preventDefault();
      }
    };

    const preventGestureZoom = (event: Event) => {
      event.preventDefault();
    };

    main.addEventListener("wheel", preventPageZoom, { passive: false });
    main.addEventListener("gesturestart", preventGestureZoom as EventListener, {
      passive: false
    });
    main.addEventListener("gesturechange", preventGestureZoom as EventListener, {
      passive: false
    });

    return () => {
      main.removeEventListener("wheel", preventPageZoom);
      main.removeEventListener("gesturestart", preventGestureZoom as EventListener);
      main.removeEventListener("gesturechange", preventGestureZoom as EventListener);
      };
  }, []);

  useEffect(() => {
    const teamId = new URLSearchParams(window.location.search).get("team");

    if (teamId) {
      setSelectedTeamId(teamId);
    }
  }, []);

  useEffect(() => {
    if (!selectedTeamId) {
      return;
    }

    if (!clubMap[selectedTeamId] && !nationalTeamMap[selectedTeamId]) {
      return;
    }

    void handleRefreshTeamRef.current(selectedTeamId);
  }, [clubMap, nationalTeamMap, selectedTeamId]);

  useEffect(() => {
    if (introPhase !== "launching") {
      return;
    }

    const timeoutId = window.setTimeout(
      () => setIntroPhase("revealed"),
      prefersReducedMotion ? 620 : 4050
    );

    return () => window.clearTimeout(timeoutId);
  }, [introPhase, prefersReducedMotion]);

  useEffect(() => {
    const timeoutId = window.setTimeout(
      () => setShouldMountExperience(true),
      prefersReducedMotion ? 120 : 960
    );

    return () => window.clearTimeout(timeoutId);
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (!shouldMountExperience) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const response = await fetch("/api/football/snapshot", {
          cache: "no-store"
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as FootballSnapshot;

        if (!cancelled) {
          setSnapshot(payload);
        }
      } catch {
        // Keep fallback snapshot on network or route failure.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [shouldMountExperience]);

  return (
    <main ref={mainRef} className="relative h-screen overflow-hidden bg-cyber-bg text-white">
      <motion.div
        animate={
          isIntroVisible
            ? {
                opacity: introPhase === "launching" ? 1 : 0,
                scale: 1,
                filter: "blur(0px) saturate(1)"
              }
            : {
                opacity: 1,
                scale: 1,
                filter: "blur(0px) saturate(1)"
              }
        }
        transition={
          introPhase === "launching" && !prefersReducedMotion
            ? {
                opacity: { duration: 1.26, delay: 1.46, ease: [0.16, 1, 0.3, 1] },
                scale: { duration: 0.01 },
                filter: { duration: 0.01 }
              }
            : { duration: prefersReducedMotion ? 0.3 : 0.7, ease: [0.16, 1, 0.3, 1] }
        }
        className={`${isIntroVisible ? "pointer-events-none" : "pointer-events-auto"} absolute inset-0`}
      >
        {shouldMountExperience ? (
          isCountryMode ? (
            <WorldDetailMap
              locale={locale}
              selectedTeamId={selectedTeamId}
              onSelectTeam={handleSelectTeam}
              teams={snapshot.clubs}
              teamMap={clubMap}
            />
          ) : (
            <MapComponent
              locale={locale}
              selectedTeamId={selectedTeamId}
              onSelectTeam={handleSelectTeam}
              visibleTeamIds={globeHotTeamIds}
              nationalTeams={snapshot.nationalTeams}
              nationalTeamMap={nationalTeamMap}
              nationalMatches={activeNationalMatches}
              globeHotNationalTeams={snapshot.globeHotNationalTeams}
              presentationPhase={introPhase}
              onPresentationTargetChange={setIntroTarget}
            />
          )
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(70,255,182,0.08),transparent_24%),radial-gradient(circle_at_80%_72%,rgba(90,255,218,0.05),transparent_22%),linear-gradient(180deg,rgba(1,4,7,0.7),rgba(2,5,10,0.96))]" />
        )}
      </motion.div>

      <div className="pointer-events-none absolute inset-0 bg-grid-radial opacity-80" />

      <div
        className={`absolute z-50 flex items-center gap-2 ${languageDockClass}`}
        style={languageDockStyle}
      >
        <div className="rounded-full border border-cyan-200/12 bg-black/42 p-1 backdrop-blur-xl">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setLocale("zh")}
              className={`rounded-full px-3 py-2 text-[10px] tracking-[0.22em] transition ${
                locale === "zh"
                  ? "bg-cyan-200/14 text-cyan-50"
                  : "text-white/56 hover:text-white/82"
              }`}
              aria-label={`${copy.languageLabel} Chinese`}
            >
              中文
            </button>
            <button
              type="button"
              onClick={() => setLocale("en")}
              className={`rounded-full px-3 py-2 text-[10px] tracking-[0.22em] transition ${
                locale === "en"
                  ? "bg-cyan-200/14 text-cyan-50"
                  : "text-white/56 hover:text-white/82"
              }`}
              aria-label={`${copy.languageLabel} English`}
            >
              EN
            </button>
          </div>
        </div>
      </div>

      {!isIntroVisible ? (
        <div className="pointer-events-none absolute left-4 top-4 z-30 max-w-[18rem] rounded-2xl border border-cyan-200/10 bg-black/34 px-4 py-3 backdrop-blur-xl sm:left-6 sm:top-6">
          <div className="text-[10px] tracking-[0.24em] text-cyan-50/52">{copy.modeTitle}</div>
          <div className="mt-2 text-sm leading-6 text-white/84">
            {isCountryMode ? copy.flatDescription : copy.globeDescription}
          </div>
        </div>
      ) : null}

      {!isIntroVisible ? (
        <div className="absolute right-4 top-4 z-30 flex w-[11.5rem] flex-col gap-2 sm:right-6 sm:top-6">
          <button
            type="button"
            onClick={() => (isCountryMode ? handleExitFlatView() : handleEnterFlatView())}
            className="rounded-2xl border border-cyan-200/15 bg-black/42 px-4 py-3 text-left text-[11px] tracking-[0.22em] text-cyan-50 backdrop-blur-xl transition duration-300 hover:border-cyan-200/35 hover:bg-cyan-200/10"
          >
            {isCountryMode ? copy.showGlobe : copy.showFlatMap}
          </button>
        </div>
      ) : null}

      {!isIntroVisible ? (
        <TeamSidebar
          locale={locale}
          selectedTeamId={selectedTeamId}
          onClose={() => setSelectedTeamId(null)}
          clubMap={clubMap}
          nationalTeamMap={nationalTeamMap}
          clubDetails={snapshot.clubDetails}
          nationalTeamDetails={snapshot.nationalTeamDetails}
          refreshMessage={
            selectedTeamId
              ? refreshingTeamIds.includes(selectedTeamId)
                ? copy.refreshing
                : translateRefreshMessage(locale, refreshMessages[selectedTeamId] ?? null)
              : null
          }
        />
      ) : null}

      {!isIntroVisible && isCountryMode ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-4 z-[45] flex justify-center px-4 sm:bottom-5">
          <div className="rounded-full border border-white/8 bg-black/28 px-4 py-2 text-center text-[10px] tracking-[0.08em] text-white/46 backdrop-blur-md">
            {copy.dataNotice}
          </div>
        </div>
      ) : null}

      <IntroLanding
        locale={locale}
        phase={introPhase}
        reducedMotion={Boolean(prefersReducedMotion)}
        target={introTarget}
        onStart={handleStartIntro}
      />
    </main>
  );
}
