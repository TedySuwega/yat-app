"use client";

import React, { useState, use, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Users,
  Compass,
  Calendar,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Ticket,
  QrCode,
  ShieldCheck,
} from "lucide-react";
import { getDestinationById, getOpenTripById } from "../../data/destinations";

interface BookPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function BookTripPage({ params, searchParams }: BookPageProps) {
  const resolvedParams = use(params);
  const resolvedSearchParams = use(searchParams);
  const router = useRouter();

  const destId = resolvedParams.id;
  const tripId = resolvedSearchParams.tripId as string;

  const dest = getDestinationById(destId);
  const tripData = getOpenTripById(tripId);

  // States
  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [bookingId, setBookingId] = useState("");

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [seats, setSeats] = useState(1);
  const [selectedVibe, setSelectedVibe] = useState<string>("Chill Explorer");

  // Vibe Options with description and icons
  const vibeOptions = [
    { name: "Chill Explorer", icon: "🌴", desc: "Laid-back beaches, aesthetic cafes, sunsets, and local spots." },
    { name: "Adrenaline Junkie", icon: "⚡", desc: "Volcanic hikes, deep snorkeling, surfing, and road trips." },
    { name: "Foodie", icon: "🍜", desc: "Local culinary stalls, midnight food runs, and culinary masterclasses." },
    { name: "Culture Nomad", icon: "🏛️", desc: "Ancient temple crawls, handicraft sessions, and history lessons." },
  ];

  // Pre-select the destination vibe if available
  useEffect(() => {
    if (dest) {
      setSelectedVibe(dest.vibe);
    }
  }, [dest]);

