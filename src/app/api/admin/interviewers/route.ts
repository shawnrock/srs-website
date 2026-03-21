import { NextRequest, NextResponse } from 'next/server';
import {
  getAuthSession,
  createInterviewer,
  getAllInterviewers,
  getInterviewerByEmail,
  createInviteToken,
} from '@/lib/auth-store';
import { sendInterviewerInvite } from '@/lib/email';

export const runtime = 'nodejs';

async function requireAdmin(req: NextRequest) {
  const auth  = req.headers.get('authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return null;
  const session = await getAuthSession(token);
  if (!session || session.role !== 'Admin') return null;
  return session;
}

// GET  /api/admin/interviewers — list all interviewers
export async function GET(req: NextRequest) {
  const session = await requireAdmin(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const list = await getAllInterviewers();
  return NextResponse.json(list);
}

// POST /api/admin/interviewers — invite a new interviewer
export async function POST(req: NextRequest) {
  const session = await requireAdmin(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, email } = await req.json() as { name: string; email: string };
  if (!name?.trim() || !email?.trim())
    return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });

  const lower = email.toLowerCase().trim();

  // Check duplicate
  const existing = await getInterviewerByEmail(lower);
  if (existing)
    return NextResponse.json(
      { error: 'An interviewer with that email already exists.' },
      { status: 409 },
    );

  const interviewer = await createInterviewer(name.trim(), lower, session.email);
  const inviteToken = await createInviteToken(interviewer.id, interviewer.email, interviewer.name);

  const baseUrl   = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const inviteUrl = `${baseUrl}/ai-interview/invite/${inviteToken.token}`;

  // Send invite email (non-blocking — don't fail the request if email fails)
  try {
    await sendInterviewerInvite({
      name: interviewer.name,
      email: interviewer.email,
      inviteUrl,
      invitedBy: session.name,
    });
  } catch (e) {
    console.error('[admin/interviewers] invite email failed:', e);
  }

  return NextResponse.json({ interviewer, inviteUrl }, { status: 201 });
}
