import { NextResponse } from 'next/server';
import { archiveStore } from '@/lib/interview-archive';

// GET /api/admin/reports
// Only returns interviews that are fully completed with a generated AI report.
// Scheduled, waiting, or in-progress sessions are excluded intentionally.
export async function GET() {
  try {
    const [all, interviewerStats] = await Promise.all([
      archiveStore.getAll(500),
      archiveStore.getInterviewerStats(),
    ]);

    const now = Date.now();
    const thisMonth = all.filter(r => now - new Date(r.interviewDate).getTime() < 30 * 86400000).length;
    const thisWeek  = all.filter(r => now - new Date(r.interviewDate).getTime() <  7 * 86400000).length;
    const scoredItems = all.filter(r => (r.overallScore || 0) > 0);
    const avgScore  = scoredItems.length
      ? Math.round(scoredItems.reduce((s, r) => s + r.overallScore, 0) / scoredItems.length)
      : 0;
    const durItems = all.filter(r => (r.interviewDurationMinutes || 0) > 0);
    const avgDur = durItems.length
      ? Math.round(durItems.reduce((s, r) => s + r.interviewDurationMinutes, 0) / durItems.length)
      : 0;

    return NextResponse.json({
      overview: { total: all.length, thisMonth, thisWeek, avgScore, avgDurationMinutes: avgDur },
      interviewers: interviewerStats,
      recent: all.slice(0, 100),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
