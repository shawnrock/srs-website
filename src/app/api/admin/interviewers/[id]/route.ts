import { NextRequest, NextResponse } from 'next/server';
import {
  getAuthSession,
  getInterviewerById,
  updateInterviewer,
  deleteInterviewer,
} from '@/lib/auth-store';

export const runtime = 'nodejs';

async function requireAdmin(req: NextRequest) {
  const auth  = req.headers.get('authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return null;
  const session = await getAuthSession(token);
  return session?.role === 'Admin' ? session : null;
}

// PATCH /api/admin/interviewers/[id]
// Body: { action: 'suspend' | 'activate' } OR { approvedLocations: [...] }
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const interviewer = await getInterviewerById(id);
  if (!interviewer) return NextResponse.json({ error: 'Interviewer not found.' }, { status: 404 });

  const body = await req.json() as Record<string, any>;

  if (body.action === 'suspend') {
    await updateInterviewer(id, { status: 'suspended' });
  } else if (body.action === 'activate') {
    await updateInterviewer(id, { status: 'active' });
  } else if (body.approvedLocations !== undefined) {
    await updateInterviewer(id, { approvedLocations: body.approvedLocations });
  } else {
    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  }

  const updated = await getInterviewerById(id);
  return NextResponse.json(updated);
}

// DELETE /api/admin/interviewers/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const interviewer = await getInterviewerById(id);
  if (!interviewer) return NextResponse.json({ error: 'Interviewer not found.' }, { status: 404 });

  await deleteInterviewer(id);
  return NextResponse.json({ ok: true });
}
