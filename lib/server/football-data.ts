import "server-only";

import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { BlobNotFoundError, get as getBlob, put as putBlob } from "@vercel/blob";
import { CLUB_DETAILS, NATIONAL_MATCHES, NATIONAL_TEAM_DETAILS, NATIONAL_TEAMS, TEAMS, type Match } from "@/data/mockData";
import {
  BUNDESLIGA_BOOTSTRAP_CATALOG,
  FALLBACK_LEAGUE_CATALOG,
  HOT_GLOBE_NATIONAL_TEAMS,
  PRIORITY_BOOTSTRAP_CATALOG,
  SECONDARY_LEAGUE_COUNTRIES
} from "@/lib/football/config";
import { NATIONAL_COUNTRY_CODE_OVERRIDES, getFlagUrlForCountryCode, getNationalFlagUrl } from "@/lib/football/flags";
import { createFallbackFootballSnapshot } from "@/lib/football/fallback";
import { getFootballWorldCapitals } from "@/lib/football/national-geography";
import type {
  ApiFootballCoachResponse,
  ApiFootballCountryResponse,
  ApiFootballFixtureResponse,
  ApiFootballLeagueResponse,
  ApiFootballLineupResponse,
  ApiFootballTeamResponse,
  LeagueCatalogEntry,
  FootballSidebarFixtureStatus,
  FootballSidebarDetail,
  FootballSnapshot,
  FootballTeam,
  RefreshResult,
  SidebarFixtureOutcome
} from "@/lib/football/types";

const CACHE_DIR = path.join(process.cwd(), "data", "cache");
const SNAPSHOT_PATH = path.join(CACHE_DIR, "football-snapshot.json");
const SNAPSHOT_BACKUP_PATH = path.join(CACHE_DIR, "football-snapshot.previous.json");
const GEOCODE_CACHE_PATH = path.join(CACHE_DIR, "football-geocode.json");
const BLOB_SNAPSHOT_PATH = "football/football-snapshot.json";
const BLOB_SNAPSHOT_BACKUP_PATH = "football/football-snapshot.previous.json";
const BLOB_GEOCODE_CACHE_PATH = "football/football-geocode.json";
const API_BASE_URL = process.env.API_FOOTBALL_BASE_URL ?? "https://v3.football.api-sports.io";
const MAPBOX_GEOCODE_BASE_URL = "https://api.mapbox.com/geocoding/v5/mapbox.places";
const NOMINATIM_BASE_URL = process.env.GEOCODE_BASE_URL ?? "https://nominatim.openstreetmap.org/search";
const FOOTBALL_WORLD_CAPITALS = getFootballWorldCapitals();
const geocodeInFlight = new Map<string, Promise<{ lat: number; lng: number } | null>>();
const CLUB_CITY_OVERRIDES: Record<string, string> = {
  "Qingdao Youth Island": "Qingdao",
  "Dalian Huayi": "Dalian",
  "Dongguan United": "Foshan",
  "Guangxi Baoyun": "Pingguo",
  "Guangzhou E-Power": "Guangzhou",
  "Hebei Kungfu": "Shijiazhuang",
  "Nanjing City": "Nanjing",
  "Shaanxi Union": "Weinan",
  "Shenzhen Juniors": "Shenzhen",
  "Yanbian Longding": "Yanji"
};
const CLUB_STADIUM_OVERRIDES: Record<string, string> = {
  "Dalian Huayi": "Jinzhou Stadium",
  "Dongguan United": "Nanhai Sports Center Stadium",
  "Guangxi Baoyun": "Pingguo Stadium",
  "Guangzhou E-Power": "Yuexiushan Stadium",
  "Hebei Kungfu": "Yutong International Sports Center",
  "Nanjing City": "Wutaishan Stadium",
  "Shaanxi Union": "Weinan Sports Center Stadium",
  "Shenzhen Juniors": "Shenzhen Youth Football Training Base Centre Stadium",
  "Yanbian Longding": "Yanji Stadium"
};
const CLUB_COORD_OVERRIDES: Record<string, { lat: number; lng: number }> = {
  Monaco: { lat: 43.7384, lng: 7.4246 }
};
const GEOCODE_CITY_OVERRIDES: Record<string, string> = {
  "argentina|capital federal ciudad de buenos aires": "Buenos Aires",
  "mexico|d f": "Mexico City"
};
const API_FOOTBALL_REQUEST_LIMIT = 10;
const API_FOOTBALL_RATE_WINDOW_MS = 60_000;
const DEFAULT_API_FOOTBALL_SEASON = 2024;
const apiFootballRequestTimestamps: number[] = [];

const LIVE_STATUS = new Set(["1H", "2H", "HT", "ET", "BT", "P", "INT", "LIVE"]);
const UPCOMING_STATUS = new Set(["NS", "TBD", "PST"]);
const IGNORED_FIXTURE_STATUS = new Set(["CANC", "ABD", "AWD", "WO"]);
const SECONDARY_LEAGUE_PATTERN =
  /\b(2|ii|second|championship|serie b|segunda|liga 2|ligue 2|2\. bundesliga|division 2|league one)\b/i;
const EXCLUDED_LEAGUE_PATTERN =
  /\b(women|feminine|u(?:17|18|19|20|21|23)|youth|reserve|reserves|amateur|regional|state|provincial|nacional b)\b/i;

type GeocodeCache = Record<string, { lat: number; lng: number }>;
type BootstrapMode = "bundesliga" | "priority" | "curated" | "all";

const COUNTRY_NAME_ALIASES: Record<string, string[]> = {
  England: ["England", "Great Britain", "United Kingdom"],
  Scotland: ["Scotland", "Great Britain", "United Kingdom"],
  Wales: ["Wales", "Great Britain", "United Kingdom"],
  "Northern Ireland": ["Northern Ireland", "Great Britain", "United Kingdom"],
  "United States": ["United States", "USA", "United States of America"],
  "Saudi Arabia": ["Saudi Arabia"],
  China: ["China", "China PR"],
  "Antigua and Barb.": ["Antigua and Barbuda"],
  "Bosnia and Herz.": ["Bosnia and Herzegovina"],
  "Br. Indian Ocean Ter.": ["British Indian Ocean Territory"],
  "Cape Verde": ["Cape Verde", "Cabo Verde"],
  "Central African Rep.": ["Central African Republic"],
  "Côte d'Ivoire": ["Ivory Coast", "Cote d'Ivoire", "Côte d'Ivoire"],
  "Czech Rep.": ["Czech Republic", "Czechia"],
  "Dem. Rep. Congo": ["Democratic Republic of the Congo", "DR Congo"],
  "Dem. Rep. Korea": ["North Korea", "Korea DPR", "Democratic People's Republic of Korea"],
  "Dominican Rep.": ["Dominican Republic"],
  "Eq. Guinea": ["Equatorial Guinea"],
  "Faeroe Is.": ["Faroe Islands"],
  "Guinea-Bissau": ["Guinea-Bissau"],
  Korea: ["South Korea", "Korea Republic", "Republic of Korea"],
  "Lao PDR": ["Laos", "Lao People's Democratic Republic"],
  "N. Cyprus": ["Northern Cyprus"],
  "N. Mariana Is.": ["Northern Mariana Islands"],
  "Papua New Guinea": ["Papua New Guinea"],
  "S. Geo. and S. Sandw. Is.": ["South Georgia and the South Sandwich Islands"],
  "S. Sudan": ["South Sudan"],
  "Saint Helena": ["Saint Helena"],
  "Saint Lucia": ["Saint Lucia"],
  "São Tomé and Principe": ["Sao Tome and Principe", "São Tomé and Príncipe"],
  "Solomon Is.": ["Solomon Islands"],
  "Sri Lanka": ["Sri Lanka"],
  "St. Pierre and Miquelon": ["Saint Pierre and Miquelon"],
  "St. Vin. and Gren.": ["Saint Vincent and the Grenadines"],
  Swaziland: ["Eswatini", "Swaziland"],
  "Timor-Leste": ["Timor-Leste", "East Timor"],
  "Turks and Caicos Is.": ["Turks and Caicos Islands"],
  "U.S. Virgin Is.": ["United States Virgin Islands", "U.S. Virgin Islands"],
  "United Arab Emirates": ["United Arab Emirates", "UAE"],
  "United Rep. Tanzania": ["Tanzania", "United Republic of Tanzania"],
  "Wallis and Futuna Is.": ["Wallis and Futuna"],
  "W. Sahara": ["Western Sahara"]
};

const NATIONAL_TEAM_SEARCH_ALIASES: Record<string, string[]> = {
  France: ["France"],
  England: ["England"],
  Scotland: ["Scotland"],
  Wales: ["Wales"],
  "Northern Ireland": ["Northern Ireland"],
  Spain: ["Spain"],
  Germany: ["Germany"],
  Italy: ["Italy"],
  Portugal: ["Portugal"],
  Netherlands: ["Netherlands"],
  Croatia: ["Croatia"],
  Brazil: ["Brazil"],
  Argentina: ["Argentina"],
  Uruguay: ["Uruguay"],
  Colombia: ["Colombia"],
  Morocco: ["Morocco"],
  Japan: ["Japan"],
  "United States": ["United States", "USA", "United States of America"],
  Mexico: ["Mexico"],
  "Saudi Arabia": ["Saudi Arabia", "Saudi-Arabia"],
  Australia: ["Australia"],
  China: ["China PR", "China"]
};

