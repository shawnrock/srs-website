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

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deleted = await sessionManager.deleteSession(id);
  if (!deleted) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
