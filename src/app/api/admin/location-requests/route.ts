import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession, getAllLocationRequests } from '@/lib/auth-store';

export const runtime = 'nodejs';

// GET /api/admin/location-requests?status=pending|all
export async function GET(req: NextRequest) {
  const auth  = req.headers.get('authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const session = await getAuthSession(token);
  if (!session || session.role !== 'Admin')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const status = new URL(req.url).searchParams.get('status') ?? 'all';
  const all    = await getAllLocationRequests();
  const list   = status === 'pending' ? all.filter(r => r.status === 'pending') : all;

  return NextResponse.json(list);
}
