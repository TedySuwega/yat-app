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
  title: "YoloTrips 🌴 | Where to next, buddy?",
  description: "Curated aesthetic trips and adventures for Gen Z & millennial travelers. Join our next open trip, make epic friends, and explore like a local.",
  keywords: "travel app, travel vibes, open trip, bali trip, mount bromo sunrise, labuan bajo sailing, yogyakarta, adventure travel, young travelers",
  authors: [{ name: "YoloTrips Crew" }],
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
      <body className="min-h-full flex flex-col bg-brand-sand font-sans text-brand-dark">
        <Navbar />
        <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
