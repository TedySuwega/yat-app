"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  DollarSign,
  Ticket,
  Search,
  Trash2,
  Phone,
  RotateCcw,
  Sparkles,
  Compass,
  FileSpreadsheet,
  CheckCircle,
  ExternalLink,
} from "lucide-react";

interface Booking {
  id: string;
  destinationId: string;
  destinationTitle: string;
  tripId: string;
  tripDates: string;
  fullName: string;
  email: string;
  whatsapp: string;
  seats: number;
  vibe: string;
  totalPrice: number;
  bookedAt: string;
  status: string; // 'confirmed' | 'pinged'
}

export default function AdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDest, setFilterDest] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showNotification, setShowNotification] = useState<string | null>(null);

  // Demo Bookings Data
  const demoBookings: Booking[] = [
    {
      id: "TKT-BALI-2849",
      destinationId: "bali-chill",
      destinationTitle: "Bali Chill Vibes",
      tripId: "bali-oct-10",
      tripDates: "10 Oct - 14 Oct, 2026",
      fullName: "Chloe Jenkins",
      email: "chloe.j@example.com",
      whatsapp: "+62 812-3456-7890",
      seats: 2,
      vibe: "Chill Explorer",
      totalPrice: 698,
      bookedAt: new Date(Date.now() - 3600000 * 4).toLocaleString(),
      status: "pinged",
    },
    {
      id: "TKT-BAJO-8492",
      destinationId: "labuan-bajo",
      destinationTitle: "Labuan Bajo Sailing",
      tripId: "bajo-oct-18",
      tripDates: "18 Oct - 21 Oct, 2026",
      fullName: "Marcus Chen",
      email: "marcus.c@example.com",
      whatsapp: "+1 555-0199",
      seats: 1,
      vibe: "Adrenaline Junkie",
      totalPrice: 549,
      bookedAt: new Date(Date.now() - 3600000 * 24).toLocaleString(),
      status: "confirmed",
    },
    {
      id: "TKT-BROM-4819",
      destinationId: "bromo-sunrise",
      destinationTitle: "Mount Bromo Sunrise",
      tripId: "bromo-nov-02",
      tripDates: "02 Nov - 05 Nov, 2026",
      fullName: "Sarah Connor",
      email: "sarah.c@skyline.org",
      whatsapp: "+44 7911 123456",
      seats: 3,
      vibe: "Adrenaline Junkie",
      totalPrice: 657,
      bookedAt: new Date(Date.now() - 3600000 * 48).toLocaleString(),
      status: "confirmed",
    },
    {
      id: "TKT-JOGJ-9321",
      destinationId: "yogyakarta-culture",
      destinationTitle: "Yogyakarta Cultural Stroll",
      tripId: "jogja-nov-12",
      tripDates: "12 Nov - 15 Nov, 2026",
      fullName: "Daisuke Sato",
      email: "dsato@travel.co.jp",
      whatsapp: "+81 90-1234-5678",
      seats: 1,
      vibe: "Foodie",
      totalPrice: 179,
      bookedAt: new Date(Date.now() - 3600000 * 72).toLocaleString(),
      status: "pinged",
    },
  ];

  // Load bookings from LocalStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("yolo_trips_bookings");
      if (stored) {
        setBookings(JSON.parse(stored));
      } else {
        // Auto-seed with demo data for visual completeness on first visit
        localStorage.setItem("yolo_trips_bookings", JSON.stringify(demoBookings));
        setBookings(demoBookings);
      }
    }
  }, []);

  // Update storage helper
  const updateStorage = (updatedList: Booking[]) => {
    setBookings(updatedList);
    if (typeof window !== "undefined") {
      localStorage.setItem("yolo_trips_bookings", JSON.stringify(updatedList));
    }
  };

  // Simulate WhatsApp Ping Status
  const handlePing = (id: string) => {
    const updated = bookings.map((b) => {
      if (b.id === id) {
        return { ...b, status: b.status === "pinged" ? "confirmed" : "pinged" };
      }
      return b;
    });
    updateStorage(updated);
    showNotice("Booking status updated!");
  };

  // Delete Booking
  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to cancel this booking? This will free up trip slots.")) {
      const filtered = bookings.filter((b) => b.id !== id);
      updateStorage(filtered);
      showNotice("Booking cancelled successfully.");
    }
  };

  // Reset to Demo Data
  const handleResetDemo = () => {
    if (confirm("Reset bookings list to default demo data?")) {
      updateStorage(demoBookings);
      showNotice("Demo bookings reloaded!");
    }
  };

  // Clear All Bookings
  const handleClearAll = () => {
    if (confirm("WARNING: Delete all bookings? This cannot be undone.")) {
      updateStorage([]);
      showNotice("All bookings deleted.");
    }
  };

  // Notification Toast Helper
  const showNotice = (msg: string) => {
    setShowNotification(msg);
    setTimeout(() => setShowNotification(null), 3000);
  };

  // Metric Computations
  const stats = useMemo(() => {
    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
    const totalSeats = bookings.reduce((sum, b) => sum + b.seats, 0);

    // Calculate most popular vibe
    const vibeCounts: { [key: string]: number } = {};
    bookings.forEach((b) => {
      vibeCounts[b.vibe] = (vibeCounts[b.vibe] || 0) + b.seats;
    });
    let topVibe = "N/A";
    let maxCount = 0;
    Object.entries(vibeCounts).forEach(([vibe, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topVibe = vibe;
      }
    });

    return { totalBookings, totalRevenue, totalSeats, topVibe };
  }, [bookings]);

  // Unique list of destinations for dropdown filter
  const uniqueDestTitles = useMemo(() => {
    const set = new Set<string>();
    bookings.forEach((b) => set.add(b.destinationTitle));
    return Array.from(set);
  }, [bookings]);

  // Filtering Logic
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchesSearch =
        b.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDest = filterDest === "All" || b.destinationTitle === filterDest;
      const matchesStatus =
        filterStatus === "All" ||
        (filterStatus === "pinged" && b.status === "pinged") ||
        (filterStatus === "confirmed" && b.status === "confirmed");

      return matchesSearch && matchesDest && matchesStatus;
    });
  }, [bookings, searchQuery, filterDest, filterStatus]);

  return (
    <div className="flex flex-col gap-10 pb-16 animate-pop">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-brand-teal font-sans font-bold text-xs uppercase tracking-wider">Internal testing center</span>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-brand-dark flex items-center gap-2 mt-0.5">
            📊 Trip Registrations
          </h1>
          <p className="text-gray-500 font-sans text-sm">
            View, search, update statuses, or simulate notifications for local testing purposes.
          </p>
        </div>

        {/* Developer controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetDemo}
            className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 font-sans font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Demo Data
          </button>
          <button
            onClick={handleClearAll}
            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-sans font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Wipe Storage
          </button>
        </div>
      </div>

      {/* Notifications Toast */}
      {showNotification && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3.5 bg-brand-dark text-white rounded-2xl shadow-xl flex items-center gap-2 text-sm font-sans font-bold border border-white/10 animate-bounce">
          <CheckCircle className="w-4 h-4 text-brand-teal" /> {showNotification}
        </div>
      )}

      {/* METRIC CARD GRID */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Registrations */}
        <div className="bg-white border border-amber-100 rounded-3xl p-5 sm:p-6 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-brand-orange/10 text-brand-orange flex items-center justify-center shrink-0">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-sans font-bold text-gray-400 uppercase block">bookings</span>
            <span className="text-2xl font-display font-black text-brand-dark">{stats.totalBookings}</span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white border border-amber-100 rounded-3xl p-5 sm:p-6 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-sans font-bold text-gray-400 uppercase block">total revenue</span>
            <span className="text-2xl font-display font-black text-brand-dark">${stats.totalRevenue}</span>
          </div>
        </div>

        {/* Total Seats */}
        <div className="bg-white border border-amber-100 rounded-3xl p-5 sm:p-6 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-brand-teal/10 text-brand-teal flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-sans font-bold text-gray-400 uppercase block">seats sold</span>
            <span className="text-2xl font-display font-black text-brand-dark">{stats.totalSeats}</span>
          </div>
        </div>

        {/* Popular Vibe */}
        <div className="bg-white border border-amber-100 rounded-3xl p-5 sm:p-6 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 text-xl select-none">
            ✨
          </div>
          <div>
            <span className="text-[10px] font-sans font-bold text-gray-400 uppercase block">top travel vibe</span>
            <span className="text-lg font-display font-black text-brand-dark truncate max-w-[160px] block">
              {stats.topVibe}
            </span>
          </div>
        </div>
      </section>

      {/* FILTER & CONTROL CENTER */}
      <section className="bg-white border border-amber-100 rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row items-stretch md:items-center gap-4 shadow-sm">
        {/* Search */}
        <div className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-100 hover:border-amber-200 focus-within:border-brand-orange rounded-2xl flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search traveler name, email, booking code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-xs sm:text-sm font-sans"
          />
        </div>

        {/* Destination Filter */}
        <div className="flex flex-col sm:flex-row gap-3.5">
          <select
            value={filterDest}
            onChange={(e) => setFilterDest(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 border border-gray-100 hover:border-amber-200 rounded-2xl text-xs font-sans font-bold text-gray-600 outline-none cursor-pointer"
          >
            <option value="All">All Spots 🗺️</option>
            {uniqueDestTitles.map((title) => (
              <option key={title} value={title}>
                {title}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 border border-gray-100 hover:border-amber-200 rounded-2xl text-xs font-sans font-bold text-gray-600 outline-none cursor-pointer"
          >
            <option value="All">All Statuses 🚦</option>
            <option value="confirmed">Awaiting Ping 🟠</option>
            <option value="pinged">Pinged 🟢</option>
          </select>
        </div>
      </section>

      {/* REGISTRATIONS TABLE / RESPONSIVE VIEW */}
      <section className="bg-white border border-amber-100 rounded-[2rem] overflow-hidden shadow-sm">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-20 px-6 flex flex-col items-center gap-3">
            <span className="text-4xl">📭</span>
            <h3 className="font-display font-bold text-lg text-brand-dark">No registrations found</h3>
            <p className="text-xs font-sans text-gray-400 max-w-xs leading-normal">
              Either there are no bookings stored in localStorage matching your filter, or you wiped your database!
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setFilterDest("All");
                setFilterStatus("All");
              }}
              className="mt-2 px-4 py-2 bg-brand-teal hover:bg-brand-teal-hover text-white text-xs font-bold font-sans rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Desktop layout: Table, Mobile: Stacked Cards */
          <div>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left font-sans border-collapse">
                <thead>
                  <tr className="bg-brand-sand border-b border-amber-100/50 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Booking Info</th>
                    <th className="px-6 py-4">Traveler Details</th>
                    <th className="px-6 py-4">Destination & Dates</th>
                    <th className="px-6 py-4 text-center">Seats / Vibe</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                  {filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-brand-sand/35 transition-colors">
                      {/* Booking Code & Date */}
                      <td className="px-6 py-4.5">
                        <span className="font-mono font-bold text-brand-dark block">{b.id}</span>
                        <span className="text-[10px] text-gray-400 block mt-0.5">{b.bookedAt}</span>
                      </td>

                      {/* Traveler Contact */}
                      <td className="px-6 py-4.5">
                        <span className="font-bold text-brand-dark block">{b.fullName}</span>
                        <span className="text-[10px] text-gray-400 block mt-0.5">{b.email}</span>
                        <a
                          href={`https://wa.me/${b.whatsapp.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-emerald-600 hover:text-emerald-700 font-bold mt-1 hover:underline"
                        >
                          <Phone className="w-3 h-3 shrink-0" /> {b.whatsapp} <ExternalLink className="w-2 h-2" />
                        </a>
                      </td>

                      {/* Destination Details */}
                      <td className="px-6 py-4.5">
                        <span className="font-bold text-brand-dark block">{b.destinationTitle}</span>
                        <span className="text-[10px] text-gray-400 block mt-0.5">{b.tripDates}</span>
                      </td>

                      {/* Seats and Vibe */}
                      <td className="px-6 py-4.5 text-center">
                        <span className="px-2.5 py-0.5 rounded-full bg-brand-sand-dark text-gray-700 font-bold text-[10px]">
                          {b.seats} seat(s)
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-brand-teal/10 text-brand-teal font-bold text-[10px] block w-fit mx-auto mt-1">
                          {b.vibe}
                        </span>
                      </td>

                      {/* Price Paid */}
                      <td className="px-6 py-4.5 font-display font-black text-brand-orange text-base">
                        ${b.totalPrice}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4.5">
                        <button
                          onClick={() => handlePing(b.id)}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-transform duration-200 active:scale-95 flex items-center gap-1.5 ${
                            b.status === "pinged"
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                              : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            b.status === "pinged" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                          }`}></span>
                          {b.status === "pinged" ? "Pinged" : "Awaiting Ping"}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4.5 text-right">
                        <button
                          onClick={() => handleDelete(b.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                          title="Cancel Booking"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Stack Cards Layout */}
            <div className="grid grid-cols-1 gap-4 p-4 lg:hidden">
              {filteredBookings.map((b) => (
                <div
                  key={b.id}
                  className="p-5 border border-amber-100 rounded-2xl flex flex-col gap-4 bg-gray-50/50"
                >
                  <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                    <div>
                      <span className="font-mono font-bold text-sm text-brand-dark block">{b.id}</span>
                      <span className="text-[10px] text-gray-400">{b.bookedAt}</span>
                    </div>
                    <span className="font-display font-black text-brand-orange text-lg">
                      ${b.totalPrice}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs font-sans text-gray-600">
                    <div>
                      <span className="text-gray-400 font-semibold block uppercase text-[10px]">Traveler</span>
                      <span className="font-bold text-brand-dark">{b.fullName}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-semibold block uppercase text-[10px]">Vibe Match</span>
                      <span className="font-bold text-brand-teal">{b.vibe}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-400 font-semibold block uppercase text-[10px]">Destination</span>
                      <span className="font-bold text-brand-dark">{b.destinationTitle}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-400 font-semibold block uppercase text-[10px]">Dates</span>
                      <span className="font-medium text-brand-dark">{b.tripDates}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-3 border-t border-gray-100 mt-1 flex-wrap justify-between">
                    <a
                      href={`https://wa.me/${b.whatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 border border-emerald-500 hover:bg-emerald-50 text-emerald-600 rounded-xl font-bold text-xs flex items-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5" /> Ping WA
                    </a>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePing(b.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                          b.status === "pinged"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {b.status === "pinged" ? "Pinged" : "Toggle Ping"}
                      </button>

                      <button
                        onClick={() => handleDelete(b.id)}
                        className="p-2 border border-gray-200 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
