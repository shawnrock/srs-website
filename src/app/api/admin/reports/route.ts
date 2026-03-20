import { NextResponse } from 'next/server';
import { archiveStore } from '@/lib/interview-archive';

// GET /api/admin/reports — interviewer stats + recent interview list
export async function GET() {
  try {
    const [all, interviewerStats] = await Promise.all([
      archiveStore.getAll(500),
      archiveStore.getInterviewerStats(),
    ]);

    const now = Date.now();
    const thisMonth = all.filter(r => now - new Date(r.interviewDate).getTime() < 30 * 86400000).length;
    const thisWeek  = all.filter(r => now - new Date(r.interviewDate).getTime() <  7 * 86400000).length;
    const avgScore  = all.length ? Math.round(all.reduce((s, r) => s + (r.overallScore || 0), 0) / all.length) : 0;
    const avgDur    = all.length ? Math.round(all.reduce((s, r) => s + (r.interviewDurationMinutes || 0), 0) / all.length) : 0;

    return NextResponse.json({
      overview: { total: all.length, thisMonth, thisWeek, avgScore, avgDurationMinutes: avgDur },
      interviewers: interviewerStats,
      recent: all.slice(0, 100),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
