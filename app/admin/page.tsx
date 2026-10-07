"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
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
  CheckCircle,
  ExternalLink,
  LogOut,
  Upload,
  Image as ImageIcon,
  Copy,
  Check,
  Send,
  Loader2,
  FileImage,
} from "lucide-react";
import { useRouter } from "next/navigation";

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
  status: string;
}

interface UploadedMedia {
  url: string;
  filename: string;
  width: number;
  height: number;
  size: number;
  format: string;
  uploadedAt: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"bookings" | "media">("bookings");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDest, setFilterDest] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showNotification, setShowNotification] = useState<string | null>(null);

  // Ping loading state
  const [pingingId, setPingingId] = useState<string | null>(null);

  // Media Upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [recentUploads, setRecentUploads] = useState<UploadedMedia[]>([
    {
      url: "/images/destinations/chill/bali-chill.jpg",
      filename: "bali-chill.jpg",
      width: 1200,
      height: 800,
      size: 142000,
      format: "jpg",
      uploadedAt: "Default Asset",
    },
    {
      url: "/images/destinations/adventure/komodo-sailing.jpg",
      filename: "komodo-sailing.jpg",
      width: 1200,
      height: 800,
      size: 189000,
      format: "jpg",
      uploadedAt: "Default Asset",
    },
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/bookings");
      if (res.status === 401) {
        router.push("/login?from=/admin");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setBookings(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  // WhatsApp Automated Ping via Fonnte API
  const handleAutomatedPing = async (id: string) => {
    const booking = bookings.find((b) => b.id === id);
    if (!booking) return;

    setPingingId(id);
    try {
      const res = await fetch(`/api/bookings/${id}/ping`, {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: "pinged" } : b))
        );
        const isMock = data?.whatsapp?.isMock;
        showNotice(
          isMock
            ? `[MOCK] WhatsApp simulated to ${booking.fullName}!`
            : `WhatsApp sent via Fonnte to ${booking.fullName}!`
        );
      } else {
        showNotice("Could not send automated ping. Please try again.");
      }
    } catch (err) {
      console.error(err);
      showNotice("Network error sending WhatsApp ping.");
    } finally {
      setPingingId(null);
    }
  };

  // Toggle manual status
  const handleToggleStatus = async (id: string) => {
    const booking = bookings.find((b) => b.id === id);
    if (!booking) return;

    const newStatus = booking.status === "pinged" ? "confirmed" : "pinged";

    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        const updated = await res.json();
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: updated.status } : b))
        );
        showNotice("Booking status updated!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Booking
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to cancel this booking? This will restore trip slots.")) {
      try {
        const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
        if (res.ok) {
          setBookings((prev) => prev.filter((b) => b.id !== id));
          showNotice("Booking cancelled successfully.");
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Notification Toast Helper
  const showNotice = (msg: string) => {
    setShowNotification(msg);
    setTimeout(() => setShowNotification(null), 3500);
  };

  // Image file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setUploadError(null);
    }
  };

  // Handle image upload with Sharp optimization
  const handleUploadImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setUploadError(data.error || "Upload failed");
        return;
      }

      const newMedia: UploadedMedia = {
        url: data.url,
        filename: data.filename,
        width: data.width || 1200,
        height: data.height || 800,
        size: data.size || 0,
        format: data.format || "webp",
        uploadedAt: new Date().toLocaleTimeString(),
      };

      setRecentUploads((prev) => [newMedia, ...prev]);
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      showNotice("Image optimized with Sharp (1200x800 WebP) and uploaded!");
    } catch (err: any) {
      setUploadError(err.message || "Network error while uploading image");
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(text);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  // Metric Computations
  const stats = useMemo(() => {
    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const totalSeats = bookings.reduce((sum, b) => sum + (b.seats || 0), 0);

    const vibeCounts: { [key: string]: number } = {};
    bookings.forEach((b) => {
      if (b.vibe) {
        vibeCounts[b.vibe] = (vibeCounts[b.vibe] || 0) + (b.seats || 1);
      }
    });
    let topVibe = "Chill Explorer";
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
    bookings.forEach((b) => {
      if (b.destinationTitle) set.add(b.destinationTitle);
    });
    return Array.from(set);
  }, [bookings]);

  // Filtering Logic
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchesSearch =
        (b.fullName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.email || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDest = filterDest === "All" || b.destinationTitle === filterDest;
      const matchesStatus =
        filterStatus === "All" ||
        (filterStatus === "pinged" && b.status === "pinged") ||
        (filterStatus === "confirmed" && b.status === "confirmed");

      return matchesSearch && matchesDest && matchesStatus;
    });
  }, [bookings, searchQuery, filterDest, filterStatus]);

  const formatBookedAt = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-brand-teal" />
        <p className="text-gray-500 font-sans text-sm">Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-brand-teal font-sans font-bold text-xs uppercase tracking-wider">
            YoloTrips Management Console
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-brand-dark flex items-center gap-2 mt-0.5">
            ⚡ Admin Operations
          </h1>
          <p className="text-gray-500 font-sans text-sm">
            Manage registrations, automated WhatsApp pings (Fonnte), and media uploads (Sharp).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadBookings}
            className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 font-sans font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 border border-red-100 hover:bg-red-50 text-red-600 font-sans font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </div>

      {/* TAB SELECTOR */}
      <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
        <button
          onClick={() => setActiveTab("bookings")}
          className={`px-5 py-2.5 rounded-2xl font-sans font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "bookings"
              ? "bg-brand-dark text-white shadow-md"
              : "text-gray-500 hover:bg-gray-100"
          }`}
        >
          <Ticket className="w-4 h-4" /> Bookings & Registrations ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab("media")}
          className={`px-5 py-2.5 rounded-2xl font-sans font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "media"
              ? "bg-brand-teal text-white shadow-md shadow-brand-teal/20"
              : "text-gray-500 hover:bg-gray-100"
          }`}
        >
          <Upload className="w-4 h-4" /> Media Manager (Sharp 1200x800)
        </button>
      </div>

      {/* Notifications Toast */}
      {showNotification && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3.5 bg-brand-dark text-white rounded-2xl shadow-xl flex items-center gap-2 text-sm font-sans font-bold border border-white/10 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-brand-teal shrink-0" /> {showNotification}
        </div>
      )}

      {/* ────────────────── TAB 1: BOOKINGS & REGISTRATIONS ────────────────── */}
      {activeTab === "bookings" && (
        <>
          {/* METRIC CARD GRID */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-amber-100 rounded-3xl p-5 sm:p-6 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-brand-orange/10 text-brand-orange flex items-center justify-center shrink-0">
                <Ticket className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-sans font-bold text-gray-400 uppercase block">bookings</span>
                <span className="text-2xl font-display font-black text-brand-dark">{stats.totalBookings}</span>
              </div>
            </div>

            <div className="bg-white border border-amber-100 rounded-3xl p-5 sm:p-6 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-sans font-bold text-gray-400 uppercase block">total revenue</span>
                <span className="text-2xl font-display font-black text-brand-dark">${stats.totalRevenue}</span>
              </div>
            </div>

            <div className="bg-white border border-amber-100 rounded-3xl p-5 sm:p-6 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-brand-teal/10 text-brand-teal flex items-center justify-center shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-sans font-bold text-gray-400 uppercase block">seats sold</span>
                <span className="text-2xl font-display font-black text-brand-dark">{stats.totalSeats}</span>
              </div>
            </div>

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

          {/* REGISTRATIONS TABLE */}
          <section className="bg-white border border-amber-100 rounded-[2rem] overflow-hidden shadow-sm">
            {filteredBookings.length === 0 ? (
              <div className="text-center py-20 px-6 flex flex-col items-center gap-3">
                <span className="text-4xl">📭</span>
                <h3 className="font-display font-bold text-lg text-brand-dark">No registrations found</h3>
                <p className="text-xs font-sans text-gray-400 max-w-xs leading-normal">
                  No bookings match your filter, or database has no records.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setFilterDest("All");
                    setFilterStatus("All");
                  }}
                  className="mt-2 px-4 py-2 bg-brand-teal hover:bg-brand-teal-hover text-white text-xs font-bold font-sans rounded-xl cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div>
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-left font-sans border-collapse">
                    <thead>
                      <tr className="bg-brand-sand border-b border-amber-100/50 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        <th className="px-6 py-4">Booking Info</th>
                        <th className="px-6 py-4">Traveler Contact</th>
                        <th className="px-6 py-4">Destination & Dates</th>
                        <th className="px-6 py-4 text-center">Seats / Vibe</th>
                        <th className="px-6 py-4">Price</th>
                        <th className="px-6 py-4">WhatsApp Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                      {filteredBookings.map((b) => {
                        const isPinging = pingingId === b.id;
                        return (
                          <tr key={b.id} className="hover:bg-brand-sand/35 transition-colors">
                            <td className="px-6 py-4.5">
                              <span className="font-mono font-bold text-brand-dark block">{b.id}</span>
                              <span className="text-[10px] text-gray-400 block mt-0.5">{formatBookedAt(b.bookedAt)}</span>
                            </td>

                            <td className="px-6 py-4.5">
                              <span className="font-bold text-brand-dark block">{b.fullName}</span>
                              <span className="text-[10px] text-gray-400 block mt-0.5">{b.email}</span>
                              <div className="flex items-center gap-2 mt-1">
                                <a
                                  href={`https://wa.me/${(b.whatsapp || "").replace(/\D/g, "")}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-[10px] text-emerald-600 hover:text-emerald-700 font-bold hover:underline"
                                  title="Open in WhatsApp Web"
                                >
                                  <Phone className="w-3 h-3 shrink-0" /> {b.whatsapp} <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              </div>
                            </td>

                            <td className="px-6 py-4.5">
                              <span className="font-bold text-brand-dark block">{b.destinationTitle}</span>
                              <span className="text-[10px] text-gray-400 block mt-0.5">{b.tripDates}</span>
                            </td>

                            <td className="px-6 py-4.5 text-center">
                              <span className="px-2.5 py-0.5 rounded-full bg-brand-sand-dark text-gray-700 font-bold text-[10px]">
                                {b.seats} seat(s)
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full bg-brand-teal/10 text-brand-teal font-bold text-[10px] block w-fit mx-auto mt-1">
                                {b.vibe}
                              </span>
                            </td>

                            <td className="px-6 py-4.5 font-display font-black text-brand-orange text-base">
                              ${b.totalPrice}
                            </td>

                            <td className="px-6 py-4.5">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleToggleStatus(b.id)}
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-transform duration-200 active:scale-95 flex items-center gap-1.5 ${
                                    b.status === "pinged"
                                      ? "bg-emerald-100 text-emerald-700"
                                      : "bg-amber-100 text-amber-700"
                                  }`}
                                  title="Click to toggle status manually"
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                      b.status === "pinged" ? "bg-emerald-500" : "bg-amber-500"
                                    }`}
                                  />
                                  {b.status === "pinged" ? "Pinged" : "Awaiting"}
                                </button>
                              </div>
                            </td>

                            <td className="px-6 py-4.5 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleAutomatedPing(b.id)}
                                  disabled={isPinging}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                                    b.status === "pinged"
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                                      : "bg-brand-teal text-white hover:bg-brand-teal-hover shadow-sm"
                                  }`}
                                  title="Send automated message via Fonnte API"
                                >
                                  {isPinging ? (
                                    <>
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Pinging...
                                    </>
                                  ) : (
                                    <>
                                      <Send className="w-3.5 h-3.5" /> {b.status === "pinged" ? "Re-Ping WA" : "Auto Ping WA"}
                                    </>
                                  )}
                                </button>

                                <button
                                  onClick={() => handleDelete(b.id)}
                                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                                  title="Cancel Booking"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Stack Cards Layout */}
                <div className="grid grid-cols-1 gap-4 p-4 lg:hidden">
                  {filteredBookings.map((b) => {
                    const isPinging = pingingId === b.id;
                    return (
                      <div
                        key={b.id}
                        className="p-5 border border-amber-100 rounded-2xl flex flex-col gap-4 bg-gray-50/50"
                      >
                        <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                          <div>
                            <span className="font-mono font-bold text-sm text-brand-dark block">{b.id}</span>
                            <span className="text-[10px] text-gray-400">{formatBookedAt(b.bookedAt)}</span>
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

                        <div className="flex items-center gap-2 pt-3 border-t border-gray-100 mt-1 flex-wrap justify-between">
                          <button
                            onClick={() => handleAutomatedPing(b.id)}
                            disabled={isPinging}
                            className="px-3.5 py-2 bg-brand-teal hover:bg-brand-teal-hover text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            {isPinging ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                            Auto Ping WA (Fonnte)
                          </button>

                          <div className="flex items-center gap-2">
                            <a
                              href={`https://wa.me/${(b.whatsapp || "").replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 border border-emerald-500 hover:bg-emerald-50 text-emerald-600 rounded-xl"
                              title="Direct wa.me link"
                            >
                              <Phone className="w-4 h-4" />
                            </a>

                            <button
                              onClick={() => handleDelete(b.id)}
                              className="p-2 border border-gray-200 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        </>
      )}

      {/* ────────────────── TAB 2: MEDIA MANAGER (SHARP) ────────────────── */}
      {activeTab === "media" && (
        <section className="flex flex-col gap-8 animate-fade-in">
          {/* Upload Box Card */}
          <div className="bg-white border border-amber-100 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
              <div>
                <span className="px-3 py-1 rounded-full bg-brand-teal/10 text-brand-teal font-sans font-bold text-[10px] uppercase tracking-wider inline-block mb-1.5">
                  Sharp Image Pipeline
                </span>
                <h2 className="font-display font-black text-2xl text-brand-dark">
                  🖼️ Upload & Optimize Destination Images
                </h2>
                <p className="text-gray-500 font-sans text-xs sm:text-sm mt-1 max-w-xl">
                  Images uploaded here are automatically processed on the server using <span className="font-bold text-brand-teal">Sharp</span>, resized to standard <span className="font-bold text-brand-dark">1200x800px</span> with center focal crop and converted to lightweight WebP format.
                </p>
              </div>
            </div>

            <form onSubmit={handleUploadImage} className="flex flex-col gap-6">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 hover:border-brand-teal rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-gray-50/50 hover:bg-brand-teal/5 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {previewUrl ? (
                  <div className="flex flex-col items-center gap-4">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-64 h-40 object-cover rounded-2xl shadow-md border-2 border-brand-teal"
                    />
                    <div className="text-xs font-sans text-gray-600">
                      <span className="font-bold text-brand-dark">{selectedFile?.name}</span> (
                      {selectedFile ? (selectedFile.size / 1024).toFixed(1) : 0} KB)
                    </div>
                    <span className="text-xs text-brand-teal font-bold underline">Click to choose another photo</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-brand-teal/10 text-brand-teal flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Upload className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="font-display font-bold text-base text-brand-dark">
                        Click or drag destination image here
                      </p>
                      <p className="text-xs text-gray-400 font-sans mt-0.5">
                        Supports JPEG, PNG, WebP (Max 10MB) • Resized to 1200x800 WebP
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {uploadError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs font-sans text-red-600 font-medium">
                  {uploadError}
                </div>
              )}

              <div className="flex justify-end gap-3">
                {selectedFile && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="px-5 py-2.5 border border-gray-200 rounded-xl text-xs font-sans font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                  >
                    Clear
                  </button>
                )}

                <button
                  type="submit"
                  disabled={!selectedFile || uploading}
                  className={`px-6 py-2.5 rounded-xl text-xs font-sans font-bold flex items-center gap-2 cursor-pointer transition-all ${
                    !selectedFile || uploading
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-brand-teal hover:bg-brand-teal-hover text-white shadow-md shadow-brand-teal/20"
                  }`}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Processing with Sharp...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Upload & Optimize Image
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Recent Images Gallery */}
          <div className="bg-white border border-amber-100 rounded-3xl p-6 sm:p-8 shadow-sm">
            <h3 className="font-display font-bold text-lg text-brand-dark flex items-center gap-2 mb-4">
              <FileImage className="w-5 h-5 text-brand-teal" /> Media Assets Library
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {recentUploads.map((media, idx) => (
                <div
                  key={idx}
                  className="border border-gray-100 rounded-2xl p-3 flex flex-col gap-3 bg-gray-50/50 hover:border-brand-teal/40 transition-colors"
                >
                  <div className="relative w-full h-44 rounded-xl overflow-hidden bg-gray-100">
                    <img
                      src={media.url}
                      alt={media.filename}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[9px] font-mono">
                      {media.width}x{media.height} • {media.format.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-xs font-sans">
                      <span className="font-bold text-brand-dark truncate max-w-[170px]" title={media.filename}>
                        {media.filename}
                      </span>
                      <span className="text-[10px] text-gray-400">{(media.size / 1024).toFixed(1)} KB</span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-1">
                      <input
                        type="text"
                        readOnly
                        value={media.url}
                        className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1 text-[10px] font-mono text-gray-500 outline-none"
                      />
                      <button
                        onClick={() => copyToClipboard(media.url)}
                        className="p-1.5 bg-white border border-gray-200 hover:border-brand-teal text-gray-600 rounded-lg cursor-pointer transition-colors shrink-0"
                        title="Copy image URL"
                      >
                        {copiedUrl === media.url ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
