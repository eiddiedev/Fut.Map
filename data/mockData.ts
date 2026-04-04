export type Team = {
  id: string;
  name: string;
  shortName: string;
  city: string;
  country: string;
  stadium: string;
  lng: number;
  lat: number;
  accent: string;
  logo: string;
  signal: string;
  possession: string;
  xg: number;
  press: string;
  form: string[];
};

export type Match = {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  competition: string;
  minute: number;
  score: string;
  narrative: string;
  intensity: number;
  phase: number;
};

export type SidebarFixtureStatus = "finished" | "scheduled" | "live";

export type SidebarFixture = {
  id: string;
  competition: string;
  opponent: string;
  dateLabel: string;
  venue: string;
  status: SidebarFixtureStatus;
  outcome?: "W" | "D" | "L";
  score?: string;
  minute?: number;
  note: string;
};

export type LineupPlayer = {
  number: number;
  name: string;
  x: number;
  y: number;
};

export type SidebarLineup = {
  formation: string;
  matchLabel: string;
  players: LineupPlayer[];
};

export type TeamSidebarDetail = {
  coach: string;
  coachTitle: string;
  honors: string[];
  recentFixtures: SidebarFixture[];
  nextFixture: SidebarFixture;
  lineup: SidebarLineup;
};

type PlayerSeed = [number, string];

function spreadLine(y: number, players: PlayerSeed[]): LineupPlayer[] {
  const gap = 100 / (players.length + 1);

  return players.map(([number, name], index) => ({
    number,
    name,
    x: gap * (index + 1),
    y
  }));
}

function createLineup(
  formation: string,
  matchLabel: string,
  lines: Array<{ y: number; players: PlayerSeed[] }>
): SidebarLineup {
  return {
    formation,
    matchLabel,
    players: lines.flatMap((line) => spreadLine(line.y, line.players))
  };
}

function fixture(config: SidebarFixture): SidebarFixture {
  return config;
}

const PREMIER_LEAGUE_BADGE_BASE = "https://resources.premierleague.com/premierleague/badges/50";

const PREMIER_LEAGUE_BADGE_URLS = {
  ars: `${PREMIER_LEAGUE_BADGE_BASE}/t3.png`,
  avl: `${PREMIER_LEAGUE_BADGE_BASE}/t7.png`,
  bou: `${PREMIER_LEAGUE_BADGE_BASE}/t91.png`,
  bre: `${PREMIER_LEAGUE_BADGE_BASE}/t94.png`,
  bha: `${PREMIER_LEAGUE_BADGE_BASE}/t131.png`,
  bur: `${PREMIER_LEAGUE_BADGE_BASE}/t90.png`,
  che: `${PREMIER_LEAGUE_BADGE_BASE}/t8.png`,
  cry: `${PREMIER_LEAGUE_BADGE_BASE}/t31.png`,
  eve: `${PREMIER_LEAGUE_BADGE_BASE}/t11.png`,
  ful: `${PREMIER_LEAGUE_BADGE_BASE}/t34.png`,
  lee: `${PREMIER_LEAGUE_BADGE_BASE}/t2.png`,
  mci: `${PREMIER_LEAGUE_BADGE_BASE}/t43.png`,
  mun: `${PREMIER_LEAGUE_BADGE_BASE}/t1.png`,
  new: `${PREMIER_LEAGUE_BADGE_BASE}/t4.png`,
  nfo: `${PREMIER_LEAGUE_BADGE_BASE}/t17.png`,
  sun: `${PREMIER_LEAGUE_BADGE_BASE}/t56.png`,
  tot: `${PREMIER_LEAGUE_BADGE_BASE}/t6.png`,
  whu: `${PREMIER_LEAGUE_BADGE_BASE}/t21.png`,
  wol: `${PREMIER_LEAGUE_BADGE_BASE}/t39.png`,
  liv: `${PREMIER_LEAGUE_BADGE_BASE}/t14.png`
} as const;

