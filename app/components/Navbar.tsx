"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Calendar, ShieldAlert, Menu, X, Sparkles } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: "Explore", href: "/", icon: Compass },
    { name: "Open Trips", href: "/#open-trips", icon: Calendar },
    { name: "Admin Dashboard", href: "/admin", icon: ShieldAlert },
  ];

  return (
    <header className="sticky top-0 z-50 w-full px-4 sm:px-6 lg:px-8 pt-4 pb-2">
      <nav className="mx-auto max-w-7xl rounded-3xl bg-white/70 border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] backdrop-blur-md transition-all duration-300">
        <div className="px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl font-bold font-display tracking-tight text-brand-dark flex items-center gap-1.5 transition-transform duration-300 group-hover:scale-105">
              YoloTrips <span className="animate-bounce">🌴</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-1.5 font-sans font-medium text-sm transition-all duration-200 hover:text-brand-orange hover:scale-105 ${
                    isActive ? "text-brand-orange font-semibold" : "text-gray-600"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Action Button */}
          <div className="hidden md:flex items-center">
            <Link
              href="/#open-trips"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full font-sans font-semibold text-sm bg-brand-orange text-white hover:bg-brand-orange-hover hover:scale-105 active:scale-95 transition-all duration-200 shadow-md shadow-brand-orange/20"
            >
              <Sparkles className="w-4 h-4 animate-pulse" />
              Join a Trip
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-brand-orange transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isOpen && (
          <div className="md:hidden px-6 pb-6 pt-2 border-t border-gray-100/50 flex flex-col gap-4 animate-pop">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 py-3 px-4 rounded-2xl font-sans font-medium text-base transition-colors ${
                    isActive
                      ? "bg-brand-orange/10 text-brand-orange font-semibold"
                      : "text-gray-600 hover:bg-gray-50 hover:text-brand-orange"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {link.name}
                </Link>
              );
            })}
            <Link
              href="/#open-trips"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 py-3.5 mt-2 rounded-2xl font-sans font-bold text-center bg-brand-orange text-white hover:bg-brand-orange-hover transition-colors shadow-md shadow-brand-orange/20"
            >
              <Sparkles className="w-5 h-5 animate-pulse" />
              Join a Trip
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
