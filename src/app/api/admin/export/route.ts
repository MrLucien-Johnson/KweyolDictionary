import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const entries = await prisma.dictionaryEntry.findMany({
    include: {
      examples: true,
      adultPresentation: true,
      childPresentation: true,
      categories: { include: { category: true } },
    },
    orderBy: { kweyolWord: "asc" },
  });

  return new NextResponse(JSON.stringify({ exportedAt: new Date().toISOString(), entries }, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="kweyol-dictionary-export.json"',
    },
  });
}
