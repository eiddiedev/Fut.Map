import type { GlobeHotNationalTeamConfig, LeagueCatalogEntry } from "@/lib/football/types";

export const HOT_GLOBE_NATIONAL_TEAMS: GlobeHotNationalTeamConfig[] = [
  { id: "eng_nt", country: "England", label: "英格兰", showInGlobeOverview: true, allowFlyline: true, visibleAtOrBelowDistance: 14 },
  { id: "sco_nt", country: "Scotland", label: "苏格兰", showInGlobeOverview: false, allowFlyline: false, visibleAtOrBelowDistance: 5.05 },
  { id: "wal_nt", country: "Wales", label: "威尔士", showInGlobeOverview: false, allowFlyline: false, visibleAtOrBelowDistance: 5.05 },
  { id: "nir_nt", country: "Northern Ireland", label: "北爱尔兰", showInGlobeOverview: false, allowFlyline: false, visibleAtOrBelowDistance: 5.05 },
  { id: "fra_nt", country: "France", label: "法国", showInGlobeOverview: true, allowFlyline: true, visibleAtOrBelowDistance: 14 },
  { id: "esp_nt", country: "Spain", label: "西班牙", showInGlobeOverview: true, allowFlyline: true, visibleAtOrBelowDistance: 14 },
  { id: "ger_nt", country: "Germany", label: "德国", showInGlobeOverview: true, allowFlyline: true, visibleAtOrBelowDistance: 14 },
  { id: "ita_nt", country: "Italy", label: "意大利", showInGlobeOverview: true, allowFlyline: true, visibleAtOrBelowDistance: 14 },
  { id: "por_nt", country: "Portugal", label: "葡萄牙", showInGlobeOverview: true, allowFlyline: true, visibleAtOrBelowDistance: 14 },
  { id: "ned_nt", country: "Netherlands", label: "荷兰", showInGlobeOverview: true, allowFlyline: true, visibleAtOrBelowDistance: 14 },
  { id: "cro_nt", country: "Croatia", label: "克罗地亚", showInGlobeOverview: true, allowFlyline: true, visibleAtOrBelowDistance: 14 },
  { id: "bra_nt", country: "Brazil", label: "巴西", showInGlobeOverview: true, allowFlyline: true, visibleAtOrBelowDistance: 14 },
  { id: "arg_nt", country: "Argentina", label: "阿根廷", showInGlobeOverview: true, allowFlyline: true, visibleAtOrBelowDistance: 14 },
  { id: "uru_nt", country: "Uruguay", label: "乌拉圭", showInGlobeOverview: true, allowFlyline: true, visibleAtOrBelowDistance: 14 },
  { id: "col_nt", country: "Colombia", label: "哥伦比亚", showInGlobeOverview: true, allowFlyline: true, visibleAtOrBelowDistance: 14 },
  { id: "mar_nt", country: "Morocco", label: "摩洛哥", showInGlobeOverview: true, allowFlyline: true, visibleAtOrBelowDistance: 14 },
  { id: "jpn_nt", country: "Japan", label: "日本", showInGlobeOverview: true, allowFlyline: true, visibleAtOrBelowDistance: 14 },
  { id: "usa_nt", country: "United States", label: "美国", showInGlobeOverview: true, allowFlyline: true, visibleAtOrBelowDistance: 14 },
  { id: "mex_nt", country: "Mexico", label: "墨西哥", showInGlobeOverview: true, allowFlyline: true, visibleAtOrBelowDistance: 14 },
  { id: "ksa_nt", country: "Saudi Arabia", label: "沙特", showInGlobeOverview: true, allowFlyline: true, visibleAtOrBelowDistance: 14 },
  { id: "aus_nt", country: "Australia", label: "澳大利亚", showInGlobeOverview: true, allowFlyline: true, visibleAtOrBelowDistance: 14 },
  { id: "chn_nt", country: "China", label: "中国", showInGlobeOverview: true, allowFlyline: true, visibleAtOrBelowDistance: 14 }
];

export const DEFAULT_NATIONAL_VISIBLE_DISTANCE = 8.1;

export const SECONDARY_LEAGUE_COUNTRIES = ["England", "Spain", "Germany", "Italy", "France", "China"];

// Current free-tier API access exposes Bundesliga team identities through season 2024.
export const BUNDESLIGA_BOOTSTRAP_CATALOG: LeagueCatalogEntry[] = [
  { country: "Germany", tier: 1, leagueId: 78, leagueName: "Bundesliga", season: 2024 }
];