const NATIONAL_TEAM_CODE_ALIASES: Record<string, string[]> = {
  France: ["FRA"],
  England: ["ENG"],
  Scotland: ["SCO"],
  Wales: ["WAL"],
  "Northern Ireland": ["NIR"],
  Spain: ["ESP"],
  Germany: ["GER"],
  Italy: ["ITA"],
  Portugal: ["POR"],
  Netherlands: ["NED"],
  Croatia: ["CRO"],
  Brazil: ["BRA"],
  Argentina: ["ARG"],
  Uruguay: ["URU"],
  Colombia: ["COL"],
  Morocco: ["MAR"],
  Japan: ["JPN"],
  "United States": ["USA"],
  Mexico: ["MEX"],
  "Saudi Arabia": ["KSA", "SAU"],
  Australia: ["AUS"],
  China: ["CHN"]
};

const COUNTRY_FLAG_URL_FALLBACKS: Record<string, string> = {
  Afghanistan: "https://flagcdn.com/w80/af.png",
  Aland: "https://flagcdn.com/w80/ax.png",
  "American Samoa": "https://flagcdn.com/w80/as.png",
  "Antigua and Barb.": "https://flagcdn.com/w80/ag.png",
  Bahamas: "https://flagcdn.com/w80/bs.png",
  "Bosnia and Herz.": "https://flagcdn.com/w80/ba.png",
  "Br. Indian Ocean Ter.": "https://flagcdn.com/w80/io.png",
  Brunei: "https://flagcdn.com/w80/bn.png",
  "Cape Verde": "https://flagcdn.com/w80/cv.png",
  "Cayman Is.": "https://flagcdn.com/w80/ky.png",
  "Central African Rep.": "https://flagcdn.com/w80/cf.png",
  Chad: "https://flagcdn.com/w80/td.png",
  Comoros: "https://flagcdn.com/w80/km.png",
  "Côte d'Ivoire": "https://flagcdn.com/w80/ci.png",
  Curaçao: "https://flagcdn.com/w80/cw.png",
  "Czech Rep.": "https://flagcdn.com/w80/cz.png",
  "Dem. Rep. Congo": "https://flagcdn.com/w80/cd.png",
  "Dem. Rep. Korea": "https://flagcdn.com/w80/kp.png",
  Djibouti: "https://flagcdn.com/w80/dj.png",
  Dominica: "https://flagcdn.com/w80/dm.png",
  "Dominican Rep.": "https://flagcdn.com/w80/do.png",
  "Eq. Guinea": "https://flagcdn.com/w80/gq.png",
  Eritrea: "https://flagcdn.com/w80/er.png",
  "Faeroe Is.": "https://flagcdn.com/w80/fo.png",
  "Falkland Is.": "https://flagcdn.com/w80/fk.png",
  "Fr. Polynesia": "https://flagcdn.com/w80/pf.png",
  Greenland: "https://flagcdn.com/w80/gl.png",
  Guam: "https://flagcdn.com/w80/gu.png",
  "Guinea-Bissau": "https://flagcdn.com/w80/gw.png",
  Guyana: "https://flagcdn.com/w80/gy.png",
  "Isle of Man": "https://flagcdn.com/w80/im.png",
  Jersey: "https://flagcdn.com/w80/je.png",
  Kiribati: "https://flagcdn.com/w80/ki.png",
  Korea: "https://flagcdn.com/w80/kr.png",
  "Lao PDR": "https://flagcdn.com/w80/la.png",
  Madagascar: "https://flagcdn.com/w80/mg.png",
  Micronesia: "https://flagcdn.com/w80/fm.png",
  Montserrat: "https://flagcdn.com/w80/ms.png",
  Mozambique: "https://flagcdn.com/w80/mz.png",
  "N. Mariana Is.": "https://flagcdn.com/w80/mp.png",
  "New Caledonia": "https://flagcdn.com/w80/nc.png",
  Niger: "https://flagcdn.com/w80/ne.png",
  Niue: "https://flagcdn.com/w80/nu.png",
  Palau: "https://flagcdn.com/w80/pw.png",
  "Papua New Guinea": "https://flagcdn.com/w80/pg.png",
  "Puerto Rico": "https://flagcdn.com/w80/pr.png",
  "S. Sudan": "https://flagcdn.com/w80/ss.png",
  "Saint Helena": "https://flagcdn.com/w80/sh.png",
  "Saint Lucia": "https://flagcdn.com/w80/lc.png",
  Samoa: "https://flagcdn.com/w80/ws.png",
  "São Tomé and Principe": "https://flagcdn.com/w80/st.png",
  Seychelles: "https://flagcdn.com/w80/sc.png",
  "Sierra Leone": "https://flagcdn.com/w80/sl.png",
  "Solomon Is.": "https://flagcdn.com/w80/sb.png",
  "Sri Lanka": "https://flagcdn.com/w80/lk.png",
  "St. Pierre and Miquelon": "https://flagcdn.com/w80/pm.png",
  "St. Vin. and Gren.": "https://flagcdn.com/w80/vc.png",
  Swaziland: "https://flagcdn.com/w80/sz.png",
  Timor: "https://flagcdn.com/w80/tl.png",
  Togo: "https://flagcdn.com/w80/tg.png",
  Tonga: "https://flagcdn.com/w80/to.png",
  Tunisia: "https://flagcdn.com/w80/tn.png",
  Turkmenistan: "https://flagcdn.com/w80/tm.png",
  Uganda: "https://flagcdn.com/w80/ug.png",
  Uzbekistan: "https://flagcdn.com/w80/uz.png",
  Vanuatu: "https://flagcdn.com/w80/vu.png",
  Yemen: "https://flagcdn.com/w80/ye.png",
  Zambia: "https://flagcdn.com/w80/zm.png",
  Zimbabwe: "https://flagcdn.com/w80/zw.png"
};

function getApiFootballKey() {
  return process.env.API_FOOTBALL_KEY ?? "";
}

function getMapboxToken() {
  return process.env.MAPBOX_ACCESS_TOKEN ?? process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
}

function getConfiguredFootballSeason() {
  const raw = process.env.API_FOOTBALL_LATEST_SEASON?.trim();
  const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN;

  return Number.isFinite(parsed) && parsed >= 2000 ? parsed : DEFAULT_API_FOOTBALL_SEASON;
}

function shouldUseBlobStorage() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

async function ensureCacheDir() {
  await mkdir(CACHE_DIR, { recursive: true });
}

async function readJsonBlob<T>(pathname: string): Promise<T | null> {
  try {
    const payload = await getBlob(pathname, {
      access: "public"
    });

    if (!payload || payload.statusCode !== 200) {
      return null;
    }

    const raw = await new Response(payload.stream).text();
    return JSON.parse(raw) as T;
  } catch (error) {
    if (error instanceof BlobNotFoundError) {
      return null;
    }

    throw error;
  }
}

async function writeJsonBlob(pathname: string, value: unknown) {
  await putBlob(pathname, JSON.stringify(value, null, 2), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json"
  });
}

async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function writeJsonFile(filePath: string, value: unknown) {
  await ensureCacheDir();
  await writeFile(filePath, JSON.stringify(value, null, 2), "utf8");
}

function isLiveStatus(status: string | undefined) {
  if (!status) {
    return false;
  }

  return LIVE_STATUS.has(status.toUpperCase());
}

function isUpcomingStatus(status: string | undefined) {
  if (!status) {
    return false;
  }

  return UPCOMING_STATUS.has(status.toUpperCase());
}

function shouldIgnoreFixtureStatus(status: string | undefined) {
  if (!status) {
    return false;
  }

  return IGNORED_FIXTURE_STATUS.has(status.toUpperCase());
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function createShortName(name: string) {
  const words = name
    .replace(/\./g, "")
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 1) {
    return words[0].slice(0, 3).toUpperCase();
  }

  return words
    .slice(0, 3)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 3);
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&apos;|&#0*39;|&#x0*27;/gi, "'")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, "\"")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .trim();
}

function sanitizeLocationLabel(value: string) {
  return decodeHtmlEntities(value).replace(/\s+/g, " ").trim();
}

function normalizeGeocodeCityLabel(value: string, country: string) {
  const cleanValue = sanitizeLocationLabel(value);
  const key = `${normalizeName(country)}|${normalizeName(cleanValue)}`;

  return GEOCODE_CITY_OVERRIDES[key] ?? cleanValue;
}

function buildGeocodeQueryCandidates(value: string) {
  const full = sanitizeLocationLabel(value);
  const firstSegment = sanitizeLocationLabel(full.split(",")[0] ?? full);

  return [firstSegment, full].filter(
    (candidate, index, list) =>
      candidate &&
      list.findIndex((item) => normalizeName(item) === normalizeName(candidate)) === index
  );
}

