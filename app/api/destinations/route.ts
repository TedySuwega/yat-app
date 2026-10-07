import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import {
  type DbDestination,
  type DbOpenTrip,
  mapDestination,
  mapOpenTrip,
} from "@/lib/mappers";
import { getFallbackDestinations } from "@/lib/dummy-data";

export async function GET(request: NextRequest) {
  const vibe = request.nextUrl.searchParams.get("vibe");

  try {
    const db = getDb();

    let destinations: DbDestination[];
    if (vibe && vibe !== "All") {
      destinations = db
        .prepare("SELECT * FROM destinations WHERE vibe = ? ORDER BY title")
        .all(vibe) as DbDestination[];
    } else {
      destinations = db
        .prepare("SELECT * FROM destinations ORDER BY title")
        .all() as DbDestination[];
    }

    if (!destinations || destinations.length === 0) {
      return NextResponse.json(getFallbackDestinations(vibe));
    }

    const tripsStmt = db.prepare(
      "SELECT * FROM open_trips WHERE destination_id = ? AND is_active = 1 ORDER BY start_date"
    );

    const result = destinations.map((row) => {
      const trips = tripsStmt.all(row.id) as DbOpenTrip[];
      return mapDestination(row, trips.map(mapOpenTrip));
    });

    return NextResponse.json(result);
  } catch (error) {
    console.warn("[API /api/destinations] Database query notice, using fallback data:", error);
    return NextResponse.json(getFallbackDestinations(vibe));
  }
}
