import { NextRequest, NextResponse } from "next/server";
import { bootstrapFootballSnapshot } from "@/lib/server/football-data";

export async function POST(request: NextRequest) {
  const modeParam = request.nextUrl.searchParams.get("mode");
  const mode =
    modeParam === "all"
      ? "all"
      : modeParam === "curated"
        ? "curated"
        : modeParam === "priority"
          ? "priority"
          : "bundesliga";

  try {
    const snapshot = await bootstrapFootballSnapshot(mode);

    return NextResponse.json({
      ok: true,
      mode,
      snapshot,
      message:
        mode === "all"
          ? "已按全量模式初始化缓存，包含尽可能多的国家一级联赛与指定二级联赛"
          : mode === "priority"
            ? "已按热门联赛模式初始化缓存，优先同步德甲、其余三大联赛、中超与额外热门联赛的真实队徽与位置数据"
          : mode === "curated"
            ? "已按保守模式初始化缓存，优先同步策划联赛目录"
            : "已按德甲验证模式初始化缓存，仅同步 Bundesliga 的真实队徽与位置数据"
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        mode,
        message: error instanceof Error ? error.message : "初始化缓存失败"
      },
      { status: 500 }
    );
  }
}
