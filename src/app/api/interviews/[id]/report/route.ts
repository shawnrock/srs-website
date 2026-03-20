import { NextRequest, NextResponse } from 'next/server';
import { sessionManager } from '@/lib/session-manager';
import { geminiService } from '@/lib/gemini-service';
import { ScoringEngine } from '@/lib/scoring-engine';
import { sendInterviewReport } from '@/lib/email';
import { archiveStore } from '@/lib/interview-archive';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await sessionManager.getSession(id);
  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  // Return cached report if available
  if (session.report) {
    return NextResponse.json(session.report);
  }

  // Generate report
  try {
    const scoringEngine = new ScoringEngine(session.questions || []);
    const [aiReport] = await Promise.allSettled([
      geminiService.generateInterviewReport({
        jd: session.jd,
        candidate: session.candidate,
        questions: session.questions || [],
        answerTranscripts: session.answerTranscripts || {},
        proctorAlerts: session.proctorAlerts || [],
      }),
    ]);

    const keywordScores = scoringEngine.scoreAllAnswers(session.answerTranscripts || {});
    const validScores = Object.values(keywordScores).filter(Boolean);
    const avgKeywordScore = validScores.length > 0
      ? validScores.reduce((a, s) => a + (s?.score || 0), 0) / validScores.length
      : 0;

    const proctorAlerts = session.proctorAlerts || [];
    const proctorRedFlags = proctorAlerts.filter((a: any) => a.severity === 'high').length;
    const proctorWarnings = proctorAlerts.filter((a: any) => a.severity === 'warning').length;
    const proctorScore = Math.max(100 - proctorRedFlags * 20 - proctorWarnings * 5, 0);

    let report: any;
    if (aiReport.status === 'fulfilled') {
      report = {
        ...aiReport.value,
        keywordAnalysis: {
          averageKeywordScore: parseFloat(avgKeywordScore.toFixed(1)),
          perQuestion: validScores.map(s => s && ({
            questionIndex: s.questionIndex,
            category: s.questionCategory,
            keywordsHit: s.keywordsHit,
            keywordsExpected: s.keywordsExpected,
            keywordCoverage: s.keywordsCount,
            wordCount: s.wordCount,
            fluency: s.fluency,
          })).filter(Boolean),
        },
        proctoring: {
          score: proctorScore,
          totalAlerts: proctorAlerts.length,
          warnings: proctorWarnings,
          redFlags: proctorRedFlags,
          alerts: proctorAlerts,
        },
        answerTranscripts: session.answerTranscripts || {},
        candidate: session.candidate?.name,
        position: session.jd?.title,
        client: session.jd?.client,
        interviewDate: new Date().toISOString(),
        totalQuestions: session.questions?.length || 0,
        questionsAnswered: Object.keys(session.answerTranscripts || {}).length,
      };
    } else {
      report = {
        overallScore: Math.round(avgKeywordScore * 10),
        recommendation: avgKeywordScore >= 8 ? 'Recommended' : avgKeywordScore >= 6 ? 'Conditional Pass' : 'Not Recommended',
        summary: 'AI evaluation unavailable. Keyword-based analysis only.',
        strengths: [],
        weaknesses: [],
        proctoring: { score: proctorScore, totalAlerts: proctorAlerts.length, warnings: proctorWarnings, redFlags: proctorRedFlags },
        candidate: session.candidate?.name,
        position: session.jd?.title,
        interviewDate: new Date().toISOString(),
        answerTranscripts: session.answerTranscripts || {},
      };
    }

    await sessionManager.updateSession(id, { report });

    // ── Persist to long-term archive (non-blocking, best-effort) ──────────
    const skills: string[] = [];
    const pa = session.profileAnalysis;
    if (pa?.keySkills) skills.push(...pa.keySkills);
    else if (pa?.skills) skills.push(...pa.skills);

    const interviewDate = session.interviewStartedAt || session.createdAt;
    const durationMs = session.interviewStartedAt
      ? new Date(report.interviewDate).getTime() - new Date(session.interviewStartedAt).getTime()
      : 0;
    const durationMinutes = Math.round(durationMs / 60000);

    archiveStore.archive({
      id,
      sessionId: id,
      interviewerName: session.recruiterName || 'Unknown',
      interviewerEmail: session.recruiterEmail || 'unknown@srsinfoway.com',
      candidateName: session.candidate?.name || '',
      candidateEmail: session.candidate?.email || '',
      position: session.jd?.title || '',
      client: session.jd?.client || '',
      skills,
      matchScore: session.candidate?.matchScore || 0,
      overallScore: report.overallScore || 0,
      recommendation: report.recommendation || '',
      interviewDate,
      archivedAt: new Date().toISOString(),
      interviewDurationMinutes: durationMinutes,
      totalQuestions: session.questions?.length || 0,
      questionsAnswered: Object.keys(session.answerTranscripts || {}).length,
      proctorAlerts: proctorAlerts.length,
      proctorRedFlags,
      proctorScore,
      reportSummary: report.summary || '',
      strengths: report.strengths || [],
      areasForImprovement: report.areasForImprovement || report.weaknesses || [],
      interviewerNotes: session.interviewerNotes || '',
      candidateInfo: session.candidateInfo || undefined,
    }).catch(err => console.error('[Archive] Failed:', err));

    // Email report PDF to recruiter (non-blocking)
    if (session.recruiterEmail) {
      sendInterviewReport({
        recruiterEmail: session.recruiterEmail,
        recruiterName: session.recruiterName,
        report,
        session: {
          id: session.id,
          candidateName: session.candidate?.name,
          position: session.jd?.title,
          client: session.jd?.client,
          observerUrl: session.observerUrl,
        },
      }).catch(err => console.error('[Email] Report send failed:', err));
    }

    return NextResponse.json(report);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/interviews/[id]/report — manually (re)send report email
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await sessionManager.getSession(id);
  if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  if (!session.report) return NextResponse.json({ error: 'Report not generated yet' }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const toEmail: string = body.email || session.recruiterEmail;
  const toName: string = body.name || session.recruiterName;

  if (!toEmail) return NextResponse.json({ error: 'No email address provided' }, { status: 400 });

  try {
    await sendInterviewReport({
      recruiterEmail: toEmail,
      recruiterName: toName,
      report: session.report,
      session: {
        id: session.id,
        candidateName: session.candidate?.name,
        position: session.jd?.title,
        client: session.jd?.client,
        observerUrl: session.observerUrl,
      },
    });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
