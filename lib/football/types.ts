import type {
  Match,
  SidebarFixture,
  SidebarFixtureStatus,
  Team,
  TeamSidebarDetail
} from "@/data/mockData";

export type FootballTeam = Team & {
  providerTeamId?: number | null;
  countryCode?: string | null;
  countryFlagUrl?: string | null;
  leagueId?: number | null;
  leagueName?: string | null;
  leagueTier?: number | null;
  isNationalTeam?: boolean;
  showInGlobeOverview?: boolean;
  allowFlyline?: boolean;
  visibleAtOrBelowDistance?: number | null;
};

export type FootballSidebarDetail = TeamSidebarDetail & {
  providerTeamId?: number | null;
  dataStatus?: "live" | "cached" | "fallback";
};

export type LeagueCatalogEntry = {
  country: string;
  tier: number;
  leagueId?: number | null;
  leagueName: string;
  season?: number | null;
};

export type GlobeHotNationalTeamConfig = {
  id: string;
  country: string;
  label: string;
  showInGlobeOverview: boolean;
  allowFlyline: boolean;
  visibleAtOrBelowDistance: number;
};

export type FootballSnapshot = {
  source: "cache" | "fallback" | "api-football";
  updatedAt: string;
  clubs: FootballTeam[];
  clubDetails: Record<string, FootballSidebarDetail>;
  nationalTeams: FootballTeam[];
  nationalTeamDetails: Record<string, FootballSidebarDetail>;
  nationalMatches: Match[];
  globeHotNationalTeams: GlobeHotNationalTeamConfig[];
  leagueCatalog: LeagueCatalogEntry[];
};

export type RefreshResult = {
  ok: boolean;
  teamId: string;
  message: string;
  updatedAt: string;
  source?: FootballSnapshot["source"];
  isNationalTeam?: boolean;
  team?: FootballTeam;
  detail?: FootballSidebarDetail;
  nationalMatches?: Match[];
};

export type ApiFootballTeamResponse = {
  team?: {
    id?: number;
    name?: string;
    code?: string | null;
    country?: string;
    founded?: number;
    national?: boolean;
    logo?: string;
  };
  venue?: {
    id?: number;
    name?: string;
    address?: string | null;
    city?: string | null;
    capacity?: number | null;
    surface?: string | null;
    image?: string | null;
  };
};

export type ApiFootballLeagueResponse = {
  league: {
    id: number;
    name: string;
    type: string;
    logo?: string | null;
  };
  country: {
    name: string;
    code?: string | null;
    flag?: string | null;
  };
  seasons?: Array<{
    year: number;
    current?: boolean;
  }>;
};

export type ApiFootballCountryResponse = {
  name: string;
  code?: string | null;
  flag?: string | null;
};

export type ApiFootballFixtureResponse = {
  fixture: {
    id: number;
    date: string;
    status: {
      short: string;
      elapsed?: number | null;
    };
    venue?: {
      name?: string | null;
      city?: string | null;
    };
  };
  league: {
    id: number;
    name: string;
  };
  teams: {
    home: {
      id: number;
      name: string;
    };
    away: {
      id: number;
      name: string;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
};

export type ApiFootballLineupResponse = {
  team: {
    id: number;
    name: string;
  };
  coach?: {
    id?: number;
    name?: string;
  };
  formation?: string;
  startXI?: Array<{
    player: {
      id?: number;
      name?: string;
      number?: number | null;
      pos?: string | null;
      grid?: string | null;
    };
  }>;
};

export type ApiFootballCoachResponse = {
  id?: number;
  name?: string;
  nationality?: string;
  age?: number | null;
};

export type ApiFootballTrophyResponse = {
  league?: string;
  country?: string;
  place?: string;
  season?: string;
};

export type SidebarFixtureOutcome = SidebarFixture["outcome"];
export type FootballSidebarFixtureStatus = SidebarFixtureStatus;