// Current free-tier API access exposes these priority league team identities through season 2024.
export const PRIORITY_BOOTSTRAP_CATALOG: LeagueCatalogEntry[] = [
  { country: "Germany", tier: 1, leagueId: 78, leagueName: "Bundesliga", season: 2024 },
  { country: "Germany", tier: 2, leagueId: 79, leagueName: "2. Bundesliga", season: 2024 },
  { country: "England", tier: 1, leagueId: 39, leagueName: "Premier League", season: 2024 },
  { country: "England", tier: 2, leagueId: 40, leagueName: "Championship", season: 2024 },
  { country: "Spain", tier: 1, leagueId: 140, leagueName: "La Liga", season: 2024 },
  { country: "Spain", tier: 2, leagueId: 141, leagueName: "Segunda División", season: 2024 },
  { country: "Italy", tier: 1, leagueId: 135, leagueName: "Serie A", season: 2024 },
  { country: "Italy", tier: 2, leagueId: 136, leagueName: "Serie B", season: 2024 },
  { country: "China", tier: 1, leagueId: 169, leagueName: "Chinese Super League", season: 2024 },
  { country: "China", tier: 2, leagueId: 170, leagueName: "China League One", season: 2024 },
  { country: "China", tier: 3, leagueId: 929, leagueName: "China League Two", season: 2024 },
  { country: "France", tier: 1, leagueId: 61, leagueName: "Ligue 1", season: 2024 },
  { country: "France", tier: 2, leagueId: 62, leagueName: "Ligue 2", season: 2024 },
  { country: "Portugal", tier: 1, leagueId: 94, leagueName: "Primeira Liga", season: 2024 },
  { country: "Netherlands", tier: 1, leagueId: 88, leagueName: "Eredivisie", season: 2024 },
  { country: "Saudi Arabia", tier: 1, leagueId: 307, leagueName: "Saudi Pro League", season: 2024 },
  { country: "United States", tier: 1, leagueId: 253, leagueName: "MLS", season: 2024 },
  { country: "Japan", tier: 1, leagueId: 98, leagueName: "J1 League", season: 2024 },
  { country: "Brazil", tier: 1, leagueId: 71, leagueName: "Serie A", season: 2024 },
  { country: "Argentina", tier: 1, leagueId: 128, leagueName: "Liga Profesional Argentina", season: 2024 },
  { country: "Belgium", tier: 1, leagueId: 144, leagueName: "Jupiler Pro League", season: 2024 },
  { country: "Turkey", tier: 1, leagueId: 203, leagueName: "Süper Lig", season: 2024 },
  { country: "Mexico", tier: 1, leagueId: 262, leagueName: "Liga MX", season: 2024 },
  { country: "Australia", tier: 1, leagueId: 188, leagueName: "A-League", season: 2024 },
  { country: "Scotland", tier: 1, leagueId: 179, leagueName: "Premiership", season: 2024 },
  { country: "Switzerland", tier: 1, leagueId: 207, leagueName: "Super League", season: 2024 },
  { country: "Austria", tier: 1, leagueId: 218, leagueName: "Bundesliga", season: 2024 },
  { country: "Denmark", tier: 1, leagueId: 119, leagueName: "Superliga", season: 2024 },
  { country: "Norway", tier: 1, leagueId: 103, leagueName: "Eliteserien", season: 2024 },
  { country: "Sweden", tier: 1, leagueId: 113, leagueName: "Allsvenskan", season: 2024 },
  { country: "Greece", tier: 1, leagueId: 197, leagueName: "Super League 1", season: 2024 },
  { country: "Czech Republic", tier: 1, leagueId: 345, leagueName: "Czech Liga", season: 2024 },
  { country: "Romania", tier: 1, leagueId: 283, leagueName: "Liga I", season: 2024 },
  { country: "Croatia", tier: 1, leagueId: 210, leagueName: "HNL", season: 2024 },
  { country: "Serbia", tier: 1, leagueId: 286, leagueName: "Super Liga", season: 2024 },
  { country: "South Korea", tier: 1, leagueId: 292, leagueName: "K League 1", season: 2024 },
  { country: "Poland", tier: 1, leagueId: 106, leagueName: "Ekstraklasa", season: 2024 }
];

export const FALLBACK_LEAGUE_CATALOG: LeagueCatalogEntry[] = [
  { country: "England", tier: 1, leagueName: "Premier League" },
  { country: "England", tier: 2, leagueName: "EFL Championship" },
  { country: "Spain", tier: 1, leagueName: "La Liga" },
  { country: "Spain", tier: 2, leagueName: "La Liga 2" },
  { country: "Germany", tier: 1, leagueName: "Bundesliga" },
  { country: "Germany", tier: 2, leagueName: "2. Bundesliga" },
  { country: "Italy", tier: 1, leagueName: "Serie A" },
  { country: "Italy", tier: 2, leagueName: "Serie B" },
  { country: "France", tier: 1, leagueName: "Ligue 1" },
  { country: "France", tier: 2, leagueName: "Ligue 2" },
  { country: "China", tier: 1, leagueName: "Chinese Super League" },
  { country: "China", tier: 2, leagueName: "China League One" },
  { country: "Brazil", tier: 1, leagueName: "Brasileirao Serie A" },
  { country: "Argentina", tier: 1, leagueName: "Liga Profesional" },
  { country: "Portugal", tier: 1, leagueName: "Primeira Liga" },
  { country: "Netherlands", tier: 1, leagueName: "Eredivisie" },
  { country: "Belgium", tier: 1, leagueName: "Belgian Pro League" },
  { country: "Turkey", tier: 1, leagueName: "Super Lig" },
  { country: "Saudi Arabia", tier: 1, leagueName: "Saudi Pro League" },
  { country: "Japan", tier: 1, leagueName: "J1 League" },
  { country: "United States", tier: 1, leagueName: "MLS" },
  { country: "Mexico", tier: 1, leagueName: "Liga MX" },
  { country: "Australia", tier: 1, leagueName: "A-League Men" }
];
