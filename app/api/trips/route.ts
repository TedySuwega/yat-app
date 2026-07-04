import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import {
  type DbDestination,
  type DbOpenTrip,
  mapDestination,
  mapOpenTrip,
} from "@/lib/mappers";

export async function GET() {
  const db = getDb();

  const trips = db
    .prepare(
      "SELECT * FROM open_trips WHERE is_active = 1 ORDER BY start_date"
    )
    .all() as DbOpenTrip[];

  const destStmt = db.prepare("SELECT * FROM destinations WHERE id = ?");

  const result = trips.map((trip) => {
    const destination = destStmt.get(trip.destination_id) as DbDestination;
    return {
      ...mapOpenTrip(trip),
      destination: mapDestination(destination, []),
    };
  });

  return NextResponse.json(result);
}
