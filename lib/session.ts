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

const FALLBACK_SECRET = "dev-secret-key-min-32-chars-long-yolotrips-production-fallback!!";

function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (secret && secret.length >= 32) {
    return secret;
  }
  // Safe fallback if environment variable is not defined in deployment/preview
  return FALLBACK_SECRET;
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
