import type { SessionOptions } from "iron-session";

export interface SessionData {
  adminId: number;
  email: string;
  isLoggedIn: boolean;
}

export const defaultSession: SessionData = {
  adminId: 0,
  email: "",
  isLoggedIn: false,
};

function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "ADMIN_SESSION_SECRET must be set in .env.local and be at least 32 characters"
    );
  }
  return secret;
}

export function getSessionOptions(): SessionOptions {
  return {
    password: getSessionSecret(),
    cookieName: "yolotrips_admin_session",
    ttl: 60 * 60 * 24 * 7,
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    },
  };
}
