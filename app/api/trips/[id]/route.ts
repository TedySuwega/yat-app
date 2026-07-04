import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import {
  type DbDestination,
  type DbOpenTrip,
  mapDestination,
  mapOpenTrip,
} from "@/lib/mappers";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const db = getDb();

  const trip = db
    .prepare("SELECT * FROM open_trips WHERE id = ?")
    .get(id) as DbOpenTrip | undefined;

  if (!trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  const destination = db
    .prepare("SELECT * FROM destinations WHERE id = ?")
    .get(trip.destination_id) as DbDestination;

  return NextResponse.json({
    ...mapOpenTrip(trip),
    destination: mapDestination(destination, []),
  });
}