export const TEAMS: Team[] = [
  {
    id: "ars",
    name: "Arsenal",
    shortName: "ARS",
    city: "London",
    country: "England",
    stadium: "Emirates Stadium",
    lng: -0.1084,
    lat: 51.5549,
    accent: "#ff584a",
    logo: PREMIER_LEAGUE_BADGE_URLS.ars,
    signal: "north-london uplink",
    possession: "61%",
    xg: 2.14,
    press: "High press 7.9",
    form: ["W", "W", "D", "W", "L"]
  },
  {
    id: "avl",
    name: "Aston Villa",
    shortName: "AVL",
    city: "Birmingham",
    country: "England",
    stadium: "Villa Park",
    lng: -1.8849,
    lat: 52.5092,
    accent: "#8ecbff",
    logo: PREMIER_LEAGUE_BADGE_URLS.avl,
    signal: "villa-park relay",
    possession: "52%",
    xg: 1.73,
    press: "Mid block press 6.7",
    form: ["W", "W", "D", "L", "W"]
  },
  {
    id: "bou",
    name: "Bournemouth",
    shortName: "BOU",
    city: "Bournemouth",
    country: "England",
    stadium: "Vitality Stadium",
    lng: -1.838,
    lat: 50.7352,
    accent: "#ff6b5f",
    logo: PREMIER_LEAGUE_BADGE_URLS.bou,
    signal: "south-coast pulse",
    possession: "49%",
    xg: 1.58,
    press: "Transition press 6.4",
    form: ["L", "W", "D", "W", "L"]
  },
  {
    id: "bre",
    name: "Brentford",
    shortName: "BRE",
    city: "London",
    country: "England",
    stadium: "Gtech Community Stadium",
    lng: -0.2885,
    lat: 51.4908,
    accent: "#ff6d62",
    logo: PREMIER_LEAGUE_BADGE_URLS.bre,
    signal: "west-london corridor",
    possession: "47%",
    xg: 1.61,
    press: "Direct press 6.5",
    form: ["W", "L", "W", "D", "W"]
  },
  {
    id: "bha",
    name: "Brighton & Hove Albion",
    shortName: "BHA",
    city: "Brighton",
    country: "England",
    stadium: "American Express Stadium",
    lng: -0.0836,
    lat: 50.8616,
    accent: "#7ad0ff",
    logo: PREMIER_LEAGUE_BADGE_URLS.bha,
    signal: "south-coast lattice",
    possession: "57%",
    xg: 1.77,
    press: "Fluid press 6.9",
    form: ["D", "W", "W", "L", "W"]
  },
  {
    id: "bur",
    name: "Burnley",
    shortName: "BUR",
    city: "Burnley",
    country: "England",
    stadium: "Turf Moor",
    lng: -2.2303,
    lat: 53.789,
    accent: "#9ebcff",
    logo: PREMIER_LEAGUE_BADGE_URLS.bur,
    signal: "lancashire channel",
    possession: "48%",
    xg: 1.42,
    press: "Compact press 6.1",
    form: ["L", "D", "W", "L", "D"]
  },
  {
    id: "che",
    name: "Chelsea",
    shortName: "CHE",
    city: "London",
    country: "England",
    stadium: "Stamford Bridge",
    lng: -0.1909,
    lat: 51.4817,
    accent: "#3188ff",
    logo: PREMIER_LEAGUE_BADGE_URLS.che,
    signal: "west-london pulse",
    possession: "58%",
    xg: 1.92,
    press: "Aggressive press 7.1",
    form: ["W", "D", "W", "L", "W"]
  },
  {
    id: "cry",
    name: "Crystal Palace",
    shortName: "CRY",
    city: "London",
    country: "England",
    stadium: "Selhurst Park",
    lng: -0.0858,
    lat: 51.3983,
    accent: "#5da5ff",
    logo: PREMIER_LEAGUE_BADGE_URLS.cry,
    signal: "selhurst current",
    possession: "45%",
    xg: 1.49,
    press: "Counter press 6.2",
    form: ["W", "L", "D", "W", "L"]
  },
  {
    id: "eve",
    name: "Everton",
    shortName: "EVE",
    city: "Liverpool",
    country: "England",
    stadium: "Hill Dickinson Stadium",
    lng: -3.0028,
    lat: 53.425,
    accent: "#79a8ff",
    logo: PREMIER_LEAGUE_BADGE_URLS.eve,
    signal: "dockside relay",
    possession: "46%",
    xg: 1.43,
    press: "Reactive press 6.0",
    form: ["L", "W", "D", "L", "W"]
  },
  {
    id: "ful",
    name: "Fulham",
    shortName: "FUL",
    city: "London",
    country: "England",
    stadium: "Craven Cottage",
    lng: -0.2217,
    lat: 51.4749,
    accent: "#f3f5f7",
    logo: PREMIER_LEAGUE_BADGE_URLS.ful,
    signal: "thames-side relay",
    possession: "51%",
    xg: 1.52,
    press: "Balanced press 6.3",
    form: ["D", "W", "L", "W", "D"]
  },
  {
    id: "lee",
    name: "Leeds United",
    shortName: "LEE",
    city: "Leeds",
    country: "England",
    stadium: "Elland Road",
    lng: -1.5721,
    lat: 53.7778,
    accent: "#85d4ff",
    logo: PREMIER_LEAGUE_BADGE_URLS.lee,
    signal: "west-yorkshire uplink",
    possession: "50%",
    xg: 1.55,
    press: "Vertical press 6.5",
    form: ["W", "L", "D", "W", "L"]
  },
  {
    id: "mci",
    name: "Manchester City",
    shortName: "MCI",
    city: "Manchester",
    country: "England",
    stadium: "Etihad Stadium",
    lng: -2.2004,
    lat: 53.4831,
    accent: "#7ad7ff",
    logo: PREMIER_LEAGUE_BADGE_URLS.mci,
    signal: "etihad control grid",
    possession: "65%",
    xg: 2.44,
    press: "Positional press 7.7",
    form: ["W", "W", "W", "D", "W"]
  },
  {
    id: "mun",
    name: "Manchester United",
    shortName: "MUN",
    city: "Manchester",
    country: "England",
    stadium: "Old Trafford",
    lng: -2.2913,
    lat: 53.4631,
    accent: "#d43b4f",
    logo: PREMIER_LEAGUE_BADGE_URLS.mun,
    signal: "old-trafford relay",
    possession: "54%",
    xg: 1.86,
    press: "Front-foot press 7.2",
    form: ["W", "L", "W", "D", "W"]
  },
  {
    id: "new",
    name: "Newcastle United",
    shortName: "NEW",
    city: "Newcastle upon Tyne",
    country: "England",
    stadium: "St James' Park",
    lng: -1.6217,
    lat: 54.9756,
    accent: "#f1f3f6",
    logo: PREMIER_LEAGUE_BADGE_URLS.new,
    signal: "tyne relay",
    possession: "53%",
    xg: 1.82,
    press: "Front-foot press 6.9",
    form: ["W", "W", "L", "D", "W"]
  },
  {
    id: "nfo",
    name: "Nottingham Forest",
    shortName: "NFO",
    city: "Nottingham",
    country: "England",
    stadium: "City Ground",
    lng: -1.1326,
    lat: 52.9399,
    accent: "#ff5b54",
    logo: PREMIER_LEAGUE_BADGE_URLS.nfo,
    signal: "trent current",
    possession: "43%",
    xg: 1.41,
    press: "Low block press 5.9",
    form: ["W", "D", "L", "W", "W"]
  },
  {
    id: "sun",
    name: "Sunderland",
    shortName: "SUN",
    city: "Sunderland",
    country: "England",
    stadium: "Stadium of Light",
    lng: -1.3898,
    lat: 54.9146,
    accent: "#ff5955",
    logo: PREMIER_LEAGUE_BADGE_URLS.sun,
    signal: "wearside beacon",
    possession: "47%",
    xg: 1.38,
    press: "Energy press 6.1",
    form: ["L", "W", "D", "L", "W"]
  },
  {
    id: "tot",
    name: "Tottenham Hotspur",
    shortName: "TOT",
    city: "London",
    country: "England",
    stadium: "Tottenham Hotspur Stadium",
    lng: -0.0664,
    lat: 51.6043,
    accent: "#f5f7fb",
    logo: PREMIER_LEAGUE_BADGE_URLS.tot,
    signal: "north-london lane",
    possession: "55%",
    xg: 1.84,
    press: "High line press 7.0",
    form: ["W", "L", "W", "D", "L"]
  },
  {
    id: "whu",
    name: "West Ham United",
    shortName: "WHU",
    city: "London",
    country: "England",
    stadium: "London Stadium",
    lng: -0.0166,
    lat: 51.5386,
    accent: "#a17bff",
    logo: PREMIER_LEAGUE_BADGE_URLS.whu,
    signal: "east-london vector",
    possession: "47%",
    xg: 1.47,
    press: "Mid block press 6.0",
    form: ["D", "L", "W", "D", "W"]
  },
  {
    id: "wol",
    name: "Wolverhampton Wanderers",
    shortName: "WOL",
    city: "Wolverhampton",
    country: "England",
    stadium: "Molineux Stadium",
    lng: -2.1306,
    lat: 52.5904,
    accent: "#ffc34d",
    logo: PREMIER_LEAGUE_BADGE_URLS.wol,
    signal: "black-country path",
    possession: "46%",
    xg: 1.36,
    press: "Wing trap press 6.0",
    form: ["L", "D", "W", "L", "D"]
  },
  {
    id: "liv",
    name: "Liverpool",
    shortName: "LIV",
    city: "Liverpool",
    country: "England",
    stadium: "Anfield",
    lng: -2.9608,
    lat: 53.4308,
    accent: "#ff4d5f",
    logo: PREMIER_LEAGUE_BADGE_URLS.liv,
    signal: "anfield redline",
    possession: "56%",
    xg: 2.08,
    press: "Counter press 8.0",
    form: ["W", "W", "L", "W", "D"]
  },
  {
    id: "psg",
    name: "Paris Saint-Germain",
    shortName: "PSG",
    city: "Paris",
    country: "France",
    stadium: "Parc des Princes",
    lng: 2.2522,
    lat: 48.8414,
    accent: "#37a6ff",
    logo: "/teams/psg.svg",
    signal: "paris quantum relay",
    possession: "64%",
    xg: 2.37,
    press: "Fluid press 7.1",
    form: ["W", "W", "W", "D", "W"]
  },
  {
    id: "om",
    name: "Marseille",
    shortName: "OM",
    city: "Marseille",
    country: "France",
    stadium: "Orange Velodrome",
    lng: 5.3958,
    lat: 43.2698,
    accent: "#8fe5ff",
    logo: "/teams/marseille.svg",
    signal: "mediterranean uplink",
    possession: "53%",
    xg: 1.66,
    press: "Vertical press 6.4",
    form: ["D", "W", "W", "L", "W"]
  },
  {
    id: "rma",
    name: "Real Madrid",
    shortName: "RMA",
    city: "Madrid",
    country: "Spain",
    stadium: "Santiago Bernabeu",
    lng: -3.6884,
    lat: 40.4531,
    accent: "#ffd86b",
    logo: "/teams/realmadrid.svg",
    signal: "madrid elite node",
    possession: "57%",
    xg: 2.03,
    press: "Elastic press 6.8",
    form: ["W", "L", "W", "W", "W"]
  },
  {
    id: "bar",
    name: "Barcelona",
    shortName: "BAR",
    city: "Barcelona",
    country: "Spain",
    stadium: "Estadi Olimpic",
    lng: 2.1228,
    lat: 41.3809,
    accent: "#ffb84a",
    logo: "/teams/barcelona.svg",
    signal: "catalonia mesh",
    possession: "63%",
    xg: 2.11,
    press: "Rest-defense press 7.0",
    form: ["W", "W", "D", "L", "W"]
  },
  {
    id: "atm",
    name: "Atletico Madrid",
    shortName: "ATM",
    city: "Madrid",
    country: "Spain",
    stadium: "Metropolitano",
    lng: -3.5995,
    lat: 40.4362,
    accent: "#ff6d73",
    logo: "/teams/atletico.svg",
    signal: "metropolitano lock",
    possession: "49%",
    xg: 1.73,
    press: "Compact press 6.6",
    form: ["W", "D", "W", "W", "L"]
  },
  {
    id: "bay",
    name: "Bayern Munich",
    shortName: "BAY",
    city: "Munich",
    country: "Germany",
    stadium: "Allianz Arena",
    lng: 11.6248,
    lat: 48.2188,
    accent: "#ff4166",
    logo: "/teams/bayern.svg",
    signal: "munich core stream",
    possession: "59%",
    xg: 2.28,
    press: "High press 8.2",
    form: ["W", "D", "W", "W", "W"]
  },
  {
    id: "bvb",
    name: "Borussia Dortmund",
    shortName: "BVB",
    city: "Dortmund",
    country: "Germany",
    stadium: "Signal Iduna Park",
    lng: 7.4519,
    lat: 51.4926,
    accent: "#ffd447",
    logo: "/teams/dortmund.svg",
    signal: "ruhr signal path",
    possession: "55%",
    xg: 1.88,
    press: "Wave press 6.7",
    form: ["L", "W", "W", "D", "W"]
  },
  {
    id: "rbl",
    name: "RB Leipzig",
    shortName: "RBL",
    city: "Leipzig",
    country: "Germany",
    stadium: "Red Bull Arena",
    lng: 12.3481,
    lat: 51.3452,
    accent: "#ff8797",
    logo: "/teams/leipzig.svg",
    signal: "saxony relay",
    possession: "54%",
    xg: 1.79,
    press: "Fast press 6.9",
    form: ["W", "W", "L", "D", "W"]
  },
  {
    id: "mil",
    name: "AC Milan",
    shortName: "MIL",
    city: "Milan",
    country: "Italy",
    stadium: "San Siro",
    lng: 9.124,
    lat: 45.4781,
    accent: "#ff2d55",
    logo: "/teams/milan.svg",
    signal: "san-siro vector link",
    possession: "54%",
    xg: 1.74,
    press: "Mid press 6.2",
    form: ["D", "W", "L", "W", "D"]
  },
  {
    id: "int",
    name: "Inter Milan",
    shortName: "INT",
    city: "Milan",
    country: "Italy",
    stadium: "San Siro",
    lng: 9.124,
    lat: 45.4781,
    accent: "#3ec7ff",
    logo: "/teams/inter.svg",
    signal: "nerazzurri stream",
    possession: "57%",
    xg: 2.01,
    press: "Adaptive press 6.8",
    form: ["W", "W", "W", "D", "L"]
  },
  {
    id: "juv",
    name: "Juventus",
    shortName: "JUV",
    city: "Turin",
    country: "Italy",
    stadium: "Allianz Stadium",
    lng: 7.6413,
    lat: 45.1096,
    accent: "#f3f5f6",
    logo: "/teams/juventus.svg",
    signal: "torino channel",
    possession: "51%",
    xg: 1.69,
    press: "Block press 6.1",
    form: ["W", "L", "W", "D", "W"]
  },
  {
    id: "nap",
    name: "Napoli",
    shortName: "NAP",
    city: "Naples",
    country: "Italy",
    stadium: "Stadio Diego Armando Maradona",
    lng: 14.193,
    lat: 40.8279,
    accent: "#49c4ff",
    logo: "/teams/napoli.svg",
    signal: "vesuvius sync",
    possession: "55%",
    xg: 1.84,
    press: "High line press 6.5",
    form: ["D", "W", "W", "W", "L"]
  }
];

export const MATCHES: Match[] = [
  {
    id: "match-ars-rma",
    homeTeamId: "ars",
    awayTeamId: "rma",
    competition: "champions circuit",
    minute: 67,
    score: "2 - 1",
    narrative: "阿森纳前场高压持续生效，皇马的纵向转换依旧犀利。",
    intensity: 0.88,
    phase: 0.15
  },
  {
    id: "match-psg-bay",
    homeTeamId: "psg",
    awayTeamId: "bay",
    competition: "elite night",
    minute: 52,
    score: "1 - 1",
    narrative: "巴黎与拜仁中场拉扯非常快，双方都在追求高质量终结。",
    intensity: 0.92,
    phase: 1.1
  },
  {
    id: "match-bar-int",
    homeTeamId: "bar",
    awayTeamId: "int",
    competition: "continental sync",
    minute: 73,
    score: "3 - 2",
    narrative: "巴萨在肋部持续制造 overload，国米用反击不断回应。",
    intensity: 0.95,
    phase: 2.05
  },
  {
    id: "match-bvb-liv",
    homeTeamId: "bvb",
    awayTeamId: "liv",
    competition: "signal derby",
    minute: 38,
    score: "0 - 1",
    narrative: "多特保持高位出球，利物浦的反抢和二次推进更直接。",
    intensity: 0.74,
    phase: 3.0
  },
  {
    id: "match-juv-atm",
    homeTeamId: "juv",
    awayTeamId: "atm",
    competition: "lock phase",
    minute: 61,
    score: "1 - 0",
    narrative: "尤文把节奏压得很低，马竞在等待一次高价值反击窗口。",
    intensity: 0.63,
    phase: 4.0
  },
  {
    id: "match-mci-nap",
    homeTeamId: "mci",
    awayTeamId: "nap",
    competition: "orbital league",
    minute: 81,
    score: "2 - 2",
    narrative: "曼城持续主导控球，但那不勒斯的纵深冲击让比赛非常开放。",
    intensity: 0.91,
    phase: 4.8
  }
];

export const TEAM_MAP = Object.fromEntries(TEAMS.map((team) => [team.id, team])) as Record<
  string,
  Team
>;

