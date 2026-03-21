import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_USERS,
  HARDCODED_INTERVIEWERS,
  getInterviewerByEmail,
  verifyPassword,
  fingerprintRequest,
  summarizeUA,
  getClientIp,
  createAuthSession,
  createLocationRequest,
  getPendingLocationRequests,
  updateInterviewer,
} from '@/lib/auth-store';
import type { ApprovedLocation } from '@/lib/auth-store';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json() as { email: string; password: string };
    if (!email || !password)
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });

    const lower = email.toLowerCase().trim();
    const ua    = req.headers.get('user-agent') ?? '';
    const ip    = getClientIp(req);
    const fp    = fingerprintRequest(ip, ua);

    // ── Admin login (hardcoded, no location restriction) ─────────────────────
    if (ADMIN_USERS[lower]) {
      const admin = ADMIN_USERS[lower];
      if (admin.password !== password)
        return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });

      const session = await createAuthSession(
        `admin:${lower}`, lower, admin.name, 'Admin', fp,
      );
      return NextResponse.json({
        token: session.token,
        user: { email: lower, name: admin.name, role: 'Admin' },
      });
    }

    // ── Hardcoded interviewer accounts (built-in test accounts, no location check) ─
    if (HARDCODED_INTERVIEWERS[lower]) {
      const iv = HARDCODED_INTERVIEWERS[lower];
      if (iv.password !== password)
        return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });

      const session = await createAuthSession(
        `interviewer:${lower}`, lower, iv.name, 'Interviewer', fp,
      );
      return NextResponse.json({
        token: session.token,
        user: { email: lower, name: iv.name, role: 'Interviewer' },
      });
    }

    // ── Redis-provisioned interviewer login ──────────────────────────────────
    const interviewer = await getInterviewerByEmail(lower);
    if (!interviewer)
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });

    if (interviewer.status === 'invited')
      return NextResponse.json(
        { error: 'Your account setup is incomplete. Please check your invite email to set a password.' },
        { status: 403 },
      );

    if (interviewer.status === 'suspended')
      return NextResponse.json(
        { error: 'Your account has been suspended. Please contact your administrator.' },
        { status: 403 },
      );

    if (!interviewer.passwordHash || !verifyPassword(password, interviewer.passwordHash))
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });

    // ── Location / fingerprint check ─────────────────────────────────────────
    const approved = interviewer.approvedLocations ?? [];
    const knownFp  = approved.find(loc => loc.fingerprint === fp);

    if (knownFp) {
      const updatedLocs = approved.map(loc =>
        loc.fingerprint === fp ? { ...loc, lastUsedAt: new Date().toISOString() } : loc,
      );
      await updateInterviewer(interviewer.id, {
        approvedLocations: updatedLocs,
        lastLoginAt: new Date().toISOString(),
      });
    } else {
      const uaSummary = summarizeUA(ua);
      if (approved.length < 2) {
        const newLoc: ApprovedLocation = {
          id: uuidv4(),
          fingerprint: fp,
          ipAddress: ip,
          userAgentSummary: uaSummary,
          label: `Location ${approved.length + 1}`,
          approvedAt: new Date().toISOString(),
          approvedBy: 'system',
          lastUsedAt: new Date().toISOString(),
        };
        await updateInterviewer(interviewer.id, {
          approvedLocations: [...approved, newLoc],
          lastLoginAt: new Date().toISOString(),
        });
      } else {
        const pending = await getPendingLocationRequests();
        const alreadyPending = pending.some(
          r => r.interviewerId === interviewer.id && r.fingerprint === fp,
        );
        if (!alreadyPending) {
          await createLocationRequest(
            interviewer.id, interviewer.email, interviewer.name, fp, ip, uaSummary,
          );
        }
        return NextResponse.json(
          {
            error:
              'Login from a new location requires administrator approval. ' +
              'A request has been sent to your admin. You will be able to log in once it is approved.',
            code: 'LOCATION_PENDING',
          },
          { status: 403 },
        );
      }
    }

    const session = await createAuthSession(
      interviewer.id, interviewer.email, interviewer.name, 'Interviewer', fp,
    );
    return NextResponse.json({
      token: session.token,
      user: { email: interviewer.email, name: interviewer.name, role: 'Interviewer' },
    });
  } catch (err: any) {
    console.error('[auth/login]', err);
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 });
  }
}
