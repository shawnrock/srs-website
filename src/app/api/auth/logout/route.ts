import { NextRequest, NextResponse } from 'next/server';
import { deleteAuthSession } from '@/lib/auth-store';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (token) await deleteAuthSession(token);
  return NextResponse.json({ ok: true });
}
