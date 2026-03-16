import nodemailer from 'nodemailer';

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
            Open Observer Dashboard
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
