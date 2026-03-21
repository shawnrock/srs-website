import { NextRequest, NextResponse } from 'next/server';
import {
  getInviteToken,
  deleteInviteToken,
  getInterviewerById,
  updateInterviewer,
  hashPassword,
} from '@/lib/auth-store';

export const runtime = 'nodejs';

// GET  /api/invite/[token] — validate token and return name/email for display
export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const inv = await getInviteToken(token);
  if (!inv) return NextResponse.json({ error: 'This invite link is invalid or has expired.' }, { status: 404 });

  const now = new Date();
  if (new Date(inv.expiresAt) < now)
    return NextResponse.json({ error: 'This invite link has expired. Please ask your admin to resend the invite.' }, { status: 410 });

  return NextResponse.json({ name: inv.name, email: inv.email });
}

// POST /api/invite/[token] — accept invite, set password
export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const inv = await getInviteToken(token);
  if (!inv) return NextResponse.json({ error: 'Invalid or expired invite link.' }, { status: 404 });

  const now = new Date();
  if (new Date(inv.expiresAt) < now)
    return NextResponse.json({ error: 'Invite link has expired.' }, { status: 410 });

  const { password } = await req.json() as { password: string };
  if (!password || password.length < 8)
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });

  const interviewer = await getInterviewerById(inv.interviewerId);
  if (!interviewer)
    return NextResponse.json({ error: 'Interviewer account not found.' }, { status: 404 });

  await updateInterviewer(inv.interviewerId, {
    passwordHash: hashPassword(password),
    status: 'active',
    activatedAt: now.toISOString(),
  });

  await deleteInviteToken(token);
  return NextResponse.json({ ok: true });
}
