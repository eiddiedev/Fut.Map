import { NextResponse } from "next/server";
import { ensureFootballSnapshot } from "@/lib/server/football-data";

export async function GET() {
  const snapshot = await ensureFootballSnapshot();

  return NextResponse.json(snapshot);
}
