import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import {
  type DbDestination,
  type DbOpenTrip,
  mapDestination,
  mapOpenTrip,
} from "@/lib/mappers";

export async function GET(request: NextRequest) {
  const db = getDb();
  const vibe = request.nextUrl.searchParams.get("vibe");

  let destinations: DbDestination[];
  if (vibe) {
    destinations = db
      .prepare("SELECT * FROM destinations WHERE vibe = ? ORDER BY title")
      .all(vibe) as DbDestination[];
  } else {
    destinations = db
      .prepare("SELECT * FROM destinations ORDER BY title")
      .all() as DbDestination[];
  }

  const tripsStmt = db.prepare(
    "SELECT * FROM open_trips WHERE destination_id = ? AND is_active = 1 ORDER BY start_date"
  );

  const result = destinations.map((row) => {
    const trips = tripsStmt.all(row.id) as DbOpenTrip[];
    return mapDestination(row, trips.map(mapOpenTrip));
  });

  return NextResponse.json(result);
}
