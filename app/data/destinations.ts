export interface ItineraryItem {
  day: number;
  title: string;
  details: string;
}

export interface OpenTrip {
  id: string;
  startDate: string; // e.g., "10 Oct"
  endDate: string;   // e.g., "14 Oct"
  year: string;      // e.g., "2026"
  price: number;
  totalSlots: number;
  bookedSlots: number;
}

export interface Destination {
  id: string;
  title: string;
  tagline: string;
  description: string;
  image: string;
  rating: number;
  reviewsCount: number;
  price: number; // Base price
  tags: string[];
  vibe: "Chill Explorer" | "Adrenaline Junkie" | "Foodie" | "Culture Nomad";
  vibeIcon: string;
  whatToBring: string[];
  highlights: string[];
  itinerary: ItineraryItem[];
  openTrips: OpenTrip[];
}

export const destinations: Destination[] = [
  {
    id: "bali-chill",
    title: "Bali Chill Vibes",
    tagline: "Tropical beaches, endless sunset chasing, and aesthetic cafe hopping.",
    description: "Ready to escape the daily grind? Bali is calling, buddy! This trip is all about that laid-back island lifestyle. We'll explore hidden waterfalls in Ubud, catch magical sunsets at Uluwatu, surf some easy waves, and eat at the most Instagrammable cafes in Canggu. Perfect for making new friends and relaxing under the sun.",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&h=800&q=80",
    rating: 4.9,
    reviewsCount: 142,
    price: 349,
    tags: ["🔥 Popular", "🌴 Beach Vibe", "🍹 Chill"],
    vibe: "Chill Explorer",
    vibeIcon: "🌴",
    whatToBring: [
      "Swimwear & Boardshorts",
      "Biodegradable Sunscreen",
      "Flowy outfits for cafe photos",
      "Comfortable sandals & sneakers",
      "Reusable water bottle",
      "Power bank for long days out"
    ],
    highlights: [
      "Sunset beach campfire & acoustic session in Canggu",
      "Hidden jungle swing and waterfall trek in Ubud",
      "Surfing lessons with cool local instructors",
      "Uluwatu cliff temple visit & Kecak fire dance show"
    ],
    itinerary: [
      {
        day: 1,
        title: "Welcome to Paradise & Canggu Sunset",
        details: "Arrive in Bali! We'll pick you up from the airport and head to our aesthetic villa. After settling in, we'll head to Canggu Beach for a welcome sunset drink, chill acoustic tunes, and a cozy beachside dinner to get to know the crew."
      },
      {
        day: 2,
        title: "Ubud Jungles, Swings & Waterfalls",
        details: "Rise and shine! We are heading north to Ubud. We will trek down to a gorgeous jungle waterfall, try out the famous Ubud giant swing, and stroll through the Tegalalang rice terraces. Lunch at a local organic cafe."
      },
      {
        day: 3,
        title: "Surf Session & Uluwatu Sunset",
        details: "Time to hit the waves! We will have an easy-going morning surf session suitable for beginners. In the afternoon, we head south to Uluwatu Temple, perched on a dramatic cliff, and watch the traditional Kecak dance during sunset."
      },
      {
        day: 4,
        title: "Beach Club Chill & Farewell Dinner",
        details: "A dedicated chill day! Spend your morning lounging by the pool or cafe hopping. In the afternoon, we gather at a premium beach club with infinity pools, daybeds, and DJ sets, leading into our big farewell seafood dinner."
      }
    ],
    openTrips: [
      {
        id: "bali-oct-10",
        startDate: "10 Oct",
        endDate: "14 Oct",
        year: "2026",
        price: 349,
        totalSlots: 12,
        bookedSlots: 8
      },
      {
        id: "bali-nov-05",
        startDate: "05 Nov",
        endDate: "09 Nov",
        year: "2026",
        price: 349,
        totalSlots: 12,
        bookedSlots: 4
      }
    ]
  },
  {
    id: "labuan-bajo",
    title: "Labuan Bajo Sailing",
    tagline: "Island hopping on a gorgeous wooden Phinisi boat & meeting Komodo dragons.",
    description: "Hop aboard our luxury wooden Phinisi boat and sail across the pristine waters of Komodo National Park. We'll hike to the famous 3-bay viewpoint of Padar Island, walk on the dreamy Pink Beach, swim with giant manta rays, and watch thousands of flying foxes take off at sunset. It's the ultimate tropical adventure!",
    image: "https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=1200&h=800&q=80",
    rating: 4.8,
    reviewsCount: 96,
    price: 549,
    tags: ["🍃 Nature", "⛵ Sailing", "🐋 Adventure"],
    vibe: "Adrenaline Junkie",
    vibeIcon: "⚡",
    whatToBring: [
      "Trekking shoes or sneakers (for Padar Island)",
      "Snorkeling gear (if you prefer your own)",
      "Dry bag for boat trips",
      "Sun hat & sunglasses",
      "Windbreaker jacket for boat decks",
      "Motion sickness pills (just in case)"
    ],
    highlights: [
      "Hiking Padar Island for the legendary panoramic view",
      "Strolling on the surreal Pink Beach",
      "Snorkeling with majestic Manta Rays at Manta Point",
      "Living onboard a traditional luxury Phinisi boat"
    ],
    itinerary: [
      {
        day: 1,
        title: "Boarding the Phinisi & Kelor Island Hike",
        details: "Meet at Labuan Bajo harbor and check into your cozy boat cabin. We set sail immediately! Our first stop is Kelor Island for a short, steep hike yielding gorgeous sea views, followed by snorkeling and a gorgeous sunset dinner onboard."
      },
      {
        day: 2,
        title: "Padar Island Sunrise & Pink Beach",
        details: "An early 4:30 AM wake-up call for the highlight hike: Padar Island sunrise! The view of the three colored bays is breathtaking. Afterward, we sail to the magical Pink Beach to swim, take photos, and relax on the rosy sand."
      },
      {
        day: 3,
        title: "Komodo Dragons & Manta Point Snorkel",
        details: "We land on Komodo Island to spot the legendary pre-historic Komodo Dragons with local rangers. Next, we head to Manta Point. Jump into the turquoise water to snorkel alongside giant, gentle manta rays!"
      },
      {
        day: 4,
        title: "Kanawa Island Snorkel & Return",
        details: "Enjoy breakfast on deck as we sail to Kanawa Island, a paradise of colorful coral reefs and friendly fish. We'll do a final snorkel session, then head back to Labuan Bajo harbor by midday for airport drops."
      }
    ],
    openTrips: [
      {
        id: "bajo-oct-18",
        startDate: "18 Oct",
        endDate: "21 Oct",
        year: "2026",
        price: 549,
        totalSlots: 10,
        bookedSlots: 8
      },
      {
        id: "bajo-nov-12",
        startDate: "12 Nov",
        endDate: "15 Nov",
        year: "2026",
        price: 549,
        totalSlots: 10,
        bookedSlots: 3
      }
    ]
  },
  {
    id: "bromo-sunrise",
    title: "Mount Bromo Sunrise",
    tagline: "Ride retro 4x4 Jeeps across volcanic sands to catch a surreal sunrise.",
    description: "Step onto another planet! Mount Bromo's volcanic landscape is absolutely mind-blowing. We'll ride in vintage 4x4 Jeeps in the middle of the night, witness a mystical golden sunrise lighting up the smoking crater, hike across the Sea of Sand, and climb the stairs directly to the edge of the active volcano.",
    image: "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c26e?auto=format&fit=crop&w=1200&h=800&q=80",
    rating: 4.7,
    reviewsCount: 88,
    price: 219,
    tags: ["🌋 Active Volcano", "📸 Photography", "⚡ Epic"],
    vibe: "Adrenaline Junkie",
    vibeIcon: "⚡",
    whatToBring: [
      "Heavy warm jacket & gloves (it gets down to 5°C!)",
      "Face mask/buff (to protect from volcanic dust)",
      "Headlamp or flashlight",
      "Sturdy hiking boots or sports shoes",
      "Warm beanie & scarf",
      "Thermos or snacks for the chilly morning"
    ],
    highlights: [
      "Catching Bromo sunrise from King Kong Hill (unbelievable colors!)",
      "Off-road vintage 4x4 Jeep ride across the volcanic ash desert",
      "Hiking up to the smoking rim of Bromo's active crater",
      "Strolling through the misty Whispering Sands"
    ],
    itinerary: [
      {
        day: 1,
        title: "Journey to Bromo Highlands & Meet-up",
        details: "We'll pick the crew up from Malang or Surabaya. We drive up into the cool Bromo highlands, check into our cozy mountain lodge, and enjoy a warm local dinner around a fireplace. Early night, because the adventure starts at midnight!"
      },
      {
        day: 2,
        title: "The Midnight Jeep Chase & Epic Sunrise",
        details: "Wake up at 2:30 AM! We board our vintage open-top Jeeps and rumble up the mountain paths to King Kong Hill. We'll sip hot coffee as the sun rises over Bromo, Batok, and Semeru volcanoes. A truly spiritual view!"
      },
      {
        day: 3,
        title: "Hiking the Crater Rim & Sea of Sand",
        details: "After sunrise, we cross the vast Sea of Sand in our Jeeps. We will hike (or ride a pony) to the foot of Bromo, then climb 250 concrete steps to look directly inside the smoking, rumbling crater. Back to lodge for hot breakfast."
      },
      {
        day: 4,
        title: "Madakaripura Waterfall & Farewell",
        details: "Before heading home, we stop by Madakaripura, a spectacular, deep canyon waterfall where water rains down from the sky. Put on your raincoats! After this epic splash, we head back for airport/train drops."
      }
    ],
    openTrips: [
      {
        id: "bromo-nov-02",
        startDate: "02 Nov",
        endDate: "05 Nov",
        year: "2026",
        price: 219,
        totalSlots: 15,
        bookedSlots: 7
      },
      {
        id: "bromo-dec-04",
        startDate: "04 Dec",
        endDate: "07 Dec",
        year: "2026",
        price: 219,
        totalSlots: 15,
        bookedSlots: 10
      }
    ]
  },
  {
    id: "yogyakarta-culture",
    title: "Yogyakarta Cultural Stroll",
    tagline: "Uncover ancient temples, craft handmade batik, and eat local street food.",
    description: "Yogyakarta (Jogja) is the cultural beating heart of Java. On this trip, we combine magnificent ancient history with hip city vibes. We'll watch the sun rise behind Borobudur Temple (the world's largest Buddhist monument), explore the majestic Prambanan temple ruins, try batik-making, and eat local Gudeg and street snacks along Malioboro.",
    image: "https://images.unsplash.com/photo-1584810359583-96fc3448beaa?auto=format&fit=crop&w=1200&h=800&q=80",
    rating: 4.8,
    reviewsCount: 112,
    price: 179,
    tags: ["🏛️ History", "🍜 Foodie", "🎨 Arts"],
    vibe: "Foodie",
    vibeIcon: "🍜",
    whatToBring: [
      "Comfortable light clothing (Jogja is warm!)",
      "Camera or phone with plenty of storage",
      "Modest clothing for temple visits (shoulders & knees covered)",
      "Umbrella or light raincoat",
      "Cash for local street snacks and handicrafts",
      "Hand sanitizer & wet wipes"
    ],
    highlights: [
      "Watching the majestic Borobudur Temple sunrise",
      "Exploring the massive Prambanan Hindu Temple complex",
      "Traditional batik workshop with local master artists",
      "Late-night culinary crawl along the iconic Malioboro street"
    ],
    itinerary: [
      {
        day: 1,
        title: "Malioboro Vibes & Culinary Stroll",
        details: "Arrive in Jogja! We check into our boutique hotel, then head out in traditional cycle-rickshaws (becak) to Malioboro. We will taste local specialties like Gudeg, charcoal coffee (kopi joss), and sweet bakpia pastries."
      },
      {
        day: 2,
        title: "Borobudur Sunrise & Batik Making",
        details: "A 4:00 AM trip to Borobudur Temple to watch the fog lift off the volcanic plains. We'll explore the temple reliefs. In the afternoon, we head to a local village for a hands-on batik painting workshop, creating our own custom souvenir."
      },
      {
        day: 3,
        title: "Jeep Tour at Mount Merapi & Prambanan",
        details: "Adrenaline check! We go on a rugged off-road Jeep ride near the active Mt. Merapi, exploring bunkers and ruins. In the late afternoon, we visit the towering Prambanan temple complex and watch a beautiful sunset backdrop."
      },
      {
        day: 4,
        title: "Sultan's Palace & Farewell Lunch",
        details: "We visit the Keraton (Sultan's Palace) and the mysterious Water Castle (Taman Sari) with its secret underground chambers. We finish with a grand royal-style Javanese farewell lunch before heading to the airport."
      }
    ],
    openTrips: [
      {
        id: "jogja-nov-12",
        startDate: "12 Nov",
        endDate: "15 Nov",
        year: "2026",
        price: 179,
        totalSlots: 16,
        bookedSlots: 6
      },
      {
        id: "jogja-dec-18",
        startDate: "18 Dec",
        endDate: "21 Dec",
        year: "2026",
        price: 179,
        totalSlots: 16,
        bookedSlots: 12
      }
    ]
  }
];

// Helper functions
export function getDestinationById(id: string): Destination | undefined {
  return destinations.find((d) => d.id === id);
}

export function getOpenTripById(tripId: string): { destination: Destination; trip: OpenTrip } | undefined {
  for (const dest of destinations) {
    const trip = dest.openTrips.find((t) => t.id === tripId);
    if (trip) {
      return { destination: dest, trip };
    }
  }
  return undefined;
}
