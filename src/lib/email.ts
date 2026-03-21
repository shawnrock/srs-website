import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';
import { generateICS, googleCalendarUrl } from './calendar';

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_SECURE !== 'false', // true for port 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    pool: true,
    maxConnections: 3,
    maxMessages: 100,
  });
}

const FROM = process.env.SMTP_FROM || 'SRS Infoway AI Interview <no-reply@saassrs.com>';

/**
 * Send interviewer onboarding invite email with a set-password link.
 */
export async function sendInterviewerInvite({
  name,
  email,
  inviteUrl,
  invitedBy,
}: {
  name: string;
  email: string;
  inviteUrl: string;
  invitedBy: string;
}) {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: FROM,
    to: `${name} <${email}>`,
    subject: 'You have been invited to SRS Infoway AI Interview Platform',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9fafb; border-radius: 12px;">
        <div style="background: #0a2540; border-radius: 8px; padding: 20px 24px; margin-bottom: 24px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px;">SRS Infoway — AI Interview Platform</h1>
        </div>

        <p style="color: #374151; font-size: 15px;">Hi <strong>${name}</strong>,</p>

        <p style="color: #374151; font-size: 15px;">
          <strong>${invitedBy}</strong> has invited you to join the SRS Infoway AI Interview Platform as an Interviewer.
        </p>

        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0 0 8px; color: #166534; font-weight: 600; font-size: 13px;">What happens next:</p>
          <ol style="margin: 0; padding-left: 20px; color: #166534; font-size: 13px;">
            <li>Click the button below to set up your password</li>
            <li>Log in with your email and new password</li>
            <li>You can access the platform from up to <strong>2 devices/locations</strong></li>
          </ol>
        </div>

        <div style="text-align: center; margin: 28px 0;">
          <a href="${inviteUrl}"
            style="background: #e8542f; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 15px; font-weight: 600; display: inline-block;">
            Accept Invite &amp; Set Password
          </a>
        </div>

        <p style="color: #6b7280; font-size: 13px;">
          This link expires in <strong>72 hours</strong>. If you did not expect this invitation, you can safely ignore this email.
        </p>

        <p style="color: #6b7280; font-size: 13px; margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
          SRS Infoway Recruitment Team<br/>
          <a href="https://www.srsinfoway.com" style="color: #0097a7; text-decoration: none;">www.srsinfoway.com</a>
        </p>
      </div>
    `,
  });
  console.log(`[Email] Interviewer invite sent to ${email}`);
}

/**
 * Send Google Calendar-compatible .ics invites to both candidate and interviewer
 * for a scheduled interview. Both recipients get a 15-min reminder popup.
 */
export async function sendScheduledInterviewInvites({
  sessionId,
  candidate,
  jd,
  scheduledAt,
  interviewUrl,
  observerUrl,
  interviewer,
}: {
  sessionId: string;
  candidate: { name: string; email: string };
  jd: { title: string; client: string };
  scheduledAt: Date;
  interviewUrl: string;
  observerUrl: string;
  interviewer: { name: string; email: string };
}) {
  const transporter = createTransporter();
  const organizerEmail = process.env.SMTP_USER || 'no-reply@saassrs.com';
  const organizerName  = 'SRS Infoway AI Interview Platform';

  const title = `Interview – ${jd.title} at ${jd.client}`;
  const description = [
    `Position: ${jd.title}`,
    `Company: ${jd.client}`,
    `Candidate: ${candidate.name}`,
    `Interviewer: ${interviewer.name}`,
  ].join('\n');

  const icsContent = generateICS({
    uid: sessionId,
    title,
    description,
    startAt: scheduledAt,
    durationMinutes: 60,
    organizerEmail,
    organizerName,
    attendees: [
      { name: candidate.name,    email: candidate.email,    role: 'attendee' },
      { name: interviewer.name,  email: interviewer.email,  role: 'chair'    },
    ],
    candidateJoinUrl:  interviewUrl,
    interviewerJoinUrl: observerUrl,
  });

  const gcalUrl = googleCalendarUrl({
    title,
    startAt: scheduledAt,
    durationMinutes: 60,
    description: `${description}\n\nCandidate link: ${interviewUrl}\nInterviewer panel: ${observerUrl}`,
    attendeeEmails: [candidate.email, interviewer.email],
  });

  const icsAttachment = {
    filename: 'interview-invite.ics',
    content:  Buffer.from(icsContent, 'utf-8'),
    contentType: 'text/calendar; method=REQUEST',
  };

  const dateStr = scheduledAt.toLocaleString('en-IN', {
    dateStyle: 'full', timeStyle: 'short', timeZone: 'Asia/Kolkata',
  });

  // ── Candidate email ───────────────────────────────────────────────────────
  await transporter.sendMail({
    from: FROM,
    to: `${candidate.name} <${candidate.email}>`,
    subject: `[Interview Scheduled] ${jd.title} at ${jd.client} – ${dateStr}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9fafb; border-radius: 12px;">
        <div style="background: #0a2540; border-radius: 8px; padding: 20px 24px; margin-bottom: 24px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px;">SRS Infoway — Interview Scheduled</h1>
        </div>
        <p style="color: #374151; font-size: 15px;">Dear <strong>${candidate.name}</strong>,</p>
        <p style="color: #374151; font-size: 15px;">
          Your AI interview for <strong>${jd.title}</strong> at <strong>${jd.client}</strong> has been scheduled.
        </p>
        <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p style="margin: 0 0 8px; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase;">Interview Details</p>
          <p style="margin: 4px 0; color: #111827;"><strong>📅 Date & Time:</strong> ${dateStr}</p>
          <p style="margin: 4px 0; color: #111827;"><strong>Position:</strong> ${jd.title}</p>
          <p style="margin: 4px 0; color: #111827;"><strong>Company:</strong> ${jd.client}</p>
          <p style="margin: 4px 0; color: #111827;"><strong>Duration:</strong> ~60 minutes</p>
        </div>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${interviewUrl}" style="background: #e8542f; color: #fff; text-decoration: none; padding: 13px 28px; border-radius: 8px; font-size: 15px; font-weight: 600; display: inline-block; margin: 0 6px;">
            Join Interview
          </a>
          <a href="${gcalUrl}" style="background: #4285f4; color: #fff; text-decoration: none; padding: 13px 28px; border-radius: 8px; font-size: 15px; font-weight: 600; display: inline-block; margin: 0 6px;">
            📅 Add to Google Calendar
          </a>
        </div>
        <div style="background: #fef9c3; border: 1px solid #fde047; border-radius: 8px; padding: 12px 16px; margin-top: 16px;">
          <p style="margin: 0; color: #713f12; font-size: 13px;">
            ⏰ You will receive a <strong>15-minute reminder</strong> before the interview starts (via Google Calendar notification).
          </p>
        </div>
        <p style="color: #6b7280; font-size: 13px; margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
          The calendar invite (.ics) is attached to this email — it works with Google Calendar, Outlook and Apple Calendar.<br/><br/>
          Best of luck! · <strong>SRS Infoway Recruitment Team</strong>
        </p>
      </div>`,
    attachments: [icsAttachment],
  });

  // ── Interviewer email ─────────────────────────────────────────────────────
  await transporter.sendMail({
    from: FROM,
    to: `${interviewer.name} <${interviewer.email}>`,
    subject: `[Interview Scheduled] ${candidate.name} – ${jd.title} – ${dateStr}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9fafb; border-radius: 12px;">
        <div style="background: #0a2540; border-radius: 8px; padding: 20px 24px; margin-bottom: 24px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px;">SRS Infoway — Interview Scheduled</h1>
        </div>
        <p style="color: #374151; font-size: 15px;">Hi <strong>${interviewer.name}</strong>,</p>
        <p style="color: #374151; font-size: 15px;">
          An interview has been scheduled for candidate <strong>${candidate.name}</strong>.
        </p>
        <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p style="margin: 0 0 8px; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase;">Interview Details</p>
          <p style="margin: 4px 0; color: #111827;"><strong>📅 Date & Time:</strong> ${dateStr}</p>
          <p style="margin: 4px 0; color: #111827;"><strong>Candidate:</strong> ${candidate.name} (${candidate.email})</p>
          <p style="margin: 4px 0; color: #111827;"><strong>Position:</strong> ${jd.title}</p>
          <p style="margin: 4px 0; color: #111827;"><strong>Company:</strong> ${jd.client}</p>
        </div>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${observerUrl}" style="background: #0a2540; color: #fff; text-decoration: none; padding: 13px 28px; border-radius: 8px; font-size: 15px; font-weight: 600; display: inline-block; margin: 0 6px;">
            Open Interviewer Panel
          </a>
          <a href="${gcalUrl}" style="background: #4285f4; color: #fff; text-decoration: none; padding: 13px 28px; border-radius: 8px; font-size: 15px; font-weight: 600; display: inline-block; margin: 0 6px;">
            📅 Add to Google Calendar
          </a>
        </div>
        <div style="background: #fef9c3; border: 1px solid #fde047; border-radius: 8px; padding: 12px 16px; margin-top: 16px;">
          <p style="margin: 0; color: #713f12; font-size: 13px;">
            ⏰ A <strong>15-minute reminder</strong> is set in the calendar invite. You'll also see an alert on your interview dashboard.
          </p>
        </div>
        <p style="color: #6b7280; font-size: 13px; margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
          The calendar invite (.ics) is attached — imports directly into Google Calendar, Outlook and Apple Calendar.<br/><br/>
          SRS Infoway Recruitment Team
        </p>
      </div>`,
    attachments: [icsAttachment],
  });

  console.log(`[Email] Scheduled interview invites sent to ${candidate.email} and ${interviewer.email}`);
}

/**
 * Send interview invitation to the candidate.
 */
export async function sendCandidateInvite({
  candidate,
  jd,
  interviewUrl,
}: {
  candidate: { name: string; email: string };
  jd: { title: string; client: string };
  interviewUrl: string;
}) {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: FROM,
    to: `${candidate.name} <${candidate.email}>`,
    subject: `Interview Invitation – ${jd.title} at ${jd.client}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9fafb; border-radius: 12px;">
        <div style="background: #0a2540; border-radius: 8px; padding: 20px 24px; margin-bottom: 24px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px;">SRS Infoway — AI Interview Platform</h1>
        </div>

        <p style="color: #374151; font-size: 15px;">Dear <strong>${candidate.name}</strong>,</p>

        <p style="color: #374151; font-size: 15px;">
          You have been invited to an AI-conducted screening interview for the position of
          <strong>${jd.title}</strong> at <strong>${jd.client}</strong>.
        </p>

        <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p style="margin: 0 0 12px; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Interview Details</p>
          <p style="margin: 4px 0; color: #111827;"><strong>Position:</strong> ${jd.title}</p>
          <p style="margin: 4px 0; color: #111827;"><strong>Company:</strong> ${jd.client}</p>
          <p style="margin: 4px 0; color: #111827;"><strong>Duration:</strong> ~30–45 minutes</p>
          <p style="margin: 4px 0; color: #111827;"><strong>Format:</strong> AI-conducted video interview</p>
        </div>

        <p style="color: #374151; font-size: 15px;">Click the button below to join your interview:</p>

        <div style="text-align: center; margin: 28px 0;">
          <a href="${interviewUrl}"
            style="background: #e8542f; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 15px; font-weight: 600; display: inline-block;">
            Join Interview
          </a>
        </div>

        <div style="background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 16px; margin-top: 20px;">
          <p style="margin: 0 0 8px; color: #92400e; font-weight: 600; font-size: 13px;">Tips for a great interview:</p>
          <ul style="margin: 0; padding-left: 20px; color: #92400e; font-size: 13px;">
            <li>Use a quiet, well-lit location</li>
            <li>Allow camera and microphone permissions when prompted</li>
            <li>Use Google Chrome for the best experience</li>
            <li>Test your internet connection beforehand</li>
          </ul>
        </div>

        <p style="color: #6b7280; font-size: 13px; margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
          Best of luck!<br/>
          <strong>SRS Infoway Recruitment Team</strong><br/>
          <a href="https://www.srsinfoway.com" style="color: #0097a7; text-decoration: none;">www.srsinfoway.com</a>
        </p>
      </div>
    `,
  });
  console.log(`[Email] Candidate invite sent to ${candidate.email}`);
}

/**
 * Send recruiter/observer notification when interview is scheduled.
 */
export async function sendRecruiterNotification({
  recruiterEmail,
  recruiterName,
  candidate,
  jd,
  observerUrl,
}: {
  recruiterEmail: string;
  recruiterName: string;
  candidate: { name: string; email: string };
  jd: { title: string; client: string };
  observerUrl: string;
}) {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: FROM,
    to: `${recruiterName} <${recruiterEmail}>`,
    subject: `[Interview Scheduled] ${candidate.name} – ${jd.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9fafb; border-radius: 12px;">
        <div style="background: #0a2540; border-radius: 8px; padding: 20px 24px; margin-bottom: 24px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px;">SRS Infoway — AI Interview Platform</h1>
        </div>

        <p style="color: #374151; font-size: 15px;">Hi <strong>${recruiterName}</strong>,</p>
        <p style="color: #374151; font-size: 15px;">An AI interview has been scheduled. Here are the details:</p>

        <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p style="margin: 4px 0; color: #111827;"><strong>Candidate:</strong> ${candidate.name} (${candidate.email})</p>
          <p style="margin: 4px 0; color: #111827;"><strong>Position:</strong> ${jd.title}</p>
          <p style="margin: 4px 0; color: #111827;"><strong>Client:</strong> ${jd.client}</p>
        </div>

        <div style="text-align: center; margin: 28px 0;">
          <a href="${observerUrl}"
            style="background: #0a2540; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 15px; font-weight: 600; display: inline-block;">
            Open Interviewer Dashboard
          </a>
        </div>

        <p style="color: #6b7280; font-size: 13px; margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
          SRS Infoway Recruitment Team
        </p>
      </div>
    `,
  });
  console.log(`[Email] Recruiter notification sent to ${recruiterEmail}`);
}

// ─────────────────────────────────────────────────────────────
// Build a PDF Buffer from a report object
// ─────────────────────────────────────────────────────────────
function buildReportPdf(report: any, session: { candidateName?: string; position?: string; client?: string }): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const primary  = '#0a2540';
    const accent   = '#e8542f';
    const cyan     = '#0097a7';
    const muted    = '#64748b';
    const green    = '#059669';
    const red      = '#dc2626';
    const amber    = '#d97706';

    const score = report.overallScore ?? 0;
    const scoreColor = score >= 80 ? green : score >= 60 ? amber : red;

    // ── Header bar ──────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, 72).fill(primary);
    doc.fillColor('#ffffff')
      .font('Helvetica-Bold').fontSize(18)
      .text('SRS Infoway — AI Interview Evaluation Report', 50, 22, { width: doc.page.width - 100 });
    doc.font('Helvetica').fontSize(9).fillColor('rgba(255,255,255,0.7)')
      .text(`Generated on ${new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}  •  Confidential`, 50, 48);

    doc.y = 90;

    // ── Candidate + Score card ───────────────────────────────
    doc.fillColor(primary).font('Helvetica-Bold').fontSize(14)
      .text(session.candidateName || 'Candidate', 50);
    doc.font('Helvetica').fontSize(10).fillColor(muted)
      .text(`${session.position || ''}${session.client ? '  •  ' + session.client : ''}`, 50, doc.y + 2);

    // Score circle (text-based)
    const scoreX = doc.page.width - 120;
    const scoreY = 88;
    doc.rect(scoreX, scoreY, 70, 60).fill('#f8fafc').stroke('#e2e8f0');
    doc.fillColor(scoreColor).font('Helvetica-Bold').fontSize(26)
      .text(String(score), scoreX + 5, scoreY + 8, { width: 60, align: 'center' });
    doc.fillColor(muted).font('Helvetica').fontSize(8)
      .text('/100  Overall', scoreX + 2, scoreY + 40, { width: 66, align: 'center' });

    doc.y = 165;
    doc.fillColor(accent).font('Helvetica-Bold').fontSize(11)
      .text(`Recommendation: ${report.recommendation || 'N/A'}`, 50);

    // ── Divider ──────────────────────────────────────────────
    const hr = () => { doc.moveDown(0.5); doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke('#e2e8f0'); doc.moveDown(0.5); };

    hr();

    // ── Score breakdown ──────────────────────────────────────
    doc.fillColor(primary).font('Helvetica-Bold').fontSize(11).text('Score Breakdown', 50);
    doc.moveDown(0.3);
    const metrics = [
      ['Technical Depth',     report.technicalDepth],
      ['Communication',       report.communicationScore],
      ['Confidence',          report.confidenceLevel],
      ['Proctoring Integrity',report.proctoring?.score],
    ];
    metrics.forEach(([label, val]) => {
      const v = val ?? 0;
      const c = v >= 80 ? green : v >= 60 ? amber : red;
      doc.fillColor(muted).font('Helvetica').fontSize(9).text(`${label}:`, 60, doc.y, { continued: true, width: 160 });
      doc.fillColor(c).font('Helvetica-Bold').fontSize(9).text(` ${v}/100`, { continued: false });
      doc.moveDown(0.2);
    });

    hr();

    // ── Summary ──────────────────────────────────────────────
    if (report.summary) {
      doc.fillColor(primary).font('Helvetica-Bold').fontSize(11).text('Summary', 50);
      doc.moveDown(0.3);
      doc.fillColor('#334155').font('Helvetica').fontSize(9)
        .text(report.summary, 60, doc.y, { width: doc.page.width - 110, lineGap: 3 });
      hr();
    }

    // ── Strengths & Weaknesses ───────────────────────────────
    const colW = (doc.page.width - 120) / 2;
    const colY = doc.y;

    if (report.strengths?.length) {
      doc.fillColor(green).font('Helvetica-Bold').fontSize(10).text('Strengths', 60, colY);
      report.strengths.slice(0, 5).forEach((s: string) => {
        doc.fillColor('#334155').font('Helvetica').fontSize(9)
          .text(`+ ${s}`, 60, doc.y + 2, { width: colW - 10, lineGap: 2 });
      });
    }

    if (report.weaknesses?.length) {
      const wx = 60 + colW + 10;
      doc.fillColor(amber).font('Helvetica-Bold').fontSize(10).text('Areas for Improvement', wx, colY);
      report.weaknesses.slice(0, 5).forEach((w: string) => {
        doc.fillColor('#334155').font('Helvetica').fontSize(9)
          .text(`– ${w}`, wx, doc.y + 2, { width: colW - 10, lineGap: 2 });
      });
    }

    doc.y = Math.max(doc.y + 12, colY + 80);
    hr();

    // ── Answer Transcripts ───────────────────────────────────
    const transcripts = report.answerTranscripts || {};
    if (Object.keys(transcripts).length > 0) {
      doc.fillColor(primary).font('Helvetica-Bold').fontSize(11).text('Interview Transcripts', 50);
      doc.moveDown(0.3);
      Object.entries(transcripts).forEach(([qi, text]) => {
        const qNum = parseInt(qi) + 1;
        doc.fillColor(cyan).font('Helvetica-Bold').fontSize(9).text(`Question ${qNum}:`, 60, doc.y + 4);
        doc.fillColor('#334155').font('Helvetica').fontSize(8.5)
          .text(String(text || '(no response captured)'), 60, doc.y + 2, { width: doc.page.width - 110, lineGap: 2 });
        doc.moveDown(0.4);
      });
      hr();
    }

    // ── Proctoring Alerts ────────────────────────────────────
    const alerts = report.proctoring?.alerts || [];
    if (alerts.length > 0) {
      doc.fillColor(primary).font('Helvetica-Bold').fontSize(11).text('Integrity Alerts', 50);
      doc.moveDown(0.3);
      doc.fillColor(muted).font('Helvetica').fontSize(9)
        .text(`Total: ${alerts.length}  •  High: ${report.proctoring.redFlags}  •  Warnings: ${report.proctoring.warnings}`, 60);
      doc.moveDown(0.3);
      alerts.slice(0, 15).forEach((a: any) => {
        const isHigh = a.severity === 'high';
        doc.fillColor(isHigh ? red : amber).font('Helvetica-Bold').fontSize(8.5)
          .text(`${isHigh ? '●' : '○'} ${a.check}`, 60, doc.y + 2, { continued: true });
        doc.fillColor(muted).font('Helvetica').fontSize(8)
          .text(`  ${a.detail || ''}`, { continued: false });
        doc.moveDown(0.2);
      });
      hr();
    }

    // ── Footer ───────────────────────────────────────────────
    doc.moveDown(1);
    doc.fillColor(muted).font('Helvetica').fontSize(8)
      .text('This report was generated automatically by the SRS Infoway AI Interview Platform.\nFor queries contact: recruitment@srsinfoway.com  •  www.srsinfoway.com', 50, doc.y, { align: 'center', width: doc.page.width - 100 });

    doc.end();
  });
}

// ─────────────────────────────────────────────────────────────
// Send the completed interview report as a PDF to the recruiter
// ─────────────────────────────────────────────────────────────
export async function sendInterviewReport({
  recruiterEmail,
  recruiterName,
  report,
  session,
}: {
  recruiterEmail: string;
  recruiterName?: string;
  report: any;
  session: { id: string; candidateName?: string; position?: string; client?: string; observerUrl?: string };
}) {
  const pdfBuffer = await buildReportPdf(report, session);
  const fileName = `Interview_Report_${(session.candidateName || 'Candidate').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;

  const transporter = createTransporter();
  await transporter.sendMail({
    from: FROM,
    to: recruiterName ? `${recruiterName} <${recruiterEmail}>` : recruiterEmail,
    subject: `[Interview Report] ${session.candidateName || 'Candidate'} – ${session.position || 'Interview'}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9fafb; border-radius: 12px;">
        <div style="background: #0a2540; border-radius: 8px; padding: 20px 24px; margin-bottom: 24px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px;">SRS Infoway — Interview Report Ready</h1>
        </div>

        <p style="color: #374151; font-size: 15px;">Hi${recruiterName ? ' ' + recruiterName : ''},</p>
        <p style="color: #374151; font-size: 15px;">
          The AI interview for <strong>${session.candidateName || 'the candidate'}</strong> applying for
          <strong>${session.position || 'the position'}</strong>${session.client ? ' at <strong>' + session.client + '</strong>' : ''} has been completed.
        </p>

        <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p style="margin: 0 0 10px; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Report Summary</p>
          <p style="margin: 4px 0; color: #111827;"><strong>Overall Score:</strong> ${report.overallScore ?? 'N/A'}/100</p>
          <p style="margin: 4px 0; color: #111827;"><strong>Recommendation:</strong> ${report.recommendation || 'N/A'}</p>
          ${report.proctoring ? `<p style="margin: 4px 0; color: #111827;"><strong>Integrity Score:</strong> ${report.proctoring.score}/100 (${report.proctoring.totalAlerts} alerts)</p>` : ''}
        </div>

        <p style="color: #374151; font-size: 14px;">
          The full evaluation report is attached as a PDF. You can also view the detailed report online:
        </p>

        ${session.observerUrl ? `
        <div style="text-align: center; margin: 24px 0;">
          <a href="${session.observerUrl}"
            style="background: #0a2540; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: 600; display: inline-block;">
            View Full Report on Interviewer Dashboard →
          </a>
        </div>` : ''}

        <p style="color: #6b7280; font-size: 13px; margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
          SRS Infoway Recruitment Team<br/>
          <a href="https://www.srsinfoway.com" style="color: #0097a7; text-decoration: none;">www.srsinfoway.com</a>
        </p>
      </div>
    `,
    attachments: [
      {
        filename: fileName,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  });
  console.log(`[Email] Interview report sent to ${recruiterEmail}`);
}
