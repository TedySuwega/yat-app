import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import {
  type DbDestination,
  type DbOpenTrip,
  mapDestination,
  mapOpenTrip,
} from "@/lib/mappers";
import { getFallbackDestinationById } from "@/lib/dummy-data";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  try {
    const db = getDb();

    const destination = db
      .prepare("SELECT * FROM destinations WHERE id = ?")
      .get(id) as DbDestination | undefined;

    if (!destination) {
      const fallback = getFallbackDestinationById(id);
      if (fallback) {
        return NextResponse.json(fallback);
      }
      return NextResponse.json({ error: "Destination not found" }, { status: 404 });
    }

    const trips = db
      .prepare(
        "SELECT * FROM open_trips WHERE destination_id = ? AND is_active = 1 ORDER BY start_date"
      )
      .all(id) as DbOpenTrip[];

    return NextResponse.json(mapDestination(destination, trips.map(mapOpenTrip)));
  } catch (error) {
    console.warn(`[API /api/destinations/${id}] DB notice, using fallback:`, error);
    const fallback = getFallbackDestinationById(id);
    if (fallback) {
      return NextResponse.json(fallback);
    }
    return NextResponse.json({ error: "Destination not found" }, { status: 404 });
  }
}
