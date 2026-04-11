export type Locale = "zh" | "en";

export const DEFAULT_LOCALE: Locale = "zh";
export const LOCALE_STORAGE_KEY = "fut-map-locale";

export function normalizeLocale(value: string | null | undefined): Locale {
  return value === "en" ? "en" : "zh";
}

export const INTRO_COPY = {
  zh: {
    badge: "全球足球信号地图",
    cta: "开始探索"
  },
  en: {
    badge: "GLOBAL FOOTBALL SIGNAL ATLAS",
    cta: "Start Exploring"
  }
} as const;

export const HOME_COPY = {
  zh: {
    languageLabel: "语言",
    modeTitle: "模式说明",
    flatDescription: "二维模式查看全球俱乐部分布与城市层级。",
    globeDescription: "三维模式查看全球国家队视角与国家级联动飞线。",
    showFlatMap: "切换二维世界地图",
    showGlobe: "切回三维地球",
    refreshing: "正在同步该队伍的最新信息...",
    dataNotice: "由于免费 API 限制，此站 demo 版本暂展示 2024 年的联赛数据"
  },
  en: {
    languageLabel: "Language",
    modeTitle: "Mode",
    flatDescription: "2D mode shows global club distribution and city-level locations.",
    globeDescription: "3D mode shows national-team storytelling and linked flylines.",
    showFlatMap: "Open 2D World Map",
    showGlobe: "Back To 3D Globe",
    refreshing: "Syncing the latest data for this team...",
    dataNotice: "Due to free API limits, this demo currently shows 2024 league data."
  }
} as const;

export const MAP_CONTROL_COPY = {
  zh: {
    flylinesOn: "飞线已开",
    flylinesOff: "飞线已关",
    autoRotateOn: "自动旋转已开",
    autoRotateOff: "自动旋转已关",
    resetView: "重置视角",
    flylineDisclaimer: "飞线为模拟效果",
    renderError:
      "当前环境没有拿到 WebGL 渲染上下文，3D 地球无法启动。请在支持硬件加速的浏览器里打开页面。",
    rendererLabel: "渲染器"
  },
  en: {
    flylinesOn: "Flylines On",
    flylinesOff: "Flylines Off",
    autoRotateOn: "Auto-Rotate On",
    autoRotateOff: "Auto-Rotate Off",
    resetView: "Reset View",
    flylineDisclaimer: "Flylines are simulated",
    renderError:
      "No WebGL rendering context is available in this environment, so the 3D globe cannot start. Open the page in a browser with hardware acceleration enabled.",
    rendererLabel: "Renderer"
  }
} as const;

export const WORLD_MAP_COPY = {
  zh: {
    initError: "世界地图初始化失败",
    labelError: "世界地图标签加载失败",
    loadError: "世界地图加载失败，请检查网络或渲染环境。",
    rendererLabel: "渲染器"
  },
  en: {
    initError: "World map initialization failed",
    labelError: "World map label loading failed",
    loadError: "The world map could not be loaded. Check the network or rendering environment.",
    rendererLabel: "Renderer"
  }
} as const;

export const SIDEBAR_COPY = {
  zh: {
    cachedHint: "当前展示的是缓存资料，点选队徽后会自动尝试同步最新信息。",
    fallbackHint:
      "当前展示的是缓存/历史档案；若球队已更名、停运或暂不在接口覆盖内，实时资料可能不可用。",
    homePrefix: "主场：",
    close: "关闭",
    home: "主场",
    city: "城市",
    coach: "主教练",
    recentForm: "近五场",
    currentMatch: "当前比赛",
    nextMatch: "下一场比赛",
    liveAgainst: "正在对阵",
    latestLineup: "最近一场阵容",
    recentFixtures: "近五场赛况",
    noRecentFixtures: "暂无近五场缓存，系统会在点选该队后自动尝试同步最新赛况。",
    honors: "历史荣誉",
    honorsPending: "荣誉信息待同步",
    noLineup:
      "当前队伍还没有缓存阵容数据，系统会在点选该队后自动尝试同步最近一场阵容。",
    versus: "vs",
    form: {
      W: "胜",
      D: "平",
      L: "负"
    }
  },
  en: {
    cachedHint: "Cached data is currently shown. Selecting the badge will try to sync the latest information.",
    fallbackHint:
      "Cached or historical data is currently shown. If the team was renamed, dissolved, or is outside the provider coverage, live data may be unavailable.",
    homePrefix: "Home: ",
    close: "Close",
    home: "Home",
    city: "City",
    coach: "Coach",
    recentForm: "Last 5",
    currentMatch: "Live Match",
    nextMatch: "Next Match",
    liveAgainst: "Live vs",
    latestLineup: "Latest Lineup",
    recentFixtures: "Recent Fixtures",
    noRecentFixtures:
      "No recent-fixture cache is available yet. The app will try to sync the latest results after you select this team.",
    honors: "Honors",
    honorsPending: "Honors pending sync",
    noLineup:
      "No lineup cache is available for this team yet. The app will try to sync the latest lineup after you select it.",
    versus: "vs",
    form: {
      W: "W",
      D: "D",
      L: "L"
    }
  }
} as const;

