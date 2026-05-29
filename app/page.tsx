"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Compass, MapPin, Star, Calendar, Users, ArrowRight, Sparkles } from "lucide-react";
import { destinations } from "./data/destinations";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVibe, setSelectedVibe] = useState<string>("All");

  const vibesList = [
    { label: "All Vibes ✨", value: "All" },
    { label: "Chill Explorer 🌴", value: "Chill Explorer" },
    { label: "Adrenaline Junkie ⚡", value: "Adrenaline Junkie" },
    { label: "Foodie 🍜", value: "Foodie" },
    { label: "Culture Nomad 🏛️", value: "Culture Nomad" },
  ];

  // Filtered destinations
  const filteredDestinations = useMemo(() => {
    return destinations.filter((dest) => {
      const matchesSearch =
        dest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesVibe = selectedVibe === "All" || dest.vibe === selectedVibe;
      return matchesSearch && matchesVibe;
    });
  }, [searchQuery, selectedVibe]);

  // All open trips from filtered destinations
  const openTripsList = useMemo(() => {
    const list: any[] = [];
    filteredDestinations.forEach((dest) => {
      dest.openTrips.forEach((trip) => {
        list.push({
          ...trip,
          destination: dest,
        });
      });
    });
    // Sort by start date placeholder (could sort chronologically)
    return list;
  }, [filteredDestinations]);

  return (
    <div className="flex flex-col gap-16 md:gap-24 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-amber-100 via-amber-50 to-teal-50 border border-amber-200/40 p-8 sm:p-12 md:p-16 lg:p-20 text-center">
        {/* Floating stickers for aesthetic Gen Z feel */}
        <div className="absolute top-8 left-8 bg-brand-orange/10 border border-brand-orange/20 text-brand-orange font-bold text-xs px-3 py-1.5 rounded-full rotate-[-6deg] hidden md:flex items-center gap-1 shadow-sm select-none">
          🍹 Cocktails Daily
        </div>
        <div className="absolute bottom-12 left-16 bg-brand-teal/10 border border-brand-teal/20 text-brand-teal font-bold text-xs px-3 py-1.5 rounded-full rotate-[12deg] hidden md:flex items-center gap-1 shadow-sm select-none">
          🏄‍♂️ Beginner Surf
        </div>
        <div className="absolute top-12 right-12 bg-purple-500/10 border border-purple-500/20 text-purple-600 font-bold text-xs px-3 py-1.5 rounded-full rotate-[8deg] hidden md:flex items-center gap-1 shadow-sm select-none">
          📸 Aesthetic Feeds
        </div>
        <div className="absolute bottom-16 right-20 bg-amber-500/10 border border-amber-500/20 text-amber-600 font-bold text-xs px-3 py-1.5 rounded-full rotate-[-4deg] hidden md:flex items-center gap-1 shadow-sm select-none">
          🔥 No Boring Buses
        </div>

        <div className="relative z-10 flex flex-col items-center max-w-3xl mx-auto gap-6">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-xs font-bold uppercase tracking-wider animate-pulse">
            <Sparkles className="w-3.5 h-3.5" /> Stop Dreaming, Start Traveling
          </div>

          <h1 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl text-brand-dark leading-tight tracking-tight">
            Where to next, <span className="text-brand-orange relative inline-block">
              buddy?
              <svg className="absolute left-0 bottom-[-6px] w-full h-[8px] text-brand-teal fill-current" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0,5 Q50,10 100,5" stroke="currentColor" strokeWidth="3" fill="none" />
              </svg>
            </span> 🌴
          </h1>

          <p className="text-gray-600 font-sans text-base sm:text-lg max-w-xl leading-relaxed">
            Forget standard rigid tour packages. We do casual open-trip adventures where you get to connect with epic people, eat crazy good local food, and live like a local.
          </p>

          {/* Search bar & filter wrapper */}
          <div className="w-full max-w-xl mt-6 p-2 rounded-2xl sm:rounded-full bg-white shadow-xl shadow-brand-dark/5 border border-amber-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex-1 flex items-center px-4 gap-2">
              <Search className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Search Bali, Bromo, hiking, beaches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2.5 text-sm bg-transparent border-none outline-none focus:ring-0 text-brand-dark placeholder-gray-400 font-sans"
              />
            </div>
            <button className="px-6 py-3 sm:py-2.5 bg-brand-orange hover:bg-brand-orange-hover text-white font-sans font-bold text-sm rounded-xl sm:rounded-full transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-brand-orange/20">
              Find Vibes
            </button>
          </div>
        </div>
      </section>

      {/* 2. Interactive Vibe Filters */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <span className="text-brand-teal font-sans font-bold text-xs uppercase tracking-wider">Choose your frequency</span>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-brand-dark">Match Your Travel Vibe</h2>
          </div>
        </div>

        {/* Horizontal scroll vibe tags */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
          {vibesList.map((vibe) => (
            <button
              key={vibe.value}
              onClick={() => setSelectedVibe(vibe.value)}
              className={`px-5 py-3 rounded-2xl font-sans font-bold text-sm shrink-0 transition-all duration-200 cursor-pointer border ${
                selectedVibe === vibe.value
                  ? "bg-brand-teal border-brand-teal text-white shadow-md shadow-brand-teal/20 hover:scale-105"
                  : "bg-white border-amber-100 text-gray-600 hover:border-brand-teal hover:text-brand-teal"
              }`}
            >
              {vibe.label}
            </button>
          ))}
        </div>
      </section>

      {/* 3. Featured Destinations Cards */}
      <section className="flex flex-col gap-8">
        <div className="flex justify-between items-end">
          <h3 className="font-display font-bold text-xl sm:text-2xl text-brand-dark flex items-center gap-2">
            <Compass className="w-6 h-6 text-brand-orange animate-spin-slow" />
            Curated Spots ({filteredDestinations.length})
          </h3>
        </div>

        {filteredDestinations.length === 0 ? (
          <div className="text-center py-16 px-6 bg-white border border-dashed border-amber-200 rounded-3xl flex flex-col items-center gap-3">
            <span className="text-4xl">🏜️</span>
            <h4 className="font-display font-bold text-lg text-brand-dark">No vibe matches your search...</h4>
            <p className="text-sm font-sans text-gray-500">Try searching another destination or resetting the vibe filter!</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedVibe("All");
              }}
              className="mt-2 px-5 py-2.5 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold font-sans rounded-xl transition-colors"
            >
              Reset Search & Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredDestinations.map((dest) => (
              <Link
                href={`/destination/${dest.id}`}
                key={dest.id}
                className="group flex flex-col bg-white border border-amber-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
              >
                {/* Image Wrap */}
                <div className="relative h-56 w-full overflow-hidden bg-gray-100">
                  <Image
                    src={dest.image}
                    alt={dest.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    priority
                  />
                  {/* Floating Rating Badge */}
                  <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm border border-white/50 text-brand-dark font-sans font-bold text-xs flex items-center gap-1 shadow-sm">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    {dest.rating}
                  </div>
                  {/* Vibe icon stamp */}
                  <div className="absolute bottom-4 left-4 w-9 h-9 rounded-full bg-white/95 backdrop-blur-sm border border-white/50 flex items-center justify-center text-lg shadow-sm">
                    {dest.vibeIcon}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-grow flex flex-col justify-between gap-4">
                  <div className="flex flex-col gap-2">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {dest.tags.slice(0, 2).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 rounded-full bg-brand-sand-dark text-[10px] font-sans font-bold text-gray-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <h4 className="font-display font-extrabold text-lg text-brand-dark leading-snug group-hover:text-brand-orange transition-colors">
                      {dest.title}
                    </h4>

                    <p className="text-gray-500 font-sans text-xs line-clamp-2 leading-relaxed">
                      {dest.tagline}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-sans font-medium text-gray-400 block uppercase">starts from</span>
                      <span className="text-lg font-display font-black text-brand-orange">${dest.price}</span>
                    </div>
                    <span className="w-8 h-8 rounded-full bg-brand-orange/10 group-hover:bg-brand-orange text-brand-orange group-hover:text-white flex items-center justify-center transition-all duration-300">
                      <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 4. Open Trip Schedule Section */}
      <section id="open-trips" className="flex flex-col gap-8 scroll-mt-24">
        <div>
          <span className="text-brand-orange font-sans font-bold text-xs uppercase tracking-wider">Don't travel alone</span>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-brand-dark flex items-center gap-2">
            📅 Upcoming Open Trips
          </h2>
          <p className="text-gray-500 font-sans text-sm mt-1">
            Pick a date, reserve your slot, and we'll connect you with the crew in a WhatsApp group!
          </p>
        </div>

        {openTripsList.length === 0 ? (
          <div className="text-center py-12 px-6 bg-white border border-dashed border-amber-200 rounded-3xl">
            <p className="text-gray-500 font-sans text-sm">No scheduled trips match your filters. Reset your filters to see all dates!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {openTripsList.map((trip) => {
              const slotsLeft = trip.totalSlots - trip.bookedSlots;
              const percentBooked = (trip.bookedSlots / trip.totalSlots) * 100;
              const isSoldOut = slotsLeft <= 0;

              return (
                <div
                  key={trip.id}
                  className="bg-white border border-amber-100 hover:border-brand-teal/40 rounded-3xl p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  {/* Destination Thumb & Title */}
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shrink-0 bg-gray-100 border border-gray-100">
                      <Image
                        src={trip.destination.image}
                        alt={trip.destination.title}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <span className="px-2 py-0.5 rounded-full bg-brand-orange/10 text-brand-orange text-[10px] font-sans font-bold uppercase tracking-wider block w-fit mb-1.5">
                        {trip.destination.vibe}
                      </span>
                      <h4 className="font-display font-extrabold text-base sm:text-lg text-brand-dark">
                        {trip.destination.title}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-sans mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-brand-teal shrink-0" />
                        <span>Indonesia</span>
                      </div>
                    </div>
                  </div>

                  {/* Dates & Schedule */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-sand-dark flex items-center justify-center text-brand-teal shrink-0">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-sans font-medium text-gray-400 block uppercase">trip schedule</span>
                      <span className="text-sm sm:text-base font-sans font-bold text-brand-dark">
                        {trip.startDate} - {trip.endDate}, {trip.year}
                      </span>
                    </div>
                  </div>

                  {/* Slots Remaining with Bar Indicator */}
                  <div className="flex flex-col gap-1.5 lg:max-w-xs w-full">
                    <div className="flex justify-between items-center text-xs font-sans">
                      <span className="text-gray-400 font-medium flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> Slots Left
                      </span>
                      <span className={`font-bold ${isSoldOut ? "text-red-500 animate-pulse" : "text-brand-teal"}`}>
                        {isSoldOut ? "SOLD OUT 😭" : `${slotsLeft} of ${trip.totalSlots} slots free`}
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2.5 bg-brand-sand-dark rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isSoldOut
                            ? "bg-red-500"
                            : slotsLeft <= 3
                            ? "bg-amber-500"
                            : "bg-brand-teal"
                        }`}
                        style={{ width: `${percentBooked}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Pricing and Action */}
                  <div className="flex items-center justify-between lg:justify-end gap-6 pt-4 lg:pt-0 border-t border-gray-100 lg:border-none">
                    <div>
                      <span className="text-[10px] font-sans font-medium text-gray-400 block uppercase">all inclusive</span>
                      <span className="text-xl sm:text-2xl font-display font-black text-brand-orange">${trip.price}</span>
                    </div>
                    <Link
                      href={isSoldOut ? "#" : `/book/${trip.destination.id}?tripId=${trip.id}`}
                      className={`px-6 py-3.5 sm:px-8 sm:py-4 rounded-2xl font-sans font-extrabold text-sm shadow-md transition-all duration-200 text-center ${
                        isSoldOut
                          ? "bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                          : "bg-brand-orange hover:bg-brand-orange-hover text-white hover:scale-105 active:scale-95 shadow-brand-orange/20 cursor-pointer"
                      }`}
                      onClick={(e) => {
                        if (isSoldOut) e.preventDefault();
                      }}
                    >
                      {isSoldOut ? "Full" : "Secure Slot 🚀"}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