export const NATIONAL_TEAMS: Team[] = [
  {
    id: "eng_nt",
    name: "England",
    shortName: "ENG",
    city: "London",
    country: "England",
    stadium: "Wembley Stadium",
    lng: -0.2796,
    lat: 51.556,
    accent: "#f6f7fb",
    logo: "/teams/national-generic.svg",
    signal: "wembley command relay",
    possession: "57%",
    xg: 1.98,
    press: "纵深反抢 7.6",
    form: ["W", "W", "D", "W", "L"]
  },
  {
    id: "fra_nt",
    name: "France",
    shortName: "FRA",
    city: "Paris",
    country: "France",
    stadium: "Stade de France",
    lng: 2.3601,
    lat: 48.9244,
    accent: "#4db6ff",
    logo: "/teams/national-generic.svg",
    signal: "saint-denis blue circuit",
    possession: "55%",
    xg: 1.86,
    press: "流动逼抢 7.4",
    form: ["W", "D", "W", "W", "D"]
  },
  {
    id: "esp_nt",
    name: "Spain",
    shortName: "ESP",
    city: "Madrid",
    country: "Spain",
    stadium: "Las Rozas Hub",
    lng: -3.7038,
    lat: 40.4168,
    accent: "#ffcf68",
    logo: "/teams/national-generic.svg",
    signal: "iberian possession grid",
    possession: "61%",
    xg: 2.07,
    press: "持续控压 7.2",
    form: ["W", "W", "D", "L", "W"]
  },
  {
    id: "bra_nt",
    name: "Brazil",
    shortName: "BRA",
    city: "Brasilia",
    country: "Brazil",
    stadium: "Mane Garrincha",
    lng: -47.8825,
    lat: -15.7942,
    accent: "#72f59a",
    logo: "/teams/national-generic.svg",
    signal: "selacao long-range link",
    possession: "58%",
    xg: 2.16,
    press: "前场压迫 7.8",
    form: ["W", "W", "W", "D", "W"]
  },
  {
    id: "arg_nt",
    name: "Argentina",
    shortName: "ARG",
    city: "Buenos Aires",
    country: "Argentina",
    stadium: "Monumental",
    lng: -58.4497,
    lat: -34.5453,
    accent: "#8fe5ff",
    logo: "/teams/national-generic.svg",
    signal: "rioplatense sync channel",
    possession: "54%",
    xg: 1.91,
    press: "弹性逼抢 7.3",
    form: ["W", "D", "W", "W", "L"]
  },
  {
    id: "mar_nt",
    name: "Morocco",
    shortName: "MAR",
    city: "Rabat",
    country: "Morocco",
    stadium: "Prince Moulay Abdellah",
    lng: -6.8326,
    lat: 33.9716,
    accent: "#ff6d73",
    logo: "/teams/national-generic.svg",
    signal: "atlas defense corridor",
    possession: "48%",
    xg: 1.42,
    press: "紧凑阻断 6.8",
    form: ["W", "W", "L", "D", "W"]
  },
  {
    id: "jpn_nt",
    name: "Japan",
    shortName: "JPN",
    city: "Tokyo",
    country: "Japan",
    stadium: "National Stadium",
    lng: 139.7148,
    lat: 35.6778,
    accent: "#ffffff",
    logo: "/teams/national-generic.svg",
    signal: "tokyo rapid lattice",
    possession: "53%",
    xg: 1.79,
    press: "快速压迫 7.1",
    form: ["W", "W", "D", "W", "W"]
  },
  {
    id: "usa_nt",
    name: "United States",
    shortName: "USA",
    city: "Washington",
    country: "United States",
    stadium: "Audi Field",
    lng: -77.0128,
    lat: 38.8766,
    accent: "#7ad7ff",
    logo: "/teams/national-generic.svg",
    signal: "atlantic relay mesh",
    possession: "51%",
    xg: 1.64,
    press: "高速回抢 6.9",
    form: ["D", "W", "W", "L", "W"]
  },
  {
    id: "chn_nt",
    name: "China",
    shortName: "CHN",
    city: "Beijing",
    country: "China",
    stadium: "Beijing National Stadium",
    lng: 116.4074,
    lat: 39.9042,
    accent: "#ff5f54",
    logo: "/teams/national-generic.svg",
    signal: "dragon team relay",
    possession: "52%",
    xg: 1.48,
    press: "双后腰压迫 6.4",
    form: ["W", "W", "D", "D", "W"]
  },
  {
    id: "ksa_nt",
    name: "Saudi Arabia",
    shortName: "KSA",
    city: "Riyadh",
    country: "Saudi Arabia",
    stadium: "King Fahd Sports City",
    lng: 46.7108,
    lat: 24.6905,
    accent: "#5ce2b6",
    logo: "/teams/national-generic.svg",
    signal: "riyadh desert uplink",
    possession: "49%",
    xg: 1.51,
    press: "区域压迫 6.6",
    form: ["W", "D", "W", "L", "D"]
  }
];

export const NATIONAL_MATCHES: Match[] = [
  {
    id: "nat-eng-bra",
    homeTeamId: "eng_nt",
    awayTeamId: "bra_nt",
    competition: "intercontinental circuit",
    minute: 64,
    score: "2 - 2",
    narrative: "英格兰与巴西在中前场持续对冲，长距离转移与强侧压迫同时拉满。",
    intensity: 0.96,
    phase: 0.22
  },
  {
    id: "nat-fra-arg",
    homeTeamId: "fra_nt",
    awayTeamId: "arg_nt",
    competition: "global test window",
    minute: 58,
    score: "1 - 1",
    narrative: "法国依靠中场推进不断提速，阿根廷则用耐心控制和突然提频回应。",
    intensity: 0.92,
    phase: 1.05
  },
  {
    id: "nat-esp-jpn",
    homeTeamId: "esp_nt",
    awayTeamId: "jpn_nt",
    competition: "oceanic exchange",
    minute: 71,
    score: "3 - 2",
    narrative: "西班牙维持高控球节奏，日本利用快速反击把比赛拉成开放战。",
    intensity: 0.9,
    phase: 1.88
  },
  {
    id: "nat-usa-mar",
    homeTeamId: "usa_nt",
    awayTeamId: "mar_nt",
    competition: "atlantic sync",
    minute: 49,
    score: "0 - 1",
    narrative: "美国不断尝试边路提速，摩洛哥用紧凑站位和反击路线限制空间。",
    intensity: 0.78,
    phase: 2.66
  },
  {
    id: "nat-ksa-bra",
    homeTeamId: "ksa_nt",
    awayTeamId: "bra_nt",
    competition: "desert crossover",
    minute: 66,
    score: "1 - 2",
    narrative: "沙特在中段建立了稳固拦截带，巴西则用技术优势不断制造二次进攻。",
    intensity: 0.86,
    phase: 3.44
  },
  {
    id: "nat-jpn-arg",
    homeTeamId: "jpn_nt",
    awayTeamId: "arg_nt",
    competition: "pacific link",
    minute: 82,
    score: "2 - 2",
    narrative: "日本的快节奏传导与阿根廷的纵深冲击形成了很强的跨洲对抗感。",
    intensity: 0.94,
    phase: 4.18
  },
  {
    id: "nat-ger-mex",
    homeTeamId: "ger_nt",
    awayTeamId: "mex_nt",
    competition: "continental relay",
    minute: 54,
    score: "1 - 0",
    narrative: "德国在中路建立稳定推进，墨西哥则不断尝试用边路提速打穿转身空间。",
    intensity: 0.84,
    phase: 4.92
  },
  {
    id: "nat-por-aus",
    homeTeamId: "por_nt",
    awayTeamId: "aus_nt",
    competition: "southern crossover",
    minute: 62,
    score: "2 - 1",
    narrative: "葡萄牙通过肋部小配合控制节奏，澳大利亚持续用纵向冲刺回应。",
    intensity: 0.82,
    phase: 5.61
  },
  {
    id: "nat-chn-ita",
    homeTeamId: "chn_nt",
    awayTeamId: "ita_nt",
    competition: "silk route series",
    minute: 47,
    score: "1 - 1",
    narrative: "中国在中后场保持紧凑站位，意大利则利用弱侧转移不断寻找直塞窗口。",
    intensity: 0.8,
    phase: 6.34
  },
  {
    id: "nat-col-ned",
    homeTeamId: "col_nt",
    awayTeamId: "ned_nt",
    competition: "atlantic bridge",
    minute: 76,
    score: "2 - 3",
    narrative: "哥伦比亚把比赛拉进高强度对攻，荷兰依靠中场轮转与后插上持续给出回应。",
    intensity: 0.91,
    phase: 7.02
  }
];

export const NATIONAL_TEAM_MAP = Object.fromEntries(
  NATIONAL_TEAMS.map((team) => [team.id, team])
) as Record<string, Team>;

