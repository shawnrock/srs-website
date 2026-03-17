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
    candidateName: session.candidate?.name,
    position: session.jd?.title,
    client: session.jd?.client,
    totalQuestions: session.questions?.length || 0,
    currentQuestion: session.currentQuestion,
    dailyRoomUrl: session.dailyRoomUrl,
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await sessionManager.getSession(id);
  if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

  const body = await req.json();

  // Interview control actions from observer
  if (body.action === 'start_interview') {
    await sessionManager.updateSession(id, { status: 'in_progress', currentQuestion: 0 });
    return NextResponse.json({ success: true, status: 'in_progress', currentQuestion: 0 });
  }

  if (body.action === 'next_question') {
    const next = (session.currentQuestion ?? 0) + 1;
    if (next >= (session.questions?.length ?? 0)) {
      await sessionManager.updateSession(id, { status: 'completed' });
      return NextResponse.json({ success: true, status: 'completed' });
    }
    await sessionManager.updateSession(id, { currentQuestion: next });
    return NextResponse.json({ success: true, currentQuestion: next });
  }

  if (body.action === 'end_interview') {
    await sessionManager.updateSession(id, { status: 'completed' });
    return NextResponse.json({ success: true, status: 'completed' });
  }

  // Transcript chunk from candidate
  if (body.transcript !== undefined) {
    const qIdx = body.questionIndex ?? session.currentQuestion ?? 0;
    const existing = (session.answerTranscripts ?? {})[qIdx] ?? '';
    await sessionManager.updateSession(id, {
      answerTranscripts: { ...session.answerTranscripts, [qIdx]: (existing + ' ' + body.transcript).trim() },
    });
    return NextResponse.json({ success: true });
  }

  // Proctor alert from candidate
  if (body.alert) {
    await sessionManager.updateSession(id, {
      proctorAlerts: [...(session.proctorAlerts ?? []), body.alert],
    });
    return NextResponse.json({ success: true });
  }

  // Generic status update — never allow downgrading an active or completed session
  if (body.status) {
    const protectedStatuses = ['in_progress', 'completed'];
    if (protectedStatuses.includes(session.status) && !protectedStatuses.includes(body.status)) {
      // Silently ignore attempts to set 'waiting' or 'scheduled' on an active session
      return NextResponse.json({ success: true });
    }
    await sessionManager.updateSession(id, { status: body.status });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deleted = await sessionManager.deleteSession(id);
  if (!deleted) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
