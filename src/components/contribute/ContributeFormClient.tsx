"use client";

import { useSearchParams } from "next/navigation";
import { ContributeForm } from "@/components/contribute/ContributeForm";

export function ContributeFormClient({ issuesUrl }: { issuesUrl: string }) {
  const searchParams = useSearchParams();
  return (
    <ContributeForm
      issuesUrl={issuesUrl}
      defaultEntry={searchParams.get("entry") ?? undefined}
      defaultType={searchParams.get("type") ?? undefined}
    />
  );
}
