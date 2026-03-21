import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-store';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const auth  = req.headers.get('authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const session = await getAuthSession(token);
  if (!session) return NextResponse.json({ error: 'Session expired or invalid.' }, { status: 401 });

  return NextResponse.json({
    email: session.email,
    name:  session.name,
    role:  session.role,
  });
}