function colorFromString(seed: string) {
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = seed.charCodeAt(index) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash) % 360;

  return `hsl(${hue} 78% 66%)`;
}

async function mapWithConcurrency<T>(
  items: T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<void>
) {
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      await mapper(items[currentIndex], currentIndex);
    }
  }

  const workerCount = Math.max(1, Math.min(concurrency, items.length));
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
}

function normalizeName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function resolveCanonicalCountryName(country: string) {
  const normalizedCountry = normalizeName(country);
  const directMatch = FOOTBALL_WORLD_CAPITALS.find(
    (entry) => normalizeName(entry.country) === normalizedCountry
  );

  if (directMatch) {
    return directMatch.country;
  }

  for (const [canonicalCountry, aliases] of Object.entries(COUNTRY_NAME_ALIASES)) {
    if (
      normalizeName(canonicalCountry) === normalizedCountry ||
      aliases.some((alias) => normalizeName(alias) === normalizedCountry)
    ) {
      return canonicalCountry;
    }
  }

  return country;
}

function getCountryCapitalEntry(country: string) {
  const canonicalCountry = resolveCanonicalCountryName(country);

  return (
    FOOTBALL_WORLD_CAPITALS.find(
      (entry) => normalizeName(entry.country) === normalizeName(canonicalCountry)
    ) ?? null
  );
}

function isSameCoords(
  left: { lat: number; lng: number },
  right: { lat: number; lng: number },
  tolerance = 0.02
) {
  return Math.abs(left.lat - right.lat) <= tolerance && Math.abs(left.lng - right.lng) <= tolerance;
}

function toDateLabel(isoString: string) {
  const date = new Date(isoString);

  if (Number.isNaN(date.getTime())) {
    return "待定";
  }

  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");

  return `${month}-${day} ${hours}:${minutes}`;
}

function makeShortNarrative(fixture: ApiFootballFixtureResponse) {
  return `${fixture.league.name} 对阵数据已同步。`;
}

function inferOutcome(
  fixture: ApiFootballFixtureResponse,
  providerTeamId: number
): SidebarFixtureOutcome | undefined {
  const isHome = fixture.teams.home.id === providerTeamId;
  const homeGoals = fixture.goals.home ?? 0;
  const awayGoals = fixture.goals.away ?? 0;

  if (homeGoals === awayGoals) {
    return "D";
  }

  const won = isHome ? homeGoals > awayGoals : awayGoals > homeGoals;

  return won ? "W" : "L";
}

function fixtureTimestamp(fixture: ApiFootballFixtureResponse) {
  return new Date(fixture.fixture.date).getTime();
}

function sortFixturesByDateDescending(fixtures: ApiFootballFixtureResponse[]) {
  return [...fixtures].sort((left, right) => fixtureTimestamp(right) - fixtureTimestamp(left));
}

function getRecentFixtureCandidates(fixtures: ApiFootballFixtureResponse[]) {
  return sortFixturesByDateDescending(fixtures).filter((fixture) => {
    const status = fixture.fixture.status.short;

    return isLiveStatus(status) || (!isUpcomingStatus(status) && !shouldIgnoreFixtureStatus(status));
  });
}

function getNextFixtureCandidate(fixtures: ApiFootballFixtureResponse[]) {
  const now = Date.now();

  return [...fixtures]
    .filter((fixture) => {
      const status = fixture.fixture.status.short;

      if (shouldIgnoreFixtureStatus(status)) {
        return false;
      }

      if (isLiveStatus(status) || isUpcomingStatus(status)) {
        return true;
      }

      return fixtureTimestamp(fixture) >= now;
    })
    .sort((left, right) => fixtureTimestamp(left) - fixtureTimestamp(right))[0];
}

function createPlaceholderSnapshot() {
  return createFallbackFootballSnapshot();
}

export async function readFootballSnapshot(): Promise<FootballSnapshot> {
  const snapshot =
    shouldUseBlobStorage()
      ? await readJsonBlob<FootballSnapshot>(BLOB_SNAPSHOT_PATH)
      : await readJsonFile<FootballSnapshot>(SNAPSHOT_PATH);

  if (snapshot) {
    return snapshot;
  }

  const fallback = createPlaceholderSnapshot();
  await writeFootballSnapshot(fallback);
  return fallback;
}

export async function writeFootballSnapshot(snapshot: FootballSnapshot) {
  if (shouldUseBlobStorage()) {
    const existingSnapshot = await readJsonBlob<FootballSnapshot>(BLOB_SNAPSHOT_PATH);

    if (existingSnapshot) {
      await writeJsonBlob(BLOB_SNAPSHOT_BACKUP_PATH, existingSnapshot);
    }

    await writeJsonBlob(BLOB_SNAPSHOT_PATH, snapshot);
    return;
  }

  await ensureCacheDir();
  try {
    await copyFile(SNAPSHOT_PATH, SNAPSHOT_BACKUP_PATH);
  } catch {
    // Ignore missing snapshot on first write.
  }
  await writeJsonFile(SNAPSHOT_PATH, snapshot);
}

async function readGeocodeCache(): Promise<GeocodeCache> {
  const cache =
    shouldUseBlobStorage()
      ? await readJsonBlob<GeocodeCache>(BLOB_GEOCODE_CACHE_PATH)
      : await readJsonFile<GeocodeCache>(GEOCODE_CACHE_PATH);

  return cache ?? {};
}

async function writeGeocodeCache(cache: GeocodeCache) {
  if (shouldUseBlobStorage()) {
    await writeJsonBlob(BLOB_GEOCODE_CACHE_PATH, cache);
    return;
  }

  await writeJsonFile(GEOCODE_CACHE_PATH, cache);
}

async function waitForApiFootballSlot() {
  while (true) {
    const now = Date.now();

    while (
      apiFootballRequestTimestamps.length > 0 &&
      now - apiFootballRequestTimestamps[0] >= API_FOOTBALL_RATE_WINDOW_MS
    ) {
      apiFootballRequestTimestamps.shift();
    }

    if (apiFootballRequestTimestamps.length < API_FOOTBALL_REQUEST_LIMIT) {
      apiFootballRequestTimestamps.push(now);
      return;
    }

    const waitMs =
      API_FOOTBALL_RATE_WINDOW_MS - (now - apiFootballRequestTimestamps[0]) + 120;

    await new Promise((resolve) => setTimeout(resolve, Math.max(waitMs, 250)));
  }
}

