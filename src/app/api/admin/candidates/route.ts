import { NextRequest, NextResponse } from 'next/server';
import { archiveStore } from '@/lib/interview-archive';

// GET /api/admin/candidates?skills=React,Node&days=30&interviewer=&minScore=60&recommendation=&q=
export async function GET(req: NextRequest) {
  try {
    const p = req.nextUrl.searchParams;
    const skillsParam = p.get('skills');
    const skills = skillsParam ? skillsParam.split(',').map(s => s.trim()).filter(Boolean) : [];
    const days        = p.get('days')   ? parseInt(p.get('days')!)   : undefined;
    const fromDate    = p.get('from')   || undefined;
    const toDate      = p.get('to')     || undefined;
    const interviewer = p.get('interviewer') || undefined;
    const minScore    = p.get('minScore')  ? parseInt(p.get('minScore')!)  : undefined;
    const maxScore    = p.get('maxScore')  ? parseInt(p.get('maxScore')!)  : undefined;
    const recommendation = p.get('recommendation') || undefined;
    const query       = p.get('q') || undefined;

    const results = await archiveStore.combinedSearch({
      skills, days, fromDate, toDate, interviewer, minScore, maxScore, recommendation, query,
    });

    return NextResponse.json({ results, total: results.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
