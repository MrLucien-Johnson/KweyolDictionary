import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import {
  isUserRole,
  type UserRoleValue,
} from "@/lib/constants/roles";

const COOKIE_NAME = "kweyol_admin_session";

export type AdminSession = {
  email: string;
  role: UserRoleValue;
};

type AdminUserRecord = {
  email: string;
  password: string;
  role?: string;
};

function secret() {
  return process.env.ADMIN_SESSION_SECRET || "dev-only-change-me";
}

function parseAdminUsersJson(): AdminUserRecord[] {
  const raw = process.env.ADMIN_USERS_JSON;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (row): row is AdminUserRecord =>
        typeof row === "object" &&
        row !== null &&
        typeof (row as AdminUserRecord).email === "string" &&
        typeof (row as AdminUserRecord).password === "string",
    );
  } catch {
    return [];
  }
}

export function resolveAdminRole(email: string): UserRoleValue {
  const fromMap = parseAdminUsersJson().find(
    (row) => row.email.toLowerCase() === email.toLowerCase(),
  );
  if (fromMap?.role && isUserRole(fromMap.role)) {
    return fromMap.role;
  }

  const singleEmail = process.env.ADMIN_EMAIL || "editor@example.com";
  if (email.toLowerCase() === singleEmail.toLowerCase()) {
    const envRole = process.env.ADMIN_ROLE;
    if (envRole && isUserRole(envRole)) return envRole;
    return "ADMINISTRATOR";
  }

  return "CONTRIBUTOR";
}

export function createAdminSessionToken(email: string, role: UserRoleValue) {
  const payload = Buffer.from(JSON.stringify({ email, role })).toString(
    "base64url",
  );
  const signature = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifyAdminSessionToken(
  token: string | undefined,
): AdminSession | null {
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
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      email?: string;
      role?: string;
    };
    if (!parsed.email || typeof parsed.email !== "string") return null;
    const role =
      parsed.role && isUserRole(parsed.role)
        ? parsed.role
        : resolveAdminRole(parsed.email);
    return { email: parsed.email, role };
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const jar = await cookies();
  return verifyAdminSessionToken(jar.get(COOKIE_NAME)?.value);
}

export function adminCookieName() {
  return COOKIE_NAME;
}

/**
 * Validates against ADMIN_USERS_JSON (multi-user) or the legacy single
 * ADMIN_EMAIL / ADMIN_PASSWORD pair. Returns the session identity on success.
 */
export function validateAdminCredentials(
  email: string,
  password: string,
): AdminSession | null {
  const users = parseAdminUsersJson();
  if (users.length > 0) {
    const match = users.find(
      (row) =>
        row.email.toLowerCase() === email.toLowerCase() &&
        row.password === password,
    );
    if (!match) return null;
    const role =
      match.role && isUserRole(match.role)
        ? match.role
        : resolveAdminRole(match.email);
    return { email: match.email, role };
  }

  const expectedEmail = process.env.ADMIN_EMAIL || "editor@example.com";
  const expectedPassword = process.env.ADMIN_PASSWORD || "changeme";
  if (email !== expectedEmail || password !== expectedPassword) {
    return null;
  }
  return { email, role: resolveAdminRole(email) };
}
