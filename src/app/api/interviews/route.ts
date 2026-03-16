import { NextRequest, NextResponse } from 'next/server';
import { sessionManager } from '@/lib/session-manager';
import { geminiService } from '@/lib/gemini-service';

export async function GET() {
  const sessions = await sessionManager.getAllSessions();
  return NextResponse.json(sessions.map(s => ({
    id: s.id,
    status: s.status,
    candidate: s.candidate,
    jd: s.jd,
    createdAt: s.createdAt,
    lastActivityAt: s.lastActivityAt,
    interviewUrl: s.interviewUrl,
    observerUrl: s.observerUrl,
    questionsCount: s.questions?.length || 0,
  })));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jd, candidate } = body;

    if (!jd?.title || !jd?.description || !candidate?.name || !candidate?.email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const session = await sessionManager.createSession(jd, candidate);

    // Generate questions and profile analysis in parallel
    const [questions, profileAnalysis] = await Promise.allSettled([
      geminiService.generateQuestions(jd, candidate.resume || ''),
      candidate.resume ? geminiService.analyzeResumeProfile(candidate) : Promise.resolve(null),
    ]);

    let finalQuestions = session.questions;
    let finalProfileAnalysis = null;
    let matchScore: number | undefined;

    if (questions.status === 'fulfilled') {
      finalQuestions = questions.value;
      if (profileAnalysis.status === 'fulfilled' && profileAnalysis.value) {
        finalProfileAnalysis = profileAnalysis.value;
        matchScore = profileAnalysis.value.matchScore;
      }
    } else {
      console.error('Failed to generate questions:', questions.reason);
      finalQuestions = [
        { text: 'Tell me about yourself and your experience.', category: 'Behavioral', keywords: [], difficulty: 'Easy' },
        { text: `What interests you most about the ${jd.title} role?`, category: 'Cultural Fit', keywords: [], difficulty: 'Easy' },
        { text: 'Describe a challenging project you worked on and how you overcame obstacles.', category: 'Problem-Solving', keywords: [], difficulty: 'Medium' },
        { text: 'What are your greatest technical strengths?', category: 'Technical', keywords: [], difficulty: 'Medium' },
        { text: 'Where do you see yourself in 5 years?', category: 'Behavioral', keywords: [], difficulty: 'Easy' },
      ];
    }

    const updatedCandidate = matchScore !== undefined
      ? { ...session.candidate, matchScore }
      : session.candidate;

    await sessionManager.updateSession(session.id, {
      questions: finalQuestions,
      profileAnalysis: finalProfileAnalysis,
      candidate: updatedCandidate,
    });

    return NextResponse.json({
      id: session.id,
      status: session.status,
      interviewUrl: session.interviewUrl,
      observerUrl: session.observerUrl,
      questionsCount: finalQuestions.length,
      candidate: updatedCandidate,
      jd: session.jd,
    }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/interviews error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
