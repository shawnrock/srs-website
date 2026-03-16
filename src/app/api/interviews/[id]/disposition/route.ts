import { NextRequest, NextResponse } from 'next/server';
import { sessionManager } from '@/lib/session-manager';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await sessionManager.getSession(id);
  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }
  const body = await req.json();
  if (session.report) {
    await sessionManager.updateSession(id, {
      report: {
        ...session.report,
        disposition: body.disposition,
        dispositionNotes: body.notes,
        dispositionBy: body.by,
        dispositionAt: new Date().toISOString(),
      },
    });
  }
  return NextResponse.json({ success: true });
}
