import { NextRequest, NextResponse } from 'next/server';
import { sessionManager } from '@/lib/session-manager';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await sessionManager.getSession(id);

  if (!session?.dailyRoomName) {
    return NextResponse.json({ count: 0, participants: [] });
  }

  const apiKey = process.env.DAILY_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ count: 0, participants: [] });
  }

  try {
    // Use Daily.co presence API to get current participants in the room
    const res = await fetch(`https://api.daily.co/v1/presence`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!res.ok) {
      return NextResponse.json({ count: 0, participants: [] });
    }

    const data = await res.json();
    // data.data is an array of rooms with active participants
    const roomData = (data.data || []).find((r: any) => r.room_name === session.dailyRoomName);

    if (!roomData) {
      return NextResponse.json({ count: 0, participants: [] });
    }

    return NextResponse.json({
      count: roomData.participant_count || 0,
      participants: (roomData.participants || []).map((p: any) => ({
        id: p.userId || p.id,
        name: p.userName || p.user_name || 'Unknown',
        joinedAt: p.joinTime || p.joined_at,
      })),
    });
  } catch (err) {
    return NextResponse.json({ count: 0, participants: [] });
  }
}