export const CLUB_DETAILS: Record<string, TeamSidebarDetail> = {
  ars: {
    coach: "米克尔·阿尔特塔",
    coachTitle: "主教练",
    honors: ["英格兰顶级联赛 13 次", "足总杯 14 次", "欧洲优胜者杯 1 次"],
    recentFixtures: [
      fixture({ id: "ars-r1", competition: "英超", opponent: "布莱顿", dateLabel: "4 天前", venue: "主场", status: "finished", outcome: "W", score: "2 - 0", note: "右肋连续压迫制造两次高质量机会。" }),
      fixture({ id: "ars-r2", competition: "英超", opponent: "纽卡斯尔", dateLabel: "8 天前", venue: "客场", status: "finished", outcome: "D", score: "1 - 1", note: "中场对抗强度很高，节奏被切得较碎。" }),
      fixture({ id: "ars-r3", competition: "英超", opponent: "热刺", dateLabel: "13 天前", venue: "主场", status: "finished", outcome: "W", score: "3 - 1", note: "北伦敦德比前场反抢效率很高。" }),
      fixture({ id: "ars-r4", competition: "足总杯", opponent: "维拉", dateLabel: "17 天前", venue: "主场", status: "finished", outcome: "W", score: "2 - 1", note: "定位球二点球保护做得很好。" }),
      fixture({ id: "ars-r5", competition: "英超", opponent: "切尔西", dateLabel: "22 天前", venue: "客场", status: "finished", outcome: "L", score: "0 - 1", note: "最后一传质量一般，边路推进受阻。" })
    ],
    nextFixture: fixture({ id: "ars-n1", competition: "英超", opponent: "曼联", dateLabel: "03-30 20:30", venue: "主场", status: "scheduled", note: "预计首发延续 4-3-3，中前场会继续强调高位压迫。" }),
    lineup: createLineup("4-3-3", "最近一场首发 vs 布莱顿", [
      { y: 86, players: [[22, "拉亚"]] },
      { y: 68, players: [[4, "本·怀特"], [2, "萨利巴"], [6, "加布里埃尔"], [35, "津琴科"]] },
      { y: 50, players: [[8, "厄德高"], [41, "赖斯"], [29, "哈弗茨"]] },
      { y: 26, players: [[7, "萨卡"], [9, "热苏斯"], [11, "马丁内利"]] }
    ])
  },
  che: {
    coach: "恩佐·马雷斯卡",
    coachTitle: "主教练",
    honors: ["英格兰顶级联赛 6 次", "欧冠 2 次", "欧联杯 2 次"],
    recentFixtures: [
      fixture({ id: "che-r1", competition: "英超", opponent: "狼队", dateLabel: "3 天前", venue: "主场", status: "finished", outcome: "W", score: "2 - 1", note: "边后卫内收后，中场控球更稳定。" }),
      fixture({ id: "che-r2", competition: "英超", opponent: "西汉姆", dateLabel: "7 天前", venue: "客场", status: "finished", outcome: "D", score: "1 - 1", note: "防线回追速度决定了比赛下限。" }),
      fixture({ id: "che-r3", competition: "联赛杯", opponent: "富勒姆", dateLabel: "12 天前", venue: "主场", status: "finished", outcome: "W", score: "3 - 0", note: "中前场的短传渗透质量不错。" }),
      fixture({ id: "che-r4", competition: "英超", opponent: "阿森纳", dateLabel: "16 天前", venue: "主场", status: "finished", outcome: "W", score: "1 - 0", note: "纵向冲击把对手防线拉得很开。" }),
      fixture({ id: "che-r5", competition: "英超", opponent: "曼城", dateLabel: "20 天前", venue: "客场", status: "finished", outcome: "L", score: "0 - 2", note: "中场出球被限制后压迫断了层。" })
    ],
    nextFixture: fixture({ id: "che-n1", competition: "英超", opponent: "利物浦", dateLabel: "03-31 23:00", venue: "客场", status: "scheduled", note: "预计继续双后腰保护，重点控制反击落点。" }),
    lineup: createLineup("4-2-3-1", "最近一场首发 vs 狼队", [
      { y: 86, players: [[1, "桑切斯"]] },
      { y: 68, players: [[27, "古斯托"], [6, "科尔威尔"], [5, "巴迪亚西勒"], [3, "库库雷利亚"]] },
      { y: 56, players: [[25, "凯塞多"], [8, "恩佐"]] },
      { y: 40, players: [[11, "马杜埃凯"], [20, "帕尔默"], [7, "斯特林"]] },
      { y: 23, players: [[15, "杰克逊"]] }
    ])
  },
  mci: {
    coach: "佩普·瓜迪奥拉",
    coachTitle: "主教练",
    honors: ["英格兰顶级联赛 10 次", "欧冠 1 次", "世俱杯 1 次"],
    recentFixtures: [
      fixture({ id: "mci-r1", competition: "英超", opponent: "伯恩茅斯", dateLabel: "4 天前", venue: "主场", status: "finished", outcome: "W", score: "3 - 1", note: "边锋内收后，肋部传跑更顺。" }),
      fixture({ id: "mci-r2", competition: "英超", opponent: "利物浦", dateLabel: "8 天前", venue: "客场", status: "finished", outcome: "D", score: "2 - 2", note: "高位对抗强度几乎拉满。" }),
      fixture({ id: "mci-r3", competition: "欧冠", opponent: "那不勒斯", dateLabel: "12 天前", venue: "主场", status: "finished", outcome: "W", score: "2 - 1", note: "二次进攻质量决定了比赛走势。" }),
      fixture({ id: "mci-r4", competition: "英超", opponent: "切尔西", dateLabel: "16 天前", venue: "主场", status: "finished", outcome: "W", score: "2 - 0", note: "持续控球把对手压回了禁区前沿。" }),
      fixture({ id: "mci-r5", competition: "英超", opponent: "热刺", dateLabel: "21 天前", venue: "客场", status: "finished", outcome: "W", score: "1 - 0", note: "高位压迫与反丢球反抢都很稳定。" })
    ],
    nextFixture: fixture({ id: "mci-n1", competition: "英超", opponent: "阿斯顿维拉", dateLabel: "04-01 03:00", venue: "主场", status: "scheduled", note: "仍会围绕中路站位和肋部渗透去控节奏。" }),
    lineup: createLineup("3-2-4-1", "最近一场首发 vs 伯恩茅斯", [
      { y: 86, players: [[31, "埃德森"]] },
      { y: 70, players: [[25, "阿坎吉"], [3, "迪亚斯"], [24, "格瓦迪奥尔"]] },
      { y: 56, players: [[16, "罗德里"], [8, "科瓦契奇"]] },
      { y: 40, players: [[47, "福登"], [17, "德布劳内"], [20, "B席"], [11, "多库"]] },
      { y: 22, players: [[9, "哈兰德"]] }
    ])
  },
  liv: {
    coach: "阿尔内·斯洛特",
    coachTitle: "主教练",
    honors: ["英格兰顶级联赛 20 次", "欧冠 6 次", "世俱杯 1 次"],
    recentFixtures: [
      fixture({ id: "liv-r1", competition: "英超", opponent: "布伦特福德", dateLabel: "4 天前", venue: "主场", status: "finished", outcome: "W", score: "3 - 1", note: "前场反抢后立即提速制造了多次射门。" }),
      fixture({ id: "liv-r2", competition: "英超", opponent: "曼城", dateLabel: "8 天前", venue: "主场", status: "finished", outcome: "D", score: "2 - 2", note: "转换速度和落位速度都很高。" }),
      fixture({ id: "liv-r3", competition: "欧冠", opponent: "多特蒙德", dateLabel: "12 天前", venue: "客场", status: "finished", outcome: "W", score: "1 - 0", note: "两翼推进与中锋支点结合得不错。" }),
      fixture({ id: "liv-r4", competition: "英超", opponent: "阿森纳", dateLabel: "16 天前", venue: "客场", status: "finished", outcome: "L", score: "0 - 2", note: "回防时的横向移动慢了半拍。" }),
      fixture({ id: "liv-r5", competition: "英超", opponent: "纽卡斯尔", dateLabel: "21 天前", venue: "主场", status: "finished", outcome: "W", score: "2 - 0", note: "肋部斜传连续打穿二线防守。" })
    ],
    nextFixture: fixture({ id: "liv-n1", competition: "英超", opponent: "切尔西", dateLabel: "03-31 23:00", venue: "主场", status: "scheduled", note: "预计会继续在边路对位上做针对性压迫。" }),
    lineup: createLineup("4-3-3", "最近一场首发 vs 布伦特福德", [
      { y: 86, players: [[1, "阿利松"]] },
      { y: 68, players: [[66, "阿诺德"], [5, "科纳特"], [4, "范戴克"], [26, "罗伯逊"]] },
      { y: 50, players: [[10, "麦卡利斯特"], [38, "赫拉芬贝赫"], [17, "琼斯"]] },
      { y: 26, players: [[11, "萨拉赫"], [9, "努涅斯"], [7, "迪亚斯"]] }
    ])
  },
  mun: {
    coach: "迈克尔·卡里克",
    coachTitle: "主教练",
    honors: ["英格兰顶级联赛 20 次", "足总杯 13 次", "欧冠 3 次"],
    recentFixtures: [
      fixture({ id: "mun-r1", competition: "英超", opponent: "阿斯顿维拉", dateLabel: "03-15", venue: "主场", status: "finished", outcome: "W", score: "3 - 1", note: "卡塞米罗首开纪录，库尼亚与谢什科在下半场锁定胜局。" }),
      fixture({ id: "mun-r2", competition: "英超", opponent: "纽卡斯尔联", dateLabel: "03-04", venue: "客场", status: "finished", outcome: "L", score: "1 - 2", note: "在圣詹姆斯公园遭到逆转，联赛节奏一度被对手切碎。" }),
      fixture({ id: "mun-r3", competition: "英超", opponent: "西汉姆联", dateLabel: "02-10", venue: "客场", status: "finished", outcome: "D", score: "1 - 1", note: "谢什科补时绝平，卡里克开局阶段继续保持拿分势头。" }),
      fixture({ id: "mun-r4", competition: "英超", opponent: "热刺", dateLabel: "02-07", venue: "主场", status: "finished", outcome: "W", score: "2 - 0", note: "姆贝乌莫与B费破门，主场高压让十人热刺难以出球。" }),
      fixture({ id: "mun-r5", competition: "英超", opponent: "富勒姆", dateLabel: "02-01", venue: "主场", status: "finished", outcome: "W", score: "3 - 2", note: "谢什科补时制胜，老特拉福德惊险收下三分。" })
    ],
    nextFixture: fixture({ id: "mun-n1", competition: "英超", opponent: "利兹联", dateLabel: "04-13 20:00", venue: "主场", status: "scheduled", note: "英超 4 月赛程调整后，曼联将在 4 月 13 日晚主场迎战利兹联。" }),
    lineup: createLineup("4-2-3-1", "最近一场首发 vs 阿斯顿维拉", [
      { y: 86, players: [[31, "拉门斯"]] },
      { y: 68, players: [[20, "达洛特"], [15, "约罗"], [5, "马奎尔"], [23, "卢克·肖"]] },
      { y: 56, players: [[18, "卡塞米罗"], [37, "梅努"]] },
      { y: 40, players: [[16, "阿马德"], [8, "布鲁诺·费尔南德斯"], [10, "库尼亚"]] },
      { y: 23, players: [[19, "姆贝乌莫"]] }
    ])
  },
  psg: {
    coach: "路易斯·恩里克",
    coachTitle: "主教练",
    honors: ["法甲 12 次", "法国杯 15 次", "法国超级杯 12 次"],
    recentFixtures: [
      fixture({ id: "psg-r1", competition: "法甲", opponent: "里尔", dateLabel: "3 天前", venue: "主场", status: "finished", outcome: "W", score: "3 - 1", note: "控球优势明显，肋部渗透效率高。" }),
      fixture({ id: "psg-r2", competition: "法甲", opponent: "马赛", dateLabel: "8 天前", venue: "客场", status: "finished", outcome: "W", score: "2 - 0", note: "中前场切换到弱侧的速度很快。" }),
      fixture({ id: "psg-r3", competition: "欧冠", opponent: "拜仁", dateLabel: "12 天前", venue: "主场", status: "finished", outcome: "D", score: "1 - 1", note: "中场被持续反抢，节奏比较拉扯。" }),
      fixture({ id: "psg-r4", competition: "法甲", opponent: "里昂", dateLabel: "16 天前", venue: "主场", status: "finished", outcome: "W", score: "4 - 1", note: "边中结合打得非常顺。" }),
      fixture({ id: "psg-r5", competition: "法国杯", opponent: "摩纳哥", dateLabel: "20 天前", venue: "客场", status: "finished", outcome: "W", score: "2 - 1", note: "高位抢断后反击终结很坚决。" })
    ],
    nextFixture: fixture({ id: "psg-n1", competition: "法甲", opponent: "尼斯", dateLabel: "04-01 02:45", venue: "客场", status: "scheduled", note: "预计会延续高控球和高位边锋站位。" }),
    lineup: createLineup("4-3-3", "最近一场首发 vs 里尔", [
      { y: 86, players: [[99, "多纳鲁马"]] },
      { y: 68, players: [[2, "阿什拉夫"], [5, "马尔基尼奥斯"], [21, "卢卡斯"], [25, "努诺·门德斯"]] },
      { y: 50, players: [[17, "维蒂尼亚"], [33, "扎伊尔-埃梅里"], [8, "鲁伊斯"]] },
      { y: 26, players: [[10, "登贝莱"], [9, "贡萨洛·拉莫斯"], [7, "克瓦拉茨赫利亚"]] }
    ])
  },
  om: {
    coach: "让-路易·加塞",
    coachTitle: "主教练",
    honors: ["法甲 9 次", "欧冠 1 次", "法国杯 10 次"],
    recentFixtures: [
      fixture({ id: "om-r1", competition: "法甲", opponent: "雷恩", dateLabel: "4 天前", venue: "主场", status: "finished", outcome: "W", score: "2 - 0", note: "中路拦截带保护得不错。" }),
      fixture({ id: "om-r2", competition: "法甲", opponent: "巴黎圣日耳曼", dateLabel: "9 天前", venue: "主场", status: "finished", outcome: "L", score: "0 - 2", note: "高位逼抢执行后劲不足。" }),
      fixture({ id: "om-r3", competition: "法甲", opponent: "尼斯", dateLabel: "13 天前", venue: "客场", status: "finished", outcome: "D", score: "1 - 1", note: "边路推进打开了反击空间。" }),
      fixture({ id: "om-r4", competition: "法国杯", opponent: "里尔", dateLabel: "18 天前", venue: "主场", status: "finished", outcome: "W", score: "2 - 1", note: "下半场压迫强度明显提升。" }),
      fixture({ id: "om-r5", competition: "法甲", opponent: "摩纳哥", dateLabel: "22 天前", venue: "客场", status: "finished", outcome: "W", score: "1 - 0", note: "整体回撤更有纪律性。" })
    ],
    nextFixture: fixture({ id: "om-n1", competition: "法甲", opponent: "朗斯", dateLabel: "03-31 22:00", venue: "客场", status: "scheduled", note: "重点会放在边翼卫与中卫之间的保护上。" }),
    lineup: createLineup("3-4-2-1", "最近一场首发 vs 雷恩", [
      { y: 86, players: [[16, "洛佩斯"]] },
      { y: 70, players: [[99, "姆本巴"], [5, "巴列尔迪"], [13, "梅特"]] },
      { y: 54, players: [[44, "恩里克"], [27, "韦勒图"], [21, "隆吉耶"], [7, "克劳斯"]] },
      { y: 38, players: [[11, "阿明·阿里"], [10, "奥纳希"]] },
      { y: 22, players: [[9, "奥巴梅扬"]] }
    ])
  },
  rma: {
    coach: "卡洛·安切洛蒂",
    coachTitle: "主教练",
    honors: ["欧冠 15 次", "西甲 36 次", "世俱杯 5 次"],
    recentFixtures: [
      fixture({ id: "rma-r1", competition: "西甲", opponent: "皇家社会", dateLabel: "4 天前", venue: "主场", status: "finished", outcome: "W", score: "2 - 0", note: "纵向推进和边路回敲都很流畅。" }),
      fixture({ id: "rma-r2", competition: "西甲", opponent: "塞维利亚", dateLabel: "8 天前", venue: "客场", status: "finished", outcome: "W", score: "3 - 1", note: "转换中的传跑层次很清晰。" }),
      fixture({ id: "rma-r3", competition: "欧冠", opponent: "阿森纳", dateLabel: "12 天前", venue: "客场", status: "finished", outcome: "L", score: "1 - 2", note: "中场对抗稍被压制。" }),
      fixture({ id: "rma-r4", competition: "西甲", opponent: "马竞", dateLabel: "16 天前", venue: "主场", status: "finished", outcome: "D", score: "1 - 1", note: "德比战更多是防守与反击的博弈。" }),
      fixture({ id: "rma-r5", competition: "国王杯", opponent: "毕尔巴鄂", dateLabel: "21 天前", venue: "主场", status: "finished", outcome: "W", score: "2 - 1", note: "边路下底频率很高。" })
    ],
    nextFixture: fixture({ id: "rma-n1", competition: "西甲", opponent: "巴塞罗那", dateLabel: "04-01 04:00", venue: "客场", status: "scheduled", note: "国家德比会强调中场纵向推进与弱侧转移。" }),
    lineup: createLineup("4-4-2", "最近一场首发 vs 皇家社会", [
      { y: 86, players: [[1, "库尔图瓦"]] },
      { y: 68, players: [[2, "卡瓦哈尔"], [22, "吕迪格"], [4, "阿拉巴"], [23, "门迪"]] },
      { y: 50, players: [[15, "巴尔韦德"], [8, "克罗斯"], [5, "贝林厄姆"], [7, "维尼修斯"]] },
      { y: 26, players: [[11, "罗德里戈"], [9, "姆巴佩"]] }
    ])
  },
  bar: {
    coach: "汉斯-迪特·弗里克",
    coachTitle: "主教练",
    honors: ["西甲 27 次", "欧冠 5 次", "国王杯 31 次"],
    recentFixtures: [
      fixture({ id: "bar-r1", competition: "西甲", opponent: "比利亚雷亚尔", dateLabel: "3 天前", venue: "主场", status: "finished", outcome: "W", score: "3 - 0", note: "中前场站位很有层次感。" }),
      fixture({ id: "bar-r2", competition: "西甲", opponent: "皇家贝蒂斯", dateLabel: "8 天前", venue: "客场", status: "finished", outcome: "D", score: "1 - 1", note: "边后卫套上效果不错。" }),
      fixture({ id: "bar-r3", competition: "欧冠", opponent: "国际米兰", dateLabel: "12 天前", venue: "主场", status: "finished", outcome: "W", score: "3 - 2", note: "肋部 overload 多次生效。" }),
      fixture({ id: "bar-r4", competition: "西甲", opponent: "马竞", dateLabel: "16 天前", venue: "客场", status: "finished", outcome: "L", score: "0 - 1", note: "中场第一落点拿得不够稳。" }),
      fixture({ id: "bar-r5", competition: "国王杯", opponent: "瓦伦西亚", dateLabel: "21 天前", venue: "主场", status: "finished", outcome: "W", score: "2 - 0", note: "持续压迫让对方很难完整出球。" })
    ],
    nextFixture: fixture({ id: "bar-n1", competition: "西甲", opponent: "皇家马德里", dateLabel: "04-01 04:00", venue: "主场", status: "scheduled", note: "预计继续控球主导和高位反抢。" }),
    lineup: createLineup("4-3-3", "最近一场首发 vs 比利亚雷亚尔", [
      { y: 86, players: [[1, "特尔施特根"]] },
      { y: 68, players: [[23, "孔德"], [4, "阿劳霍"], [2, "库巴西"], [3, "巴尔德"]] },
      { y: 50, players: [[21, "德容"], [8, "佩德里"], [6, "加维"]] },
      { y: 26, players: [[19, "亚马尔"], [9, "莱万"], [11, "拉菲尼亚"]] }
    ])
  },
  atm: {
    coach: "迭戈·西蒙尼",
    coachTitle: "主教练",
    honors: ["西甲 11 次", "欧联杯 3 次", "欧洲超级杯 3 次"],
    recentFixtures: [
      fixture({ id: "atm-r1", competition: "西甲", opponent: "赫塔菲", dateLabel: "4 天前", venue: "主场", status: "finished", outcome: "W", score: "2 - 0", note: "整体防线压得很紧。" }),
      fixture({ id: "atm-r2", competition: "西甲", opponent: "皇家马德里", dateLabel: "8 天前", venue: "客场", status: "finished", outcome: "D", score: "1 - 1", note: "德比里反击质量不低。" }),
      fixture({ id: "atm-r3", competition: "欧冠", opponent: "尤文图斯", dateLabel: "12 天前", venue: "客场", status: "finished", outcome: "L", score: "0 - 1", note: "禁区前沿保护做得不够完整。" }),
      fixture({ id: "atm-r4", competition: "西甲", opponent: "塞维利亚", dateLabel: "17 天前", venue: "主场", status: "finished", outcome: "W", score: "3 - 1", note: "边翼卫插上很坚决。" }),
      fixture({ id: "atm-r5", competition: "国王杯", opponent: "皇家社会", dateLabel: "21 天前", venue: "主场", status: "finished", outcome: "W", score: "1 - 0", note: "低位防守后的提速很明确。" })
    ],
    nextFixture: fixture({ id: "atm-n1", competition: "西甲", opponent: "毕尔巴鄂", dateLabel: "03-31 21:00", venue: "客场", status: "scheduled", note: "大概率继续五后卫体系稳守后打身后。" }),
    lineup: createLineup("3-5-2", "最近一场首发 vs 赫塔菲", [
      { y: 86, players: [[13, "奥布拉克"]] },
      { y: 70, players: [[15, "萨维奇"], [2, "希门尼斯"], [22, "埃尔莫索"]] },
      { y: 54, players: [[14, "略伦特"], [5, "德保罗"], [6, "科克"], [8, "巴里奥斯"], [12, "利诺"]] },
      { y: 26, players: [[19, "莫拉塔"], [7, "格列兹曼"]] }
    ])
  },
  bay: {
    coach: "文森特·孔帕尼",
    coachTitle: "主教练",
    honors: ["德甲 33 次", "欧冠 6 次", "世俱杯 2 次"],
    recentFixtures: [
      fixture({ id: "bay-r1", competition: "德甲", opponent: "勒沃库森", dateLabel: "4 天前", venue: "主场", status: "finished", outcome: "D", score: "2 - 2", note: "肋部回传后的二次推进很强。" }),
      fixture({ id: "bay-r2", competition: "德甲", opponent: "斯图加特", dateLabel: "8 天前", venue: "客场", status: "finished", outcome: "W", score: "3 - 1", note: "边锋和前腰之间的穿插很活跃。" }),
      fixture({ id: "bay-r3", competition: "欧冠", opponent: "巴黎圣日耳曼", dateLabel: "12 天前", venue: "客场", status: "finished", outcome: "D", score: "1 - 1", note: "高位压迫和落位都很整齐。" }),
      fixture({ id: "bay-r4", competition: "德甲", opponent: "多特蒙德", dateLabel: "17 天前", venue: "主场", status: "finished", outcome: "W", score: "2 - 0", note: "两翼爆点能力占据上风。" }),
      fixture({ id: "bay-r5", competition: "德国杯", opponent: "法兰克福", dateLabel: "22 天前", venue: "主场", status: "finished", outcome: "W", score: "3 - 0", note: "持续高压导致对手失误很多。" })
    ],
    nextFixture: fixture({ id: "bay-n1", competition: "德甲", opponent: "RB 莱比锡", dateLabel: "03-31 01:30", venue: "客场", status: "scheduled", note: "中场保护和快速回抢是关键。" }),
    lineup: createLineup("4-2-3-1", "最近一场首发 vs 勒沃库森", [
      { y: 86, players: [[1, "诺伊尔"]] },
      { y: 68, players: [[27, "莱默尔"], [2, "于帕梅卡诺"], [3, "金玟哉"], [19, "戴维斯"]] },
      { y: 56, players: [[6, "基米希"], [45, "帕夫洛维奇"]] },
      { y: 40, players: [[17, "奥利塞"], [42, "穆西亚拉"], [10, "萨内"]] },
      { y: 23, players: [[9, "凯恩"]] }
    ])
  },
  bvb: {
    coach: "努里·沙欣",
    coachTitle: "主教练",
    honors: ["德甲 8 次", "欧冠 1 次", "德国杯 5 次"],
    recentFixtures: [
      fixture({ id: "bvb-r1", competition: "德甲", opponent: "霍芬海姆", dateLabel: "4 天前", venue: "主场", status: "finished", outcome: "W", score: "2 - 1", note: "高位逼抢拿回了不少二点球。" }),
      fixture({ id: "bvb-r2", competition: "德甲", opponent: "拜仁", dateLabel: "8 天前", venue: "客场", status: "finished", outcome: "L", score: "0 - 2", note: "中场接应不够顺畅。" }),
      fixture({ id: "bvb-r3", competition: "欧冠", opponent: "利物浦", dateLabel: "12 天前", venue: "主场", status: "finished", outcome: "L", score: "0 - 1", note: "出球被持续反抢压制。" }),
      fixture({ id: "bvb-r4", competition: "德甲", opponent: "法兰克福", dateLabel: "17 天前", venue: "主场", status: "finished", outcome: "W", score: "3 - 1", note: "边路直塞效果很不错。" }),
      fixture({ id: "bvb-r5", competition: "德国杯", opponent: "不来梅", dateLabel: "22 天前", venue: "客场", status: "finished", outcome: "D", score: "1 - 1", note: "最后靠点球艰难过关。" })
    ],
    nextFixture: fixture({ id: "bvb-n1", competition: "德甲", opponent: "门兴", dateLabel: "03-30 22:30", venue: "主场", status: "scheduled", note: "预计会继续把压迫触发点放在边路。" }),
    lineup: createLineup("4-2-3-1", "最近一场首发 vs 霍芬海姆", [
      { y: 86, players: [[1, "科贝尔"]] },
      { y: 68, players: [[26, "瑞尔森"], [4, "施洛特贝克"], [25, "聚勒"], [5, "本塞拜尼"]] },
      { y: 56, players: [[20, "萨比策"], [23, "埃姆雷·詹"]] },
      { y: 40, players: [[27, "阿德耶米"], [10, "布兰特"], [43, "吉腾斯"]] },
      { y: 23, players: [[9, "吉拉西"]] }
    ])
  },
  rbl: {
    coach: "马尔科·罗泽",
    coachTitle: "主教练",
    honors: ["德国杯 2 次", "德国超级杯 1 次", "欧战常客"],
    recentFixtures: [
      fixture({ id: "rbl-r1", competition: "德甲", opponent: "弗赖堡", dateLabel: "3 天前", venue: "主场", status: "finished", outcome: "W", score: "2 - 0", note: "纵向推进非常直接。" }),
      fixture({ id: "rbl-r2", competition: "德甲", opponent: "斯图加特", dateLabel: "8 天前", venue: "客场", status: "finished", outcome: "D", score: "1 - 1", note: "中后场回收后再提速很有效。" }),
      fixture({ id: "rbl-r3", competition: "德甲", opponent: "勒沃库森", dateLabel: "12 天前", venue: "主场", status: "finished", outcome: "L", score: "0 - 2", note: "压迫被连续穿透。" }),
      fixture({ id: "rbl-r4", competition: "德国杯", opponent: "柏林联合", dateLabel: "17 天前", venue: "主场", status: "finished", outcome: "W", score: "3 - 1", note: "边路推进和禁区前沿二次球都占优。" }),
      fixture({ id: "rbl-r5", competition: "德甲", opponent: "拜仁", dateLabel: "22 天前", venue: "客场", status: "finished", outcome: "W", score: "2 - 1", note: "反击打得非常犀利。" })
    ],
    nextFixture: fixture({ id: "rbl-n1", competition: "德甲", opponent: "拜仁", dateLabel: "03-31 01:30", venue: "主场", status: "scheduled", note: "会重点保护中卫身前空间，再伺机反击。" }),
    lineup: createLineup("4-4-2", "最近一场首发 vs 弗赖堡", [
      { y: 86, players: [[1, "古拉西"]] },
      { y: 68, players: [[39, "亨里希斯"], [4, "奥尔班"], [23, "卢克巴"], [22, "劳姆"]] },
      { y: 50, players: [[17, "巴库"], [8, "海达拉"], [13, "赛瓦尔德"], [10, "西蒙斯"]] },
      { y: 26, players: [[30, "舍什科"], [11, "奥蓬达"]] }
    ])
  },
  mil: {
    coach: "保罗·丰塞卡",
    coachTitle: "主教练",
    honors: ["意甲 19 次", "欧冠 7 次", "意大利超级杯 8 次"],
    recentFixtures: [
      fixture({ id: "mil-r1", competition: "意甲", opponent: "亚特兰大", dateLabel: "4 天前", venue: "主场", status: "finished", outcome: "D", score: "1 - 1", note: "中路站位不错，但终结效率一般。" }),
      fixture({ id: "mil-r2", competition: "意甲", opponent: "罗马", dateLabel: "8 天前", venue: "客场", status: "finished", outcome: "W", score: "2 - 1", note: "快速推进打出了明显层次。" }),
      fixture({ id: "mil-r3", competition: "意甲", opponent: "国际米兰", dateLabel: "12 天前", venue: "主场", status: "finished", outcome: "L", score: "0 - 2", note: "德比中被持续压制中场二点。" }),
      fixture({ id: "mil-r4", competition: "意大利杯", opponent: "拉齐奥", dateLabel: "17 天前", venue: "主场", status: "finished", outcome: "W", score: "1 - 0", note: "边锋单挑效果很明显。" }),
      fixture({ id: "mil-r5", competition: "意甲", opponent: "佛罗伦萨", dateLabel: "22 天前", venue: "客场", status: "finished", outcome: "D", score: "2 - 2", note: "攻防转换都偏快。" })
    ],
    nextFixture: fixture({ id: "mil-n1", competition: "意甲", opponent: "尤文图斯", dateLabel: "03-31 02:45", venue: "主场", status: "scheduled", note: "预计比赛节奏会偏谨慎，中场对抗强度很大。" }),
    lineup: createLineup("4-2-3-1", "最近一场首发 vs 亚特兰大", [
      { y: 86, players: [[16, "迈尼昂"]] },
      { y: 68, players: [[2, "卡拉布里亚"], [28, "佳夫"], [23, "托莫里"], [19, "特奥"]] },
      { y: 56, players: [[14, "赖因德斯"], [29, "福法纳"]] },
      { y: 40, players: [[11, "普利希奇"], [10, "莱奥"], [21, "丘库埃泽"]] },
      { y: 23, players: [[7, "莫拉塔"]] }
    ])
  },
  int: {
    coach: "西蒙尼·因扎吉",
    coachTitle: "主教练",
    honors: ["意甲 20 次", "欧冠 3 次", "意大利杯 9 次"],
    recentFixtures: [
      fixture({ id: "int-r1", competition: "意甲", opponent: "都灵", dateLabel: "4 天前", venue: "主场", status: "finished", outcome: "W", score: "2 - 0", note: "三中卫出球非常顺畅。" }),
      fixture({ id: "int-r2", competition: "意甲", opponent: "米兰", dateLabel: "8 天前", venue: "客场", status: "finished", outcome: "W", score: "2 - 0", note: "德比战里防守落位非常整齐。" }),
      fixture({ id: "int-r3", competition: "欧冠", opponent: "巴塞罗那", dateLabel: "12 天前", venue: "客场", status: "finished", outcome: "L", score: "2 - 3", note: "被对方肋部 overload 打出了问题。" }),
      fixture({ id: "int-r4", competition: "意甲", opponent: "那不勒斯", dateLabel: "17 天前", venue: "主场", status: "finished", outcome: "W", score: "3 - 1", note: "边翼卫和前锋之间的联系很紧密。" }),
      fixture({ id: "int-r5", competition: "意大利杯", opponent: "罗马", dateLabel: "21 天前", venue: "主场", status: "finished", outcome: "D", score: "1 - 1", note: "最终通过点球晋级。" })
    ],
    nextFixture: fixture({ id: "int-n1", competition: "意甲", opponent: "拉齐奥", dateLabel: "03-31 01:00", venue: "客场", status: "scheduled", note: "预计会继续三中卫和双前锋的直连打法。" }),
    lineup: createLineup("3-5-2", "最近一场首发 vs 都灵", [
      { y: 86, players: [[1, "索默"]] },
      { y: 70, players: [[28, "帕瓦尔"], [15, "阿切尔比"], [95, "巴斯托尼"]] },
      { y: 54, players: [[2, "邓弗里斯"], [23, "巴雷拉"], [20, "恰尔汗奥卢"], [22, "姆希塔良"], [32, "迪马尔科"]] },
      { y: 26, players: [[9, "图拉姆"], [10, "劳塔罗"]] }
    ])
  },
  juv: {
    coach: "蒂亚戈·莫塔",
    coachTitle: "主教练",
    honors: ["意甲 36 次", "意大利杯 15 次", "欧冠 2 次"],
    recentFixtures: [
      fixture({ id: "juv-r1", competition: "意甲", opponent: "博洛尼亚", dateLabel: "4 天前", venue: "主场", status: "finished", outcome: "W", score: "1 - 0", note: "节奏压得很稳，防线没有给太多空间。" }),
      fixture({ id: "juv-r2", competition: "意甲", opponent: "米兰", dateLabel: "8 天前", venue: "客场", status: "finished", outcome: "D", score: "1 - 1", note: "中场绞杀相当明显。" }),
      fixture({ id: "juv-r3", competition: "欧冠", opponent: "马竞", dateLabel: "12 天前", venue: "主场", status: "finished", outcome: "W", score: "1 - 0", note: "等待高价值反击的策略奏效。" }),
      fixture({ id: "juv-r4", competition: "意甲", opponent: "那不勒斯", dateLabel: "17 天前", venue: "客场", status: "finished", outcome: "L", score: "0 - 1", note: "前场压迫不够持续。" }),
      fixture({ id: "juv-r5", competition: "意大利杯", opponent: "亚特兰大", dateLabel: "22 天前", venue: "主场", status: "finished", outcome: "W", score: "2 - 1", note: "中后场过渡更稳了。" })
    ],
    nextFixture: fixture({ id: "juv-n1", competition: "意甲", opponent: "AC 米兰", dateLabel: "03-31 02:45", venue: "客场", status: "scheduled", note: "更可能回到稳守后打转换的路线。" }),
    lineup: createLineup("4-2-3-1", "最近一场首发 vs 博洛尼亚", [
      { y: 86, players: [[29, "迪格雷戈里奥"]] },
      { y: 68, players: [[6, "达尼洛"], [4, "加蒂"], [3, "布雷默"], [27, "坎比亚索"]] },
      { y: 56, players: [[5, "洛卡特利"], [19, "凯夫伦·图拉姆"]] },
      { y: 40, players: [[11, "冈萨雷斯"], [16, "麦肯尼"], [10, "伊尔迪兹"]] },
      { y: 23, players: [[9, "弗拉霍维奇"]] }
    ])
  },
  nap: {
    coach: "安东尼奥·孔蒂",
    coachTitle: "主教练",
    honors: ["意甲 3 次", "意大利杯 6 次", "欧战常客"],
    recentFixtures: [
      fixture({ id: "nap-r1", competition: "意甲", opponent: "拉齐奥", dateLabel: "4 天前", venue: "主场", status: "finished", outcome: "W", score: "2 - 1", note: "两翼冲击让比赛一直保持开放。" }),
      fixture({ id: "nap-r2", competition: "意甲", opponent: "国际米兰", dateLabel: "8 天前", venue: "客场", status: "finished", outcome: "L", score: "1 - 3", note: "中场被压制后出球不顺。" }),
      fixture({ id: "nap-r3", competition: "欧冠", opponent: "曼城", dateLabel: "12 天前", venue: "客场", status: "finished", outcome: "D", score: "2 - 2", note: "纵深冲击制造了很多混乱。" }),
      fixture({ id: "nap-r4", competition: "意甲", opponent: "尤文图斯", dateLabel: "17 天前", venue: "主场", status: "finished", outcome: "W", score: "1 - 0", note: "中场保护和边路速度很好地配合起来。" }),
      fixture({ id: "nap-r5", competition: "意大利杯", opponent: "罗马", dateLabel: "21 天前", venue: "主场", status: "finished", outcome: "W", score: "2 - 0", note: "高位回收后反击效率很高。" })
    ],
    nextFixture: fixture({ id: "nap-n1", competition: "意甲", opponent: "佛罗伦萨", dateLabel: "03-30 21:00", venue: "客场", status: "scheduled", note: "预计会继续强调直塞身后与肋部冲击。" }),
    lineup: createLineup("4-3-3", "最近一场首发 vs 拉齐奥", [
      { y: 86, players: [[1, "梅雷特"]] },
      { y: 68, players: [[22, "迪洛伦佐"], [13, "拉赫马尼"], [4, "布翁焦尔诺"], [17, "奥利维拉"]] },
      { y: 50, players: [[99, "安古伊萨"], [68, "洛博特卡"], [8, "麦克托米奈"]] },
      { y: 26, players: [[21, "波利塔诺"], [11, "卢卡库"], [77, "克瓦拉茨赫利亚"]] }
    ])
  }
};

