// Run with: npx tsx scripts/seed-db.ts
// Migrates destinations.ts hardcoded data into the SQLite DB.

import { getDb } from "../lib/db";
import { CREATE_TABLES_SQL } from "../lib/schema";
import { destinations } from "../app/data/destinations";

const db = getDb();

db.exec(CREATE_TABLES_SQL);

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

const seedAll = db.transaction(() => {
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

seedAll();

console.log("✅ Database seeded!");
