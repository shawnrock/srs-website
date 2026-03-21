import { NextRequest, NextResponse } from 'next/server';
import { sendCandidateInvite, sendRecruiterNotification, sendScheduledInterviewInvites } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, candidate, jd, interviewUrl, observerUrl, recruiterEmail, recruiterName,
            sessionId, scheduledAt, interviewer } = body;

    if (!type || !candidate?.email || !candidate?.name || !jd?.title || !jd?.client) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (type === 'candidate_invite') {
      if (!interviewUrl) return NextResponse.json({ error: 'interviewUrl required' }, { status: 400 });
      await sendCandidateInvite({ candidate, jd, interviewUrl });

    } else if (type === 'recruiter_notification') {
      if (!observerUrl || !recruiterEmail || !recruiterName) {
        return NextResponse.json({ error: 'observerUrl, recruiterEmail, recruiterName required' }, { status: 400 });
      }
      await sendRecruiterNotification({ recruiterEmail, recruiterName, candidate, jd, observerUrl });

    } else if (type === 'scheduled_invite') {
      if (!sessionId || !scheduledAt || !interviewUrl || !observerUrl || !interviewer?.name || !interviewer?.email) {
        return NextResponse.json({ error: 'sessionId, scheduledAt, interviewUrl, observerUrl, interviewer required' }, { status: 400 });
      }
      await sendScheduledInterviewInvites({
        sessionId,
        candidate,
        jd,
        scheduledAt: new Date(scheduledAt),
        interviewUrl,
        observerUrl,
        interviewer,
      });

    } else {
      return NextResponse.json({ error: 'Unknown email type' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Email API] Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 });
  }
}
