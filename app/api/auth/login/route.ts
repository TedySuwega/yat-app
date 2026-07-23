import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { getSession } from "@/lib/auth";
import { LoginSchema, formatZodErrors } from "@/lib/validations";

interface DbAdminUser {
  id: number;
  email: string;
  password_hash: string;
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: formatZodErrors(parsed.error) },
      { status: 400 }
    );
  }

  const { email, password } = parsed.data;

  const db = getDb();
  const admin = db
    .prepare("SELECT id, email, password_hash FROM admin_users WHERE email = ?")
    .get(email.toLowerCase()) as DbAdminUser | undefined;

  if (!admin || !verifyPassword(password, admin.password_hash)) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const session = await getSession();
  session.adminId = admin.id;
  session.email = admin.email;
  session.isLoggedIn = true;
  await session.save();

  return NextResponse.json({ success: true, email: admin.email });
}
