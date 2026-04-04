import { NextResponse } from "next/server";
import { ensureFootballSnapshot } from "@/lib/server/football-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const snapshot = await ensureFootballSnapshot();

  return NextResponse.json(snapshot);
}
