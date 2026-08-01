import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "kweyol_admin_session";

function secret() {
  return process.env.ADMIN_SESSION_SECRET || "dev-only-change-me";
}

export function createAdminSessionToken(email: string) {
  const payload = Buffer.from(JSON.stringify({ email, role: "ADMINISTRATOR" })).toString(
    "base64url",
  );
  const signature = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifyAdminSessionToken(token: string | undefined) {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = createHmac("sha256", secret()).update(payload).digest("base64url");
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) {
    return null;
  }
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      email: string;
      role: string;
    };
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const jar = await cookies();
  return verifyAdminSessionToken(jar.get(COOKIE_NAME)?.value);
}

export function adminCookieName() {
  return COOKIE_NAME;
}

export function validateAdminCredentials(email: string, password: string) {
  const expectedEmail = process.env.ADMIN_EMAIL || "editor@example.com";
  const expectedPassword = process.env.ADMIN_PASSWORD || "changeme";
  return email === expectedEmail && password === expectedPassword;
}
