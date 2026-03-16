import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Deepgram not configured' }, { status: 404 });
  }
  return NextResponse.json({ apiKey });
}
