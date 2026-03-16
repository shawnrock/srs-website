import { NextRequest, NextResponse } from 'next/server';
import { sessionManager } from '@/lib/session-manager';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await sessionManager.getSession(id);
  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }
  return NextResponse.json({
    id: session.id,
    status: session.status,
    candidate: session.candidate,
    jd: session.jd,
    questions: session.questions,
    currentQuestion: session.currentQuestion,
    proctorAlerts: session.proctorAlerts || [],
    answerTranscripts: session.answerTranscripts || {},
    profileAnalysis: session.profileAnalysis,
    dailyRoomUrl: session.dailyRoomUrl,
    report: session.report || null,
  });
}
