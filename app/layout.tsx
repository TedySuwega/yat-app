import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "YoloTrips 🌴 | Where to next, buddy?", template: "%s | YoloTrips" },
  description: "Curated aesthetic trips and adventures for Gen Z & millennial travelers. Join our next open trip, make epic friends, and explore like a local.",
  keywords: "travel app, travel vibes, open trip, bali trip, mount bromo sunrise, labuan bajo sailing, yogyakarta, adventure travel, young travelers",
  authors: [{ name: "YoloTrips Crew" }],
  openGraph: {
    type: "website",
    siteName: "YoloTrips",
    title: "YoloTrips 🌴 | Aesthetic Open Trips for Gen Z",
    description: "Casual open-trip adventures in Indonesia. No boring tours — just vibes, friends, and epic destinations.",
    images: [{ url: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&h=630&q=80", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "YoloTrips 🌴 | Aesthetic Open Trips",
    description: "Casual open-trip adventures in Indonesia. No boring tours — just vibes, friends, and epic destinations.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${outfit.variable} h-full scroll-smooth antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-brand-sand font-sans text-brand-dark">
        <Navbar />
        <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
