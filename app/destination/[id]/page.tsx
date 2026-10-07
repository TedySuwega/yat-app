"use client";

import React, { useState, use, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Star,
  Check,
  ChevronDown,
  Calendar,
  AlertTriangle,
  Sparkles,
  ArrowLeft,
  Luggage,
  Info,
} from "lucide-react";
import { destinations as fallbackDestinations, type Destination } from "../../data/destinations";

interface DestinationPageProps {
  params: Promise<{ id: string }>;
}

export default function DestinationDetailPage({ params }: DestinationPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [dest, setDest] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);

  // States
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});
  const [openDay, setOpenDay] = useState<number | null>(1);
  const [selectedTripId, setSelectedTripId] = useState<string>("");

  useEffect(() => {
    fetch(`/api/destinations/${resolvedParams.id}`)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Not found");
      })
      .then((data) => {
        if (data && data.id) {
          setDest(data);
        } else {
          const fallback = fallbackDestinations.find((d) => d.id === resolvedParams.id);
          setDest(fallback || null);
        }
      })
      .catch((err) => {
        console.warn("Using fallback destination on client:", err);
        const fallback = fallbackDestinations.find((d) => d.id === resolvedParams.id);
        setDest(fallback || null);
      })
      .finally(() => setLoading(false));
  }, [resolvedParams.id]);

  useEffect(() => {
    if (dest && dest.openTrips.length > 0 && !selectedTripId) {
      const availableTrip =
        dest.openTrips.find((t) => t.totalSlots - t.bookedSlots > 0) || dest.openTrips[0];
      setSelectedTripId(availableTrip.id);
    }
  }, [dest, selectedTripId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-500 font-sans text-sm animate-pulse">Loading destination...</p>
      </div>
    );
  }

  if (!dest) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 bg-white border border-amber-100 rounded-3xl gap-4">
        <span className="text-4xl">🏝️</span>
        <h2 className="font-display font-extrabold text-2xl text-brand-dark">Destination not found</h2>
        <p className="text-sm font-sans text-gray-500 max-w-sm">
          Oops, this destination doesn't seem to exist in our travel guides. Let's find you another epic spot!
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-brand-orange hover:bg-brand-orange-hover text-white font-sans font-bold text-sm rounded-xl transition-colors shadow-md shadow-brand-orange/20"
        >
          Back to Explore
        </Link>
      </div>
    );
  }

  const selectedTrip = dest.openTrips.find((t) => t.id === selectedTripId);
  const slotsLeft = selectedTrip ? selectedTrip.totalSlots - selectedTrip.bookedSlots : 0;
  const isSoldOut = slotsLeft <= 0;

  // Toggle checklist items
  const toggleChecklist = (item: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

  // Toggle itinerary days
  const toggleDay = (day: number) => {
    setOpenDay((prev) => (prev === day ? null : day));
  };

  return (
    <div className="flex flex-col gap-10 pb-16">
      {/* Back link */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-sans font-bold text-sm text-gray-500 hover:text-brand-orange transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Explore
        </Link>
      </div>

      {/* Hero Header Banner */}
      <section className="relative h-[300px] sm:h-[450px] w-full rounded-[2.5rem] overflow-hidden shadow-md">
        <Image
          src={dest.image}
          alt={dest.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-brand-dark/20 to-transparent" />

        {/* Hero content overlays */}
        <div className="absolute bottom-6 left-6 right-6 sm:bottom-10 sm:left-10 sm:right-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="flex flex-col gap-3 max-w-2xl text-white">
            {/* Vibe badge */}
            <div className="flex items-center gap-1.5 w-fit px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-xs font-sans font-bold uppercase tracking-wider">
              <span>{dest.vibeIcon}</span>
              <span>{dest.vibe} Vibe</span>
            </div>

            <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight leading-none drop-shadow-sm">
              {dest.title}
            </h1>

            <p className="text-gray-200 font-sans text-sm sm:text-base leading-relaxed drop-shadow-sm font-medium">
              {dest.tagline}
            </p>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end gap-3 shrink-0">
            {/* Rating badge */}
            <div className="px-3.5 py-1.5 rounded-full bg-white/95 text-brand-dark font-sans font-extrabold text-sm flex items-center gap-1 shadow-sm">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>{dest.rating}</span>
              <span className="text-gray-400 font-normal text-xs">({dest.reviewsCount} reviews)</span>
            </div>
            <div className="text-white hidden sm:block">
              <span className="text-xs text-gray-300 font-sans font-medium uppercase block tracking-wider">starts at</span>
              <span className="text-3xl font-display font-black text-white">${dest.price}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Details, Packing, Itinerary */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Description */}
          <div className="bg-white border border-amber-100 rounded-3xl p-6 sm:p-8 flex flex-col gap-4 shadow-sm">
            <h2 className="font-display font-extrabold text-xl sm:text-2xl text-brand-dark flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-orange animate-pulse" /> The Vibe & Details
            </h2>
            <p className="text-gray-600 font-sans text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {dest.description}
            </p>

            {/* highlights box */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h3 className="font-display font-bold text-base text-brand-dark mb-3">✨ Trip Highlights</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {dest.highlights.map((hl, index) => (
                  <li key={index} className="flex gap-2.5 items-start text-sm font-sans text-gray-600">
                    <span className="w-5 h-5 rounded-full bg-brand-teal/10 text-brand-teal flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">✓</span>
                    <span>{hl}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Interactive Day-by-Day Itinerary Accordion */}
          <div className="bg-white border border-amber-100 rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-sm">
            <div>
              <h2 className="font-display font-extrabold text-xl sm:text-2xl text-brand-dark flex items-center gap-2">
                🗺️ Day-by-Day Itinerary
              </h2>
              <p className="text-xs font-sans text-gray-400 mt-1">Click a day to expand details and activities!</p>
            </div>

            <div className="flex flex-col gap-3">
              {dest.itinerary.map((dayItem) => {
                const isOpen = openDay === dayItem.day;
                return (
                  <div
                    key={dayItem.day}
                    className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
                      isOpen ? "border-brand-teal bg-brand-teal/5" : "border-gray-100 bg-gray-50/50 hover:bg-gray-50"
                    }`}
                  >
                    <button
                      onClick={() => toggleDay(dayItem.day)}
                      className="w-full text-left px-5 py-4 flex justify-between items-center gap-4 cursor-pointer focus:outline-none"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-sm shrink-0 transition-colors ${
                          isOpen ? "bg-brand-teal text-white" : "bg-brand-sand-dark text-gray-600"
                        }`}>
                          D{dayItem.day}
                        </span>
                        <h4 className="font-display font-bold text-sm sm:text-base text-brand-dark line-clamp-1">
                          {dayItem.title}
                        </h4>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? "transform rotate-180 text-brand-teal" : ""
                      }`} />
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 pl-[3.25rem] text-sm font-sans text-gray-600 leading-relaxed animate-pop">
                        <p>{dayItem.details}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Packing Checklist */}
          <div className="bg-white border border-amber-100 rounded-3xl p-6 sm:p-8 flex flex-col gap-4 shadow-sm">
            <h2 className="font-display font-extrabold text-xl sm:text-2xl text-brand-dark flex items-center gap-2">
              <Luggage className="w-5.5 h-5.5 text-brand-orange" /> Interactive Packing Checklist
            </h2>
            <p className="text-xs font-sans text-gray-400">
              Prepare for the trip! Mark items you've already packed, so you don't forget anything.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              {dest.whatToBring.map((item, idx) => {
                const isChecked = !!checkedItems[item];
                return (
                  <button
                    key={idx}
                    onClick={() => toggleChecklist(item)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-200 hover:scale-[1.01] ${
                      isChecked
                        ? "border-brand-teal bg-brand-teal/5 text-gray-400"
                        : "border-gray-100 bg-gray-50/50 text-gray-700 hover:border-amber-200"
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-all duration-200 ${
                      isChecked
                        ? "bg-brand-teal border-brand-teal text-white"
                        : "border-gray-300 bg-white"
                    }`}>
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                    </span>
                    <span className={`font-sans text-xs sm:text-sm font-medium ${isChecked ? "line-through" : ""}`}>
                      {item}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Booking Selector Sidebar */}
        <div className="flex flex-col gap-6 lg:sticky lg:top-28 h-fit">
          <div className="bg-white border-2 border-brand-teal/20 rounded-[2rem] p-6 sm:p-8 flex flex-col gap-6 shadow-lg shadow-brand-dark/5">
            <div className="flex justify-between items-end border-b border-gray-100 pb-4">
              <div>
                <span className="text-[10px] font-sans font-medium text-gray-400 block uppercase">total price</span>
                <span className="text-3xl font-display font-black text-brand-orange">${dest.price}</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-brand-teal/10 text-brand-teal font-sans font-bold text-xs">
                All Inclusive 🎒
              </span>
            </div>

            {/* Date Select Section */}
            <div className="flex flex-col gap-3">
              <label className="font-display font-bold text-sm text-brand-dark flex items-center gap-1.5">
                <Calendar className="w-4.5 h-4.5 text-brand-teal" /> Choose Upcoming Date
              </label>

              <div className="flex flex-col gap-2.5">
                {dest.openTrips.map((trip) => {
                  const left = trip.totalSlots - trip.bookedSlots;
                  const sold = left <= 0;
                  const active = selectedTripId === trip.id;

                  return (
                    <button
                      key={trip.id}
                      onClick={() => !sold && setSelectedTripId(trip.id)}
                      className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between gap-3 cursor-pointer transition-all duration-200 ${
                        sold
                          ? "bg-gray-50 border-gray-100 text-gray-400 opacity-60 cursor-not-allowed"
                          : active
                          ? "border-brand-teal bg-brand-teal/5 text-brand-dark font-semibold ring-2 ring-brand-teal/10"
                          : "border-amber-100 bg-white text-gray-600 hover:border-brand-teal"
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-xs sm:text-sm font-sans font-bold">
                          {trip.startDate} - {trip.endDate}, {trip.year}
                        </span>
                        <span className="text-[10px] text-gray-400 font-sans mt-0.5">
                          ${trip.price} • All Inclusive
                        </span>
                      </div>
                      <span className={`text-[10px] font-sans font-bold px-2 py-0.5 rounded-full ${
                        sold
                          ? "bg-gray-200 text-gray-500"
                          : left <= 3
                          ? "bg-amber-100 text-amber-600"
                          : "bg-brand-teal/10 text-brand-teal"
                      }`}>
                        {sold ? "SOLD OUT" : left <= 3 ? `Only ${left} left!` : `${left} slots`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Alert banner if low slots */}
            {!isSoldOut && slotsLeft <= 3 && (
              <div className="flex gap-2.5 p-3.5 bg-amber-50 border border-amber-200/50 rounded-2xl text-amber-700 font-sans text-xs">
                <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
                <p>
                  <strong>Quick check!</strong> Only {slotsLeft} slots remain for this trip. Lock it down before someone else does!
                </p>
              </div>
            )}

            {/* Quick Trip Vibe Card */}
            <div className="flex items-center gap-3 p-3.5 bg-brand-sand rounded-2xl border border-amber-100">
              <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-lg border border-amber-200/40">
                {dest.vibeIcon}
              </span>
              <div>
                <span className="text-[10px] font-sans font-semibold text-gray-400 uppercase tracking-wider block">Recommended Vibe</span>
                <span className="font-display font-extrabold text-sm text-brand-dark">{dest.vibe}</span>
              </div>
            </div>

            {/* Large Call To Action Button */}
            <button
              onClick={() => {
                if (!isSoldOut && selectedTripId) {
                  router.push(`/book/${dest.id}?tripId=${selectedTripId}`);
                }
              }}
              className={`w-full py-4.5 rounded-2xl font-sans font-extrabold text-base shadow-md text-center transition-all duration-200 flex items-center justify-center gap-2 ${
                isSoldOut
                  ? "bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                  : "bg-brand-orange hover:bg-brand-orange-hover text-white hover:scale-105 active:scale-95 shadow-brand-orange/25 cursor-pointer"
              }`}
              disabled={isSoldOut}
            >
              {isSoldOut ? "Fully Booked 😭" : "Join This Trip! 🚀"}
            </button>
          </div>

          {/* Quick Info Box */}
          <div className="p-4 bg-gray-50 border border-gray-200/60 rounded-2xl text-xs font-sans text-gray-500 flex gap-2">
            <Info className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Need a custom plan?</strong> We handle flights and stays but if you need customized airport drops, just ping us after booking!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
