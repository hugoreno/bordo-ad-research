import { NextResponse } from "next/server";
import { getSnapshotOrSample } from "@/lib/data";

export async function GET() {
  const snapshot = await getSnapshotOrSample();
  return NextResponse.json(snapshot);
}
