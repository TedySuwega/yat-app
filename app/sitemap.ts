import { MetadataRoute } from "next";
import { getDb } from "@/lib/db";
import { type DbDestination } from "@/lib/mappers";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  let destinations: DbDestination[] = [];
  try {
    const db = getDb();
    destinations = db.prepare("SELECT id, created_at FROM destinations").all() as DbDestination[];
  } catch (e) {
    console.error("Error generating sitemap destination links:", e);
  }

  const destinationUrls = destinations.map((dest) => ({
    url: `${baseUrl}/destination/${dest.id}`,
    lastModified: dest.created_at ? new Date(dest.created_at) : new Date(),
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
