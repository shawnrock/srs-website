import { NextRequest, NextResponse } from 'next/server';
import { geminiService } from '@/lib/gemini-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jd, resume } = body;

    if (!jd?.title || !jd?.description) {
      return NextResponse.json({ error: 'Missing JD fields' }, { status: 400 });
    }

    // If no resume provided, skip compatibility check
    if (!resume || resume.trim().length < 50) {
      return NextResponse.json({ compatible: true, matchScore: 50, reason: 'No resume provided — skipping compatibility check.', mismatches: [] });
    }

    const result = await geminiService.checkJDResumeCompatibility(jd, resume);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[Validate] Error:', err);
    // On AI error, don't block — return compatible so the flow continues
    return NextResponse.json({ compatible: true, matchScore: 50, reason: 'Validation skipped due to an error.', mismatches: [] });
  }
}
