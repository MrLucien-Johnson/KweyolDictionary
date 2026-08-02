import { NextResponse } from "next/server";
import { adminCookieName } from "@/lib/admin/auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: adminCookieName(),
    value: "",
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return response;
}
