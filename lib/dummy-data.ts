import { destinations as staticDestinations, type Destination, type OpenTrip } from "@/app/data/destinations";

export interface MockBooking {
  id: string;
  destinationId: string;
  destinationTitle: string;
  tripId: string;
  tripDates: string;
  startDate: string;
  endDate: string;
  year: string;
  fullName: string;
  email: string;
  whatsapp: string;
  seats: number;
  vibe: string;
  totalPrice: number;
  status: "confirmed" | "pinged" | "cancelled";
  paymentRef: string | null;
  bookedAt: string;
}

export const INITIAL_DUMMY_BOOKINGS: MockBooking[] = [
  {
    id: "BK-BALI-771",
    destinationId: "bali-chill",
    destinationTitle: "Bali Chill Vibes",
    tripId: "bali-oct-10",
    tripDates: "10 Oct - 14 Oct, 2026",
    startDate: "10 Oct",
    endDate: "14 Oct",
    year: "2026",
    fullName: "Raka Pratama",
    email: "raka.pratama@gmail.com",
    whatsapp: "+6281234567890",
    seats: 2,
    vibe: "Chill Explorer",
    totalPrice: 698,
    status: "confirmed",
    paymentRef: "PAY-BALI-001",
    bookedAt: "2026-10-02T14:20:00.000Z",
  },
  {
    id: "BK-KOMO-882",
    destinationId: "labuan-bajo",
    destinationTitle: "Komodo Liveaboard Adventure",
    tripId: "bajo-oct-18",
    tripDates: "18 Oct - 22 Oct, 2026",
    startDate: "18 Oct",
    endDate: "22 Oct",
    year: "2026",
    fullName: "Sarah Wijaya",
    email: "sarah.wijaya@outlook.com",
    whatsapp: "+6281987654321",
    seats: 1,
    vibe: "Adrenaline Junkie",
    totalPrice: 599,
    status: "pinged",
    paymentRef: "PAY-KOMO-002",
    bookedAt: "2026-10-03T09:45:00.000Z",
  },
  {
    id: "BK-BROMO-993",
    destinationId: "bromo-sunrise",
    destinationTitle: "Bromo Milky Way & Sunrise",
    tripId: "bromo-nov-02",
    tripDates: "02 Nov - 04 Nov, 2026",
    startDate: "02 Nov",
    endDate: "04 Nov",
    year: "2026",
    fullName: "Dimas Aditya",
    email: "dimas.aditya@yahoo.com",
    whatsapp: "+6285678901234",
    seats: 2,
    vibe: "Culture Nomad",
    totalPrice: 398,
    status: "confirmed",
    paymentRef: "PAY-BROMO-003",
    bookedAt: "2026-10-04T18:10:00.000Z",
  },
  {
    id: "BK-MAND-554",
    destinationId: "motogp-mandalika",
    destinationTitle: "MotoGP Mandalika Speed Week",
    tripId: "mandalika-oct-17",
    tripDates: "17 Oct - 20 Oct, 2026",
    startDate: "17 Oct",
    endDate: "20 Oct",
    year: "2026",
    fullName: "Jessica Tan",
    email: "jessica.tan@gmail.com",
    whatsapp: "+6281311223344",
    seats: 1,
    vibe: "Sports Fan",
    totalPrice: 429,
    status: "pinged",
    paymentRef: "PAY-MAND-004",
    bookedAt: "2026-10-05T11:30:00.000Z",
  },
];

// In-memory state for fallback (e.g. serverless environments without persistent SQLite)
let inMemoryBookings: MockBooking[] = [...INITIAL_DUMMY_BOOKINGS];
const inMemoryDestinations: Destination[] = JSON.parse(JSON.stringify(staticDestinations));

export function getFallbackDestinations(vibe?: string | null): Destination[] {
  if (!vibe || vibe === "All") {
    return inMemoryDestinations;
  }
  return inMemoryDestinations.filter((d) => d.vibe.toLowerCase() === vibe.toLowerCase());
}

export function getFallbackDestinationById(id: string): Destination | null {
  return inMemoryDestinations.find((d) => d.id === id) || null;
}

export function getAllFallbackTrips(): (OpenTrip & { destinationId: string; destinationTitle: string })[] {
  const result: (OpenTrip & { destinationId: string; destinationTitle: string })[] = [];
  for (const d of inMemoryDestinations) {
    for (const t of d.openTrips) {
      result.push({
        ...t,
        destinationId: d.id,
        destinationTitle: d.title,
      });
    }
  }
  return result;
}

export function getFallbackTripById(tripId: string): (OpenTrip & { destinationId: string; destinationTitle: string }) | null {
  for (const d of inMemoryDestinations) {
    const found = d.openTrips.find((t) => t.id === tripId);
    if (found) {
      return {
        ...found,
        destinationId: d.id,
        destinationTitle: d.title,
      };
    }
  }
  return null;
}

export function getFallbackBookings(): MockBooking[] {
  return inMemoryBookings;
}

export function getFallbackBookingById(id: string): MockBooking | null {
  return inMemoryBookings.find((b) => b.id === id) || null;
}

export function addFallbackBooking(booking: MockBooking): MockBooking {
  inMemoryBookings = [booking, ...inMemoryBookings];
  // Deduct slots from in-memory trips
  for (const d of inMemoryDestinations) {
    const t = d.openTrips.find((trip) => trip.id === booking.tripId);
    if (t) {
      t.bookedSlots += booking.seats;
    }
  }
  return booking;
}

export function updateFallbackBookingStatus(id: string, status: "confirmed" | "pinged" | "cancelled"): MockBooking | null {
  const idx = inMemoryBookings.findIndex((b) => b.id === id);
  if (idx === -1) return null;
  inMemoryBookings[idx] = { ...inMemoryBookings[idx], status };
  return inMemoryBookings[idx];
}

export function deleteFallbackBooking(id: string): boolean {
  const initialLen = inMemoryBookings.length;
  inMemoryBookings = inMemoryBookings.filter((b) => b.id !== id);
  return inMemoryBookings.length < initialLen;
}
