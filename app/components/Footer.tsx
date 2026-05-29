"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="w-full bg-brand-dark text-white rounded-t-[2.5rem] mt-auto">
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-16 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
          {/* Brand Col */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold font-display tracking-tight text-white flex items-center gap-1.5">
                YoloTrips 🌴
              </span>
            </Link>
            <p className="text-gray-400 font-sans text-sm leading-relaxed max-w-sm">
              We curate super chill, epic, and culture-packed trips for Gen Z & millennial travelers. No boring tour buses. No rigid schedules. Just absolute vibes.
            </p>
            <div className="flex items-center gap-4 mt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-brand-orange hover:text-white flex items-center justify-center transition-all duration-200 hover:scale-110"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-brand-orange hover:text-white flex items-center justify-center transition-all duration-200 hover:scale-110 font-bold font-sans text-sm"
              >
                🎵
              </a>
              <a
                href="https://whatsapp.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-brand-orange hover:text-white flex items-center justify-center transition-all duration-200 hover:scale-110 font-bold font-sans text-sm"
              >
                💬
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-4">
            <h3 className="font-display font-semibold text-lg text-white">Vibe Links</h3>
            <div className="grid grid-cols-2 gap-3 text-sm font-sans text-gray-400">
              <Link href="/" className="hover:text-brand-orange transition-colors">Explore Spots</Link>
              <Link href="/#open-trips" className="hover:text-brand-orange transition-colors">Open Trips</Link>
              <Link href="/admin" className="hover:text-brand-orange transition-colors">Admin View</Link>
              <a href="#about" className="hover:text-brand-orange transition-colors">About Us</a>
              <a href="#faqs" className="hover:text-brand-orange transition-colors">Trip FAQs</a>
              <a href="#reviews" className="hover:text-brand-orange transition-colors">Vibe Checks</a>
            </div>
          </div>

          {/* Newsletter / Spam */}
          <div className="flex flex-col gap-4">
            <h3 className="font-display font-semibold text-lg text-white">Join the Newsletter 📬</h3>
            <p className="text-gray-400 font-sans text-sm leading-relaxed">
              Get notified of secret low-cost slots, new itineraries, and travel discounts. No spam, we swear!
            </p>
            <form onSubmit={handleSubscribe} className="relative mt-2">
              <input
                type="email"
                required
                placeholder="enter your cool email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-4 pr-12 py-3 bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/10 rounded-2xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all duration-200"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 px-3.5 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-xl flex items-center justify-center transition-colors cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
            {subscribed && (
              <span className="text-brand-teal text-xs font-semibold animate-pulse">
                Awesome! Check your inbox soon for good vibes. ✨
              </span>
            )}
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans text-gray-500">
          <p>© {new Date().getFullYear()} YoloTrips. Made for travelers, by travelers.</p>
          <p className="flex items-center gap-1">
            Build with <Heart className="w-3.5 h-3.5 text-brand-orange fill-brand-orange animate-pulse" /> for wanderlust souls.
          </p>
        </div>
      </div>
    </footer>
  );
}
