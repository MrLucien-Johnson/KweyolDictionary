import { NextResponse } from "next/server";
import { getAdminSession, type AdminSession } from "@/lib/admin/auth";
import {
  canAcceptTextSubmissions,
  canApproveEntries,
  canEditEntries,
  canReviewAudio,
  type UserRoleValue,
} from "@/lib/constants/roles";

export type SessionResult =
  | { ok: true; session: AdminSession }
  | { ok: false; response: NextResponse };

export async function requireAdminSession(): Promise<SessionResult> {
  const session = await getAdminSession();
  if (!session) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { ok: true, session };
}

export function forbid(message: string) {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function requireCanEdit(session: AdminSession): NextResponse | null {
  if (!canEditEntries(session.role)) {
    return forbid("Your role cannot edit dictionary entries.");
  }
  return null;
}

export function requireCanApprove(session: AdminSession): NextResponse | null {
  if (!canApproveEntries(session.role)) {
    return forbid("Your role cannot approve entries for public visibility.");
  }
  return null;
}

export function requireCanAcceptSubmission(
  session: AdminSession,
  type: string,
): NextResponse | null {
  if (type === "AUDIO") {
    if (!canReviewAudio(session.role)) {
      return forbid("Your role cannot accept audio submissions.");
    }
    return null;
  }
  if (!canAcceptTextSubmissions(session.role)) {
    return forbid("Your role cannot accept community submissions.");
  }
  return null;
}

/** Block setting APPROVED unless the actor may approve. */
export function requireApprovalPermission(
  session: AdminSession,
  nextStatus: string,
  previousStatus?: string,
): NextResponse | null {
  if (nextStatus !== "APPROVED") return null;
  if (previousStatus === "APPROVED") return null;
  return requireCanApprove(session);
}

export function sessionRoleLabel(role: UserRoleValue) {
  return role;
}
