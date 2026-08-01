import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slugs = (searchParams.get("slugs") ?? "")
    .split(",")
    .map((slug) => slug.trim())
    .filter(Boolean)
    .slice(0, 100);

  if (!slugs.length) {
    return NextResponse.json({ entries: [] });
  }

  const entries = await prisma.dictionaryEntry.findMany({
    where: {
      slug: { in: slugs },
      reviewStatus: "APPROVED",
    },
    select: {
      slug: true,
      kweyolWord: true,
      englishTranslation: true,
    },
    orderBy: { kweyolWord: "asc" },
  });

  return NextResponse.json({ entries });
}
