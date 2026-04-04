import { NextRequest, NextResponse } from "next/server";
import type { LeagueCatalogEntry } from "@/lib/football/types";
import { importLeagueCatalogIntoSnapshot } from "@/lib/server/football-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ImportRequestBody = {
  leagues?: LeagueCatalogEntry[];
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ImportRequestBody;
    const leagues = Array.isArray(body.leagues) ? body.leagues : [];
    const snapshot = await importLeagueCatalogIntoSnapshot(leagues);

    return NextResponse.json({
      ok: true,
      count: leagues.length,
      snapshot
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "增量导入失败"
      },
      { status: 500 }
    );
  }
}
