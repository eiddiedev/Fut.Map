"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import type { FootballTeam } from "@/lib/football/types";
import { FALLBACK_LEAGUE_CATALOG, PRIORITY_BOOTSTRAP_CATALOG } from "@/lib/football/config";
import { getClubBadgeIcon } from "@/lib/teamBrand";
import worldCapitals from "@/data/world-capitals.json";

type WorldDetailMapProps = {
  selectedTeamId: string | null;
  onSelectTeam: (teamId: string) => void;
  teams: FootballTeam[];
  teamMap: Record<string, FootballTeam>;
};

type OverlayPoint = {
  id: string;
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  zIndex: number;
  clusterId: string | null;
  isClusterAnchor: boolean;
};

type CountryLabel = {
  id: string;
  name: string;
  lng: number;
  lat: number;
  roughArea: number;
};

type ProjectedCountryLabel = CountryLabel & {
  x: number;
  y: number;
};

type CityLabel = {
  id: string;
  name: string;
  lng: number;
  lat: number;
  priority: 1 | 2 | 3;
};

type ProjectedCityLabel = CityLabel & {
  x: number;
  y: number;
};

type GeoPosition = [number, number];

type GeoPolygonGeometry = {
  type: "Polygon";
  coordinates: GeoPosition[][];
};

type GeoMultiPolygonGeometry = {
  type: "MultiPolygon";
  coordinates: GeoPosition[][][];
};

type RingMetrics = {
  area: number;
  centroidLng: number;
  centroidLat: number;
};

type WorldFeature = {
  properties: {
    name: string;
  };
  geometry: GeoPolygonGeometry | GeoMultiPolygonGeometry;
};

type WorldCollection = {
  features: WorldFeature[];
};

type ProjectedTeamMarker = {
  id: string;
  baseX: number;
  baseY: number;
  size: number;
};

type LeagueBadgeSource = {
  id: string;
  leagueId: number | null;
  leagueName: string;
  shortLabel: string;
  logo: string;
  lng: number;
  lat: number;
  clubCount: number;
};

type ProjectedLeagueBadge = LeagueBadgeSource & {
  x: number;
  y: number;
};

const FOCUS_COUNTRIES = new Set(["United Kingdom", "France", "Spain", "Germany", "Italy", "China"]);
const COUNTRY_LABEL_PRIORITY = new Set([
  "United Kingdom",
  "Ireland",
  "France",
  "Spain",
  "Germany",
  "Italy",
  "Netherlands",
  "Belgium",
  "Switzerland",
  "Austria",
  "Denmark",
  "Norway",
  "Sweden",
  "Poland",
  "Czech Rep.",
  "Croatia",
  "Hungary",
  "Romania",
  "Greece",
  "Serbia",
  "Ukraine",
  "Turkey",
  "China",
  "Japan",
  "Saudi Arabia",
  "Brazil",
  "Argentina",
  "United States",
  "Mexico",
  "Canada",
  "South Africa",
  "Australia"
]);
const COUNTRY_LABEL_OVERRIDES: Record<string, { lng: number; lat: number }> = {
  "United States": { lng: -98, lat: 39 },
  Brazil: { lng: -52, lat: -10 },
  Argentina: { lng: -64.2, lat: -34.2 },
  Canada: { lng: -101, lat: 57 },
  Mexico: { lng: -102.5, lat: 23.8 },
  Ireland: { lng: -8.2, lat: 53.3 },
  Russia: { lng: 100, lat: 61 },
  "United Kingdom": { lng: -2.8, lat: 54.2 },
  France: { lng: 2.5, lat: 46.4 },
  Spain: { lng: -3.7, lat: 40.2 },
  Portugal: { lng: -8, lat: 39.6 },
  Germany: { lng: 10.4, lat: 51.1 },
  Italy: { lng: 12.6, lat: 42.8 },
  Netherlands: { lng: 5.4, lat: 52.2 },
  Belgium: { lng: 4.6, lat: 50.8 },
  Switzerland: { lng: 8.1, lat: 46.8 },
  Austria: { lng: 14.2, lat: 47.6 },
  Denmark: { lng: 10, lat: 56.2 },
  Sweden: { lng: 15.2, lat: 62.2 },
  Poland: { lng: 19.2, lat: 52.1 },
  "Czech Rep.": { lng: 15.4, lat: 49.8 },
  Croatia: { lng: 16.5, lat: 45.4 },
  Hungary: { lng: 19.3, lat: 47.2 },
  Romania: { lng: 24.9, lat: 45.8 },
  Greece: { lng: 22.9, lat: 39.1 },
  Serbia: { lng: 20.8, lat: 44 },
  Ukraine: { lng: 31.2, lat: 49 },
  Turkey: { lng: 35.1, lat: 39.1 },
  China: { lng: 103.8, lat: 35.8 },
  India: { lng: 78.6, lat: 22.8 },
  Japan: { lng: 138, lat: 37.4 },
  Australia: { lng: 134.2, lat: -25.7 },
  Indonesia: { lng: 117.2, lat: -2.4 },
  "New Zealand": { lng: 172.5, lat: -41.2 },
  Mongolia: { lng: 103.8, lat: 46.9 },
  Kazakhstan: { lng: 67.9, lat: 48.2 },
  Iran: { lng: 53.7, lat: 32.1 },
  "Saudi Arabia": { lng: 44.6, lat: 23.9 },
  Norway: { lng: 10.1, lat: 62.8 },
  Greenland: { lng: -41.5, lat: 74.2 },
  Algeria: { lng: 2.8, lat: 28.3 },
  "South Africa": { lng: 24.2, lat: -29 },
  "Dem. Rep. Congo": { lng: 23.7, lat: -2.9 },
  Fiji: { lng: 178.1, lat: -17.8 }
};

