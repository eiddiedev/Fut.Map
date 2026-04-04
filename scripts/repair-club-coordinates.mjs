import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const snapshotPath = path.join(process.cwd(), "data", "cache", "football-snapshot.json");
const geocodeCachePath = path.join(process.cwd(), "data", "cache", "football-geocode.json");
const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN ?? process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

if (!mapboxToken) {
  throw new Error("Missing MAPBOX_ACCESS_TOKEN or NEXT_PUBLIC_MAPBOX_TOKEN");
}

const COUNTRY_ALIASES = new Map([
  ["usa", "United States"],
  ["united states of america", "United States"],
  ["saudi arabia", "Saudi Arabia"],
  ["saudi-arabia", "Saudi Arabia"],
  ["china pr", "China"]
]);

const MANUAL_CITY_OVERRIDES = new Map([
  ["Qingdao Youth Island", "Qingdao"],
  ["Dalian Huayi", "Dalian"],
  ["Dongguan United", "Foshan"],
  ["Guangxi Baoyun", "Pingguo"],
  ["Guangzhou E-Power", "Guangzhou"],
  ["Hebei Kungfu", "Shijiazhuang"],
  ["Nanjing City", "Nanjing"],
  ["Shaanxi Union", "Weinan"],
  ["Shenzhen Juniors", "Shenzhen"],
  ["Yanbian Longding", "Yanji"]
]);
const MANUAL_STADIUM_OVERRIDES = new Map([
  ["Dalian Huayi", "Jinzhou Stadium"],
  ["Dongguan United", "Nanhai Sports Center Stadium"],
  ["Guangxi Baoyun", "Pingguo Stadium"],
  ["Guangzhou E-Power", "Yuexiushan Stadium"],
  ["Hebei Kungfu", "Yutong International Sports Center"],
  ["Nanjing City", "Wutaishan Stadium"],
  ["Shaanxi Union", "Weinan Sports Center Stadium"],
  ["Shenzhen Juniors", "Shenzhen Youth Football Training Base Centre Stadium"],
  ["Yanbian Longding", "Yanji Stadium"]
]);
const MANUAL_COORD_OVERRIDES = new Map([["Monaco", { lat: 43.7384, lng: 7.4246 }]]);
const GEOCODE_CITY_OVERRIDES = new Map([
  ["argentina|capital federal ciudad de buenos aires", "Buenos Aires"],
  ["mexico|d f", "Mexico City"]
]);

function decodeHtmlEntities(value) {
  return String(value ?? "")
    .replace(/&apos;|&#0*39;|&#x0*27;/gi, "'")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, "\"")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .trim();
}

function sanitizeLocationLabel(value) {
  return decodeHtmlEntities(value).replace(/\s+/g, " ").trim();
}

function normalizeName(value) {
  return sanitizeLocationLabel(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function resolveCanonicalCountryName(country) {
  const clean = sanitizeLocationLabel(country);
  return COUNTRY_ALIASES.get(normalizeName(clean)) ?? clean;
}

function normalizeGeocodeCityLabel(value, country) {
  const clean = sanitizeLocationLabel(value);
  const key = `${normalizeName(country)}|${normalizeName(clean)}`;
  return GEOCODE_CITY_OVERRIDES.get(key) ?? clean;
}

function buildLocationCandidates(club) {
  const country = resolveCanonicalCountryName(club.country);
  const manualCity = MANUAL_CITY_OVERRIDES.get(club.name);
  const city = normalizeGeocodeCityLabel(manualCity ?? club.city ?? country, country);
  const firstSegment = sanitizeLocationLabel(city.split(",")[0] ?? city);
  const candidates = [firstSegment, city];

  return {
    country,
    city,
    candidates: candidates.filter(
      (candidate, index, list) =>
        candidate &&
        normalizeName(candidate) !== normalizeName(country) &&
        list.findIndex((item) => normalizeName(item) === normalizeName(candidate)) === index
    )
  };
}

async function geocodeCity(query, country) {
  const url = new URL(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(`${query}, ${country}`)}.json`
  );
  url.searchParams.set("access_token", mapboxToken);
  url.searchParams.set("autocomplete", "false");
  url.searchParams.set("limit", "1");
  url.searchParams.set("types", "place,locality,district,neighborhood,address");

  const response = await fetch(url.toString());

  if (!response.ok) {
    return null;
  }

  const payload = await response.json();
  const center = payload.features?.[0]?.center;

  if (!center || !Number.isFinite(center[0]) || !Number.isFinite(center[1])) {
    return null;
  }

  return {
    lng: center[0],
    lat: center[1]
  };
}

async function mapWithConcurrency(items, concurrency, mapper) {
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      await mapper(items[currentIndex], currentIndex);
    }
  }

  await Promise.all(
    Array.from({ length: Math.max(1, Math.min(concurrency, items.length)) }, () => worker())
  );
}

const snapshot = JSON.parse(await readFile(snapshotPath, "utf8"));
const geocodeCache = JSON.parse(await readFile(geocodeCachePath, "utf8"));
const liveClubs = snapshot.clubs.filter((club) => !club.isNationalTeam && club.leagueName);
const queryResults = new Map();
const failures = [];

const uniqueQueries = [];
const uniqueQueryKeys = new Set();

liveClubs.forEach((club) => {
  if (MANUAL_COORD_OVERRIDES.has(club.name)) {
    return;
  }

  const location = buildLocationCandidates(club);
  location.candidates.forEach((query) => {
    const key = `${query}|${location.country}`.toLowerCase();
    if (uniqueQueryKeys.has(key)) {
      return;
    }

    uniqueQueryKeys.add(key);
    uniqueQueries.push({ key, query, country: location.country });
  });
});

await mapWithConcurrency(uniqueQueries, 8, async ({ key, query, country }) => {
  const coords = await geocodeCity(query, country);

  if (coords) {
    queryResults.set(key, coords);
    geocodeCache[key] = coords;
  }
});

liveClubs.forEach((club) => {
  if (MANUAL_COORD_OVERRIDES.has(club.name)) {
    const coords = MANUAL_COORD_OVERRIDES.get(club.name);
    club.lat = coords.lat;
    club.lng = coords.lng;
    return;
  }

  const location = buildLocationCandidates(club);
  const matchedQuery = location.candidates.find((query) =>
    queryResults.has(`${query}|${location.country}`.toLowerCase())
  );

  if (!matchedQuery) {
    failures.push({
      name: club.name,
      city: club.city,
      country: club.country
    });
    return;
  }

  const coords = queryResults.get(`${matchedQuery}|${location.country}`.toLowerCase());
  club.country = location.country;
  club.city = location.city;
  club.stadium = MANUAL_STADIUM_OVERRIDES.get(club.name) ?? club.stadium;
  club.lat = coords.lat;
  club.lng = coords.lng;
});

snapshot.updatedAt = new Date().toISOString();

await writeFile(snapshotPath, JSON.stringify(snapshot, null, 2), "utf8");
await writeFile(geocodeCachePath, JSON.stringify(geocodeCache, null, 2), "utf8");

console.log(
  JSON.stringify(
    {
      updatedAt: snapshot.updatedAt,
      clubCount: liveClubs.length,
      queryCount: uniqueQueries.length,
      failureCount: failures.length,
      failures: failures.slice(0, 20)
    },
    null,
    2
  )
);
