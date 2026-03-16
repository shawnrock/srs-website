import { NextRequest, NextResponse } from 'next/server';
import { sessionManager } from '@/lib/session-manager';

async function createDailyRoom(): Promise<{ name: string; url: string }> {
  const apiKey = process.env.DAILY_API_KEY;
  if (!apiKey) throw new Error('DAILY_API_KEY not configured');
  const res = await fetch('https://api.daily.co/v1/rooms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ properties: { exp: Math.floor(Date.now() / 1000) + 3600, enable_recording: 'cloud' } }),
  });
  if (!res.ok) throw new Error('Failed to create Daily room');
  const data = await res.json();
  return { name: data.name, url: data.url };
}

async function createDailyToken(roomName: string, role: string): Promise<string> {
  const apiKey = process.env.DAILY_API_KEY;
  if (!apiKey) throw new Error('DAILY_API_KEY not configured');
  const res = await fetch('https://api.daily.co/v1/meeting-tokens', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      properties: {
        room_name: roomName,
        is_owner: role === 'observer' || role === 'interviewer',
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
    }),
  });
  if (!res.ok) throw new Error('Failed to create Daily token');
  const data = await res.json();
  return data.token;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let session = await sessionManager.getSession(id);
  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  const role = req.nextUrl.searchParams.get('role') || 'candidate';

  try {
    // Create room if not exists
    if (!session.dailyRoomName) {
      const room = await createDailyRoom();
      await sessionManager.updateSession(id, { dailyRoomName: room.name, dailyRoomUrl: room.url });
      session = await sessionManager.getSession(id) || session;
    }

    const token = await createDailyToken(session.dailyRoomName!, role);
    return NextResponse.json({ roomUrl: session.dailyRoomUrl, token });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