const EXTRA_CITY_LABELS: CityLabel[] = [
  { id: "newcastle", name: "Newcastle", lng: -1.6178, lat: 54.9783, priority: 1 },
  { id: "birmingham", name: "Birmingham", lng: -1.8904, lat: 52.4862, priority: 2 },
  { id: "brighton", name: "Brighton", lng: -0.1406, lat: 50.8225, priority: 2 },
  { id: "southampton", name: "Southampton", lng: -1.4044, lat: 50.9097, priority: 2 },
  { id: "leicester", name: "Leicester", lng: -1.1422, lat: 52.6203, priority: 2 },
  { id: "nottingham", name: "Nottingham", lng: -1.1581, lat: 52.9548, priority: 2 },
  { id: "wolverhampton", name: "Wolverhampton", lng: -2.1288, lat: 52.5862, priority: 2 },
  { id: "bournemouth", name: "Bournemouth", lng: -1.838, lat: 50.7192, priority: 2 },
  { id: "leeds", name: "Leeds", lng: -1.5491, lat: 53.8008, priority: 2 },
  { id: "sevilla", name: "Seville", lng: -5.9845, lat: 37.3891, priority: 1 },
  { id: "valencia", name: "Valencia", lng: -0.3763, lat: 39.4699, priority: 1 },
  { id: "bilbao", name: "Bilbao", lng: -2.935, lat: 43.263, priority: 1 },
  { id: "san-sebastian", name: "San Sebastian", lng: -1.9812, lat: 43.3183, priority: 2 },
  { id: "vigo", name: "Vigo", lng: -8.7207, lat: 42.2406, priority: 2 },
  { id: "villarreal", name: "Villarreal", lng: -0.1009, lat: 39.9384, priority: 2 },
  { id: "girona", name: "Girona", lng: 2.8214, lat: 41.9794, priority: 2 },
  { id: "pamplona", name: "Pamplona", lng: -1.6458, lat: 42.8125, priority: 2 },
  { id: "palma", name: "Palma", lng: 2.6502, lat: 39.5696, priority: 2 },
  { id: "lisbon", name: "Lisbon", lng: -9.1393, lat: 38.7223, priority: 1 },
  { id: "porto", name: "Porto", lng: -8.6291, lat: 41.1579, priority: 2 },
  { id: "dublin", name: "Dublin", lng: -6.2603, lat: 53.3498, priority: 2 },
  { id: "amsterdam", name: "Amsterdam", lng: 4.9041, lat: 52.3676, priority: 2 },
  { id: "brussels", name: "Brussels", lng: 4.3517, lat: 50.8503, priority: 2 },
  { id: "berne", name: "Bern", lng: 7.4474, lat: 46.948, priority: 2 },
  { id: "vienna", name: "Vienna", lng: 16.3738, lat: 48.2082, priority: 2 },
  { id: "copenhagen", name: "Copenhagen", lng: 12.5683, lat: 55.6761, priority: 2 },
  { id: "stockholm", name: "Stockholm", lng: 18.0686, lat: 59.3293, priority: 2 },
  { id: "oslo", name: "Oslo", lng: 10.7522, lat: 59.9139, priority: 2 },
  { id: "warsaw", name: "Warsaw", lng: 21.0122, lat: 52.2297, priority: 2 },
  { id: "prague", name: "Prague", lng: 14.4378, lat: 50.0755, priority: 2 },
  { id: "zagreb", name: "Zagreb", lng: 15.9819, lat: 45.815, priority: 2 },
  { id: "budapest", name: "Budapest", lng: 19.0402, lat: 47.4979, priority: 2 },
  { id: "bucharest", name: "Bucharest", lng: 26.1025, lat: 44.4268, priority: 2 },
  { id: "athens", name: "Athens", lng: 23.7275, lat: 37.9838, priority: 2 },
  { id: "belgrade", name: "Belgrade", lng: 20.4573, lat: 44.7872, priority: 2 },
  { id: "kyiv", name: "Kyiv", lng: 30.5234, lat: 50.4501, priority: 2 },
  { id: "istanbul", name: "Istanbul", lng: 28.9784, lat: 41.0082, priority: 2 },
  { id: "rome", name: "Rome", lng: 12.4964, lat: 41.9028, priority: 2 },
  { id: "florence", name: "Florence", lng: 11.2558, lat: 43.7696, priority: 2 },
  { id: "bologna", name: "Bologna", lng: 11.3426, lat: 44.4949, priority: 2 },
  { id: "bergamo", name: "Bergamo", lng: 9.67, lat: 45.6983, priority: 2 },
  { id: "genoa", name: "Genoa", lng: 8.9463, lat: 44.4056, priority: 2 },
  { id: "como", name: "Como", lng: 9.0852, lat: 45.8081, priority: 2 },
  { id: "udine", name: "Udine", lng: 13.2422, lat: 46.0711, priority: 2 },
  { id: "verona", name: "Verona", lng: 10.9916, lat: 45.4384, priority: 2 },
  { id: "cagliari", name: "Cagliari", lng: 9.1217, lat: 39.2238, priority: 2 },
  { id: "parma", name: "Parma", lng: 10.3279, lat: 44.8015, priority: 2 },
  { id: "lecce", name: "Lecce", lng: 18.1718, lat: 40.3515, priority: 2 },
  { id: "lyon", name: "Lyon", lng: 4.8357, lat: 45.764, priority: 1 },
  { id: "lille", name: "Lille", lng: 3.0573, lat: 50.6292, priority: 1 },
  { id: "nice", name: "Nice", lng: 7.262, lat: 43.7102, priority: 2 },
  { id: "monaco", name: "Monaco", lng: 7.4246, lat: 43.7384, priority: 2 },
  { id: "lens", name: "Lens", lng: 2.8333, lat: 50.4292, priority: 2 },
  { id: "strasbourg", name: "Strasbourg", lng: 7.7521, lat: 48.5734, priority: 2 },
  { id: "nantes", name: "Nantes", lng: -1.5536, lat: 47.2184, priority: 2 },
  { id: "toulouse", name: "Toulouse", lng: 1.4442, lat: 43.6047, priority: 2 },
  { id: "rennes", name: "Rennes", lng: -1.6778, lat: 48.1173, priority: 2 },
  { id: "brest", name: "Brest", lng: -4.4861, lat: 48.3904, priority: 2 },
  { id: "frankfurt", name: "Frankfurt", lng: 8.6821, lat: 50.1109, priority: 1 },
  { id: "stuttgart", name: "Stuttgart", lng: 9.1829, lat: 48.7758, priority: 1 },
  { id: "leverkusen", name: "Leverkusen", lng: 6.9843, lat: 51.0459, priority: 1 },
  { id: "bremen", name: "Bremen", lng: 8.8017, lat: 53.0793, priority: 2 },
  { id: "freiburg", name: "Freiburg", lng: 7.8421, lat: 47.999, priority: 2 },
  { id: "mainz", name: "Mainz", lng: 8.2473, lat: 49.9929, priority: 2 },
  { id: "monchengladbach", name: "Monchengladbach", lng: 6.4428, lat: 51.1805, priority: 2 },
  { id: "wolfsburg", name: "Wolfsburg", lng: 10.7865, lat: 52.4227, priority: 2 },
  { id: "sinsheim", name: "Sinsheim", lng: 8.879, lat: 49.2529, priority: 3 },
  { id: "heidenheim", name: "Heidenheim", lng: 10.1518, lat: 48.6839, priority: 3 },
  { id: "riyadh", name: "Riyadh", lng: 46.6753, lat: 24.7136, priority: 1 },
  { id: "santos", name: "Santos", lng: -46.3289, lat: -23.9608, priority: 1 },
  { id: "buenos-aires", name: "Buenos Aires", lng: -58.3816, lat: -34.6037, priority: 1 },
  { id: "rio-de-janeiro", name: "Rio de Janeiro", lng: -43.1729, lat: -22.9068, priority: 2 },
  { id: "beijing", name: "Beijing", lng: 116.4074, lat: 39.9042, priority: 1 },
  { id: "shanghai", name: "Shanghai", lng: 121.4737, lat: 31.2304, priority: 1 },
  { id: "guangzhou", name: "Guangzhou", lng: 113.2644, lat: 23.1291, priority: 1 },
  { id: "chengdu", name: "Chengdu", lng: 104.0665, lat: 30.5728, priority: 2 },
  { id: "wuhan", name: "Wuhan", lng: 114.3054, lat: 30.5931, priority: 2 },
  { id: "jinan", name: "Jinan", lng: 117.1201, lat: 36.6512, priority: 3 }
];

