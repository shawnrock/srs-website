import { NextRequest, NextResponse } from 'next/server';
import {
  getAuthSession,
  getInterviewerById,
  createInviteToken,
} from '@/lib/auth-store';
import { sendInterviewerInvite } from '@/lib/email';

export const runtime = 'nodejs';

// POST /api/admin/interviewers/[id]/invite  — resend invite email
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth  = req.headers.get('authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const session = await getAuthSession(token);
  if (!session || session.role !== 'Admin')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const interviewer = await getInterviewerById(id);
  if (!interviewer)
    return NextResponse.json({ error: 'Interviewer not found.' }, { status: 404 });

  const inviteToken = await createInviteToken(interviewer.id, interviewer.email, interviewer.name);
  const baseUrl     = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const inviteUrl   = `${baseUrl}/ai-interview/invite/${inviteToken.token}`;

  await sendInterviewerInvite({
    name: interviewer.name,
    email: interviewer.email,
    inviteUrl,
    invitedBy: session.name,
  });

  return NextResponse.json({ ok: true, inviteUrl });
}
