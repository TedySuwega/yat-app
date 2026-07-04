import type { Destination, ItineraryItem, OpenTrip } from "@/app/data/destinations";

export interface DbDestination {
  id: string;
  title: string;
  tagline: string | null;
  description: string | null;
  image_url: string | null;
  rating: number;
  reviews_count: number;
  price: number;
  tags: string | null;
  vibe: string;
  vibe_icon: string | null;
  what_to_bring: string | null;
  highlights: string | null;
  itinerary: string | null;
  created_at: string;
}

export interface DbOpenTrip {
  id: string;
  destination_id: string;
  start_date: string;
  end_date: string;
  year: string;
  price: number;
  total_slots: number;
  booked_slots: number;
  is_active: number;
  created_at: string;
}

export interface DbBooking {
  id: string;
  destination_id: string;
  trip_id: string;
  full_name: string;
  email: string;
  whatsapp: string;
  seats: number;
  vibe: string | null;
  total_price: number;
  status: string;
  payment_ref: string | null;
  booked_at: string;
}

export interface DbBookingEnriched extends DbBooking {
  destination_title: string;
  start_date: string;
  end_date: string;
  year: string;
}

function parseJson<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function mapOpenTrip(row: DbOpenTrip): OpenTrip {
  return {
    id: row.id,
    startDate: row.start_date,
    endDate: row.end_date,
    year: row.year,
    price: row.price,
    totalSlots: row.total_slots,
    bookedSlots: row.booked_slots,
  };
}

export function mapDestination(row: DbDestination, openTrips: OpenTrip[] = []): Destination {
  return {
    id: row.id,
    title: row.title,
    tagline: row.tagline ?? "",
    description: row.description ?? "",
    image: row.image_url ?? "",
    rating: row.rating,
    reviewsCount: row.reviews_count,
    price: row.price,
    tags: parseJson<string[]>(row.tags, []),
    vibe: row.vibe as Destination["vibe"],
    vibeIcon: row.vibe_icon ?? "",
    whatToBring: parseJson<string[]>(row.what_to_bring, []),
    highlights: parseJson<string[]>(row.highlights, []),
    itinerary: parseJson<ItineraryItem[]>(row.itinerary, []),
    openTrips,
  };
}

export function mapBooking(row: DbBookingEnriched) {
  return {
    id: row.id,
    destinationId: row.destination_id,
    destinationTitle: row.destination_title,
    tripId: row.trip_id,
    tripDates: `${row.start_date} - ${row.end_date}, ${row.year}`,
    fullName: row.full_name,
    email: row.email,
    whatsapp: row.whatsapp,
    seats: row.seats,
    vibe: row.vibe ?? "",
    totalPrice: row.total_price,
    bookedAt: row.booked_at,
    status: row.status,
  };
}
