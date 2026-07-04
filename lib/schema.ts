export const CREATE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS destinations (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  image_url TEXT,
  rating REAL DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  price REAL NOT NULL,
  tags TEXT,
  vibe TEXT,
  vibe_icon TEXT,
  what_to_bring TEXT,
  highlights TEXT,
  itinerary TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS open_trips (
  id TEXT PRIMARY KEY,
  destination_id TEXT NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  year TEXT NOT NULL,
  price REAL NOT NULL,
  total_slots INTEGER NOT NULL,
  booked_slots INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  destination_id TEXT NOT NULL REFERENCES destinations(id),
  trip_id TEXT NOT NULL REFERENCES open_trips(id),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  seats INTEGER NOT NULL DEFAULT 1,
  vibe TEXT,
  total_price REAL NOT NULL,
  status TEXT DEFAULT 'confirmed',
  payment_ref TEXT,
  booked_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;
