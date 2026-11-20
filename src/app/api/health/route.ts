import { NextResponse } from "next/server";
import { pingDatabase } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const database = await pingDatabase();

  return NextResponse.json({
    status: "ok",
    service: "pulse-analytics",
    time: new Date().toISOString(),
    database,
  });
}