const STATIC_TEXT_TRANSLATIONS: Record<string, string> = {
  "待同步": "Pending sync",
  "暂无数据": "No data yet",
  "阵容待同步": "Lineup pending sync",
  "最近一场阵容暂无数据": "No recent lineup data",
  "最近一场首发待同步": "Latest starting lineup pending sync",
  "最近一场首发": "Latest starting lineup",
  "荣誉信息待同步": "Honors pending sync",
  "当前国家队暂无缓存赛程，接入 API 后会在这里显示下一场比赛或实时比分。":
    "No national-team schedule is cached yet. Once the API is connected, the next match or live score will appear here.",
  "当前俱乐部暂无缓存赛程，接入 API 后会在这里显示下一场比赛或实时比分。":
    "No club schedule is cached yet. Once the API is connected, the next match or live score will appear here.",
  "真实数据接入后会显示下一场比赛时间、实时比分和最近阵容。":
    "After real data is connected, this area will show the next kick-off, live score, and latest lineup.",
  "API 当前没有返回可用赛程数据。": "The API did not return usable fixture data.",
  "未找到对应队伍": "The requested team could not be found."
};

const ARCHIVE_LABEL_TRANSLATIONS: Record<string, string> = {
  "最近一次同步结果": "the latest synced snapshot",
  "缓存/历史档案": "cached or historical data"
};

export function translateFootballText(locale: Locale, text: string) {
  if (locale === "zh") {
    return text;
  }

  return STATIC_TEXT_TRANSLATIONS[text] ?? text;
}

export function translateRefreshMessage(locale: Locale, message: string | null) {
  if (!message || locale === "zh") {
    return message;
  }

  if (STATIC_TEXT_TRANSLATIONS[message]) {
    return STATIC_TEXT_TRANSLATIONS[message];
  }

  const refreshedMatch = message.match(/^已刷新 (.+) 的 (\d{4}) 赛季数据$/);

  if (refreshedMatch) {
    return `Synced ${refreshedMatch[1]} for the ${refreshedMatch[2]} season.`;
  }

  const staticOnlyMatch = message.match(
    /^已同步 (.+) 的静态资料，但当前 API 没有返回可用的 (\d{4}) 赛季比赛信息$/
  );

  if (staticOnlyMatch) {
    return `Synced static data for ${staticOnlyMatch[1]}, but the API did not return usable ${staticOnlyMatch[2]} season fixture data yet.`;
  }

  const quotaMatch = message.match(/^今日免费 API 配额已用尽，当前先展示 (.+) 的(.+)。$/);

  if (quotaMatch) {
    const archiveLabel = ARCHIVE_LABEL_TRANSLATIONS[quotaMatch[2]] ?? quotaMatch[2];

    return `Today's free API quota is exhausted. Showing ${archiveLabel} for ${quotaMatch[1]} for now.`;
  }

  const noLiveMatch = message.match(
    /^(.+) 当前暂无可用的实时资料，已展示(.+)。这通常是因为球队已更名、停运，或暂不在当前接口覆盖范围内。$/
  );

  if (noLiveMatch) {
    const archiveLabel = ARCHIVE_LABEL_TRANSLATIONS[noLiveMatch[2]] ?? noLiveMatch[2];

    return `${noLiveMatch[1]} does not have live data available right now. Showing ${archiveLabel}. This usually means the club was renamed, dissolved, or is outside the current provider coverage.`;
  }

  const apiErrorMatch = message.match(/^暂时无法同步 (.+) 的实时资料，当前先展示(.+)。$/);

  if (apiErrorMatch) {
    const archiveLabel = ARCHIVE_LABEL_TRANSLATIONS[apiErrorMatch[2]] ?? apiErrorMatch[2];

    return `Live data for ${apiErrorMatch[1]} could not be synced right now. Showing ${archiveLabel} for now.`;
  }

  const requestErrorMatch = message.match(/^实时接口暂时不可用，当前先展示 (.+) 的(.+)。$/);

  if (requestErrorMatch) {
    const archiveLabel = ARCHIVE_LABEL_TRANSLATIONS[requestErrorMatch[2]] ?? requestErrorMatch[2];

    return `The live data endpoint is temporarily unavailable. Showing ${archiveLabel} for ${requestErrorMatch[1]} for now.`;
  }

  const missingKeyMatch = message.match(/^缺少 API_FOOTBALL_KEY，当前先展示 (.+) 的缓存\/历史档案。$/);

  if (missingKeyMatch) {
    return `API_FOOTBALL_KEY is missing. Showing cached or historical data for ${missingKeyMatch[1]} for now.`;
  }

  if (message === "同步失败，已保留当前缓存/历史档案") {
    return "Sync failed. Keeping the current cached or historical data.";
  }

  return message;
}

export function formatRecentFormSummary(locale: Locale, wins: number, draws: number, losses: number) {
  if (locale === "zh") {
    return `${wins}胜 ${draws}平 ${losses}负`;
  }

  return `${wins}W ${draws}D ${losses}L`;
}

export function formatMinuteLabel(locale: Locale, minute: number) {
  if (locale === "zh") {
    return `${minute} 分钟`;
  }

  return `${minute} min`;
}
