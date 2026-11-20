import { NextResponse, type NextRequest } from "next/server";
import { getDashboardData, isRangeKey } from "@/lib/data";

export function GET(request: NextRequest) {
  const requested = request.nextUrl.searchParams.get("range") ?? "30d";
  const range = isRangeKey(requested) ? requested : "30d";

  return NextResponse.json(getDashboardData(range), {
    headers: { "Cache-Control": "public, max-age=30" },
  });
}
