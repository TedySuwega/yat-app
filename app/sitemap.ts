import { MetadataRoute } from "next";
import { getDb } from "@/lib/db";
import { type DbDestination } from "@/lib/mappers";
import { destinations as staticDestinations } from "@/app/data/destinations";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  let destinationIds: { id: string; lastModified: Date }[] = [];
  try {
    const db = getDb();
    const destinations = db.prepare("SELECT id, created_at FROM destinations").all() as DbDestination[];
    if (destinations && destinations.length > 0) {
      destinationIds = destinations.map((d) => ({
        id: d.id,
        lastModified: d.created_at ? new Date(d.created_at) : new Date(),
      }));
    }
  } catch (e) {
    console.warn("Notice generating sitemap from DB, using fallback destinations:", e);
  }

  if (destinationIds.length === 0) {
    destinationIds = staticDestinations.map((d) => ({
      id: d.id,
      lastModified: new Date(),
    }));
  }

  const destinationUrls = destinationIds.map((dest) => ({
    url: `${baseUrl}/destination/${dest.id}`,
    lastModified: dest.lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    ...destinationUrls,
  ];
}
