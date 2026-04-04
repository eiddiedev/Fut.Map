import { MATCHES, TEAM_MAP, TEAMS } from "@/data/mockData";

export type DisplayTeam = (typeof TEAMS)[number] & {
  displayPosition: [number, number];
};

const DISPLAY_COORDINATE_OVERRIDES: Record<string, [number, number]> = {
  ars: [-0.72, 51.92],
  che: [-0.22, 51.23],
  mci: [-2.62, 53.86],
  liv: [-3.48, 53.1],
  psg: [2.95, 49.18],
  om: [5.78, 43.05],
  rma: [-4.28, 40.82],
  bar: [2.78, 41.67],
  atm: [-3.12, 40.17],
  bay: [12.32, 48.66],
  bvb: [7.98, 51.82],
  rbl: [12.96, 51.02],
  mil: [8.7, 45.18],
  int: [9.86, 45.78],
  juv: [7.08, 45.36],
  nap: [14.78, 40.55]
};

export function getDisplayTeams(): DisplayTeam[] {
  return TEAMS.map((team) => ({
    ...team,
    displayPosition: DISPLAY_COORDINATE_OVERRIDES[team.id] ?? [team.lng, team.lat]
  }));
}

export function getRenderedTeamMap(displayTeams: DisplayTeam[]) {
  return Object.fromEntries(displayTeams.map((team) => [team.id, team])) as Record<string, DisplayTeam>;
}

export function getArcMatches(renderedTeamMap: Record<string, DisplayTeam>) {
  return MATCHES.map((match) => ({
    ...match,
    sourcePosition: renderedTeamMap[match.homeTeamId].displayPosition,
    targetPosition: renderedTeamMap[match.awayTeamId].displayPosition
  }));
}

export function getActiveCountries() {
  const countries = new Set<string>();

  for (const match of MATCHES) {
    countries.add(TEAM_MAP[match.homeTeamId].country);
    countries.add(TEAM_MAP[match.awayTeamId].country);
  }

  return countries;
}
