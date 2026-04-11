"use client";

import { AnimatePresence, motion, useDragControls } from "framer-motion";
import { LineupPlayer } from "@/data/mockData";
import type { FootballSidebarDetail, FootballTeam } from "@/lib/football/types";
import { getLocalizedTeamCopy } from "@/lib/i18n/teamCopy";
import {
  type Locale,
  SIDEBAR_COPY,
  formatMinuteLabel,
  formatRecentFormSummary,
  translateFootballText
} from "@/lib/i18n/ui";
import { getNationalFlagIcon, getTeamHeaderIcon } from "@/lib/teamBrand";

type TeamSidebarProps = {
  locale: Locale;
  selectedTeamId: string | null;
  onClose: () => void;
  clubMap: Record<string, FootballTeam>;
  nationalTeamMap: Record<string, FootballTeam>;
  clubDetails: Record<string, FootballSidebarDetail>;
  nationalTeamDetails: Record<string, FootballSidebarDetail>;
  refreshMessage: string | null;
};

const RESULT_TONE: Record<string, string> = {
  W: "text-cyan-50",
  D: "text-white/72",
  L: "text-rose-200/82"
};

export function TeamSidebar({
  locale,
  selectedTeamId,
  onClose,
  clubMap,
  nationalTeamMap,
  clubDetails,
  nationalTeamDetails,
  refreshMessage
}: TeamSidebarProps) {
  const dragControls = useDragControls();
  const ui = SIDEBAR_COPY[locale];
  const nationalTeam = selectedTeamId ? nationalTeamMap[selectedTeamId] : null;
  const clubTeam = selectedTeamId ? clubMap[selectedTeamId] : null;
  const team = nationalTeam ?? clubTeam;
  const isNationalTeam = Boolean(nationalTeam);
  const detail = selectedTeamId
    ? isNationalTeam
      ? nationalTeamDetails[selectedTeamId]
      : clubDetails[selectedTeamId]
    : null;
  const statusHint =
    refreshMessage ??
    (detail?.dataStatus === "cached"
      ? ui.cachedHint
      : detail?.dataStatus === "fallback"
        ? ui.fallbackHint
        : null);

  return (
    <AnimatePresence>
      {team && detail ? (
        <motion.aside
          key={team.id}
          initial={{ x: 360, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 360, opacity: 0 }}
          transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
          drag
          dragControls={dragControls}
          dragListener={false}
          dragMomentum={false}
          dragElastic={0.08}
          className="absolute bottom-4 right-4 top-auto z-30 w-[min(24rem,calc(100vw-2rem))] sm:bottom-6 sm:right-6"
        >
          {(() => {
            const copy = getLocalizedTeamCopy(team, locale, isNationalTeam);
            const recentSummary = detail.recentFixtures.reduce(
              (acc, fixture) => {
                if (fixture.outcome) {
                  acc[fixture.outcome] += 1;
                }

                return acc;
              },
              { W: 0, D: 0, L: 0 }
            );
            const subhead = `${ui.homePrefix}${copy.stadium}`;
            const headerIconSrc: string = isNationalTeam
              ? getTeamHeaderIcon(team.id, team.shortName, team.accent, true) ??
                getNationalFlagIcon(
                  team.id,
                  team.shortName,
                  team.accent,
                  team.countryCode,
                  team.countryFlagUrl
                ) ??
                "/teams/national-generic.svg"
              : team.logo || getTeamHeaderIcon(team.id, team.shortName, team.accent, false) || "/teams/national-generic.svg";

            return (
              <div className="pointer-events-auto max-h-[calc(100vh-2rem)] overflow-hidden rounded-[24px] border border-cyan-200/15 bg-black/46 shadow-[0_0_50px_rgba(123,255,230,0.08)] backdrop-blur-2xl sm:max-h-[calc(100vh-3rem)]">
                <div
                  className="sticky top-0 z-10 flex cursor-grab items-start justify-between border-b border-white/10 bg-black/72 px-4 py-4 active:cursor-grabbing"
                  onPointerDown={(event) => dragControls.start(event)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10"
                      style={{
                        background: `radial-gradient(circle, ${team.accent}26 0%, rgba(6,10,14,0.92) 70%)`
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={headerIconSrc}
                        alt={copy.name}
                        className="h-9 w-9 object-contain"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="font-display text-lg uppercase tracking-[0.18em] text-white">
                        {team.shortName}
                      </div>
                      <div className="text-xs text-white/62">{copy.name}</div>
                      <div className="text-[10px] tracking-[0.16em] text-cyan-50/72">{subhead}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="pointer-events-auto rounded-full border border-white/10 px-3 py-1 text-[10px] tracking-[0.22em] text-white/62 transition hover:border-cyan-200/30 hover:text-cyan-50"
                    >
                      {ui.close}
                    </button>
                  </div>
                </div>

                <div className="max-h-[calc(100vh-7.5rem)] space-y-4 overflow-y-auto px-4 py-4 sm:max-h-[calc(100vh-8.5rem)]">
                  {statusHint ? (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs leading-5 text-white/60">
                      {statusHint}
                    </div>
                  ) : null}

                  <div className="grid grid-cols-2 gap-2">
                    {!isNationalTeam ? (
                      <>
                        <StatCard label={ui.home} value={copy.stadium} accent={team.accent} />
                        <StatCard
                          label={ui.city}
                          value={`${copy.city} / ${copy.country}`}
                          accent={team.accent}
                        />
                      </>
                    ) : null}
                    <StatCard
                      label={ui.coach}
                      value={translateFootballText(locale, detail.coach)}
                      accent={team.accent}
                    />
                    <StatCard
                      label={ui.recentForm}
                      value={formatRecentFormSummary(
                        locale,
                        recentSummary.W,
                        recentSummary.D,
                        recentSummary.L
                      )}
                      accent={team.accent}
                    />
                  </div>

                  <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-3">
                    <div className="mb-2 font-display text-xs uppercase tracking-[0.24em] text-cyan-50/76">
                      {detail.nextFixture.status === "live" ? ui.currentMatch : ui.nextMatch}
                    </div>
                    <div className="mb-2 flex items-center justify-between text-[10px] tracking-[0.2em] text-white/46">
                      <span>{translateFootballText(locale, detail.nextFixture.competition)}</span>
                      <span>
                        {detail.nextFixture.status === "live"
                          ? formatMinuteLabel(locale, detail.nextFixture.minute ?? 0)
                          : translateFootballText(locale, detail.nextFixture.dateLabel)}
                      </span>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                      <div className="mb-1 flex items-center justify-between font-display text-base tracking-[0.08em] text-white">
                        <span>{copy.name}</span>
                        <span className="text-white/88">
                          {detail.nextFixture.status === "live"
                            ? detail.nextFixture.score
                            : `${ui.versus} ${translateFootballText(locale, detail.nextFixture.opponent)}`}
                        </span>
                      </div>
                      <div className="mb-2 text-xs text-white/64">
                        {detail.nextFixture.status === "live"
                          ? `${ui.liveAgainst} ${translateFootballText(locale, detail.nextFixture.opponent)} · ${translateFootballText(locale, detail.nextFixture.venue)}`
                          : `${translateFootballText(locale, detail.nextFixture.opponent)} · ${translateFootballText(locale, detail.nextFixture.venue)}`}
                      </div>
                      <p className="text-xs leading-5 text-white/62">
                        {translateFootballText(locale, detail.nextFixture.note)}
                      </p>
                    </div>
                  </section>

                  <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="font-display text-xs uppercase tracking-[0.24em] text-cyan-50/76">
                        {ui.latestLineup}
                      </div>
                      <div className="text-[10px] tracking-[0.2em] text-white/42">
                        {translateFootballText(locale, detail.lineup.formation)} ·{" "}
                        {translateFootballText(locale, detail.lineup.matchLabel)}
                      </div>
                    </div>
                    <LineupField
                      players={detail.lineup.players}
                      accent={team.accent}
                      emptyStateText={ui.noLineup}
                    />
                  </section>

                  <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-3">
                    <div className="mb-2 font-display text-xs uppercase tracking-[0.24em] text-cyan-50/76">
                      {ui.recentFixtures}
                    </div>
                    <div className="space-y-2">
                      {detail.recentFixtures.length > 0 ? detail.recentFixtures.map((fixture) => (
                        <div
                          key={fixture.id}
                          className="flex items-start justify-between gap-3 rounded-2xl border border-white/8 bg-black/24 px-3 py-2"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 text-[10px] tracking-[0.2em] text-white/42">
                              <span>{translateFootballText(locale, fixture.competition)}</span>
                              <span>{translateFootballText(locale, fixture.dateLabel)}</span>
                              <span>{translateFootballText(locale, fixture.venue)}</span>
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-sm text-white">
                              <span className="font-display tracking-[0.08em]">{copy.name}</span>
                              <span className="text-white/50">{ui.versus}</span>
                              <span>{translateFootballText(locale, fixture.opponent)}</span>
                              <span className={`text-xs ${RESULT_TONE[fixture.outcome ?? "D"]}`}>
                                {ui.form[fixture.outcome ?? "D"]}
                              </span>
                            </div>
                            <div className="mt-1 text-xs leading-5 text-white/56">
                              {translateFootballText(locale, fixture.note)}
                            </div>
                          </div>
                          <div className="font-display text-sm tracking-[0.12em] text-white/88">
                            {fixture.score}
                          </div>
                        </div>
                      )) : (
                        <div className="rounded-2xl border border-white/8 bg-black/24 px-3 py-3 text-xs leading-5 text-white/54">
                          {ui.noRecentFixtures}
                        </div>
                      )}
                    </div>
                  </section>

                  <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-3">
                    <div className="mb-2 font-display text-xs uppercase tracking-[0.24em] text-cyan-50/76">
                      {ui.honors}
                    </div>
                    <div className="space-y-2">
                      {(detail.honors.length > 0 ? detail.honors : [ui.honorsPending]).map((honor) => (
                        <div
                          key={honor}
                          className="rounded-2xl border border-white/8 bg-black/24 px-3 py-2 text-xs leading-5 text-white/68"
                        >
                          {translateFootballText(locale, honor)}
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            );
          })()}
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}

function StatCard({
  label,
  value,
  accent
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div
      className="rounded-2xl border border-white/10 p-3"
      style={{
        background: `linear-gradient(180deg, ${accent}12 0%, rgba(255,255,255,0.02) 100%)`
      }}
    >
      <div className="mb-1 text-[10px] tracking-[0.2em] text-white/42">{label}</div>
      <div className="font-display text-xs tracking-[0.08em] text-white">{value}</div>
    </div>
  );
}

function LineupField({
  players,
  accent,
  emptyStateText
}: {
  players: LineupPlayer[];
  accent: string;
  emptyStateText: string;
}) {
  return (
    <div
      className="relative h-72 overflow-hidden rounded-[24px] border border-white/10"
      style={{
        background:
          "radial-gradient(circle at 50% 18%, rgba(140,255,224,0.14), rgba(0,0,0,0) 38%), linear-gradient(180deg, rgba(10,17,23,0.98), rgba(5,9,12,0.94))"
      }}
    >
      <div className="absolute inset-[10px] rounded-[18px] border border-white/8" />
      <div className="absolute left-[10px] right-[10px] top-1/2 h-px bg-white/8" />
      <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/8" />
      <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/18" />
      <div className="absolute left-1/2 top-[10px] h-12 w-28 -translate-x-1/2 rounded-b-[18px] border-x border-b border-white/8" />
      <div className="absolute left-1/2 bottom-[10px] h-12 w-28 -translate-x-1/2 rounded-t-[18px] border-x border-t border-white/8" />

      {players.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center px-8 text-center text-xs leading-6 text-white/48">
          {emptyStateText}
        </div>
      ) : null}

      {players.map((player) => (
        <div
          key={`${player.number}-${player.name}`}
          className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
          style={{ left: `${player.x}%`, top: `${player.y}%` }}
        >
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/18 text-[11px] font-semibold text-white shadow-[0_0_18px_rgba(255,255,255,0.08)]"
            style={{
              background: `radial-gradient(circle, ${accent}44 0%, rgba(9,14,18,0.98) 72%)`
            }}
          >
            {player.number}
          </div>
          <div className="max-w-[4.6rem] text-center text-[10px] leading-4 text-white/70">
            {player.name}
          </div>
        </div>
      ))}
    </div>
  );
}
