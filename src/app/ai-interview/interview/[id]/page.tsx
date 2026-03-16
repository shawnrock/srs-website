"use client";
import { use } from "react";
import dynamic from "next/dynamic";

const InterviewerDashboard = dynamic(() => import("@/components/interview/InterviewerDashboard"), { ssr: false });

export default function InterviewerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <InterviewerDashboard sessionId={id} />;
}
