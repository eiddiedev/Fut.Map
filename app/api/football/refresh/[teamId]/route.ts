import { NextResponse } from "next/server";
import { refreshTeamInSnapshot } from "@/lib/server/football-data";

type RouteContext = {
  params: {
    teamId: string;
  };
};

export async function POST(_request: Request, { params }: RouteContext) {
  const result = await refreshTeamInSnapshot(params.teamId);

  return NextResponse.json(result, {
    status: result.ok ? 200 : 400
  });
}
