import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { NextResponse } from "next/server";
import { defaultSession, type SessionData, getSessionOptions } from "@/lib/session";

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), getSessionOptions());
}

export async function requireAdmin() {
  const session = await getSession();

  if (!session.isLoggedIn) {
    return {
      session,
      unauthorized: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { session, unauthorized: null };
}

export async function clearSession() {
  const session = await getSession();
  session.adminId = defaultSession.adminId;
  session.email = defaultSession.email;
  session.isLoggedIn = defaultSession.isLoggedIn;
  await session.destroy();
}