async function apiFootballGet<T>(pathname: string, params: Record<string, string | number | boolean | undefined>) {
  const key = getApiFootballKey();

  if (!key) {
    throw new Error("缺少 API_FOOTBALL_KEY");
  }

  const url = new URL(`${API_BASE_URL.replace(/\/$/, "")}/${pathname.replace(/^\//, "")}`);

  Object.entries(params).forEach(([name, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    url.searchParams.set(name, String(value));
  });

  await waitForApiFootballSlot();

  const response = await fetch(url.toString(), {
    headers: {
      "x-apisports-key": key
    },
    next: { revalidate: 0 }
  });

  if (!response.ok) {
    throw new Error(`API-Football 请求失败: ${response.status}`);
  }

  const payload = (await response.json()) as {
    response?: T[];
    errors?: string[] | Record<string, string | string[]>;
  };

  const apiErrors = Array.isArray(payload.errors)
    ? payload.errors.filter(Boolean)
    : Object.values(payload.errors ?? {})
        .flatMap((value) => (Array.isArray(value) ? value : [value]))
        .filter(Boolean);

  if (apiErrors.length > 0) {
    throw new Error(`API-Football 返回错误: ${apiErrors.join(" / ")}`);
  }

  return payload.response ?? [];
}

function getClubNameCountryKey(name: string, country: string) {
  return `${normalizeName(name)}|${normalizeName(country)}`;
}

function getClubShortCountryKey(shortName: string, country: string) {
  return `${normalizeName(shortName)}|${normalizeName(country)}`;
}

function getLeadingNameToken(name: string) {
  return normalizeName(name).split(" ").find(Boolean) ?? "";
}

function hasStableShortCodeMatch(existingClub: FootballTeam, incomingName: string) {
  return getLeadingNameToken(existingClub.name) === getLeadingNameToken(incomingName);
}

function sortTeamsByCountryAndName(teams: FootballTeam[]) {
  return [...teams].sort((left, right) => {
    if (left.country === right.country) {
      return left.name.localeCompare(right.name);
    }

    return left.country.localeCompare(right.country);
  });
}

async function resolveProviderTeam(team: FootballTeam) {
  if (
    team.providerTeamId &&
    team.logo &&
    team.logo !== "/teams/national-generic.svg" &&
    team.countryCode
  ) {
    return {
      providerTeamId: team.providerTeamId,
      countryCode: team.countryCode ?? null,
      teamLogo: team.logo,
      venueName: team.stadium,
      venueCity: team.city,
      teamName: team.name
    };
  }

  const response: ApiFootballTeamResponse[] = [];
  const seenTeamIds = new Set<number>();
  const pushUnique = (entries: ApiFootballTeamResponse[]) => {
    entries.forEach((entry) => {
      const id = entry.team?.id;

      if (!id || seenTeamIds.has(id)) {
        return;
      }

      seenTeamIds.add(id);
      response.push(entry);
    });
  };

  if (team.providerTeamId) {
    const batch = await apiFootballGet<ApiFootballTeamResponse>("teams", {
      id: team.providerTeamId
    });
    pushUnique(batch);
  }

  const searchTerms =
    team.isNationalTeam
      ? NATIONAL_TEAM_SEARCH_ALIASES[team.country] ?? [team.name, team.country]
      : [team.name];

  for (const term of searchTerms) {
    const batch = await apiFootballGet<ApiFootballTeamResponse>("teams", {
      search: term
    });
    pushUnique(batch);
  }

  if (team.isNationalTeam) {
    const countryTerms = NATIONAL_TEAM_SEARCH_ALIASES[team.country] ?? [team.country];

    for (const term of countryTerms) {
      const batch = await apiFootballGet<ApiFootballTeamResponse>("teams", {
        country: term
      });
      pushUnique(batch);
    }

    const codeTerms = new Set<string>(
      [
        ...(NATIONAL_TEAM_CODE_ALIASES[team.country] ?? []),
        team.countryCode?.toUpperCase()
      ].filter((value): value is string => Boolean(value))
    );

    for (const code of codeTerms) {
      const batch = await apiFootballGet<ApiFootballTeamResponse>("teams", {
        code
      });
      pushUnique(batch);
    }
  }

  const normalize = (value: string | null | undefined) =>
    (value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const candidateCountryNames = new Set(
    (COUNTRY_NAME_ALIASES[team.country] ?? [team.country]).map((name) => normalize(name))
  );
  const exactMatch =
    response.find((entry) => {
      const teamName = normalize(entry.team?.name);
      const country = normalize(entry.team?.country);
      const isNational = Boolean(entry.team?.national);

      return (
        (teamName === normalize(team.name) || teamName === normalize(team.country)) &&
        candidateCountryNames.has(country) &&
        isNational === Boolean(team.isNationalTeam)
      );
    }) ??
    response.find((entry) => {
      const country = normalize(entry.team?.country);
      const isNational = Boolean(entry.team?.national);

      return candidateCountryNames.has(country) && isNational === Boolean(team.isNationalTeam);
    });

  const providerTeamId = exactMatch?.team?.id;

  if (!providerTeamId) {
    throw new Error(`未能解析 ${team.name} 的 API-Football team id`);
  }

  return {
    providerTeamId,
    countryCode: exactMatch?.team?.code ?? null,
    teamLogo: exactMatch?.team?.logo ?? team.logo,
    venueName: exactMatch?.venue?.name ?? team.stadium,
    venueCity: exactMatch?.venue?.city ?? team.city,
    teamName: exactMatch?.team?.name ?? team.name
  };
}

function fixtureOpponentName(fixture: ApiFootballFixtureResponse, providerTeamId: number) {
  return fixture.teams.home.id === providerTeamId ? fixture.teams.away.name : fixture.teams.home.name;
}

function mapRecentFixtures(fixtures: ApiFootballFixtureResponse[], providerTeamId: number) {
  return fixtures.map((fixture) => ({
    id: `fixture-${fixture.fixture.id}`,
    competition: fixture.league.name,
    opponent: fixtureOpponentName(fixture, providerTeamId),
    dateLabel: toDateLabel(fixture.fixture.date),
    venue: fixture.fixture.venue?.city ?? fixture.fixture.venue?.name ?? "待定",
    status: (isLiveStatus(fixture.fixture.status.short) ? "live" : "finished") as FootballSidebarFixtureStatus,
    outcome: inferOutcome(fixture, providerTeamId),
    score: `${fixture.goals.home ?? 0} - ${fixture.goals.away ?? 0}`,
    minute: fixture.fixture.status.elapsed ?? undefined,
    note: makeShortNarrative(fixture)
  }));
}

function fallbackNextFixture(team: FootballTeam): FootballSidebarDetail["nextFixture"] {
  return {
    id: `${team.id}-next`,
    competition: "暂无数据",
    opponent: "暂无数据",
    dateLabel: "暂无数据",
    venue: team.city,
    status: "scheduled",
    note: "API 当前没有返回可用赛程数据。"
  };
}

function createPlaceholderDetail(team: FootballTeam): FootballSidebarDetail {
  return {
    coach: "暂无数据",
    coachTitle: "主教练",
    honors: ["暂无数据"],
    recentFixtures: [],
    nextFixture: fallbackNextFixture(team),
    lineup: {
      formation: "暂无数据",
      matchLabel: "最近一场阵容暂无数据",
      players: []
    },
    providerTeamId: team.providerTeamId ?? null,
    dataStatus: "fallback"
  };
}

function isPlaceholderDetail(detail: FootballSidebarDetail | undefined) {
  if (!detail) {
    return true;
  }

  const hasCoach = detail.coach && detail.coach !== "暂无数据";
  const hasHonors = detail.honors?.length && !detail.honors.every((item) => item === "暂无数据");
  const hasRecentFixtures = detail.recentFixtures?.length > 0;
  const hasLineup = detail.lineup?.players?.length > 0;
  const hasRealNextFixture = Boolean(detail.nextFixture && detail.nextFixture.competition !== "暂无数据");

  return !(hasCoach || hasHonors || hasRecentFixtures || hasLineup || hasRealNextFixture);
}

function getTemplateDetail(team: FootballTeam) {
  const detail = team.isNationalTeam ? NATIONAL_TEAM_DETAILS[team.id] : CLUB_DETAILS[team.id];

  return detail
    ? ({
        ...detail,
        dataStatus: "fallback"
      } as FootballSidebarDetail)
    : null;
}

function getReferenceDetail(team: FootballTeam, existingDetail?: FootballSidebarDetail): FootballSidebarDetail {
  const templateDetail = getTemplateDetail(team);
  const fallbackDetail = templateDetail ?? createPlaceholderDetail(team);
  const hasUsableCoach = Boolean(existingDetail?.coach && existingDetail.coach !== "暂无数据");
  const hasUsableHonors = Boolean(
    existingDetail?.honors?.length && !existingDetail.honors.every((item) => item === "暂无数据")
  );
  const hasUsableRecentFixtures = Boolean(existingDetail?.recentFixtures?.length);
  const hasUsableNextFixture = Boolean(
    existingDetail?.nextFixture && existingDetail.nextFixture.competition !== "暂无数据"
  );
  const hasUsableLineup = Boolean(
    existingDetail?.lineup?.players?.length &&
      existingDetail.lineup.players.some((player) => player.x !== 50 || player.y !== 50)
  );

  return {
    ...fallbackDetail,
    ...existingDetail,
    coach: hasUsableCoach ? existingDetail!.coach : fallbackDetail.coach,
    coachTitle: hasUsableCoach ? existingDetail!.coachTitle : fallbackDetail.coachTitle,
    honors: hasUsableHonors ? existingDetail!.honors : fallbackDetail.honors,
    recentFixtures: hasUsableRecentFixtures ? existingDetail!.recentFixtures : fallbackDetail.recentFixtures,
    nextFixture: hasUsableNextFixture ? existingDetail!.nextFixture : fallbackDetail.nextFixture,
    lineup: hasUsableLineup ? existingDetail!.lineup : fallbackDetail.lineup,
    providerTeamId: existingDetail?.providerTeamId ?? team.providerTeamId ?? fallbackDetail.providerTeamId ?? null,
    dataStatus: existingDetail?.dataStatus ?? fallbackDetail.dataStatus ?? "fallback"
  };
}

function hasResolvedStaticProfile(team: FootballTeam, detail: FootballSidebarDetail | undefined) {
  const hasLogo = Boolean(team.logo && team.logo !== "/teams/national-generic.svg");
  const hasCoach = Boolean(detail?.dataStatus === "live" && detail?.coach && detail.coach !== "暂无数据");
  const hasHonors = Boolean(
    detail?.dataStatus === "live" &&
      detail?.honors?.length &&
      !detail.honors.every((item) => item === "暂无数据")
  );

  return hasLogo && hasCoach && hasHonors;
}

function fallbackCapitalCoords(country: string) {
  const capital = getCountryCapitalEntry(country);

  if (!capital) {
    return null;
  }

  return {
    lat: capital.lat,
    lng: capital.lng
  };
}

async function geocodeCity(city: string, country: string, cache: GeocodeCache) {
  const resolvedCity = sanitizeLocationLabel(city);
  const resolvedCountry = resolveCanonicalCountryName(country);
  const key = `${resolvedCity}|${resolvedCountry}`.toLowerCase();
  const cached = cache[key];
  const capital = getCountryCapitalEntry(resolvedCountry);
  const isCapitalCity = capital
    ? normalizeName(resolvedCity) === normalizeName(capital.capital) ||
      normalizeName(resolvedCity) === normalizeName(resolvedCountry)
    : false;
  const queryCandidates = buildGeocodeQueryCandidates(resolvedCity);

  if (cached && (!capital || isCapitalCity || !isSameCoords(cached, capital))) {
    return cached;
  }

  const inflight = geocodeInFlight.get(key);

  if (inflight) {
    return inflight;
  }

  const request = (async () => {
    try {
      const mapboxToken = getMapboxToken();

      if (mapboxToken) {
        for (const query of queryCandidates) {
          const queryKey = `${query}|${resolvedCountry}`.toLowerCase();
          const queryCached = cache[queryKey];

          if (queryCached && (!capital || isCapitalCity || !isSameCoords(queryCached, capital))) {
            cache[key] = queryCached;
            return queryCached;
          }

          const url = new URL(
            `${MAPBOX_GEOCODE_BASE_URL}/${encodeURIComponent(`${query}, ${resolvedCountry}`)}.json`
          );
          url.searchParams.set("access_token", mapboxToken);
          url.searchParams.set("autocomplete", "false");
          url.searchParams.set("limit", "1");
          url.searchParams.set("types", "place,locality,district");

          const response = await fetch(url.toString(), {
            signal: AbortSignal.timeout(5000),
            next: { revalidate: 0 }
          });

          if (!response.ok) {
            continue;
          }

          const payload = (await response.json()) as {
            features?: Array<{ center?: [number, number] }>;
          };
          const center = payload.features?.[0]?.center;

          if (center && Number.isFinite(center[0]) && Number.isFinite(center[1])) {
            const coords = {
              lat: center[1],
              lng: center[0]
            };
            cache[key] = coords;
            cache[queryKey] = coords;
            return coords;
          }
        }
      }

      for (const query of queryCandidates) {
        const url = new URL(NOMINATIM_BASE_URL);
        url.searchParams.set("city", query);
        url.searchParams.set("country", resolvedCountry);
        url.searchParams.set("format", "jsonv2");
        url.searchParams.set("limit", "1");

        const response = await fetch(url.toString(), {
          headers: {
            "User-Agent": "livegoal-map/0.1"
          },
          signal: AbortSignal.timeout(4000),
          next: { revalidate: 0 }
        });

        if (!response.ok) {
          continue;
        }

        const payload = (await response.json()) as Array<{ lat: string; lon: string }>;
        const first = payload[0];

        if (!first) {
          continue;
        }

        const coords = {
          lat: Number(first.lat),
          lng: Number(first.lon)
        };

        if (Number.isFinite(coords.lat) && Number.isFinite(coords.lng)) {
          cache[key] = coords;
          cache[`${query}|${resolvedCountry}`.toLowerCase()] = coords;
          return coords;
        }
      }
    } catch {
      // Fall through to capital fallback below.
    }

    const fallback = fallbackCapitalCoords(resolvedCountry);

    if (fallback && isCapitalCity) {
      cache[key] = fallback;
    }

    return fallback;
  })();

  geocodeInFlight.set(key, request);

  try {
    return await request;
  } finally {
    geocodeInFlight.delete(key);
  }
}

function countryToFlagUrl(countryCode: string | null | undefined, upstreamFlagUrl?: string | null) {
  return getFlagUrlForCountryCode(countryCode, upstreamFlagUrl);
}

async function fetchCountryLookup() {
  const countries = await apiFootballGet<ApiFootballCountryResponse>("countries", {});
  const lookup = new Map<string, ApiFootballCountryResponse>();

  countries.forEach((entry) => {
    lookup.set(normalizeName(entry.name), entry);
  });

  return lookup;
}

function resolveCountryMetadata(
  country: string,
  countryLookup: Map<string, ApiFootballCountryResponse>
) {
  const names = COUNTRY_NAME_ALIASES[country] ?? [country];

  for (const name of names) {
    const match = countryLookup.get(normalizeName(name));

    if (match) {
      return {
        countryCode: match.code ?? null,
        countryFlagUrl: countryToFlagUrl(match.code ?? null, match.flag ?? null)
      };
    }
  }

  return {
    countryCode: null,
    countryFlagUrl: COUNTRY_FLAG_URL_FALLBACKS[country] ?? getNationalFlagUrl(country)
  };
}

function scoreLeague(entry: ApiFootballLeagueResponse) {
  const name = entry.league.name;

  if (entry.league.type !== "League" || EXCLUDED_LEAGUE_PATTERN.test(name)) {
    return -1000;
  }

  let score = 0;

  if (!SECONDARY_LEAGUE_PATTERN.test(name)) {
    score += 25;
  } else {
    score -= 30;
  }

  if (/\b(premier|super|first|division 1|liga 1|serie a|ligue 1|bundesliga|eredivisie|pro league|mls)\b/i.test(name)) {
    score += 30;
  }

  if (/\b(top|elite|professional)\b/i.test(name)) {
    score += 12;
  }

  if (/\b(national|regional|state)\b/i.test(name)) {
    score -= 14;
  }

  const currentSeason = entry.seasons?.find((season) => season.current);
  if (currentSeason) {
    score += 6;
  }

  return score;
}

function chooseLeagueCatalogFromApi(leagues: ApiFootballLeagueResponse[]) {
  const grouped = new Map<string, ApiFootballLeagueResponse[]>();

  leagues.forEach((entry) => {
    const country = entry.country.name?.trim();

    if (!country || country === "World") {
      return;
    }

    const list = grouped.get(country) ?? [];
    list.push(entry);
    grouped.set(country, list);
  });

  const catalog = [];

  for (const [country, entries] of grouped.entries()) {
    const ranked = entries
      .map((entry) => ({ entry, score: scoreLeague(entry) }))
      .filter((entry) => entry.score > -100)
      .sort((left, right) => right.score - left.score);

    const primary = ranked[0]?.entry;

    if (primary) {
      catalog.push({
        country,
        tier: 1,
        leagueId: primary.league.id,
        leagueName: primary.league.name,
        season: primary.seasons?.find((season) => season.current)?.year ?? new Date().getUTCFullYear()
      });
    }

    if (SECONDARY_LEAGUE_COUNTRIES.includes(country)) {
      const secondary =
        ranked.find((item) => item.entry.league.id !== primary?.league.id && SECONDARY_LEAGUE_PATTERN.test(item.entry.league.name))
          ?.entry ??
        ranked.find((item) => item.entry.league.id !== primary?.league.id)?.entry;

      if (secondary) {
        catalog.push({
          country,
          tier: 2,
          leagueId: secondary.league.id,
          leagueName: secondary.league.name,
          season: secondary.seasons?.find((season) => season.current)?.year ?? new Date().getUTCFullYear()
        });
      }
    }
  }

  return catalog.sort((left, right) => {
    if (left.country === right.country) {
      return left.tier - right.tier;
    }

    return left.country.localeCompare(right.country);
  });
}

async function resolveLeagueCatalog(mode: BootstrapMode) {
  const season = getConfiguredFootballSeason();

  if (mode === "bundesliga") {
    return BUNDESLIGA_BOOTSTRAP_CATALOG.map((entry) => ({
      ...entry,
      season
    }));
  }

  if (mode === "priority") {
    return PRIORITY_BOOTSTRAP_CATALOG.map((entry) => ({
      ...entry,
      season
    }));
  }

  if (mode === "curated") {
    return FALLBACK_LEAGUE_CATALOG.map((entry) => ({
      ...entry,
      season: entry.season ?? season
    }));
  }

  const leagues = await apiFootballGet<ApiFootballLeagueResponse>("leagues", {
    current: true
  });

  const derived = chooseLeagueCatalogFromApi(leagues);

  return derived.length > 0
    ? derived
    : FALLBACK_LEAGUE_CATALOG.map((entry) => ({
        ...entry,
        season: entry.season ?? new Date().getUTCFullYear()
      }));
}

function mergeLeagueCatalogEntries(
  existingCatalog: LeagueCatalogEntry[],
  importedCatalog: LeagueCatalogEntry[]
) {
  const merged = new Map<string, LeagueCatalogEntry>();

  [...existingCatalog, ...importedCatalog].forEach((entry) => {
    const key = `${entry.country}|${entry.tier}|${entry.leagueId ?? entry.leagueName}`;
    merged.set(key, entry);
  });

  return Array.from(merged.values()).sort((left, right) => {
    if (left.country === right.country) {
      return left.tier - right.tier || left.leagueName.localeCompare(right.leagueName);
    }

    return left.country.localeCompare(right.country);
  });
}

function mergeClubDetails(baseDetails: Record<string, FootballSidebarDetail>, clubs: FootballTeam[]) {
  const nextDetails: Record<string, FootballSidebarDetail> = {};

  clubs.forEach((team) => {
    nextDetails[team.id] = baseDetails[team.id] ?? createPlaceholderDetail(team);
  });

  return nextDetails;
}

function mergeCuratedTeams(teams: FootballTeam[], curatedTeams: FootballTeam[]) {
  const nextTeams = new Map(teams.map((team) => [team.id, team]));

  curatedTeams.forEach((curatedTeam) => {
    const existing = nextTeams.get(curatedTeam.id);
    nextTeams.set(
      curatedTeam.id,
      existing
        ? existing.providerTeamId
          ? hasStableShortCodeMatch(existing, curatedTeam.name) ||
            normalizeName(existing.name) === normalizeName(curatedTeam.name)
            ? { ...curatedTeam, ...existing }
            : {
                ...existing,
                ...curatedTeam,
                providerTeamId: null,
                leagueId: null,
                leagueName: null
              }
          : {
              ...existing,
              ...curatedTeam,
              logo:
                existing.logo && existing.logo !== "/teams/national-generic.svg"
                  ? existing.logo
                  : curatedTeam.logo,
              providerTeamId: existing.providerTeamId ?? curatedTeam.providerTeamId ?? null,
              countryCode: existing.countryCode ?? curatedTeam.countryCode ?? null,
              countryFlagUrl: existing.countryFlagUrl ?? curatedTeam.countryFlagUrl ?? null,
              leagueId: existing.leagueId ?? curatedTeam.leagueId ?? null,
              leagueName: existing.leagueName ?? curatedTeam.leagueName ?? null
            }
        : curatedTeam
    );
  });

  return Array.from(nextTeams.values());
}

function getImportedLeagueTierKeys(snapshot: FootballSnapshot) {
  if (snapshot.source !== "api-football") {
    return null;
  }

  return new Set(
    snapshot.leagueCatalog.map((entry) => `${normalizeName(entry.country)}|${entry.tier}`)
  );
}

function mergeImportedClubs(
  baseClubs: FootballTeam[],
  importedClubs: FootballTeam[],
  leagueCatalog: Array<{ country: string; tier: number }>
) {
  const targetedLeagueTiers = new Set(
    leagueCatalog.map((entry) => `${normalizeName(entry.country)}|${entry.tier}`)
  );
  const importedIds = new Set(importedClubs.map((team) => team.id));
  const importedProviderIds = new Set(
    importedClubs
      .map((team) => team.providerTeamId)
      .filter((providerTeamId): providerTeamId is number => Number.isFinite(providerTeamId))
  );
  const importedNameCountryKeys = new Set(
    importedClubs.map((team) => getClubNameCountryKey(team.name, team.country))
  );
  const nextClubs = new Map<string, FootballTeam>();

  baseClubs.forEach((team) => {
    if (team.isNationalTeam) {
      nextClubs.set(team.id, team);
      return;
    }

    const teamTier = team.leagueTier ?? 1;
    const leagueKey = `${normalizeName(team.country)}|${teamTier}`;

    if (!targetedLeagueTiers.has(leagueKey)) {
      nextClubs.set(team.id, team);
      return;
    }

    const hasImportedReplacement =
      importedIds.has(team.id) ||
      (team.providerTeamId ? importedProviderIds.has(team.providerTeamId) : false) ||
      importedNameCountryKeys.has(getClubNameCountryKey(team.name, team.country));

    if (!hasImportedReplacement) {
      nextClubs.set(team.id, team);
    }
  });

  importedClubs.forEach((importedTeam) => {
    const existing = nextClubs.get(importedTeam.id);
    nextClubs.set(importedTeam.id, existing ? { ...existing, ...importedTeam } : importedTeam);
  });

  return sortTeamsByCountryAndName(Array.from(nextClubs.values()));
}

function resolveAmbientNationalMatches(
  nationalTeams: FootballTeam[],
  preferredMatches: Match[]
) {
  const hotTeamIds = new Set(
    HOT_GLOBE_NATIONAL_TEAMS.filter((entry) => entry.allowFlyline).map((entry) => entry.id)
  );
  const validTeamIds = new Set(
    nationalTeams.filter((team) => hotTeamIds.has(team.id)).map((team) => team.id)
  );
  const curatedMatches = NATIONAL_MATCHES.filter(
    (match) => validTeamIds.has(match.homeTeamId) && validTeamIds.has(match.awayTeamId)
  );
  const merged = new Map<string, Match>();

  [...preferredMatches, ...curatedMatches].forEach((match) => {
    if (!validTeamIds.has(match.homeTeamId) || !validTeamIds.has(match.awayTeamId)) {
      return;
    }

    const pairKey = [match.homeTeamId, match.awayTeamId].sort().join("__");

    if (!merged.has(pairKey)) {
      merged.set(pairKey, match);
    }
  });

  return Array.from(merged.values());
}

function buildNationalMatchesFromDetails(
  nationalTeams: FootballTeam[],
  nationalTeamDetails: Record<string, FootballSidebarDetail>
): Match[] {
  const hotTeamIds = new Set(
    HOT_GLOBE_NATIONAL_TEAMS.filter((entry) => entry.allowFlyline).map((entry) => entry.id)
  );
  const hotTeams = nationalTeams.filter((team) => hotTeamIds.has(team.id));
  const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const today = new Date();
  const todayLabel = `${`${today.getMonth() + 1}`.padStart(2, "0")}-${`${today.getDate()}`.padStart(2, "0")}`;
  const aliases = new Map<string, string>();

  hotTeams.forEach((team) => {
    aliases.set(normalize(team.name), team.id);
    aliases.set(normalize(team.country), team.id);
    aliases.set(normalize(team.shortName), team.id);
  });

  const matches = new Map<string, Match>();

  hotTeams.forEach((team, index) => {
    const fixture = nationalTeamDetails[team.id]?.nextFixture;

    if (!fixture) {
      return;
    }

    const isMatchDay = fixture.status === "live" || fixture.dateLabel.startsWith(todayLabel);

    if (!isMatchDay) {
      return;
    }

    const opponentId = aliases.get(normalize(fixture.opponent));

    if (!opponentId || opponentId === team.id) {
      return;
    }

    const [homeTeamId, awayTeamId] = [team.id, opponentId].sort();
    const pairId = `${homeTeamId}__${awayTeamId}`;

    if (matches.has(pairId)) {
      return;
    }

    matches.set(pairId, {
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

  return Array.from(matches.values());
}

function seedDetailCache(
  teams: FootballTeam[],
  baseDetails: Record<string, FootballSidebarDetail>
) {
  const nextDetails: Record<string, FootballSidebarDetail> = {};

  teams.forEach((team) => {
    const existing = baseDetails[team.id];
    const reference = getReferenceDetail(team, existing);
    nextDetails[team.id] = {
      ...reference,
      providerTeamId: team.providerTeamId ?? existing?.providerTeamId ?? reference.providerTeamId ?? null,
      dataStatus: existing?.dataStatus === "cached" ? "cached" : reference.dataStatus ?? "fallback"
    };
  });

  return nextDetails;
}

async function buildClubsFromLeagues(
  baseSnapshot: FootballSnapshot,
  leagueCatalog = FALLBACK_LEAGUE_CATALOG,
  geocodeCache: GeocodeCache
) {
  const existingByProviderId = new Map<number, FootballTeam>();
  const existingByNameCountry = new Map<string, FootballTeam>();
  const existingByShortCountry = new Map<string, FootballTeam[]>();

  baseSnapshot.clubs.forEach((club) => {
    if (club.providerTeamId) {
      existingByProviderId.set(club.providerTeamId, club);
    }

    existingByNameCountry.set(getClubNameCountryKey(club.name, club.country), club);
    const shortKey = getClubShortCountryKey(club.shortName, club.country);
    existingByShortCountry.set(shortKey, [...(existingByShortCountry.get(shortKey) ?? []), club]);
  });

  const nextClubs = new Map<string, FootballTeam>();

  for (const leagueEntry of leagueCatalog) {
    let resolvedLeagueId = leagueEntry.leagueId ?? null;
    let resolvedLeagueName = leagueEntry.leagueName;
    const season = leagueEntry.season ?? getConfiguredFootballSeason();

    if (!resolvedLeagueId) {
      const candidates = await apiFootballGet<ApiFootballLeagueResponse>("leagues", {
        search: leagueEntry.leagueName
      });

      const matched =
        candidates.find(
          (candidate) =>
            normalizeName(candidate.country.name) === normalizeName(leagueEntry.country) &&
            normalizeName(candidate.league.name) === normalizeName(leagueEntry.leagueName)
        ) ?? candidates[0];

      resolvedLeagueId = matched?.league.id ?? null;
      resolvedLeagueName = matched?.league.name ?? resolvedLeagueName;
    }

    if (!resolvedLeagueId) {
      continue;
    }

    const teams = await apiFootballGet<ApiFootballTeamResponse>("teams", {
      league: resolvedLeagueId,
      season
    });

    await mapWithConcurrency(teams, 6, async (entry) => {
      const providerTeamId = entry.team?.id;
      const teamName = entry.team?.name ? decodeHtmlEntities(entry.team.name) : undefined;
      const country = resolveCanonicalCountryName(entry.team?.country ?? leagueEntry.country);
      const shortName = entry.team?.code ?? createShortName(teamName ?? "");

      if (!providerTeamId || !teamName) {
        return;
      }

      const existing =
        existingByProviderId.get(providerTeamId) ??
        existingByNameCountry.get(getClubNameCountryKey(teamName, country)) ??
        existingByShortCountry
          .get(getClubShortCountryKey(shortName, country))
          ?.find((club) => hasStableShortCodeMatch(club, teamName));
      const city = normalizeGeocodeCityLabel(
        CLUB_CITY_OVERRIDES[teamName] ?? entry.venue?.city ?? existing?.city ?? country,
        country
      );
      const coords =
        CLUB_COORD_OVERRIDES[teamName] ??
        (await geocodeCity(city, country, geocodeCache)) ??
        existing ??
        fallbackCapitalCoords(country);

      if (!coords) {
        return;
      }

      const nextClub: FootballTeam = {
        id: existing?.id ?? `club_${providerTeamId}`,
        name: teamName,
        shortName: existing?.shortName ?? shortName,
        city,
        country,
        stadium: CLUB_STADIUM_OVERRIDES[teamName] ??
          (entry.venue?.name ? sanitizeLocationLabel(entry.venue.name) : existing?.stadium ?? "待同步"),
        lng: "lng" in coords ? coords.lng : existing?.lng ?? 0,
        lat: "lat" in coords ? coords.lat : existing?.lat ?? 0,
        accent: existing?.accent ?? colorFromString(`${country}-${teamName}`),
        logo: entry.team?.logo ?? existing?.logo ?? "",
        signal: existing?.signal ?? `${city} club relay`,
        possession: existing?.possession ?? "--",
        xg: existing?.xg ?? 0,
        press: existing?.press ?? "待同步",
        form: existing?.form ?? [],
        providerTeamId,
        countryCode: existing?.countryCode ?? null,
        countryFlagUrl: existing?.countryFlagUrl ?? null,
        leagueId: resolvedLeagueId,
        leagueName: resolvedLeagueName,
        leagueTier: leagueEntry.tier,
        isNationalTeam: false,
        showInGlobeOverview: false,
        allowFlyline: false,
        visibleAtOrBelowDistance: null
      };

      nextClubs.set(nextClub.id, nextClub);
    });
  }

  return sortTeamsByCountryAndName(Array.from(nextClubs.values()));
}

async function enrichNationalTeams(baseSnapshot: FootballSnapshot) {
  const countryLookup = await fetchCountryLookup();
  const hotTeamIds = new Set(HOT_GLOBE_NATIONAL_TEAMS.map((entry) => entry.id));
  const nextTeams: FootballTeam[] = [];

  for (const team of baseSnapshot.nationalTeams) {
    const metadata = resolveCountryMetadata(team.country, countryLookup);
    let nextTeam: FootballTeam = {
      ...team,
      countryCode: team.countryCode ?? metadata.countryCode,
      countryFlagUrl: team.countryFlagUrl ?? metadata.countryFlagUrl
    };

    if (hotTeamIds.has(team.id) || team.providerTeamId) {
      try {
        const resolved = await resolveProviderTeam(nextTeam);
        nextTeam = {
          ...nextTeam,
          providerTeamId: nextTeam.providerTeamId ?? resolved.providerTeamId,
          countryCode: nextTeam.countryCode ?? resolved.countryCode,
          logo:
            resolved.teamLogo && resolved.teamLogo !== "/teams/national-generic.svg"
              ? resolved.teamLogo
              : nextTeam.logo,
          city: resolved.venueCity ?? nextTeam.city,
          stadium: resolved.venueName ?? nextTeam.stadium
        };
      } catch {
        // Keep partial national team metadata when API search is ambiguous or unavailable.
      }
    }

    nextTeams.push(nextTeam);
  }

  return nextTeams;
}

function gridToPoint(grid: string | null | undefined, name: string, number: number) {
  if (!grid) {
    return {
      number,
      name,
      x: 50,
      y: 50
    };
  }

  const [rowRaw, columnRaw] = grid.split(":");
  const row = Number(rowRaw);
  const column = Number(columnRaw);

  if (Number.isNaN(row) || Number.isNaN(column)) {
    return {
      number,
      name,
      x: 50,
      y: 50
    };
  }

  return {
    number,
    name,
    x: 16 + (column - 1) * 17,
    y: 18 + (row - 1) * 17
  };
}

function lineupFromApi(
  lineups: ApiFootballLineupResponse[],
  providerTeamId: number
): FootballSidebarDetail["lineup"] {
  const lineup = lineups.find((entry) => entry.team.id === providerTeamId);

  if (!lineup) {
    return {
      formation: "待同步",
      matchLabel: "最近一场首发待同步",
      players: []
    };
  }

  return {
    formation: lineup.formation ?? "待同步",
    matchLabel: "最近一场首发",
    players: (lineup.startXI ?? []).map((entry) =>
      gridToPoint(
        entry.player.grid,
        entry.player.name ?? "待同步",
        entry.player.number ?? 0
      )
    )
  };
}

function hasStructuredLineup(lineup: FootballSidebarDetail["lineup"] | undefined) {
  if (!lineup?.players?.length) {
    return false;
  }

  return lineup.players.some((player) => player.x !== 50 || player.y !== 50);
}

async function fetchDetailFromApi(team: FootballTeam, existingDetail?: FootballSidebarDetail): Promise<{
  teamPatch: Partial<FootballTeam>;
  detailPatch: FootballSidebarDetail;
  message: string;
}> {
  const season = getConfiguredFootballSeason();
  const resolved = await resolveProviderTeam(team);
  const providerTeamId = resolved.providerTeamId;
  const referenceDetail = getReferenceDetail(team, existingDetail);
  const shouldSyncStatic = !hasResolvedStaticProfile(team, referenceDetail);
  const [seasonFixtures, coaches] = await Promise.all([
    apiFootballGet<ApiFootballFixtureResponse>("fixtures", {
      team: providerTeamId,
      season
    }),
    shouldSyncStatic
      ? apiFootballGet<ApiFootballCoachResponse>("coachs", { team: providerTeamId })
      : Promise.resolve([])
  ]);

  const recentFixtureCandidates = getRecentFixtureCandidates(seasonFixtures);
  const recentFixturePool = recentFixtureCandidates.slice(0, 5);
  const recent = mapRecentFixtures(recentFixturePool, providerTeamId);
  const currentLive = recent.find((fixture) => fixture.status === "live");
  const nextFixtureApi = getNextFixtureCandidate(seasonFixtures);
  const recentFixtureForLineup = recentFixturePool[0];
  const lineups =
    recentFixtureForLineup?.fixture.id
      ? await apiFootballGet<ApiFootballLineupResponse>("fixtures/lineups", {
          fixture: recentFixtureForLineup.fixture.id
        })
      : [];
  const lineup = lineupFromApi(lineups, providerTeamId);

  const coachName = shouldSyncStatic
    ? coaches[0]?.name ?? "暂无数据"
    : referenceDetail.coach ?? "暂无数据";
  const honors =
    referenceDetail.honors?.length && !referenceDetail.honors.every((item) => item === "暂无数据")
      ? referenceDetail.honors
      : ["暂无数据"];
  const resolvedLineup = hasStructuredLineup(lineup)
    ? lineup
    : hasStructuredLineup(referenceDetail.lineup)
      ? referenceDetail.lineup
      : createPlaceholderDetail(team).lineup;
  const nextFixture = currentLive
    ? currentLive
    : nextFixtureApi
      ? {
          id: `fixture-${nextFixtureApi.fixture.id}`,
          competition: nextFixtureApi.league.name,
          opponent: fixtureOpponentName(nextFixtureApi, providerTeamId),
          dateLabel: toDateLabel(nextFixtureApi.fixture.date),
          venue: nextFixtureApi.fixture.venue?.city ?? nextFixtureApi.fixture.venue?.name ?? resolved.venueCity,
          status: (isLiveStatus(nextFixtureApi.fixture.status.short) ? "live" : "scheduled") as FootballSidebarFixtureStatus,
          score: isLiveStatus(nextFixtureApi.fixture.status.short)
            ? `${nextFixtureApi.goals.home ?? 0} - ${nextFixtureApi.goals.away ?? 0}`
            : undefined,
          minute: nextFixtureApi.fixture.status.elapsed ?? undefined,
          note: makeShortNarrative(nextFixtureApi)
        }
      : fallbackNextFixture(team);

  return {
    teamPatch: {
      providerTeamId,
      countryCode: resolved.countryCode,
      logo: resolved.teamLogo ?? team.logo,
      city: resolved.venueCity,
      stadium: resolved.venueName
    },
    detailPatch: {
      coach: coachName,
      coachTitle: "主教练",
      honors,
      recentFixtures: recent,
      nextFixture,
      lineup: resolvedLineup,
      providerTeamId,
      dataStatus: "live"
    },
    message:
      recent.length > 0 || nextFixture.id !== `${team.id}-next`
        ? `已刷新 ${team.name} 的 ${season} 赛季数据`
        : `已同步 ${team.name} 的静态资料，但当前 API 没有返回可用的 ${season} 赛季比赛信息`
  };
}

function updateTeamInSnapshot(snapshot: FootballSnapshot, updatedTeam: FootballTeam) {
  return {
    clubs: snapshot.clubs.map((team) => (team.id === updatedTeam.id ? updatedTeam : team)),
    nationalTeams: snapshot.nationalTeams.map((team) => (team.id === updatedTeam.id ? updatedTeam : team))
  };
}

function formatRefreshFallbackMessage(team: FootballTeam, detail: FootballSidebarDetail | undefined, error: unknown) {
  const rawMessage = error instanceof Error ? error.message : "同步失败，已保留当前缓存/历史档案";
  const hasUsableCache = detail && !isPlaceholderDetail(detail);
  const archiveLabel = hasUsableCache ? "最近一次同步结果" : "缓存/历史档案";

  if (
    rawMessage.includes("request limit for the day") ||
    rawMessage.includes("Too many requests") ||
    rawMessage.includes("API-Football 请求失败: 429")
  ) {
    return `今日免费 API 配额已用尽，当前先展示 ${team.name} 的${archiveLabel}。`;
  }

  if (rawMessage.includes("未能解析") || rawMessage.includes("team id")) {
    return `${team.name} 当前暂无可用的实时资料，已展示${archiveLabel}。这通常是因为球队已更名、停运，或暂不在当前接口覆盖范围内。`;
  }

  if (rawMessage.startsWith("API-Football 返回错误:")) {
    return `暂时无法同步 ${team.name} 的实时资料，当前先展示${archiveLabel}。`;
  }

  if (rawMessage.startsWith("API-Football 请求失败:")) {
    return `实时接口暂时不可用，当前先展示 ${team.name} 的${archiveLabel}。`;
  }

  return rawMessage;
}

export async function refreshTeamInSnapshot(teamId: string): Promise<RefreshResult> {
  const snapshot = await ensureFootballSnapshot();
  const club = snapshot.clubs.find((entry) => entry.id === teamId);
  const nationalTeam = snapshot.nationalTeams.find((entry) => entry.id === teamId);
  const team = nationalTeam ?? club;
  const isNationalTeam = Boolean(nationalTeam);
  const existingDetail = isNationalTeam
    ? snapshot.nationalTeamDetails[teamId]
    : snapshot.clubDetails[teamId];

  if (!team) {
    return {
      ok: false,
      teamId,
      message: "未找到对应队伍",
      updatedAt: snapshot.updatedAt
    };
  }

  if (!getApiFootballKey()) {
    return {
      ok: false,
      teamId,
      message: `缺少 API_FOOTBALL_KEY，当前先展示 ${team.name} 的缓存/历史档案。`,
      updatedAt: snapshot.updatedAt,
      source: snapshot.source,
      isNationalTeam,
      team,
      detail: existingDetail ?? getReferenceDetail(team),
      nationalMatches: isNationalTeam ? snapshot.nationalMatches : undefined
    };
  }

  try {
    const { teamPatch, detailPatch, message } = await fetchDetailFromApi(team, existingDetail);
    const updatedTeam = {
      ...team,
      ...teamPatch
    };
    const nextSnapshot: FootballSnapshot = {
      ...snapshot,
      source: "api-football",
      updatedAt: new Date().toISOString(),
      ...(updateTeamInSnapshot(snapshot, updatedTeam)),
      clubDetails: isNationalTeam
        ? snapshot.clubDetails
        : { ...snapshot.clubDetails, [teamId]: detailPatch },
      nationalTeamDetails: isNationalTeam
        ? { ...snapshot.nationalTeamDetails, [teamId]: detailPatch }
        : snapshot.nationalTeamDetails
    };
    nextSnapshot.nationalMatches = buildNationalMatchesFromDetails(
      nextSnapshot.nationalTeams,
      nextSnapshot.nationalTeamDetails
    );

    await writeFootballSnapshot(nextSnapshot);

    return {
      ok: true,
      teamId,
      message,
      updatedAt: nextSnapshot.updatedAt,
      source: nextSnapshot.source,
      isNationalTeam,
      team: updatedTeam,
      detail: detailPatch,
      nationalMatches: isNationalTeam ? nextSnapshot.nationalMatches : undefined
    };
  } catch (error) {
    return {
      ok: false,
      teamId,
      message: formatRefreshFallbackMessage(team, existingDetail, error),
      updatedAt: snapshot.updatedAt,
      source: snapshot.source,
      isNationalTeam,
      team,
      detail: existingDetail ?? getReferenceDetail(team),
      nationalMatches: isNationalTeam ? snapshot.nationalMatches : undefined
    };
  }
}

export async function ensureFootballSnapshot() {
  const snapshot = await readFootballSnapshot();
  const importedLeagueTierKeys = getImportedLeagueTierKeys(snapshot);
  const clubs = mergeCuratedTeams(
    snapshot.clubs,
    TEAMS.filter((team) => {
      if (!importedLeagueTierKeys) {
        return true;
      }

      if (snapshot.clubs.some((existingTeam) => existingTeam.id === team.id)) {
        return true;
      }

      return !importedLeagueTierKeys.has(`${normalizeName(team.country)}|1`);
    })
  );
  const nationalTeams = mergeCuratedTeams(snapshot.nationalTeams, NATIONAL_TEAMS).map((team) =>
    team.isNationalTeam
      ? {
          ...team,
          countryCode: team.countryCode ?? NATIONAL_COUNTRY_CODE_OVERRIDES[team.country] ?? null,
          countryFlagUrl: team.countryFlagUrl ?? getNationalFlagUrl(team.country)
        }
      : team
  );

  const clubDetails = seedDetailCache(clubs, snapshot.clubDetails);
  const nationalTeamDetails = seedDetailCache(nationalTeams, snapshot.nationalTeamDetails);
  const liveNationalMatches =
    snapshot.source === "api-football"
      ? buildNationalMatchesFromDetails(nationalTeams, nationalTeamDetails)
      : snapshot.nationalMatches;
  const nationalMatches = resolveAmbientNationalMatches(nationalTeams, liveNationalMatches);

  return {
    ...snapshot,
    clubs,
    nationalTeams,
    clubDetails,
    nationalTeamDetails,
    nationalMatches
  };
}

export async function bootstrapFootballSnapshot(mode: BootstrapMode = "bundesliga") {
  const baseSnapshot = await ensureFootballSnapshot();
  const identityOnlyBootstrap = mode === "bundesliga" || mode === "priority";

  if (!getApiFootballKey()) {
    return baseSnapshot;
  }

  const [leagueCatalog, geocodeCache] = await Promise.all([
    resolveLeagueCatalog(mode),
    readGeocodeCache()
  ]);
  const nationalTeams = identityOnlyBootstrap
    ? baseSnapshot.nationalTeams
    : await enrichNationalTeams(baseSnapshot);
  const importedClubs = await buildClubsFromLeagues(baseSnapshot, leagueCatalog, geocodeCache);
  const clubs =
    importedClubs.length > 0
      ? mergeImportedClubs(baseSnapshot.clubs, importedClubs, leagueCatalog)
      : baseSnapshot.clubs;
  const nationalTeamDetails = seedDetailCache(nationalTeams, baseSnapshot.nationalTeamDetails);
  const nationalMatches = identityOnlyBootstrap
    ? resolveAmbientNationalMatches(nationalTeams, baseSnapshot.nationalMatches)
    : resolveAmbientNationalMatches(
        nationalTeams,
        buildNationalMatchesFromDetails(nationalTeams, nationalTeamDetails)
      );
  const nextSnapshot: FootballSnapshot = {
    ...baseSnapshot,
    source: "api-football",
    updatedAt: new Date().toISOString(),
    nationalTeams,
    clubs,
    clubDetails: seedDetailCache(clubs, baseSnapshot.clubDetails),
    nationalTeamDetails,
    nationalMatches,
    leagueCatalog
  };

  await Promise.all([writeFootballSnapshot(nextSnapshot), writeGeocodeCache(geocodeCache)]);

  return nextSnapshot;
}

export async function importLeagueCatalogIntoSnapshot(leagueCatalog: LeagueCatalogEntry[]) {
  const baseSnapshot = await ensureFootballSnapshot();

  if (!getApiFootballKey() || leagueCatalog.length === 0) {
    return baseSnapshot;
  }

  const geocodeCache = await readGeocodeCache();
  const importedClubs = await buildClubsFromLeagues(baseSnapshot, leagueCatalog, geocodeCache);
  const clubs =
    importedClubs.length > 0
      ? mergeImportedClubs(baseSnapshot.clubs, importedClubs, leagueCatalog)
      : baseSnapshot.clubs;
  const nextSnapshot: FootballSnapshot = {
    ...baseSnapshot,
    source: "api-football",
    updatedAt: new Date().toISOString(),
    clubs,
    clubDetails: seedDetailCache(clubs, baseSnapshot.clubDetails),
    leagueCatalog: mergeLeagueCatalogEntries(baseSnapshot.leagueCatalog, leagueCatalog)
  };

  await Promise.all([writeFootballSnapshot(nextSnapshot), writeGeocodeCache(geocodeCache)]);

  return nextSnapshot;
}
