import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import {
  type DbDestination,
  type DbOpenTrip,
  mapDestination,
  mapOpenTrip,
} from "@/lib/mappers";
import { getFallbackTripById, getFallbackDestinationById } from "@/lib/dummy-data";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  try {
    const db = getDb();

    const trip = db
      .prepare("SELECT * FROM open_trips WHERE id = ?")
      .get(id) as DbOpenTrip | undefined;

    if (!trip) {
      const fallbackTrip = getFallbackTripById(id);
      if (fallbackTrip) {
        return NextResponse.json({
          id: fallbackTrip.id,
          startDate: fallbackTrip.startDate,
          endDate: fallbackTrip.endDate,
          year: fallbackTrip.year,
          price: fallbackTrip.price,
          totalSlots: fallbackTrip.totalSlots,
          bookedSlots: fallbackTrip.bookedSlots,
          destination: getFallbackDestinationById(fallbackTrip.destinationId),
        });
      }
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const destination = db
      .prepare("SELECT * FROM destinations WHERE id = ?")
      .get(trip.destination_id) as DbDestination;

    return NextResponse.json({
      ...mapOpenTrip(trip),
      destination: destination ? mapDestination(destination, []) : null,
    });
  } catch (error) {
    console.warn(`[API /api/trips/${id}] DB notice, using fallback:`, error);
    const fallbackTrip = getFallbackTripById(id);
    if (fallbackTrip) {
      return NextResponse.json({
        id: fallbackTrip.id,
        startDate: fallbackTrip.startDate,
        endDate: fallbackTrip.endDate,
        year: fallbackTrip.year,
        price: fallbackTrip.price,
        totalSlots: fallbackTrip.totalSlots,
        bookedSlots: fallbackTrip.bookedSlots,
        destination: getFallbackDestinationById(fallbackTrip.destinationId),
      });
    }
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }
}
