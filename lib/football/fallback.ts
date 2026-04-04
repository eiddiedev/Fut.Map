import {
  CLUB_DETAILS,
  MATCHES,
  NATIONAL_MATCHES,
  NATIONAL_TEAM_DETAILS,
  NATIONAL_TEAMS,
  TEAMS,
  TEAM_MAP,
  type LineupPlayer,
  type Match,
  type Team
} from "@/data/mockData";
import { DEFAULT_NATIONAL_VISIBLE_DISTANCE, FALLBACK_LEAGUE_CATALOG, HOT_GLOBE_NATIONAL_TEAMS } from "@/lib/football/config";
import { getNationalFlagUrl, NATIONAL_COUNTRY_CODE_OVERRIDES } from "@/lib/football/flags";
import { getFootballWorldCapitals, type FootballCapitalEntry } from "@/lib/football/national-geography";
import type {
  FootballSidebarDetail,
  FootballSnapshot,
  FootballTeam
} from "@/lib/football/types";

type WorldCapitalEntry = FootballCapitalEntry;
const FOOTBALL_WORLD_CAPITALS = getFootballWorldCapitals();

const NATIONAL_SHORT_NAME_OVERRIDES: Record<string, string> = {
  England: "ENG",
  Scotland: "SCO",
  Wales: "WAL",
  "Northern Ireland": "NIR",
  France: "FRA",
  Spain: "ESP",
  Germany: "GER",
  Italy: "ITA",
  Portugal: "POR",
  Netherlands: "NED",
  Croatia: "CRO",
  Brazil: "BRA",
  Argentina: "ARG",
  Uruguay: "URU",
  Colombia: "COL",
  Morocco: "MAR",
  Japan: "JPN",
  "United States": "USA",
  Mexico: "MEX",
  "Saudi Arabia": "KSA",
  Australia: "AUS",
  China: "CHN"
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function countryToTeamId(country: string) {
  const hotEntry = HOT_GLOBE_NATIONAL_TEAMS.find((entry) => entry.country === country);

  if (hotEntry) {
    return hotEntry.id;
  }

  return `${country.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}_nt`;
}

function countryToShortName(country: string) {
  const overridden = NATIONAL_SHORT_NAME_OVERRIDES[country];

  if (overridden) {
    return overridden;
  }

  const words = country.replace(/\./g, "").split(/\s+/).filter(Boolean);

  if (words.length >= 2) {
    return words
      .slice(0, 3)
      .map((word) => word[0]?.toUpperCase() ?? "")
      .join("")
      .slice(0, 3);
  }

  return country.slice(0, 3).toUpperCase();
}

function colorFromString(seed: string) {
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = seed.charCodeAt(index) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash) % 360;

  return `hsl(${hue} 78% 66%)`;
}

function createPlaceholderLineup(): { formation: string; matchLabel: string; players: LineupPlayer[] } {
  return {
    formation: "待同步",
    matchLabel: "阵容待同步",
    players: []
  };
}

function createPlaceholderDetail(country: string): FootballSidebarDetail {
  return {
    coach: "待同步",
    coachTitle: "主教练",
    honors: ["荣誉信息待同步"],
    recentFixtures: [],
    nextFixture: {
      id: `${countryToTeamId(country)}-next`,
      competition: "待同步",
      opponent: "待同步",
      dateLabel: "待同步",
      venue: "待同步",
      status: "scheduled",
      note: "真实数据接入后会显示下一场比赛时间、实时比分和最近阵容。"
    },
    lineup: createPlaceholderLineup(),
    dataStatus: "fallback"
  };
}

function toFootballClub(team: Team): FootballTeam {
  return {
    ...clone(team),
    providerTeamId: null,
    countryCode: NATIONAL_COUNTRY_CODE_OVERRIDES[team.country] ?? null,
    countryFlagUrl: getNationalFlagUrl(team.country),
    leagueId: null,
    leagueName: null,
    leagueTier: 1,
    isNationalTeam: false,
    showInGlobeOverview: false,
    allowFlyline: false,
    visibleAtOrBelowDistance: null
  };
}

function toFootballNationalTeam(team: Team): FootballTeam {
  const hotConfig = HOT_GLOBE_NATIONAL_TEAMS.find((entry) => entry.id === team.id || entry.country === team.country);

  return {
    ...clone(team),
    providerTeamId: null,
    countryCode: NATIONAL_COUNTRY_CODE_OVERRIDES[team.country] ?? null,
    countryFlagUrl: getNationalFlagUrl(team.country),
    leagueId: null,
    leagueName: null,
    leagueTier: null,
    isNationalTeam: true,
    showInGlobeOverview: hotConfig?.showInGlobeOverview ?? false,
    allowFlyline: hotConfig?.allowFlyline ?? false,
    visibleAtOrBelowDistance: hotConfig?.visibleAtOrBelowDistance ?? DEFAULT_NATIONAL_VISIBLE_DISTANCE
  };
}

