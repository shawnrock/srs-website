"use client";
import { use, useEffect } from "react";
import { useRouter } from "next/navigation";

// Legacy URL — redirect to the new interviewer route
export default function ObserveLegacyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  useEffect(() => { router.replace(`/ai-interview/interview/${id}`); }, [id, router]);
  return null;
}
