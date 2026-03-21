import { NextRequest, NextResponse } from 'next/server';
import {
  getAuthSession,
  getLocationRequest,
  updateLocationRequest,
  getInterviewerById,
  updateInterviewer,
} from '@/lib/auth-store';
import type { ApprovedLocation } from '@/lib/auth-store';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs';

// PATCH /api/admin/location-requests/[id]
// Body: { action: 'approve' | 'reject', label?: string }
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth  = req.headers.get('authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const session = await getAuthSession(token);
  if (!session || session.role !== 'Admin')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const locReq = await getLocationRequest(id);
  if (!locReq) return NextResponse.json({ error: 'Request not found.' }, { status: 404 });
  if (locReq.status !== 'pending')
    return NextResponse.json({ error: 'Request already resolved.' }, { status: 409 });

  const { action, label } = await req.json() as { action: string; label?: string };
  const now = new Date().toISOString();

  if (action === 'approve') {
    const interviewer = await getInterviewerById(locReq.interviewerId);
    if (interviewer) {
      const locs    = [...(interviewer.approvedLocations ?? [])];
      const exists  = locs.find(l => l.fingerprint === locReq.fingerprint);
      if (!exists) {
        // If already at 2 locations, replace the oldest one
        if (locs.length >= 2) locs.shift();
        const newLoc: ApprovedLocation = {
          id: uuidv4(),
          fingerprint:      locReq.fingerprint,
          ipAddress:        locReq.ipAddress,
          userAgentSummary: locReq.userAgentSummary,
          label:            label ?? `Location ${locs.length + 1}`,
          approvedAt:       now,
          approvedBy:       session.email,
        };
        locs.push(newLoc);
        await updateInterviewer(interviewer.id, { approvedLocations: locs });
      }
    }
    await updateLocationRequest(id, { status: 'approved', resolvedAt: now, resolvedBy: session.email });
  } else if (action === 'reject') {
    await updateLocationRequest(id, { status: 'rejected', resolvedAt: now, resolvedBy: session.email });
  } else {
    return NextResponse.json({ error: 'Invalid action. Use "approve" or "reject".' }, { status: 400 });
  }

  const updated = await getLocationRequest(id);
  return NextResponse.json(updated);
}