  if (!dest || !tripData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 bg-white border border-amber-100 rounded-3xl gap-4">
        <span className="text-4xl">🎒</span>
        <h2 className="font-display font-extrabold text-2xl text-brand-dark">Invalid Trip Link</h2>
        <p className="text-sm font-sans text-gray-500 max-w-sm">
          Oops, this booking link is invalid or expired. Check your destination and try again!
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

  const { trip } = tripData;
  const totalPrice = dest.price * seats;

  // Form Validations
  const isStep1Valid = fullName.trim() !== "" && email.trim() !== "" && whatsapp.trim() !== "" && seats >= 1;

  const handleNextStep = () => {
    if (step === 1 && !isStep1Valid) return;
    setStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Generate Booking ID
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const generatedId = `TKT-${dest.id.substring(0, 4).toUpperCase()}-${randomCode}`;

    const newBooking = {
      id: generatedId,
      destinationId: dest.id,
      destinationTitle: dest.title,
      tripId: trip.id,
      tripDates: `${trip.startDate} - ${trip.endDate}, ${trip.year}`,
      fullName,
      email,
      whatsapp,
      seats,
      vibe: selectedVibe,
      totalPrice,
      bookedAt: new Date().toLocaleString(),
      status: "confirmed", // 'confirmed' by default in local storage
    };

    // Save to local storage
    if (typeof window !== "undefined") {
      const existingBookingsStr = localStorage.getItem("yolo_trips_bookings");
      const existingBookings = existingBookingsStr ? JSON.parse(existingBookingsStr) : [];
      existingBookings.push(newBooking);
      localStorage.setItem("yolo_trips_bookings", JSON.stringify(existingBookings));
    }

    setBookingId(generatedId);
    setIsSuccess(true);
  };

  return (
    <div className="max-w-3xl mx-auto pb-16">
      {/* Back button */}
      {!isSuccess && (
        <div className="mb-6">
          <Link
            href={`/destination/${dest.id}`}
            className="inline-flex items-center gap-1.5 font-sans font-bold text-sm text-gray-500 hover:text-brand-orange transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to details
          </Link>
        </div>
      )}

      {/* Main Container */}
      <div className="bg-white border border-amber-100 rounded-[2rem] overflow-hidden shadow-xl shadow-brand-dark/5">
        {isSuccess ? (
          /* ================= SUCCESS VIEW ================= */
          <div className="p-8 sm:p-12 text-center flex flex-col items-center gap-6 animate-pop">
            <div className="w-16 h-16 rounded-full bg-brand-teal/10 text-brand-teal flex items-center justify-center animate-bounce">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div>
              <span className="text-brand-teal font-sans font-bold text-xs uppercase tracking-widest animate-pulse">Booking Confirmed!</span>
              <h2 className="font-display font-black text-2xl sm:text-4xl text-brand-dark mt-1">Pack your bags, buddy! 🎒</h2>
              <p className="text-gray-500 font-sans text-sm mt-2 max-w-md mx-auto">
                We've locked down your {seats} {seats === 1 ? "seat" : "seats"} for {dest.title}. A confirmation email has been sent, and we'll ping you on WhatsApp soon to add you to the crew group chat!
              </p>
            </div>

            {/* AESTHETIC TICKET DISPLAY */}
            <div className="w-full max-w-md bg-brand-sand border border-amber-200/60 rounded-3xl overflow-hidden shadow-inner p-6 flex flex-col gap-4 relative">
              {/* Ticket Top Cutouts */}
              <div className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-r border-amber-200/60"></div>
              <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-l border-amber-200/60"></div>

              {/* Header */}
              <div className="flex justify-between items-center pb-3 border-b border-dashed border-amber-200/80">
                <span className="font-display font-black text-lg text-brand-dark tracking-tight">YoloTrips 🌴</span>
                <span className="font-mono font-bold text-xs text-brand-orange px-2.5 py-0.5 rounded-full bg-brand-orange/10">
                  {bookingId}
                </span>
              </div>

              {/* Body */}
              <div className="grid grid-cols-2 gap-4 text-left font-sans text-xs">
                <div>
                  <span className="text-gray-400 font-medium block">TRAVELER</span>
                  <span className="font-bold text-brand-dark text-sm sm:text-base line-clamp-1">{fullName}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-medium block">VIBE MATCH</span>
                  <span className="font-bold text-brand-teal text-sm sm:text-base flex items-center gap-1">
                    {vibeOptions.find((v) => v.name === selectedVibe)?.icon} {selectedVibe}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 font-medium block">TRIP SPOTS</span>
                  <span className="font-bold text-brand-dark text-sm">{dest.title}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-medium block">DATES</span>
                  <span className="font-bold text-brand-dark text-sm">
                    {trip.startDate} - {trip.endDate}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 font-medium block">SEATS</span>
                  <span className="font-bold text-brand-dark text-sm">{seats} traveler(s)</span>
                </div>
                <div>
                  <span className="text-gray-400 font-medium block">PAID TOTAL</span>
                  <span className="font-bold text-brand-orange text-sm sm:text-base font-display">${totalPrice}</span>
                </div>
              </div>

              {/* Ticket Footer / QR Code */}
              <div className="pt-3 border-t border-dashed border-amber-200/80 flex items-center justify-between gap-4">
                <div className="text-left font-sans text-[10px] text-gray-500 max-w-[240px]">
                  <p className="font-bold text-brand-dark flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-brand-teal shrink-0" /> Local Testing Verified
                  </p>
                  <p className="mt-1 leading-snug">Present this ticket on meetup day. Keep dreaming, keep traveling!</p>
                </div>
                <div className="w-16 h-16 bg-white border border-amber-200/60 rounded-xl p-1.5 flex items-center justify-center shrink-0">
                  <QrCode className="w-full h-full text-brand-dark" />
                </div>
              </div>
            </div>

            {/* Success Actions */}
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md mt-2">
              <Link
                href="/admin"
                className="flex-1 px-6 py-3.5 border border-brand-teal hover:bg-brand-teal/5 text-brand-teal font-sans font-bold text-sm rounded-2xl transition-colors text-center"
              >
                Go to Admin view 📊
              </Link>
              <Link
                href="/"
                className="flex-1 px-6 py-3.5 bg-brand-orange hover:bg-brand-orange-hover text-white font-sans font-bold text-sm rounded-2xl transition-all duration-200 shadow-md shadow-brand-orange/20 text-center"
              >
                Back to Explore 🌴
              </Link>
            </div>
          </div>
        ) : (
          /* ================= ACTIVE STEPS FORM ================= */
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 flex flex-col gap-8">
            {/* Step Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-5">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-sans font-bold text-brand-teal uppercase tracking-widest">
                  step {step} of 3
                </span>
                <h3 className="font-display font-extrabold text-lg sm:text-xl text-brand-dark">
                  {step === 1 && "Traveler Details 📝"}
                  {step === 2 && "Vibe Check ✨"}
                  {step === 3 && "Review & Confirm Ticket 🎫"}
                </h3>
              </div>

              {/* Circular step trackers */}
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((num) => (
                  <span
                    key={num}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-display font-extrabold transition-all duration-200 ${
                      step === num
                        ? "bg-brand-orange text-white ring-4 ring-brand-orange/15 scale-105"
                        : step > num
                        ? "bg-brand-teal text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {num}
                  </span>
                ))}
              </div>
            </div>

            {/* STEP 1: TRAVELER DETAILS */}
            {step === 1 && (
              <div className="flex flex-col gap-5 animate-pop">
                {/* Full Name */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="fullName" className="font-display font-bold text-sm text-brand-dark flex items-center gap-1">
                    <User className="w-4 h-4 text-brand-orange" /> Your Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    required
                    placeholder="e.g. Alex Cooper"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 hover:border-amber-200 focus:border-brand-orange rounded-2xl text-sm outline-none transition-all duration-200"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="font-display font-bold text-sm text-brand-dark flex items-center gap-1">
                    <Mail className="w-4 h-4 text-brand-orange" /> Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    placeholder="e.g. alex.cooper@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 hover:border-amber-200 focus:border-brand-orange rounded-2xl text-sm outline-none transition-all duration-200"
                  />
                </div>

                {/* WhatsApp */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="whatsapp" className="font-display font-bold text-sm text-brand-dark flex items-center gap-1">
                    <Phone className="w-4 h-4 text-brand-orange" /> WhatsApp Number (Include Country Code)
                  </label>
                  <input
                    type="tel"
                    id="whatsapp"
                    required
                    placeholder="e.g. +1 555-0199 or +62 812..."
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 hover:border-amber-200 focus:border-brand-orange rounded-2xl text-sm outline-none transition-all duration-200"
                  />
                </div>

                {/* Number of Seats */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="seats" className="font-display font-bold text-sm text-brand-dark flex items-center gap-1">
                    <Users className="w-4 h-4 text-brand-orange" /> Number of Seats (Max 5)
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSeats((prev) => Math.max(1, prev - 1))}
                      className="w-10 h-10 rounded-xl bg-brand-sand-dark hover:bg-gray-200 text-brand-dark font-extrabold flex items-center justify-center cursor-pointer transition-colors"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      id="seats"
                      readOnly
                      value={seats}
                      className="w-16 text-center font-sans font-bold text-base bg-transparent border-none outline-none focus:ring-0"
                    />
                    <button
                      type="button"
                      onClick={() => setSeats((prev) => Math.min(5, prev + 1))}
                      className="w-10 h-10 rounded-xl bg-brand-sand-dark hover:bg-gray-200 text-brand-dark font-extrabold flex items-center justify-center cursor-pointer transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: VIBE CHECK (VISUAL GRID SELECTION) */}
            {step === 2 && (
              <div className="flex flex-col gap-4 animate-pop">
                <p className="text-xs font-sans text-gray-500">
                  Select the travel frequency that speaks to you. We'll group you with similar vibes in the meetup group!
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {vibeOptions.map((vibe) => {
                    const isSelected = selectedVibe === vibe.name;
                    return (
                      <button
                        type="button"
                        key={vibe.name}
                        onClick={() => setSelectedVibe(vibe.name)}
                        className={`p-4 rounded-2xl border text-left flex gap-3.5 transition-all duration-200 cursor-pointer hover:scale-[1.01] ${
                          isSelected
                            ? "border-brand-teal bg-brand-teal/5 ring-2 ring-brand-teal/10 shadow-sm"
                            : "border-gray-100 bg-gray-50/50 hover:border-amber-200"
                        }`}
                      >
                        <span className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-2xl border border-gray-100 shrink-0 shadow-sm">
                          {vibe.icon}
                        </span>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-display font-extrabold text-sm sm:text-base text-brand-dark">
                            {vibe.name}
                          </span>
                          <span className="font-sans text-[11px] leading-relaxed text-gray-500">
                            {vibe.desc}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 3: REVIEW & CONFIRM */}
            {step === 3 && (
              <div className="flex flex-col gap-6 animate-pop">
                {/* Ticket Style Preview */}
                <div className="w-full border border-amber-200 bg-brand-sand/50 rounded-3xl p-5 sm:p-6 flex flex-col gap-4 shadow-sm">
                  <h4 className="font-display font-bold text-sm uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
                    <Ticket className="w-4 h-4 text-brand-orange" /> Ticket Reservation Summary
                  </h4>

                  <div className="flex items-center gap-4 py-2 border-b border-gray-100">
                    <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-xl shrink-0">
                      🌍
                    </div>
                    <div>
                      <span className="text-[10px] font-sans font-medium text-gray-400 block uppercase">selected trip</span>
                      <span className="font-display font-black text-brand-dark text-base sm:text-lg leading-tight">
                        {dest.title}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 font-sans text-xs text-gray-600">
                    <div>
                      <span className="text-gray-400 font-medium block">DATES</span>
                      <span className="font-bold text-brand-dark text-sm">
                        {trip.startDate} - {trip.endDate}, {trip.year}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-medium block">YOUR VIBE</span>
                      <span className="font-bold text-brand-teal text-sm flex items-center gap-1">
                        {vibeOptions.find((v) => v.name === selectedVibe)?.icon} {selectedVibe}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-medium block">TRAVELER</span>
                      <span className="font-bold text-brand-dark text-sm">{fullName}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-medium block">CONTACT INFO</span>
                      <span className="font-bold text-brand-dark text-sm line-clamp-1">{whatsapp} • {email}</span>
                    </div>
                  </div>

                  <div className="mt-2 pt-4 border-t border-dashed border-amber-200 flex items-center justify-between">
                    <div>
                      <span className="font-sans text-xs font-medium text-gray-400">
                        ${dest.price} × {seats} seats
                      </span>
                      <span className="font-display font-black text-2xl text-brand-orange block">
                        ${totalPrice}
                      </span>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-brand-orange/10 text-brand-orange font-sans font-bold text-xs uppercase tracking-wider">
                      All Inclusive
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-4">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-6 py-3.5 border border-gray-200 hover:bg-gray-50 text-gray-600 font-sans font-bold text-sm rounded-2xl cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={step === 1 && !isStep1Valid}
                  className={`px-7 py-3.5 font-sans font-bold text-sm rounded-2xl transition-all duration-200 flex items-center gap-1.5 shadow-md ${
                    step === 1 && !isStep1Valid
                      ? "bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                      : "bg-brand-orange hover:bg-brand-orange-hover text-white hover:scale-105 active:scale-95 shadow-brand-orange/20 cursor-pointer"
                  }`}
                >
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-8 py-3.5 bg-brand-orange hover:bg-brand-orange-hover text-white font-sans font-black text-sm rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-brand-orange/25 cursor-pointer flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 animate-pulse" /> Confirm & Book Spot!
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