const DEFAULT_MARKER_SIZE = 40;
const SELECTED_MARKER_SIZE = 54;
const MAX_MARKER_OVERLAP_RATIO = 0.5;
const MAX_MARKER_OFFSET = 32;
const RELAXATION_PASSES = 8;
const MARKER_VIEWPORT_PADDING = 96;
const LABEL_VIEWPORT_PADDING = 36;
const LEAGUE_BADGE_VIEWPORT_PADDING = 140;

const inferredLeagueCatalog = [...PRIORITY_BOOTSTRAP_CATALOG, ...FALLBACK_LEAGUE_CATALOG];

function getWikimediaFilePathUrl(fileName: string) {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}`;
}

const LEAGUE_BADGE_LOGOS_BY_ID: Record<number, string> = {
  39: getWikimediaFilePathUrl("Premier League.svg"),
  40: "https://upload.wikimedia.org/wikipedia/en/thumb/0/0f/EFL_Championship_Logo.svg/330px-EFL_Championship_Logo.svg.png",
  41: "https://upload.wikimedia.org/wikipedia/en/thumb/5/53/EFL_League_One_Logo.svg/330px-EFL_League_One_Logo.svg.png",
  61: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Logo_Ligue_1_McDonald%27s_2024.svg",
  62: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Logo_Ligue_2_BKT_2024.svg/330px-Logo_Ligue_2_BKT_2024.svg.png",
  63: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Championnat_National.png/330px-Championnat_National.png",
  71: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Campeonato_Brasileiro_S%C3%A9rie_A_logo_%282024%29.svg/330px-Campeonato_Brasileiro_S%C3%A9rie_A_logo_%282024%29.svg.png",
  78: "https://upload.wikimedia.org/wikipedia/en/thumb/d/df/Bundesliga_logo_%282017%29.svg/250px-Bundesliga_logo_%282017%29.svg.png",
  79: "https://upload.wikimedia.org/wikipedia/en/thumb/7/7b/2._Bundesliga_logo.svg/330px-2._Bundesliga_logo.svg.png",
  80: "https://upload.wikimedia.org/wikipedia/en/thumb/b/bc/3._Liga_logo_%282019%29.svg/330px-3._Liga_logo_%282019%29.svg.png",
  88: "https://upload.wikimedia.org/wikipedia/commons/0/0f/Eredivisie_nieuw_logo_2017-.svg",
  94: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Liga_Portugal_Betclic_logo.svg",
  98: "https://upload.wikimedia.org/wikipedia/commons/a/a8/Meiji_Yasuda_J1_League_logo.svg",
  103: getWikimediaFilePathUrl("Eliteserien logo.svg"),
  106: getWikimediaFilePathUrl("Ekstraklasa logo.svg"),
  128: "https://upload.wikimedia.org/wikipedia/en/thumb/a/ad/Liga_profesional_afa_logo26.png/330px-Liga_profesional_afa_logo26.png",
  135: getWikimediaFilePathUrl("Serie A.svg"),
  136: "https://upload.wikimedia.org/wikipedia/en/thumb/9/90/Serie_BKT_logo.svg/330px-Serie_BKT_logo.svg.png",
  137: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Serie_C_sky_wifi_2025-2026.png/330px-Serie_C_sky_wifi_2025-2026.png",
  138: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Serie_C_sky_wifi_2025-2026.png/330px-Serie_C_sky_wifi_2025-2026.png",
  139: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Serie_C_sky_wifi_2025-2026.png/330px-Serie_C_sky_wifi_2025-2026.png",
  140: "https://upload.wikimedia.org/wikipedia/commons/5/54/LaLiga_EA_Sports_2023_Vertical_Logo.svg",
  141: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/LaLiga_Hypermotion_2023_Vertical_Logo.svg/330px-LaLiga_Hypermotion_2023_Vertical_Logo.svg.png",
  144: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Pro_League_logo2020.jpg/330px-Pro_League_logo2020.jpg",
  169: "https://upload.wikimedia.org/wikipedia/en/thumb/8/8e/Chinese_Super_League.svg/330px-Chinese_Super_League.svg.png",
  170: "https://upload.wikimedia.org/wikipedia/en/thumb/1/18/China_League_One.svg/330px-China_League_One.svg.png",
  188: getWikimediaFilePathUrl("A-Leagues logo.svg"),
  197: "https://upload.wikimedia.org/wikipedia/en/thumb/5/54/Super_League_Greece_logo.svg/330px-Super_League_Greece_logo.svg.png",
  203: "https://upload.wikimedia.org/wikipedia/commons/4/4f/S%C3%BCper_Lig_logo.svg",
  207: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Brack_Super_League.png/330px-Brack_Super_League.png",
  210: getWikimediaFilePathUrl("HNL logo.svg"),
  218: "https://upload.wikimedia.org/wikipedia/en/thumb/2/29/Admiral_Bundesliga.svg/330px-Admiral_Bundesliga.svg.png",
  253: "https://upload.wikimedia.org/wikipedia/commons/c/c7/Major_League_Soccer_logo.svg",
  262: "https://upload.wikimedia.org/wikipedia/commons/2/22/Liga_MX_logo.svg",
  283: "https://upload.wikimedia.org/wikipedia/en/thumb/0/07/Superliga.svg/330px-Superliga.svg.png",
  286: "https://upload.wikimedia.org/wikipedia/en/thumb/8/89/Serbian_SuperLiga_logo.svg/330px-Serbian_SuperLiga_logo.svg.png",
  292: "https://upload.wikimedia.org/wikipedia/en/thumb/2/2d/K_League_1.svg/330px-K_League_1.svg.png",
  296: "https://upload.wikimedia.org/wikipedia/en/4/45/2024_Thai_League_1_logo.png",
  301: "https://upload.wikimedia.org/wikipedia/en/thumb/0/07/UAE_Pro_League_logo.svg/330px-UAE_Pro_League_logo.svg.png",
  307: "https://upload.wikimedia.org/wikipedia/en/thumb/7/75/Roshn_Saudi_League_Logo.svg/330px-Roshn_Saudi_League_Logo.svg.png",
  323: "https://upload.wikimedia.org/wikipedia/en/thumb/b/b0/Indian_Super_League_logo.svg/330px-Indian_Super_League_logo.svg.png",
  333: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Ukrainian_Premier_League_Logo_UK.svg/330px-Ukrainian_Premier_League_Logo_UK.svg.png",
  345: getWikimediaFilePathUrl("Chance Liga logo.svg"),
  435: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Primera_Federaci%C3%B3n.svg/330px-Primera_Federaci%C3%B3n.svg.png",
  436: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Primera_Federaci%C3%B3n.svg/330px-Primera_Federaci%C3%B3n.svg.png",
  929: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f9/China_League_Two.svg/330px-China_League_Two.svg.png"
};

const LEAGUE_BADGE_SHORT_LABELS: Record<string, string> = {
  Bundesliga: "BUN",
  "Premier League": "PL",
  "La Liga": "LL",
  "Serie A": "SA",
  "Chinese Super League": "CSL",
  "Ligue 1": "L1",
  "Primeira Liga": "LP",
  Eredivisie: "ERE",
  "Saudi Pro League": "SPL",
  MLS: "MLS",
  "Major League Soccer": "MLS",
  "J1 League": "J1",
  "Liga Profesional Argentina": "LPF",
  "Jupiler Pro League": "JPL",
  "Süper Lig": "SL",
  "Liga MX": "LMX",
  "A-League": "AL",
  Premiership: "SP",
  "Super League": "SL",
  Superliga: "SUP",
  Eliteserien: "ELI",
  Allsvenskan: "ALL",
  "Super League 1": "SL1",
  "Czech Liga": "CZL",
  "Liga I": "LI",
  HNL: "HNL",
  "Super Liga": "SLS",
  "K League 1": "K1",
  Ekstraklasa: "EKS",
  "League One": "L1",
  "3. Liga": "3L",
  "Primera División RFEF - Group 1": "PR1",
  "Primera División RFEF - Group 2": "PR2",
  "Serie C - Girone A": "SCA",
  "Serie C - Girone B": "SCB",
  "Serie C - Girone C": "SCC",
  "National 1": "N1",
  "Indian Super League": "ISL",
  "Thai League 1": "TL1",
  "Ukrainian Premier League": "UPL",
  "UAE Pro League": "UAE"
};

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function normalizeName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function inferLeagueMeta(team: FootballTeam) {
  if (team.leagueName) {
    return {
      leagueId: team.leagueId ?? null,
      leagueName: team.leagueName
    };
  }

  const tier = team.leagueTier ?? 1;
  const match =
    inferredLeagueCatalog.find(
      (entry) =>
        normalizeName(entry.country) === normalizeName(team.country) &&
        entry.tier === tier
    ) ?? null;

  if (!match) {
    return null;
  }

  return {
    leagueId: match.leagueId ?? null,
    leagueName: match.leagueName
  };
}

function isPointNearViewport(
  x: number,
  y: number,
  width: number,
  height: number,
  padding: number
) {
  return x >= -padding && x <= width + padding && y >= -padding && y <= height + padding;
}

function getRevealFactor(currentSpan: number, hiddenSpan: number, visibleSpan: number) {
  if (currentSpan >= hiddenSpan) {
    return 0;
  }

  if (currentSpan <= visibleSpan) {
    return 1;
  }

  return 1 - (currentSpan - visibleSpan) / (hiddenSpan - visibleSpan);
}

function getMarkerSize(teamId: string, selectedTeamId: string | null) {
  return selectedTeamId === teamId ? SELECTED_MARKER_SIZE : DEFAULT_MARKER_SIZE;
}

function resolveLeagueBadgeLogo(leagueId: number | null | undefined, leagueName: string) {
  if (leagueId && LEAGUE_BADGE_LOGOS_BY_ID[leagueId]) {
    return LEAGUE_BADGE_LOGOS_BY_ID[leagueId];
  }

  return null;
}

function getLeagueBadgeFallbackLogo(leagueName: string) {
  const label =
    LEAGUE_BADGE_SHORT_LABELS[leagueName] ??
    leagueName
      .split(/\s+/)
      .map((part) => part[0] ?? "")
      .join("")
      .slice(0, 3)
      .toUpperCase();
  const hue = Array.from(leagueName).reduce((sum, char) => sum + char.charCodeAt(0), 0) % 360;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 104">
      <defs>
        <linearGradient id="league-badge-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="hsl(${hue} 72% 52%)" />
          <stop offset="100%" stop-color="hsl(${(hue + 42) % 360} 74% 38%)" />
        </linearGradient>
      </defs>
      <rect x="12" y="14" width="136" height="76" rx="26" fill="rgba(4,8,13,0.78)" stroke="rgba(255,255,255,0.18)" stroke-width="2" />
      <rect x="22" y="24" width="116" height="10" rx="5" fill="url(#league-badge-gradient)" opacity="0.92" />
      <text x="80" y="68" font-family="Arial, sans-serif" font-size="27" font-weight="700" fill="white" text-anchor="middle" letter-spacing="3">${label}</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function getMinimumMarkerDistance(leftSize: number, rightSize: number) {
  return Math.max(leftSize, rightSize) * (1 - MAX_MARKER_OVERLAP_RATIO);
}

function getDistance(leftX: number, leftY: number, rightX: number, rightY: number) {
  return Math.hypot(leftX - rightX, leftY - rightY);
}

function getSeededUnitVector(seed: string) {
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = seed.charCodeAt(index) + ((hash << 5) - hash);
  }

  const angle = ((Math.abs(hash) % 360) * Math.PI) / 180;

  return {
    x: Math.cos(angle),
    y: Math.sin(angle)
  };
}

function clampPointOffset(baseX: number, baseY: number, x: number, y: number, maxOffset = MAX_MARKER_OFFSET) {
  const distance = getDistance(baseX, baseY, x, y);

  if (distance <= maxOffset || distance === 0) {
    return { x, y };
  }

  const scale = maxOffset / distance;

  return {
    x: baseX + (x - baseX) * scale,
    y: baseY + (y - baseY) * scale
  };
}

function buildMarkerClusters(markers: ProjectedTeamMarker[]) {
  const neighbors = Array.from({ length: markers.length }, () => [] as number[]);

  for (let leftIndex = 0; leftIndex < markers.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < markers.length; rightIndex += 1) {
      const left = markers[leftIndex];
      const right = markers[rightIndex];
      const minimumDistance = getMinimumMarkerDistance(left.size, right.size);

      if (getDistance(left.baseX, left.baseY, right.baseX, right.baseY) < minimumDistance) {
        neighbors[leftIndex].push(rightIndex);
        neighbors[rightIndex].push(leftIndex);
      }
    }
  }

  const visited = new Set<number>();
  const clusters: number[][] = [];

  for (let index = 0; index < markers.length; index += 1) {
    if (visited.has(index)) {
      continue;
    }

    const queue = [index];
    const cluster: number[] = [];
    visited.add(index);

    while (queue.length > 0) {
      const current = queue.shift()!;
      cluster.push(current);

      neighbors[current].forEach((neighbor) => {
        if (visited.has(neighbor)) {
          return;
        }

        visited.add(neighbor);
        queue.push(neighbor);
      });
    }

    clusters.push(cluster);
  }

  return clusters;
}

function resolveAnchorId(cluster: ProjectedTeamMarker[], selectedTeamId: string | null) {
  if (selectedTeamId && cluster.some((marker) => marker.id === selectedTeamId)) {
    return selectedTeamId;
  }

  const centroid = cluster.reduce(
    (accumulator, marker) => ({
      x: accumulator.x + marker.baseX / cluster.length,
      y: accumulator.y + marker.baseY / cluster.length
    }),
    { x: 0, y: 0 }
  );

  return [...cluster]
    .sort((left, right) => {
      const leftDistance = getDistance(left.baseX, left.baseY, centroid.x, centroid.y);
      const rightDistance = getDistance(right.baseX, right.baseY, centroid.x, centroid.y);

      if (Math.abs(leftDistance - rightDistance) > 0.1) {
        return leftDistance - rightDistance;
      }

      return left.id.localeCompare(right.id);
    })[0].id;
}

function layoutMarkerCluster(cluster: ProjectedTeamMarker[], selectedTeamId: string | null, clusterIndex: number) {
  const anchorId = resolveAnchorId(cluster, selectedTeamId);
  const positions = new Map(
    cluster.map((marker) => [
      marker.id,
      {
        x: marker.baseX,
        y: marker.baseY
      }
    ])
  );
  const sortedCluster = [...cluster].sort((left, right) => left.id.localeCompare(right.id));

  for (let pass = 0; pass < RELAXATION_PASSES; pass += 1) {
    for (let leftIndex = 0; leftIndex < sortedCluster.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < sortedCluster.length; rightIndex += 1) {
        const left = sortedCluster[leftIndex];
        const right = sortedCluster[rightIndex];
        const leftPoint = positions.get(left.id)!;
        const rightPoint = positions.get(right.id)!;
        const minimumDistance = getMinimumMarkerDistance(left.size, right.size);
        let dx = leftPoint.x - rightPoint.x;
        let dy = leftPoint.y - rightPoint.y;
        let distance = Math.hypot(dx, dy);

        if (distance >= minimumDistance) {
          continue;
        }

        if (distance < 0.001) {
          const seeded = getSeededUnitVector(`${left.id}:${right.id}`);
          dx = seeded.x;
          dy = seeded.y;
          distance = 1;
        }

        const push = minimumDistance - distance;
        const unitX = dx / distance;
        const unitY = dy / distance;
        const leftWeight = left.id === anchorId ? (left.id === selectedTeamId ? 0 : 0.28) : 1;
        const rightWeight = right.id === anchorId ? (right.id === selectedTeamId ? 0 : 0.28) : 1;
        const totalWeight = leftWeight + rightWeight;

        if (totalWeight <= 0) {
          continue;
        }

        positions.set(
          left.id,
          clampPointOffset(
            left.baseX,
            left.baseY,
            leftPoint.x + unitX * push * (leftWeight / totalWeight),
            leftPoint.y + unitY * push * (leftWeight / totalWeight)
          )
        );
        positions.set(
          right.id,
          clampPointOffset(
            right.baseX,
            right.baseY,
            rightPoint.x - unitX * push * (rightWeight / totalWeight),
            rightPoint.y - unitY * push * (rightWeight / totalWeight)
          )
        );
      }
    }

    sortedCluster.forEach((marker, index) => {
      if (marker.id === anchorId && marker.id === selectedTeamId) {
        positions.set(marker.id, {
          x: marker.baseX,
          y: marker.baseY
        });
        return;
      }

      const point = positions.get(marker.id)!;
      const spring = marker.id === anchorId ? 0.18 : 0.12;
      const fallbackAngle = (index + 1) * 2.399963229728653;
      const biasX = Math.cos(fallbackAngle) * 0.8;
      const biasY = Math.sin(fallbackAngle) * 0.8;

      positions.set(
        marker.id,
        clampPointOffset(
          marker.baseX,
          marker.baseY,
          point.x + (marker.baseX - point.x) * spring + biasX,
          point.y + (marker.baseY - point.y) * spring + biasY
        )
      );
    });
  }

  return sortedCluster.map((marker, index) => {
    const point = positions.get(marker.id)!;

    return {
      id: marker.id,
      baseX: marker.baseX,
      baseY: marker.baseY,
      x: point.x,
      y: point.y,
      zIndex:
        marker.id === selectedTeamId
          ? 420 + cluster.length
          : marker.id === anchorId
            ? 300 + cluster.length
            : 220 + index,
      clusterId: cluster.length > 1 ? `cluster-${clusterIndex}` : null,
      isClusterAnchor: marker.id === anchorId
    };
  });
}

function applyMarkerAvoidance(markers: ProjectedTeamMarker[], selectedTeamId: string | null) {
  const clusters = buildMarkerClusters(markers);

  return clusters
    .flatMap((cluster, clusterIndex) => {
      if (cluster.length === 1) {
        const marker = markers[cluster[0]];

        return [
          {
            id: marker.id,
            baseX: marker.baseX,
            baseY: marker.baseY,
            x: marker.baseX,
            y: marker.baseY,
            zIndex: marker.id === selectedTeamId ? 420 : 220,
            clusterId: null,
            isClusterAnchor: true
          }
        ];
      }

      return layoutMarkerCluster(
        cluster.map((markerIndex) => markers[markerIndex]),
        selectedTeamId,
        clusterIndex
      );
    })
    .sort((left, right) => {
      if (left.zIndex === right.zIndex) {
        return left.id.localeCompare(right.id);
      }

      return left.zIndex - right.zIndex;
    });
}

function getWorldViewPreset() {
  return {
    center: [10, 20] as [number, number],
    zoom: 1.7
  };
}

function walkCoordinates(
  geometry: GeoPolygonGeometry | GeoMultiPolygonGeometry,
  visitor: (longitude: number, latitude: number) => void
) {
  const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;

  polygons.forEach((polygon) => {
    polygon.forEach((ring) => {
      ring.forEach(([longitude, latitude]) => visitor(longitude, latitude));
    });
  });
}

function getRingMetrics(ring: GeoPosition[]): RingMetrics {
  let areaAccumulator = 0;
  let centroidXAccumulator = 0;
  let centroidYAccumulator = 0;

  for (let index = 0; index < ring.length - 1; index += 1) {
    const [x1, y1] = ring[index];
    const [x2, y2] = ring[index + 1];
    const cross = x1 * y2 - x2 * y1;

    areaAccumulator += cross;
    centroidXAccumulator += (x1 + x2) * cross;
    centroidYAccumulator += (y1 + y2) * cross;
  }

  const signedArea = areaAccumulator / 2;

  if (Math.abs(signedArea) < 1e-7) {
    const longitudeTotal = ring.reduce((sum, [longitude]) => sum + longitude, 0);
    const latitudeTotal = ring.reduce((sum, [, latitude]) => sum + latitude, 0);
    const count = Math.max(ring.length, 1);

    return {
      area: 0,
      centroidLng: longitudeTotal / count,
      centroidLat: latitudeTotal / count
    };
  }

  return {
    area: Math.abs(signedArea),
    centroidLng: centroidXAccumulator / (6 * signedArea),
    centroidLat: centroidYAccumulator / (6 * signedArea)
  };
}

function getPrimaryPolygonCentroid(
  geometry: GeoPolygonGeometry | GeoMultiPolygonGeometry
): RingMetrics | null {
  const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  let bestMetrics: RingMetrics | null = null;

  polygons.forEach((polygon) => {
    const outerRing = polygon[0];

    if (!outerRing?.length) {
      return;
    }

    const metrics = getRingMetrics(outerRing);

    if (!bestMetrics || metrics.area > bestMetrics.area) {
      bestMetrics = metrics;
    }
  });

  return bestMetrics;
}

function createCountryLabels(worldData: WorldCollection) {
  return worldData.features
    .map((feature) => {
      if (!feature.properties.name) {
        return null;
      }

      let minLng = Infinity;
      let maxLng = -Infinity;
      let minLat = Infinity;
      let maxLat = -Infinity;

      walkCoordinates(feature.geometry, (longitude, latitude) => {
        minLng = Math.min(minLng, longitude);
        maxLng = Math.max(maxLng, longitude);
        minLat = Math.min(minLat, latitude);
        maxLat = Math.max(maxLat, latitude);
      });

      const override = COUNTRY_LABEL_OVERRIDES[feature.properties.name];
      const primaryCentroid = getPrimaryPolygonCentroid(feature.geometry);

      return {
        id: feature.properties.name,
        name: feature.properties.name,
        lng: override?.lng ?? primaryCentroid?.centroidLng ?? (minLng + maxLng) / 2,
        lat: override?.lat ?? primaryCentroid?.centroidLat ?? (minLat + maxLat) / 2,
        roughArea: (maxLng - minLng) * (maxLat - minLat)
      };
    })
    .filter((feature): feature is CountryLabel => Boolean(feature));
}

function createCityLabels(teams: FootballTeam[]) {
  const cityMap = new Map<string, CityLabel>();

  teams.forEach((team) => {
    const cityId = team.city.toLowerCase().replace(/\s+/g, "-");
    const existing = cityMap.get(cityId);

    if (!existing) {
      cityMap.set(cityId, {
        id: cityId,
        name: team.city,
        lng: team.lng,
        lat: team.lat,
        priority: ["London", "Liverpool", "Madrid", "Barcelona", "Paris", "Munich", "Milan"].includes(team.city)
          ? 1
          : 2
      });
    }
  });

  EXTRA_CITY_LABELS.forEach((city) => {
    if (!cityMap.has(city.id)) {
      cityMap.set(city.id, city);
    }
  });

  worldCapitals.forEach((entry) => {
    const cityId = entry.capital.toLowerCase().replace(/\s+/g, "-");
    const existing = cityMap.get(cityId);

    if (existing) {
      cityMap.set(cityId, {
        ...existing,
        priority: 1
      });
      return;
    }

    cityMap.set(cityId, {
      id: cityId,
      name: entry.capital,
      lng: entry.lng,
      lat: entry.lat,
      priority: 1
    });
  });

  return Array.from(cityMap.values());
}

function createLeagueBadges(teams: FootballTeam[]) {
  const grouped = new Map<
    string,
    {
      leagueId: number | null;
      leagueName: string;
      teams: FootballTeam[];
    }
  >();

  teams.forEach((team) => {
    if (team.leagueTier !== 1) {
      return;
    }

    const leagueMeta = inferLeagueMeta(team);

    if (!leagueMeta?.leagueName) {
      return;
    }

    const groupKey = `${leagueMeta.leagueId ?? leagueMeta.leagueName}|${leagueMeta.leagueName}`;
    const existing = grouped.get(groupKey);

    if (existing) {
      existing.teams.push(team);
      return;
    }

    grouped.set(groupKey, {
      leagueId: leagueMeta.leagueId,
      leagueName: leagueMeta.leagueName,
      teams: [team]
    });
  });

  return Array.from(grouped.values())
    .filter((entry) => entry.teams.length >= 3)
    .map((entry) => {
      const logo = resolveLeagueBadgeLogo(entry.leagueId, entry.leagueName);

      if (!logo) {
        return null;
      }

      const lng = entry.teams.reduce((sum, team) => sum + team.lng, 0) / entry.teams.length;
      const lat = entry.teams.reduce((sum, team) => sum + team.lat, 0) / entry.teams.length;

      return {
        id: `league-${entry.leagueId ?? entry.leagueName}`,
        leagueId: entry.leagueId,
        leagueName: entry.leagueName,
        shortLabel: entry.leagueName,
        logo,
        lng,
        lat,
        clubCount: entry.teams.length
      };
    })
    .filter((entry): entry is LeagueBadgeSource => Boolean(entry));
}

function buildTiandituRasterTileUrl(key: string) {
  return `https://t0.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${key}`;
}