function createGeneratedNationalTeam(entry: WorldCapitalEntry): FootballTeam {
  const hotConfig = HOT_GLOBE_NATIONAL_TEAMS.find((item) => item.country === entry.country);
  const shortName = countryToShortName(entry.country);

  return {
    id: countryToTeamId(entry.country),
    name: entry.country,
    shortName,
    city: entry.capital,
    country: entry.country,
    stadium: `${entry.capital} National Stadium`,
    lng: entry.lng,
    lat: entry.lat,
    accent: colorFromString(entry.country),
    logo: "/teams/national-generic.svg",
    signal: `${entry.capital} national relay`,
    possession: "--",
    xg: 0,
    press: "待同步",
    form: [],
    providerTeamId: null,
    countryFlagUrl: getNationalFlagUrl(entry.country),
    countryCode: NATIONAL_COUNTRY_CODE_OVERRIDES[entry.country] ?? null,
    leagueId: null,
    leagueName: null,
    leagueTier: null,
    isNationalTeam: true,
    showInGlobeOverview: hotConfig?.showInGlobeOverview ?? false,
    allowFlyline: hotConfig?.allowFlyline ?? false,
    visibleAtOrBelowDistance: hotConfig?.visibleAtOrBelowDistance ?? DEFAULT_NATIONAL_VISIBLE_DISTANCE
  };
}

function createGeneratedNationalDetail(team: FootballTeam): FootballSidebarDetail {
  return {
    ...createPlaceholderDetail(team.country),
    nextFixture: {
      id: `${team.id}-next`,
      competition: "待同步",
      opponent: "待同步",
      dateLabel: "待同步",
      venue: team.city,
      status: "scheduled",
      note: "当前国家队暂无缓存赛程，接入 API 后会在这里显示下一场比赛或实时比分。"
    }
  };
}

function buildAllNationalTeams() {
  const seededTeams = NATIONAL_TEAMS.map(toFootballNationalTeam);
  const seededByCountry = new Map(seededTeams.map((team) => [team.country, team]));
  const allTeams = [...seededTeams];

  FOOTBALL_WORLD_CAPITALS.forEach((entry) => {
    if (seededByCountry.has(entry.country)) {
      return;
    }

    const generated = createGeneratedNationalTeam(entry);
    seededByCountry.set(entry.country, generated);
    allTeams.push(generated);
  });

  HOT_GLOBE_NATIONAL_TEAMS.forEach((hotConfig) => {
    if (seededByCountry.has(hotConfig.country)) {
      return;
    }

    const capital = FOOTBALL_WORLD_CAPITALS.find((entry) => entry.country === hotConfig.country);

    if (!capital) {
      return;
    }

    const generated = createGeneratedNationalTeam(capital);
    seededByCountry.set(hotConfig.country, generated);
    allTeams.push(generated);
  });

  return allTeams.sort((left, right) => left.country.localeCompare(right.country));
}

function buildNationalDetails(nationalTeams: FootballTeam[]) {
  const details: Record<string, FootballSidebarDetail> = {};

  nationalTeams.forEach((team) => {
    const existing = NATIONAL_TEAM_DETAILS[team.id];
    details[team.id] = existing
      ? ({ ...clone(existing), dataStatus: "fallback", providerTeamId: team.providerTeamId } as FootballSidebarDetail)
      : createGeneratedNationalDetail(team);
  });

  return details;
}

function buildClubDetails(clubs: FootballTeam[]) {
  const details: Record<string, FootballSidebarDetail> = {};

  clubs.forEach((team) => {
    const existing = CLUB_DETAILS[team.id];
    details[team.id] = existing
      ? ({ ...clone(existing), dataStatus: "fallback", providerTeamId: team.providerTeamId } as FootballSidebarDetail)
      : {
          ...createPlaceholderDetail(team.country),
          nextFixture: {
            id: `${team.id}-next`,
            competition: "待同步",
            opponent: "待同步",
            dateLabel: "待同步",
            venue: team.stadium,
            status: "scheduled",
            note: "当前俱乐部暂无缓存赛程，接入 API 后会在这里显示下一场比赛或实时比分。"
          }
        };
  });

  return details;
}

function buildHotNationalMatches(nationalTeams: FootballTeam[]) {
  const teamIds = new Set(nationalTeams.map((team) => team.id));

  return clone(NATIONAL_MATCHES).filter(
    (match: Match) => teamIds.has(match.homeTeamId) && teamIds.has(match.awayTeamId)
  );
}

export function createFallbackFootballSnapshot(): FootballSnapshot {
  const clubs = TEAMS.map(toFootballClub);
  const nationalTeams = buildAllNationalTeams();

  return {
    source: "fallback",
    updatedAt: new Date().toISOString(),
    clubs,
    clubDetails: buildClubDetails(clubs),
    nationalTeams,
    nationalTeamDetails: buildNationalDetails(nationalTeams),
    nationalMatches: buildHotNationalMatches(nationalTeams),
    globeHotNationalTeams: clone(HOT_GLOBE_NATIONAL_TEAMS),
    leagueCatalog: clone(FALLBACK_LEAGUE_CATALOG)
  };
}

export function createFallbackMaps(snapshot: FootballSnapshot) {
  return {
    clubMap: Object.fromEntries(snapshot.clubs.map((team) => [team.id, team])) as Record<string, FootballTeam>,
    nationalTeamMap: Object.fromEntries(snapshot.nationalTeams.map((team) => [team.id, team])) as Record<string, FootballTeam>
  };
}
