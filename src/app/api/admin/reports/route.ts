import { NextResponse } from 'next/server';
import { archiveStore } from '@/lib/interview-archive';
import { sessionManager } from '@/lib/session-manager';

// GET /api/admin/reports — merged view of archived + live sessions
export async function GET() {
  try {
    // Pull both archive records AND all live sessions in parallel
    const [archived, allSessions, interviewerStats] = await Promise.all([
      archiveStore.getAll(500),
      sessionManager.getAllSessions(),
      archiveStore.getInterviewerStats(),
    ]);

    // Build a map of archived IDs so we don't double-count
    const archivedIds = new Set(archived.map(r => r.id));

    // Convert live sessions (not yet in archive) into archive-compatible shape
    const sessionRecords = allSessions
      .filter(s => !archivedIds.has(s.id)) // exclude already-archived
      .map(s => {
        const startedAt = s.interviewStartedAt ? new Date(s.interviewStartedAt) : new Date(s.createdAt);
        const durationMs = s.status === 'completed' && s.lastActivityAt
          ? new Date(s.lastActivityAt).getTime() - startedAt.getTime()
          : 0;
        const durationMins = Math.round(durationMs / 60000);

        // Gather question scores if available
        const scoreValues = Object.values(s.scores || {}) as any[];
        const avgScore = scoreValues.length
          ? Math.round(scoreValues.reduce((acc, sc) => acc + (sc?.score || 0), 0) / scoreValues.length)
          : 0;

        return {
          id: s.id,
          candidateName: s.candidate.name,
          candidateEmail: s.candidate.email,
          jobTitle: s.jd.title,
          client: s.jd.client,
          interviewerName: s.recruiterName || 'Unknown',
          interviewerEmail: s.recruiterEmail || '',
          interviewDate: s.interviewStartedAt || s.createdAt,
          interviewDurationMinutes: durationMins,
          overallScore: avgScore,
          recommendation: s.report?.recommendation || '',
          status: s.status,
          candidateInfo: s.candidateInfo,
          interviewerNotes: s.interviewerNotes,
          archivedAt: null,
          // mark as live (not a full archive record)
          _live: true,
        };
      });

    // Merge: archived first (have full AI report), then live sessions
    const all = [
      ...archived.map(r => ({ ...r, _live: false })),
      ...sessionRecords,
    ].sort((a, b) => new Date(b.interviewDate).getTime() - new Date(a.interviewDate).getTime());

    // Build interviewer stats from merged data
    const ivMap: Record<string, any> = {};
    for (const r of all) {
      const key = r.interviewerEmail || r.interviewerName;
      if (!ivMap[key]) {
        ivMap[key] = {
          name: r.interviewerName,
          email: r.interviewerEmail,
          total: 0, totalScore: 0, totalDur: 0,
          recommended: 0, conditional: 0, notRecommended: 0,
          lastInterview: r.interviewDate,
        };
      }
      const iv = ivMap[key];
      iv.total++;
      iv.totalScore += r.overallScore || 0;
      iv.totalDur += r.interviewDurationMinutes || 0;
      const rec = (r.recommendation || '').toLowerCase();
      if (rec.includes('not')) iv.notRecommended++;
      else if (rec.includes('conditional')) iv.conditional++;
      else if (rec.includes('recommend')) iv.recommended++;
      if (r.interviewDate > iv.lastInterview) iv.lastInterview = r.interviewDate;
    }

    const mergedInterviewerStats = Object.values(ivMap).map((iv: any) => ({
      name: iv.name,
      email: iv.email,
      totalInterviews: iv.total,
      avgScore: iv.total ? Math.round(iv.totalScore / iv.total) : 0,
      avgDurationMinutes: iv.total ? Math.round(iv.totalDur / iv.total) : 0,
      recommended: iv.recommended,
      conditional: iv.conditional,
      notRecommended: iv.notRecommended,
      lastInterview: iv.lastInterview,
    }));

    const now = Date.now();
    const thisMonth = all.filter(r => now - new Date(r.interviewDate).getTime() < 30 * 86400000).length;
    const thisWeek  = all.filter(r => now - new Date(r.interviewDate).getTime() <  7 * 86400000).length;
    const scoredItems = all.filter(r => (r.overallScore || 0) > 0);
    const avgScore = scoredItems.length
      ? Math.round(scoredItems.reduce((s, r) => s + r.overallScore, 0) / scoredItems.length)
      : 0;
    const durItems = all.filter(r => (r.interviewDurationMinutes || 0) > 0);
    const avgDur = durItems.length
      ? Math.round(durItems.reduce((s, r) => s + r.interviewDurationMinutes, 0) / durItems.length)
      : 0;

    return NextResponse.json({
      overview: { total: all.length, thisMonth, thisWeek, avgScore, avgDurationMinutes: avgDur },
      interviewers: mergedInterviewerStats.length ? mergedInterviewerStats : interviewerStats,
      recent: all.slice(0, 100),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