export const NATIONAL_TEAM_DETAILS: Record<string, TeamSidebarDetail> = {
  eng_nt: {
    coach: "加雷斯·索斯盖特",
    coachTitle: "主教练",
    honors: ["世界杯冠军 1 次", "欧洲杯亚军 1 次", "世界杯季军 2 次"],
    recentFixtures: [
      fixture({ id: "eng-r1", competition: "国际比赛日", opponent: "巴西", dateLabel: "3 天前", venue: "中立场", status: "finished", outcome: "D", score: "2 - 2", note: "中前场高压和长距离转移都很坚决。" }),
      fixture({ id: "eng-r2", competition: "欧预赛", opponent: "意大利", dateLabel: "9 天前", venue: "主场", status: "finished", outcome: "W", score: "2 - 1", note: "边锋与前腰之间的连线很流畅。" }),
      fixture({ id: "eng-r3", competition: "国际比赛日", opponent: "法国", dateLabel: "14 天前", venue: "客场", status: "finished", outcome: "L", score: "0 - 1", note: "中场对抗稍落下风。" }),
      fixture({ id: "eng-r4", competition: "欧预赛", opponent: "荷兰", dateLabel: "19 天前", venue: "主场", status: "finished", outcome: "W", score: "3 - 1", note: "下半场提速后彻底掌控了局面。" }),
      fixture({ id: "eng-r5", competition: "国际比赛日", opponent: "比利时", dateLabel: "25 天前", venue: "中立场", status: "finished", outcome: "W", score: "1 - 0", note: "高位反抢很快转化成进攻。" })
    ],
    nextFixture: fixture({ id: "eng-n1", competition: "跨洲热身赛", opponent: "巴西", dateLabel: "进行中", venue: "温布利", status: "live", score: "2 - 2", minute: 64, note: "当前比赛正在进行，边路推进与快速回抢是主旋律。" }),
    lineup: createLineup("4-2-3-1", "最近一场首发 vs 巴西", [
      { y: 86, players: [[1, "皮克福德"]] },
      { y: 68, players: [[2, "沃克"], [5, "斯通斯"], [6, "格伊"], [3, "卢克·肖"]] },
      { y: 56, players: [[4, "赖斯"], [10, "贝林厄姆"]] },
      { y: 40, players: [[7, "萨卡"], [20, "福登"], [11, "戈登"]] },
      { y: 23, players: [[9, "凯恩"]] }
    ])
  },
  fra_nt: {
    coach: "迪迪埃·德尚",
    coachTitle: "主教练",
    honors: ["世界杯冠军 2 次", "欧洲杯冠军 2 次", "欧国联冠军 1 次"],
    recentFixtures: [
      fixture({ id: "fra-r1", competition: "国际比赛日", opponent: "阿根廷", dateLabel: "4 天前", venue: "中立场", status: "finished", outcome: "D", score: "1 - 1", note: "中场推进速度很快，但终结效率一般。" }),
      fixture({ id: "fra-r2", competition: "欧预赛", opponent: "德国", dateLabel: "9 天前", venue: "主场", status: "finished", outcome: "W", score: "2 - 0", note: "压迫触发点非常清晰。" }),
      fixture({ id: "fra-r3", competition: "国际比赛日", opponent: "英格兰", dateLabel: "13 天前", venue: "主场", status: "finished", outcome: "W", score: "1 - 0", note: "防守回撤后的提速很锋利。" }),
      fixture({ id: "fra-r4", competition: "欧预赛", opponent: "西班牙", dateLabel: "18 天前", venue: "客场", status: "finished", outcome: "L", score: "1 - 2", note: "中前场接球身位处理得不够好。" }),
      fixture({ id: "fra-r5", competition: "国际比赛日", opponent: "葡萄牙", dateLabel: "24 天前", venue: "中立场", status: "finished", outcome: "W", score: "2 - 1", note: "边中结合制造了足够多的威胁。" })
    ],
    nextFixture: fixture({ id: "fra-n1", competition: "国际比赛日", opponent: "西班牙", dateLabel: "04-02 03:10", venue: "巴黎", status: "scheduled", note: "预计会继续保持高质量转换与中场绞杀。" }),
    lineup: createLineup("4-3-3", "最近一场首发 vs 阿根廷", [
      { y: 86, players: [[16, "迈尼昂"]] },
      { y: 68, players: [[5, "孔德"], [4, "于帕梅卡诺"], [17, "萨利巴"], [22, "特奥"]] },
      { y: 50, players: [[13, "坎特"], [8, "琼阿梅尼"], [14, "拉比奥"]] },
      { y: 26, players: [[7, "登贝莱"], [9, "吉鲁"], [10, "姆巴佩"]] }
    ])
  },
  esp_nt: {
    coach: "路易斯·德拉富恩特",
    coachTitle: "主教练",
    honors: ["世界杯冠军 1 次", "欧洲杯冠军 3 次", "欧国联冠军 1 次"],
    recentFixtures: [
      fixture({ id: "esp-r1", competition: "国际比赛日", opponent: "日本", dateLabel: "3 天前", venue: "中立场", status: "finished", outcome: "W", score: "3 - 2", note: "持续控球和快速回抢都做到了。" }),
      fixture({ id: "esp-r2", competition: "欧预赛", opponent: "克罗地亚", dateLabel: "8 天前", venue: "主场", status: "finished", outcome: "W", score: "2 - 0", note: "中路组织与边锋牵制同时生效。" }),
      fixture({ id: "esp-r3", competition: "国际比赛日", opponent: "法国", dateLabel: "13 天前", venue: "主场", status: "finished", outcome: "W", score: "2 - 1", note: "控球耐心很好地压住了节奏。" }),
      fixture({ id: "esp-r4", competition: "欧预赛", opponent: "意大利", dateLabel: "19 天前", venue: "客场", status: "finished", outcome: "D", score: "1 - 1", note: "比赛更多是在中场拼控制。" }),
      fixture({ id: "esp-r5", competition: "国际比赛日", opponent: "葡萄牙", dateLabel: "25 天前", venue: "中立场", status: "finished", outcome: "L", score: "0 - 1", note: "面对压迫时有几次出球失误。" })
    ],
    nextFixture: fixture({ id: "esp-n1", competition: "国际比赛日", opponent: "德国", dateLabel: "04-01 21:45", venue: "马德里", status: "scheduled", note: "会继续强调控球与中前场压迫同步。" }),
    lineup: createLineup("4-3-3", "最近一场首发 vs 日本", [
      { y: 86, players: [[23, "乌奈·西蒙"]] },
      { y: 68, players: [[2, "卡瓦哈尔"], [3, "勒诺尔芒"], [14, "拉波尔特"], [24, "库库雷利亚"]] },
      { y: 50, players: [[8, "法维安"], [16, "罗德里"], [20, "佩德里"]] },
      { y: 26, players: [[19, "亚马尔"], [7, "莫拉塔"], [11, "尼科"]] }
    ])
  },
  bra_nt: {
    coach: "多里瓦尔·儒尼奥尔",
    coachTitle: "主教练",
    honors: ["世界杯冠军 5 次", "美洲杯冠军 9 次", "联合会杯冠军 4 次"],
    recentFixtures: [
      fixture({ id: "bra-r1", competition: "跨洲热身赛", opponent: "英格兰", dateLabel: "3 天前", venue: "客场", status: "finished", outcome: "D", score: "2 - 2", note: "纵向突破和一对一能力非常突出。" }),
      fixture({ id: "bra-r2", competition: "世预赛", opponent: "乌拉圭", dateLabel: "8 天前", venue: "主场", status: "finished", outcome: "W", score: "2 - 0", note: "边锋和前腰制造了大量突破。" }),
      fixture({ id: "bra-r3", competition: "国际比赛日", opponent: "阿根廷", dateLabel: "14 天前", venue: "客场", status: "finished", outcome: "L", score: "1 - 2", note: "防守转换慢了一拍。" }),
      fixture({ id: "bra-r4", competition: "世预赛", opponent: "哥伦比亚", dateLabel: "19 天前", venue: "主场", status: "finished", outcome: "W", score: "3 - 1", note: "中前场个人能力决定了比赛上限。" }),
      fixture({ id: "bra-r5", competition: "国际比赛日", opponent: "美国", dateLabel: "24 天前", venue: "中立场", status: "finished", outcome: "W", score: "2 - 1", note: "反击推进很有穿透力。" })
    ],
    nextFixture: fixture({ id: "bra-n1", competition: "跨洲热身赛", opponent: "沙特阿拉伯", dateLabel: "进行中", venue: "利雅得", status: "live", score: "2 - 1", minute: 66, note: "当前正处于中后段，巴西的技术优势比较明显。" }),
    lineup: createLineup("4-2-3-1", "最近一场首发 vs 英格兰", [
      { y: 86, players: [[1, "阿利松"]] },
      { y: 68, players: [[2, "达尼洛"], [4, "马尔基尼奥斯"], [3, "米利唐"], [6, "阿拉纳"]] },
      { y: 56, players: [[5, "吉马良斯"], [8, "帕奎塔"]] },
      { y: 40, players: [[7, "罗德里戈"], [10, "维尼修斯"], [11, "拉菲尼亚"]] },
      { y: 23, players: [[9, "恩德里克"]] }
    ])
  },
  arg_nt: {
    coach: "利昂内尔·斯卡洛尼",
    coachTitle: "主教练",
    honors: ["世界杯冠军 3 次", "美洲杯冠军 16 次", "欧美杯冠军 1 次"],
    recentFixtures: [
      fixture({ id: "arg-r1", competition: "国际比赛日", opponent: "法国", dateLabel: "4 天前", venue: "中立场", status: "finished", outcome: "D", score: "1 - 1", note: "中场节奏控制很稳。" }),
      fixture({ id: "arg-r2", competition: "世预赛", opponent: "巴西", dateLabel: "9 天前", venue: "主场", status: "finished", outcome: "W", score: "2 - 1", note: "纵深推进和临门一脚都很高效。" }),
      fixture({ id: "arg-r3", competition: "国际比赛日", opponent: "日本", dateLabel: "13 天前", venue: "客场", status: "finished", outcome: "D", score: "2 - 2", note: "快慢节奏切换非常鲜明。" }),
      fixture({ id: "arg-r4", competition: "世预赛", opponent: "智利", dateLabel: "18 天前", venue: "主场", status: "finished", outcome: "W", score: "1 - 0", note: "低位防守后打反击质量不错。" }),
      fixture({ id: "arg-r5", competition: "国际比赛日", opponent: "哥伦比亚", dateLabel: "24 天前", venue: "中立场", status: "finished", outcome: "L", score: "0 - 1", note: "边路推进被有效限制。" })
    ],
    nextFixture: fixture({ id: "arg-n1", competition: "国际比赛日", opponent: "乌拉圭", dateLabel: "04-02 08:00", venue: "布宜诺斯艾利斯", status: "scheduled", note: "会更强调中场控制与肋部冲击。" }),
    lineup: createLineup("4-3-3", "最近一场首发 vs 法国", [
      { y: 86, players: [[23, "达米安·马丁内斯"]] },
      { y: 68, players: [[26, "莫利纳"], [13, "罗梅罗"], [19, "奥塔门迪"], [3, "塔利亚菲科"]] },
      { y: 50, players: [[7, "德保罗"], [24, "恩佐"], [20, "麦卡利斯特"]] },
      { y: 26, players: [[11, "迪马利亚"], [9, "阿尔瓦雷斯"], [10, "梅西"]] }
    ])
  },
  mar_nt: {
    coach: "瓦利德·雷格拉吉",
    coachTitle: "主教练",
    honors: ["非洲国家杯冠军 1 次", "世界杯殿军 1 次", "阿拉伯杯冠军 1 次"],
    recentFixtures: [
      fixture({ id: "mar-r1", competition: "国际比赛日", opponent: "美国", dateLabel: "4 天前", venue: "中立场", status: "finished", outcome: "W", score: "1 - 0", note: "站位紧凑，反击线路非常清楚。" }),
      fixture({ id: "mar-r2", competition: "非洲区预选赛", opponent: "塞内加尔", dateLabel: "9 天前", venue: "主场", status: "finished", outcome: "D", score: "1 - 1", note: "中后场的保护做得不错。" }),
      fixture({ id: "mar-r3", competition: "国际比赛日", opponent: "葡萄牙", dateLabel: "14 天前", venue: "客场", status: "finished", outcome: "L", score: "0 - 2", note: "回防空间被反复拉开。" }),
      fixture({ id: "mar-r4", competition: "非洲区预选赛", opponent: "阿尔及利亚", dateLabel: "19 天前", venue: "主场", status: "finished", outcome: "W", score: "2 - 1", note: "边锋回收后再提速很有效。" }),
      fixture({ id: "mar-r5", competition: "国际比赛日", opponent: "埃及", dateLabel: "24 天前", venue: "中立场", status: "finished", outcome: "W", score: "1 - 0", note: "高位断球直接打成反击。" })
    ],
    nextFixture: fixture({ id: "mar-n1", competition: "国际比赛日", opponent: "土耳其", dateLabel: "04-01 00:40", venue: "拉巴特", status: "scheduled", note: "预计仍会保持紧凑防守和直接反击。" }),
    lineup: createLineup("4-1-4-1", "最近一场首发 vs 美国", [
      { y: 86, players: [[1, "布努"]] },
      { y: 68, players: [[2, "阿什拉夫"], [4, "赛斯"], [6, "阿格尔德"], [3, "马兹拉维"]] },
      { y: 56, players: [[8, "阿姆拉巴特"]] },
      { y: 40, players: [[7, "齐耶赫"], [13, "奥纳希"], [10, "阿姆拉巴特"], [11, "布法尔"]] },
      { y: 23, players: [[9, "恩内斯里"]] }
    ])
  },
  jpn_nt: {
    coach: "森保一",
    coachTitle: "主教练",
    honors: ["亚洲杯冠军 4 次", "世界杯 16 强 4 次", "东亚杯冠军 2 次"],
    recentFixtures: [
      fixture({ id: "jpn-r1", competition: "国际比赛日", opponent: "西班牙", dateLabel: "3 天前", venue: "中立场", status: "finished", outcome: "L", score: "2 - 3", note: "高速反击制造了不少机会。" }),
      fixture({ id: "jpn-r2", competition: "世预赛", opponent: "韩国", dateLabel: "8 天前", venue: "主场", status: "finished", outcome: "W", score: "2 - 1", note: "转换速度依旧很有威胁。" }),
      fixture({ id: "jpn-r3", competition: "国际比赛日", opponent: "阿根廷", dateLabel: "13 天前", venue: "主场", status: "finished", outcome: "D", score: "2 - 2", note: "边中切换速度很快。" }),
      fixture({ id: "jpn-r4", competition: "世预赛", opponent: "澳大利亚", dateLabel: "18 天前", venue: "客场", status: "finished", outcome: "W", score: "1 - 0", note: "中后场回收与提速衔接很好。" }),
      fixture({ id: "jpn-r5", competition: "国际比赛日", opponent: "墨西哥", dateLabel: "24 天前", venue: "中立场", status: "finished", outcome: "W", score: "2 - 0", note: "高位压迫成功率很高。" })
    ],
    nextFixture: fixture({ id: "jpn-n1", competition: "国际比赛日", opponent: "澳大利亚", dateLabel: "04-02 18:35", venue: "东京", status: "scheduled", note: "预计会继续保持快速传导和高位反抢。" }),
    lineup: createLineup("4-2-3-1", "最近一场首发 vs 西班牙", [
      { y: 86, players: [[1, "铃木彩艳"]] },
      { y: 68, players: [[3, "谷口彰悟"], [4, "板仓滉"], [22, "富安健洋"], [16, "中山雄太"]] },
      { y: 56, players: [[6, "远藤航"], [17, "田中碧"]] },
      { y: 40, players: [[14, "伊东纯也"], [8, "镰田大地"], [20, "久保建英"]] },
      { y: 23, players: [[9, "上田绮世"]] }
    ])
  },
  usa_nt: {
    coach: "毛里西奥·波切蒂诺",
    coachTitle: "主教练",
    honors: ["中北美国联冠军 3 次", "金杯赛冠军 7 次", "世界杯季军 1 次"],
    recentFixtures: [
      fixture({ id: "usa-r1", competition: "国际比赛日", opponent: "摩洛哥", dateLabel: "4 天前", venue: "中立场", status: "finished", outcome: "L", score: "0 - 1", note: "边路推进有速度，但中场衔接一般。" }),
      fixture({ id: "usa-r2", competition: "中北美联赛", opponent: "墨西哥", dateLabel: "9 天前", venue: "主场", status: "finished", outcome: "W", score: "2 - 1", note: "高位压迫和落位都执行得不错。" }),
      fixture({ id: "usa-r3", competition: "国际比赛日", opponent: "巴西", dateLabel: "14 天前", venue: "中立场", status: "finished", outcome: "L", score: "1 - 2", note: "中路保护压力偏大。" }),
      fixture({ id: "usa-r4", competition: "中北美联赛", opponent: "加拿大", dateLabel: "19 天前", venue: "客场", status: "finished", outcome: "W", score: "1 - 0", note: "回撤后的反击很坚决。" }),
      fixture({ id: "usa-r5", competition: "国际比赛日", opponent: "日本", dateLabel: "24 天前", venue: "主场", status: "finished", outcome: "D", score: "1 - 1", note: "边路推进打开了不少空间。" })
    ],
    nextFixture: fixture({ id: "usa-n1", competition: "国际比赛日", opponent: "哥伦比亚", dateLabel: "04-02 09:00", venue: "纽约", status: "scheduled", note: "预计比赛会更多依赖两翼提速。" }),
    lineup: createLineup("4-3-3", "最近一场首发 vs 摩洛哥", [
      { y: 86, players: [[1, "特纳"]] },
      { y: 68, players: [[2, "德斯特"], [4, "里姆"], [13, "理查兹"], [5, "罗宾逊"]] },
      { y: 50, players: [[6, "麦肯尼"], [8, "穆萨"], [10, "阿伦森"]] },
      { y: 26, players: [[11, "普利西奇"], [9, "巴洛贡"], [7, "维阿"]] }
    ])
  },
  chn_nt: {
    coach: "邵佳一",
    coachTitle: "主教练",
    honors: ["东亚足球锦标赛冠军 2 次"],
    recentFixtures: [
      fixture({ id: "chn-r1", competition: "东亚足球锦标赛", opponent: "中国香港", dateLabel: "2025-07-15 15:00", venue: "主场", status: "finished", outcome: "W", score: "1 - 0", note: "比赛节奏控制得比较稳，防线在领先后保持了较高专注度。" }),
      fixture({ id: "chn-r2", competition: "国际热身赛", opponent: "阿拉伯猎鹰", dateLabel: "2026-01-20 21:00", venue: "客场", status: "finished", outcome: "W", score: "2 - 0", note: "前场转换效率不错，第二落点保护也更完整。" }),
      fixture({ id: "chn-r3", competition: "国际热身赛", opponent: "莫斯科斯巴达", dateLabel: "2026-01-23 21:00", venue: "主场", status: "finished", outcome: "D", score: "2 - 2", note: "中前场有连续推进亮点，但防守转换还有提升空间。" }),
      fixture({ id: "chn-r4", competition: "国际热身赛", opponent: "乌兹别克斯坦", dateLabel: "2026-01-26 20:30", venue: "客场", status: "finished", outcome: "D", score: "2 - 2", note: "面对高强度身体对抗时，双后腰的覆盖范围发挥了作用。" }),
      fixture({ id: "chn-r5", competition: "国际热身赛", opponent: "库拉索", dateLabel: "2026-03-27 14:00", venue: "主场", status: "finished", outcome: "W", score: "2 - 0", note: "边路推进和前场反抢制造了足够多的压制效果。" })
    ],
    nextFixture: fixture({ id: "chn-n1", competition: "国际热身赛", opponent: "喀麦隆", dateLabel: "2026-03-31 14:00", venue: "中立场", status: "scheduled", note: "预计继续以 4-2-3-1 为基础，强调双后腰保护与边路提速。" }),
    lineup: createLineup("4-2-3-1", "最近一场首发 vs 库拉索", [
      { y: 86, players: [[1, "颜骏凌"]] },
      { y: 68, players: [[23, "杨希"], [5, "朱辰杰"], [18, "刘浩帆"], [19, "刘洋"]] },
      { y: 56, players: [[6, "王上源"], [26, "徐彬"]] },
      { y: 40, players: [[7, "谢文能"], [10, "韦世豪"], [20, "王玉栋"]] },
      { y: 23, players: [[9, "张玉宁"]] }
    ])
  },
  ksa_nt: {
    coach: "罗伯托·曼奇尼",
    coachTitle: "主教练",
    honors: ["亚洲杯冠军 3 次", "海湾杯冠军 3 次", "世界杯 16 强 1 次"],
    recentFixtures: [
      fixture({ id: "ksa-r1", competition: "国际比赛日", opponent: "巴西", dateLabel: "3 天前", venue: "主场", status: "finished", outcome: "L", score: "1 - 2", note: "中段拦截做得不错，但终结效率偏低。" }),
      fixture({ id: "ksa-r2", competition: "世预赛", opponent: "韩国", dateLabel: "8 天前", venue: "客场", status: "finished", outcome: "D", score: "1 - 1", note: "防线落位比较整齐。" }),
      fixture({ id: "ksa-r3", competition: "国际比赛日", opponent: "日本", dateLabel: "13 天前", venue: "中立场", status: "finished", outcome: "L", score: "0 - 2", note: "边路速度没有完全打出来。" }),
      fixture({ id: "ksa-r4", competition: "世预赛", opponent: "伊朗", dateLabel: "18 天前", venue: "主场", status: "finished", outcome: "W", score: "2 - 1", note: "反击效率不错，防守层次也较完整。" }),
      fixture({ id: "ksa-r5", competition: "国际比赛日", opponent: "澳大利亚", dateLabel: "23 天前", venue: "客场", status: "finished", outcome: "D", score: "0 - 0", note: "整体节奏较慢，更偏防守战。" })
    ],
    nextFixture: fixture({ id: "ksa-n1", competition: "跨洲热身赛", opponent: "巴西", dateLabel: "进行中", venue: "利雅得", status: "live", score: "1 - 2", minute: 66, note: "当前处于追分阶段，边路起球和远射都在增加。" }),
    lineup: createLineup("4-3-3", "最近一场首发 vs 巴西", [
      { y: 86, players: [[1, "奥瓦伊斯"]] },
      { y: 68, players: [[2, "阿卜杜勒哈米德"], [4, "坦巴克蒂"], [5, "布莱希"], [13, "沙赫拉尼"]] },
      { y: 50, players: [[8, "卡努"], [16, "纳赛尔"], [18, "马尔基"]] },
      { y: 26, players: [[7, "萨勒姆"], [9, "谢赫里"], [10, "达瓦萨里"]] }
    ])
  }
};
