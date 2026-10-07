import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { CREATE_TABLES_SQL } from "./schema";
import { destinations } from "@/app/data/destinations";
import { hashPassword } from "./password";
import { INITIAL_DUMMY_BOOKINGS } from "./dummy-data";

// Detect Vercel / AWS Lambda / Serverless runtime
const isServerless = Boolean(
  process.env.VERCEL ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.LAMBDA_TASK_ROOT
);

// In serverless (Vercel), only /tmp is writable
const DB_PATH = isServerless
  ? path.join("/tmp", "yolotrips.db")
  : path.join(process.cwd(), "data", "yolotrips.db");

let dbInstance: Database.Database | null = null;

export function initDbSchemaAndSeeds(db: Database.Database) {
  try {
    // 1. Create tables
    db.exec(CREATE_TABLES_SQL);

    // 2. Check and seed destinations & trips
    const destCountRow = db
      .prepare("SELECT count(*) as count FROM destinations")
      .get() as { count: number } | undefined;

    if (!destCountRow || destCountRow.count === 0) {
      const insertDestination = db.prepare(`
        INSERT OR REPLACE INTO destinations (
          id, title, tagline, description, image_url, rating, reviews_count, price,
          tags, vibe, vibe_icon, what_to_bring, highlights, itinerary
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const insertOpenTrip = db.prepare(`
        INSERT OR REPLACE INTO open_trips (
          id, destination_id, start_date, end_date, year, price, total_slots, booked_slots, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
      `);

      const seedDestinationsTx = db.transaction(() => {
        for (const dest of destinations) {
          insertDestination.run(
            dest.id,
            dest.title,
            dest.tagline,
            dest.description,
            dest.image,
            dest.rating,
            dest.reviewsCount,
            dest.price,
            JSON.stringify(dest.tags),
            dest.vibe,
            dest.vibeIcon,
            JSON.stringify(dest.whatToBring),
            JSON.stringify(dest.highlights),
            JSON.stringify(dest.itinerary)
          );

          for (const trip of dest.openTrips) {
            insertOpenTrip.run(
              trip.id,
              dest.id,
              trip.startDate,
              trip.endDate,
              trip.year,
              trip.price,
              trip.totalSlots,
              trip.bookedSlots
            );
          }
        }
      });

      seedDestinationsTx();
    }

    // 3. Check and seed default admin user
    const adminCountRow = db
      .prepare("SELECT count(*) as count FROM admin_users")
      .get() as { count: number } | undefined;

    if (!adminCountRow || adminCountRow.count === 0) {
      const initialAdminPassword = process.env.ADMIN_INITIAL_PASSWORD || "admin123";
      const insertAdmin = db.prepare(`
        INSERT OR REPLACE INTO admin_users (email, password_hash) VALUES (?, ?)
      `);
      insertAdmin.run("admin@yolotrips.com", hashPassword(initialAdminPassword));
    }

    // 4. Check and seed sample dummy bookings
    const bookingCountRow = db
      .prepare("SELECT count(*) as count FROM bookings")
      .get() as { count: number } | undefined;

    if (!bookingCountRow || bookingCountRow.count === 0) {
      const insertBooking = db.prepare(`
        INSERT OR REPLACE INTO bookings (
          id, destination_id, trip_id, full_name, email, whatsapp, seats, vibe, total_price, status, payment_ref, booked_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const seedBookingsTx = db.transaction(() => {
        for (const b of INITIAL_DUMMY_BOOKINGS) {
          insertBooking.run(
            b.id,
            b.destinationId,
            b.tripId,
            b.fullName,
            b.email,
            b.whatsapp,
            b.seats,
            b.vibe,
            b.totalPrice,
            b.status,
            b.paymentRef,
            b.bookedAt
          );
        }
      });

      seedBookingsTx();
    }
  } catch (err) {
    console.warn("[DB SEED WARN] Database schema initialization notice:", err);
  }
}

export function getDb(): Database.Database {
  if (dbInstance) {
    return dbInstance;
  }

  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const db = new Database(DB_PATH);

  try {
    db.pragma("journal_mode = WAL");
  } catch {
    // In some restricted/tmp environments WAL is not supported, fallback to DELETE
    try {
      db.pragma("journal_mode = DELETE");
    } catch {
      // ignore pragma error
    }
  }

  try {
    db.pragma("foreign_keys = ON");
  } catch {
    // ignore
  }

  initDbSchemaAndSeeds(db);

  dbInstance = db;
  return dbInstance;
}
