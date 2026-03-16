"use client";
import { use } from "react";
import dynamic from "next/dynamic";

const InterviewRoom = dynamic(() => import("@/components/interview/InterviewRoom"), { ssr: false });

export default function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <InterviewRoom sessionId={id} />;
}
