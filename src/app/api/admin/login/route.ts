import { NextResponse } from "next/server";
import { z } from "zod";
import {
  adminCookieName,
  createAdminSessionToken,
  validateAdminCredentials,
} from "@/lib/admin/auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid credentials payload" }, { status: 400 });
  }

  if (!validateAdminCredentials(parsed.data.email, parsed.data.password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: adminCookieName(),
    value: createAdminSessionToken(parsed.data.email),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return response;
}
