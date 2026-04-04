import { TEAMS } from "@/data/mockData";

export const GLOBAL_HERO_TEAM_IDS = ["rma", "bar", "mci", "liv", "ars", "bay", "psg", "int"];
export const GLOBAL_NATIONAL_TEAM_IDS = [
  "eng_nt",
  "fra_nt",
  "esp_nt",
  "bra_nt",
  "arg_nt",
  "mar_nt",
  "jpn_nt",
  "usa_nt",
  "ksa_nt"
];

export const COUNTRY_LABELS: Record<string, string> = {
  England: "英格兰",
  France: "法国",
  Spain: "西班牙",
  Germany: "德国",
  Italy: "意大利"
};

export function getCountryLabel(country: string) {
  return COUNTRY_LABELS[country] ?? country;
}

export function getCountryTeams(country: string) {
  return TEAMS.filter((team) => team.country === country);
}

export function getCountryViewPreset(country: string) {
  const teams = getCountryTeams(country);

  if (teams.length === 0) {
    return { lng: 12, lat: 46, zoom: 5 };
  }

  const bounds = teams.reduce(
    (result, team) => ({
      minLng: Math.min(result.minLng, team.lng),
      maxLng: Math.max(result.maxLng, team.lng),
      minLat: Math.min(result.minLat, team.lat),
      maxLat: Math.max(result.maxLat, team.lat)
    }),
    {
      minLng: Infinity,
      maxLng: -Infinity,
      minLat: Infinity,
      maxLat: -Infinity
    }
  );

  const lng = (bounds.minLng + bounds.maxLng) / 2;
  const lat = (bounds.minLat + bounds.maxLat) / 2;
  const span = Math.max(bounds.maxLng - bounds.minLng, (bounds.maxLat - bounds.minLat) * 1.5);

  let zoom = 6;

  if (span < 0.12) {
    zoom = 12;
  } else if (span < 0.25) {
    zoom = 11;
  } else if (span < 0.45) {
    zoom = 10;
  } else if (span < 0.9) {
    zoom = 9;
  } else if (span < 1.8) {
    zoom = 8;
  } else if (span < 3.2) {
    zoom = 7;
  }

  return { lng, lat, zoom };
}
