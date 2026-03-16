import { NextRequest, NextResponse } from 'next/server';
import { sessionManager } from '@/lib/session-manager';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = sessionManager.getSession(id);
  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }
  const body = await req.json();
  if (session.report) {
    session.report.disposition = body.disposition;
    session.report.dispositionNotes = body.notes;
    session.report.dispositionBy = body.by;
    session.report.dispositionAt = new Date().toISOString();
  }
  return NextResponse.json({ success: true });
}