export function WorldDetailMap({
  selectedTeamId,
  onSelectTeam,
  teams,
  teamMap
}: WorldDetailMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [overlayPoints, setOverlayPoints] = useState<OverlayPoint[]>([]);
  const [leagueBadges, setLeagueBadges] = useState<ProjectedLeagueBadge[]>([]);
  const [countryLabels, setCountryLabels] = useState<ProjectedCountryLabel[]>([]);
  const [cityLabels, setCityLabels] = useState<ProjectedCityLabel[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isMapInteracting, setIsMapInteracting] = useState(false);
  const [viewSpan, setViewSpan] = useState({ lng: 360, lat: 170 });
  const tiandituKey = process.env.NEXT_PUBLIC_TIANDITU_KEY;
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const teamsRef = useRef<FootballTeam[]>(teams);
  const countryLabelSourceRef = useRef<CountryLabel[]>([]);
  const cityLabelSourceRef = useRef<CityLabel[]>(createCityLabels(teams));
  const leagueBadgeSourceRef = useRef<LeagueBadgeSource[]>(createLeagueBadges(teams));
  const syncOverlayPointsRef = useRef<(() => void) | null>(null);
  const selectedTeamIdRef = useRef<string | null>(selectedTeamId);
  const isMapInteractingRef = useRef(false);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    teamsRef.current = teams;
    cityLabelSourceRef.current = createCityLabels(teams);
    leagueBadgeSourceRef.current = createLeagueBadges(teams);
    syncOverlayPointsRef.current?.();
  }, [teams]);

  useEffect(() => {
    selectedTeamIdRef.current = selectedTeamId;
    syncOverlayPointsRef.current?.();
  }, [selectedTeamId]);

  useEffect(() => {
    if (mapboxToken) {
      mapboxgl.accessToken = mapboxToken;
    }
  }, [mapboxToken]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    if (!tiandituKey) {
      setMapError("缺少天地图 Key");
      return;
    }

    let disposed = false;
    const preset = getWorldViewPreset();
    let map: mapboxgl.Map;

    try {
      map = new mapboxgl.Map({
        container,
        style: {
          version: 8,
          sources: {
            "tdt-base": {
              type: "raster",
              tiles: [buildTiandituRasterTileUrl(tiandituKey)],
              tileSize: 256
            }
          },
          layers: [
            {
              id: "background",
              type: "background",
              paint: {
                "background-color": "#091116"
              }
            },
            {
              id: "tdt-base-layer",
              type: "raster",
              source: "tdt-base",
              paint: {
                "raster-opacity": 0.96,
                "raster-saturation": -1,
                "raster-contrast": 0.14,
                "raster-brightness-min": 0.24,
                "raster-brightness-max": 0.86
              }
            }
          ]
        },
        center: preset.center,
        zoom: preset.zoom,
        minZoom: 1.2,
        maxZoom: 6.6,
        maxBounds: [
          [-180, -82],
          [180, 85]
        ],
        dragRotate: false,
        pitchWithRotate: false,
        attributionControl: false,
        doubleClickZoom: true,
        projection: "mercator"
      });
    } catch (error) {
      setMapError(error instanceof Error ? error.message : "世界地图初始化失败");
      return;
    }

    mapRef.current = map;
    map.on("error", (event) => {
      if (event.error) {
        setMapError(event.error.message);
      }
    });

    const syncOverlayPoints = () => {
      if (!mapRef.current) {
        return;
      }

      const zoom = mapRef.current.getZoom();
      const bounds = mapRef.current.getBounds();

      if (!bounds) {
        return;
      }

      const longitudeSpan = (() => {
        const rawSpan = bounds.getEast() - bounds.getWest();

        return rawSpan < 0 ? rawSpan + 360 : rawSpan;
      })();
      const latitudeSpan = bounds.getNorth() - bounds.getSouth();

      setViewSpan({
        lng: longitudeSpan,
        lat: latitudeSpan
      });

      const containerWidth = mapRef.current.getContainer().clientWidth;
      const containerHeight = mapRef.current.getContainer().clientHeight;
      const isInteracting = isMapInteractingRef.current;
      const projectedMarkers = teamsRef.current.flatMap((team) => {
        const point = mapRef.current!.project([team.lng, team.lat]);
        const isVisible =
          team.id === selectedTeamIdRef.current ||
          isPointNearViewport(
            point.x,
            point.y,
            containerWidth,
            containerHeight,
            MARKER_VIEWPORT_PADDING
          );

        if (!isVisible) {
          return [];
        }

        return {
          id: team.id,
          baseX: point.x,
          baseY: point.y,
          size: getMarkerSize(team.id, selectedTeamIdRef.current)
        };
      });

      setOverlayPoints(
        (
          isInteracting
            ? projectedMarkers.map((marker) => ({
                id: marker.id,
                baseX: marker.baseX,
                baseY: marker.baseY,
                x: marker.baseX,
                y: marker.baseY,
                zIndex: marker.id === selectedTeamIdRef.current ? 420 : 220,
                clusterId: null,
                isClusterAnchor: true
              }))
            : applyMarkerAvoidance(projectedMarkers, selectedTeamIdRef.current)
        ).sort((left, right) => {
          if (left.zIndex === right.zIndex) {
            return left.id.localeCompare(right.id);
          }

          return left.zIndex - right.zIndex;
        })
      );
      setLeagueBadges(
        leagueBadgeSourceRef.current.flatMap((badge) => {
          const point = mapRef.current!.project([badge.lng, badge.lat]);

          if (
            !isPointNearViewport(
              point.x,
              point.y,
              containerWidth,
              containerHeight,
              LEAGUE_BADGE_VIEWPORT_PADDING
            )
          ) {
            return [];
          }

          return {
            ...badge,
            x: point.x,
            y: point.y
          };
        })
      );

      const minimumArea =
        longitudeSpan > 120 || latitudeSpan > 70
          ? 220
          : longitudeSpan > 70 || latitudeSpan > 40
            ? 150
            : longitudeSpan > 42 || latitudeSpan > 24
              ? 78
              : longitudeSpan > 24 || latitudeSpan > 14
                ? 28
                : 12;
      const allowFocusCountries = longitudeSpan <= 110 && latitudeSpan <= 60;
      const allowPriorityCountries = longitudeSpan <= 72 && latitudeSpan <= 40;
      const allowAllCountriesInRegion = longitudeSpan <= 52 && latitudeSpan <= 30;
      const cityPriorityLimit =
        longitudeSpan > 42 || latitudeSpan > 26
          ? 0
          : longitudeSpan > 28 || latitudeSpan > 18
            ? 1
            : longitudeSpan > 18 || latitudeSpan > 12
              ? 2
              : 3;

      setCountryLabels(
        isInteracting
          ? []
          : countryLabelSourceRef.current
          .filter(
            (label) => {
              if (
                label.name === "Portugal" &&
                (longitudeSpan > 52 || latitudeSpan > 30)
              ) {
                return false;
              }

              return (
                label.roughArea >= minimumArea ||
                allowAllCountriesInRegion ||
                (allowFocusCountries && FOCUS_COUNTRIES.has(label.name)) ||
                (allowPriorityCountries && COUNTRY_LABEL_PRIORITY.has(label.name))
              );
            }
          )
          .map((label) => {
            const point = mapRef.current!.project([label.lng, label.lat]);

            if (
              !isPointNearViewport(
                point.x,
                point.y,
                containerWidth,
                containerHeight,
                LABEL_VIEWPORT_PADDING
              )
            ) {
              return null;
            }

            return {
              ...label,
              x: point.x,
              y: point.y
            };
          })
          .filter((label): label is ProjectedCountryLabel => Boolean(label))
      );

      setCityLabels(
        isInteracting || cityPriorityLimit === 0
          ? []
          : cityLabelSourceRef.current
              .filter((label) => label.priority <= cityPriorityLimit)
              .map((label) => {
                const point = mapRef.current!.project([label.lng, label.lat]);

                if (
                  !isPointNearViewport(
                    point.x,
                    point.y,
                    containerWidth,
                    containerHeight,
                    LABEL_VIEWPORT_PADDING
                  )
                ) {
                  return null;
                }

                return {
                  ...label,
                  x: point.x,
                  y: point.y
                };
              })
              .filter((label): label is ProjectedCityLabel => Boolean(label))
      );
    };

    const scheduleSyncOverlayPoints = () => {
      if (frameRef.current !== null) {
        return;
      }

      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null;
        syncOverlayPoints();
      });
    };

    const setInteractionMode = (next: boolean) => {
      if (isMapInteractingRef.current !== next) {
        isMapInteractingRef.current = next;
        setIsMapInteracting(next);
      }

      scheduleSyncOverlayPoints();
    };

    syncOverlayPointsRef.current = scheduleSyncOverlayPoints;

    map.on("load", async () => {
      try {
        const response = await fetch("/world.json");

        if (!response.ok) {
          throw new Error("World label data unavailable");
        }

        const worldData = (await response.json()) as WorldCollection;

        if (disposed) {
          return;
        }

        countryLabelSourceRef.current = createCountryLabels(worldData);
        scheduleSyncOverlayPoints();
        setMapError(null);
      } catch (error) {
        setMapError(error instanceof Error ? error.message : "世界地图标签加载失败");
      }
    });

    map.on("movestart", () => setInteractionMode(true));
    map.on("moveend", () => setInteractionMode(false));
    map.on("zoomstart", () => setInteractionMode(true));
    map.on("zoomend", () => setInteractionMode(false));
    map.on("dragstart", () => setInteractionMode(true));
    map.on("dragend", () => setInteractionMode(false));
    map.on("move", scheduleSyncOverlayPoints);
    map.on("zoom", scheduleSyncOverlayPoints);
    map.on("resize", scheduleSyncOverlayPoints);

    return () => {
      disposed = true;
      syncOverlayPointsRef.current = null;
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      map.remove();
      mapRef.current = null;
    };
  }, [tiandituKey]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || !selectedTeamId) {
      return;
    }

    const focusedTeam = teamMap[selectedTeamId];

    if (!focusedTeam) {
      return;
    }

    map.easeTo({
      center: [focusedTeam.lng, focusedTeam.lat],
      zoom: Math.max(map.getZoom(), 4.2),
      duration: 900
    });
  }, [selectedTeamId, teamMap]);

  const showCityLabels = !isMapInteracting && viewSpan.lng <= 42 && viewSpan.lat <= 26;
  const showCountryLabels = !isMapInteracting && (viewSpan.lng > 18 || viewSpan.lat > 12);
  const teamMarkerReveal = Math.min(
    getRevealFactor(viewSpan.lng, 40, 15.5),
    getRevealFactor(viewSpan.lat, 24, 9.8)
  );
  const showTeamDots = teamMarkerReveal > 0.02;
  const teamMarkerOpacity = clamp01(0.08 + teamMarkerReveal * 0.92);
  const teamMarkerScale = 0.82 + teamMarkerReveal * 0.18;
  const teamLabelReveal = Math.min(
    getRevealFactor(viewSpan.lng, 11.5, 6.8),
    getRevealFactor(viewSpan.lat, 7.4, 4.6)
  );
  const showTeamLabels = !isMapInteracting && teamLabelReveal > 0.55;
  const teamLabelOpacity = clamp01(0.24 + teamLabelReveal * 0.76);
  const leagueBadgeReveal = Math.min(
    getRevealFactor(viewSpan.lng, 170, 78),
    getRevealFactor(viewSpan.lat, 98, 46)
  );
  const leagueBadgeOpacity = clamp01(leagueBadgeReveal * (1 - teamMarkerReveal));
  const showLeagueBadges = leagueBadgeOpacity > 0.04;
  const leagueBadgeScale = 0.96 + leagueBadgeOpacity * 0.22;

  return (
    <div className="relative h-screen min-h-screen w-full overflow-hidden bg-[#02050a]">
      <div
        ref={containerRef}
        className="absolute inset-0 h-full w-full"
        style={{ filter: "invert(1) grayscale(1) brightness(0.72) contrast(1.18)" }}
      />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(214,255,246,0.03),transparent_32%),linear-gradient(180deg,rgba(2,6,10,0),rgba(2,6,10,0.06))]" />

      <div className="pointer-events-none absolute inset-0 z-[16]">
        {showCountryLabels
          ? countryLabels.map((label) => (
              <div
                key={label.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[11px] font-medium tracking-[0.18em]"
                style={{
                  left: label.x,
                  top: label.y,
                  color: "rgba(245, 248, 250, 0.58)"
                }}
              >
                {label.name}
              </div>
            ))
          : null}
      </div>

      <div className="pointer-events-none absolute inset-0 z-[12]">
        {showLeagueBadges
          ? leagueBadges.map((badge) => (
              <div
                key={badge.id}
                className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2"
                style={{
                  left: badge.x,
                  top: badge.y,
                  opacity: leagueBadgeOpacity,
                  transform: `translate3d(-50%, -50%, 0) scale(${leagueBadgeScale})`,
                  willChange: "transform, opacity"
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={badge.logo}
                  alt={badge.leagueName}
                  className="h-[54px] w-[54px] object-contain"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                    if (event.currentTarget.parentElement instanceof HTMLElement) {
                      event.currentTarget.parentElement.style.display = "none";
                    }
                  }}
                  style={{
                    filter: isMapInteracting
                      ? "none"
                      : "drop-shadow(0 0 18px rgba(176, 226, 240, 0.12))"
                  }}
                />
              </div>
            ))
          : null}

      </div>

      <div className="pointer-events-none absolute inset-0 z-[17]">
        {showCityLabels
          ? cityLabels.map((label) => (
              <div
                key={label.id}
                className="absolute -translate-x-1/2 whitespace-nowrap font-light tracking-[0.16em]"
                style={{
                  left: label.x,
                  top: label.y + 14,
                  fontSize: "12.5px",
                  color: "rgba(164, 186, 194, 0.2)",
                  textShadow: "0 0 10px rgba(118, 145, 154, 0.05)"
                }}
              >
                {label.name}
              </div>
            ))
          : null}
      </div>

      <div className="pointer-events-none absolute inset-0 z-20">
        {overlayPoints.map((point) => {
          if (!showTeamDots) {
            return null;
          }

          const team = teamMap[point.id];
          const isSelected = selectedTeamId === team.id;

          return (
            <button
              key={team.id}
              type="button"
              onClick={() => onSelectTeam(team.id)}
              onWheel={(event) => {
                const mapContainer = mapRef.current?.getCanvasContainer();

                if (!mapContainer) {
                  return;
                }

                event.preventDefault();
                event.stopPropagation();
                mapContainer.dispatchEvent(
                  new window.WheelEvent("wheel", {
                    bubbles: true,
                    cancelable: true,
                    deltaMode: event.deltaMode,
                    deltaX: event.deltaX,
                    deltaY: event.deltaY,
                    deltaZ: event.deltaZ,
                    clientX: event.clientX,
                    clientY: event.clientY,
                    screenX: event.screenX,
                    screenY: event.screenY,
                    ctrlKey: event.ctrlKey,
                    shiftKey: event.shiftKey,
                    altKey: event.altKey,
                    metaKey: event.metaKey
                  })
                );
              }}
              className="pointer-events-auto absolute flex flex-col items-center gap-1.5"
              style={{
                left: point.x,
                top: point.y,
                zIndex: point.zIndex,
                opacity: isSelected ? Math.max(teamMarkerOpacity, 0.92) : teamMarkerOpacity,
                transform: `translate3d(-50%, -50%, 0) scale(${isSelected ? 1 : teamMarkerScale})`,
                willChange: "transform, opacity"
              }}
            >
              <span
                className="flex items-center justify-center"
                style={{
                  width: isSelected ? SELECTED_MARKER_SIZE : DEFAULT_MARKER_SIZE,
                  height: isSelected ? SELECTED_MARKER_SIZE : DEFAULT_MARKER_SIZE,
                  filter: isSelected
                    ? `drop-shadow(0 0 14px ${team.accent}aa) drop-shadow(0 0 24px ${team.accent}55)`
                    : isMapInteracting
                      ? "none"
                      : "drop-shadow(0 0 10px rgba(232,243,240,0.32))"
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={team.logo || getClubBadgeIcon(team.shortName, team.accent)}
                  alt={team.name}
                  className="h-full w-full object-contain"
                />
              </span>
              {showTeamLabels ? (
                <span
                  className="rounded-full border border-white/10 bg-black/50 px-2 py-1 text-[10px] tracking-[0.16em] text-white/84 backdrop-blur-md"
                  style={{
                    opacity: teamLabelOpacity,
                    backdropFilter: isMapInteracting ? "none" : undefined
                  }}
                >
                  {team.shortName}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {mapError ? (
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-30 w-[min(92vw,30rem)] -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-amber-300/25 bg-black/70 px-6 py-5 text-sm leading-7 text-amber-100 backdrop-blur-2xl">
          世界地图加载失败，请检查网络或渲染环境。
          <div className="mt-2 text-xs tracking-[0.2em] text-amber-200/70">渲染器 / {mapError}</div>
        </div>
      ) : null}
    </div>
  );
}
