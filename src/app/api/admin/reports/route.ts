import { NextResponse } from 'next/server';
import { archiveStore } from '@/lib/interview-archive';
import { sessionManager } from '@/lib/session-manager';

// GET /api/admin/reports
// Merges archived (AI report generated) + all completed sessions.
// Excludes scheduled / waiting / in_progress — only real interviews that happened.
export async function GET() {
  try {
    const [archived, allSessions] = await Promise.all([
      archiveStore.getAll(500),
      sessionManager.getAllSessions(),
    ]);

    // Archive IDs — these have full AI analysis
    const archivedIds = new Set(archived.map(r => r.id));

    // Convert completed-but-not-archived sessions into a report-compatible shape
    const liveCompleted = allSessions
      .filter(s => s.status === 'completed' && !archivedIds.has(s.id))
      .map(s => {
        const startedAt = s.interviewStartedAt
          ? new Date(s.interviewStartedAt)
          : new Date(s.createdAt);
        const endedAt = s.lastActivityAt ? new Date(s.lastActivityAt) : startedAt;
        const durationMins = Math.max(0, Math.round((endedAt.getTime() - startedAt.getTime()) / 60000));

        const scoreValues: number[] = Object.values(s.scores || {}).map((sc: any) => sc?.score ?? 0);
        const avgScore = scoreValues.length
          ? Math.round(scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length)
          : 0;

        const recommendation = s.report?.recommendation || '';

        return {
          id: s.id,
          candidateName: s.candidate.name,
          candidateEmail: s.candidate.email,
          jobTitle: s.jd.title,
          position: s.jd.title,
          client: s.jd.client,
          skills: s.profileAnalysis?.skills || [],
          interviewerName: s.recruiterName || 'Unknown',
          interviewerEmail: s.recruiterEmail || '',
          interviewDate: s.interviewStartedAt || s.createdAt,
          interviewDurationMinutes: durationMins,
          overallScore: avgScore,
          recommendation,
          status: s.status,
          candidateInfo: s.candidateInfo,
          interviewerNotes: s.interviewerNotes,
          proctorRedFlags: (s.proctorAlerts || []).filter((a: any) => a.severity === 'high').length,
          archivedAt: null,
          hasAIReport: false,
        };
      });

    // Add hasAIReport flag to archived records
    const archivedWithFlag = archived.map(r => ({ ...r, hasAIReport: true }));

    // Merge: archived first, then completed sessions without reports
    const all = [
      ...archivedWithFlag,
      ...liveCompleted,
    ].sort((a, b) => new Date(b.interviewDate).getTime() - new Date(a.interviewDate).getTime());

    // ── Build interviewer stats from merged data ──────────────
    const ivMap: Record<string, {
      name: string; email: string;
      total: number; totalScore: number; totalDur: number;
      recommended: number; conditional: number; notRecommended: number;
      lastInterview: string; dailyMap: Record<string, number>;
    }> = {};

    for (const r of all) {
      const key = (r.interviewerEmail || r.interviewerName || 'unknown').toLowerCase();
      if (!ivMap[key]) {
        ivMap[key] = {
          name: r.interviewerName || 'Unknown',
          email: r.interviewerEmail || '',
          total: 0, totalScore: 0, totalDur: 0,
          recommended: 0, conditional: 0, notRecommended: 0,
          lastInterview: r.interviewDate,
          dailyMap: {},
        };
      }
      const iv = ivMap[key];
      iv.total++;
      iv.totalScore += r.overallScore || 0;
      iv.totalDur += r.interviewDurationMinutes || 0;
      const rec = (r.recommendation || '').toLowerCase();
      if (rec.includes('not')) iv.notRecommended++;
      else if (rec.includes('conditional')) iv.conditional++;
      else if (rec) iv.recommended++;

      // Daily count
      const day = r.interviewDate ? r.interviewDate.slice(0, 10) : 'unknown';
      iv.dailyMap[day] = (iv.dailyMap[day] || 0) + 1;

      if (r.interviewDate > iv.lastInterview) iv.lastInterview = r.interviewDate;
    }

    const interviewerStats = Object.values(ivMap).map(iv => ({
      name: iv.name,
      email: iv.email,
      totalInterviews: iv.total,
      avgScore: iv.total ? Math.round(iv.totalScore / iv.total) : 0,
      avgDurationMinutes: iv.total ? Math.round(iv.totalDur / iv.total) : 0,
      totalDurationMinutes: iv.totalDur,
      recommended: iv.recommended,
      conditional: iv.conditional,
      notRecommended: iv.notRecommended,
      lastInterviewDate: iv.lastInterview,
      dailyBreakdown: Object.entries(iv.dailyMap)
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([date, count]) => ({ date, count })),
    })).sort((a, b) => b.totalInterviews - a.totalInterviews);

    // ── Overview stats ────────────────────────────────────────
    const now = Date.now();
    const thisMonth = all.filter(r => now - new Date(r.interviewDate).getTime() < 30 * 86400000).length;
    const thisWeek  = all.filter(r => now - new Date(r.interviewDate).getTime() <  7 * 86400000).length;
    const today     = all.filter(r => now - new Date(r.interviewDate).getTime() <      86400000).length;
    const scoredItems = all.filter(r => (r.overallScore || 0) > 0);
    const avgScore = scoredItems.length
      ? Math.round(scoredItems.reduce((s, r) => s + (r.overallScore || 0), 0) / scoredItems.length)
      : 0;
    const durItems = all.filter(r => (r.interviewDurationMinutes || 0) > 0);
    const avgDur = durItems.length
      ? Math.round(durItems.reduce((s, r) => s + (r.interviewDurationMinutes || 0), 0) / durItems.length)
      : 0;

    return NextResponse.json({
      overview: { total: all.length, thisMonth, thisWeek, today, avgScore, avgDurationMinutes: avgDur },
      interviewers: interviewerStats,
      recent: all.slice(0, 200),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
