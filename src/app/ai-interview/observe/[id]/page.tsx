"use client";
import { use } from "react";
import dynamic from "next/dynamic";

const ObserverDashboard = dynamic(() => import("@/components/interview/ObserverDashboard"), { ssr: false });

export default function ObservePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ObserverDashboard sessionId={id} />;
}
