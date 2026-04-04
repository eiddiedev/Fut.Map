import worldCapitals from "@/data/world-capitals.json";

export type FootballCapitalEntry = (typeof worldCapitals)[number];

const HOME_NATION_CAPITALS: FootballCapitalEntry[] = [
  { country: "England", capital: "London", lat: 51.5072, lng: -0.1276 },
  { country: "Wales", capital: "Cardiff", lat: 51.4816, lng: -3.1791 },
  { country: "Scotland", capital: "Edinburgh", lat: 55.9533, lng: -3.1883 },
  { country: "Northern Ireland", capital: "Belfast", lat: 54.5973, lng: -5.9301 }
];

export function getFootballWorldCapitals() {
  const filtered = worldCapitals.filter((entry) => entry.country !== "United Kingdom");

  return [...filtered, ...HOME_NATION_CAPITALS];
}

