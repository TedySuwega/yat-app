"use client";

import React, { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldAlert, LogIn, Sparkles } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Read the live form values. Browser autofill fills the inputs without
    // updating React state, so the controlled state can still be empty.
    const formData = new FormData(e.currentTarget);
    const emailValue = String(formData.get("email") ?? "");
    const passwordValue = String(formData.get("password") ?? "");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailValue, password: passwordValue }),
      });

      const raw = await res.text();
      let data: { error?: string } = {};
      try {
        data = raw ? (JSON.parse(raw) as { error?: string }) : {};
      } catch {
        setError("The server returned an unexpected response. Please try again.");
        return;
      }

      if (!res.ok) {
        setError(data.error || "Login failed. Please try again.");
        return;
      }
    } catch {
      setError("Network error. Please try again.");
      return;
    } finally {
      setLoading(false);
    }

    router.push(from);
    router.refresh();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white/80 backdrop-blur-md border border-white/60 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.08)] p-8 flex flex-col gap-5"
    >
      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-sans font-medium">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="font-display font-bold text-sm text-brand-dark">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white font-sans text-sm text-brand-dark placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all"
          placeholder="admin@yolotrips.com"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="font-display font-bold text-sm text-brand-dark">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white font-sans text-sm text-brand-dark placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-2 w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-sans font-bold text-sm bg-brand-orange text-white hover:bg-brand-orange-hover disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-md shadow-brand-orange/20"
      >
        {loading ? (
          "Signing in..."
        ) : (
          <>
            <LogIn className="w-4 h-4" />
            Sign In
          </>
        )}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-[70vh] animate-pop">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-orange/10 text-brand-orange mb-4">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <span className="text-brand-teal font-sans font-bold text-xs uppercase tracking-wider">
            Crew access only
          </span>
          <h1 className="font-display font-black text-3xl text-brand-dark mt-1">
            Admin Login
          </h1>
          <p className="text-gray-500 font-sans text-sm mt-2">
            Sign in to manage trip registrations and booking statuses.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-3xl p-8 text-center text-gray-500 font-sans text-sm animate-pulse">
              Loading login form...
            </div>
          }
        >
          <LoginForm />
        </Suspense>

        <p className="text-center text-gray-400 font-sans text-xs mt-6 flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3" />
          YoloTrips internal dashboard
        </p>
      </div>
    </div>
  );
}
