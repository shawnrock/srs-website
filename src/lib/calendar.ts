/**
 * calendar.ts
 * Utilities for generating .ics calendar invites and Google Calendar links.
 */

/** Format a Date as ICS timestamp: YYYYMMDDTHHMMSSZ */
function icsDate(date: Date): string {
  return date.toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';
}

/** Escape ICS text values */
function icsEscape(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

/** Fold long ICS lines at 75 chars (RFC 5545) */
function icsFold(line: string): string {
  if (line.length <= 75) return line;
  const chunks: string[] = [];
  chunks.push(line.slice(0, 75));
  let pos = 75;
  while (pos < line.length) {
    chunks.push(' ' + line.slice(pos, pos + 74));
    pos += 74;
  }
  return chunks.join('\r\n');
}

export interface CalendarEventOptions {
  uid: string;
  title: string;
  description: string;
  startAt: Date;          // interview start time
  durationMinutes?: number; // default 60
  location?: string;
  organizerEmail: string;
  organizerName: string;
  attendees: Array<{ name: string; email: string; role?: 'chair' | 'attendee' }>;
  candidateJoinUrl: string;
  interviewerJoinUrl: string;
}

/**
 * Generate .ics file content as a string.
 * Includes a 15-minute VALARM popup reminder for all attendees.
 */
export function generateICS(opts: CalendarEventOptions): string {
  const {
    uid, title, description, startAt,
    durationMinutes = 60, location,
    organizerEmail, organizerName,
    attendees, candidateJoinUrl, interviewerJoinUrl,
  } = opts;

  const endAt  = new Date(startAt.getTime() + durationMinutes * 60_000);
  const now    = new Date();

  const descFull = [
    description,
    '',
    '─────────────────────────────',
    `Candidate Join Link: ${candidateJoinUrl}`,
    `Interviewer Panel:   ${interviewerJoinUrl}`,
    '─────────────────────────────',
    'Powered by SRS Infoway AI Interview Platform',
  ].join('\n');

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SRS Infoway//AI Interview Platform//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    icsFold(`UID:${uid}@srsinfoway.com`),
    icsFold(`DTSTAMP:${icsDate(now)}`),
    icsFold(`DTSTART:${icsDate(startAt)}`),
    icsFold(`DTEND:${icsDate(endAt)}`),
    icsFold(`SUMMARY:${icsEscape(title)}`),
    icsFold(`DESCRIPTION:${icsEscape(descFull)}`),
    icsFold(`LOCATION:${icsEscape(location ?? 'Online – SRS Infoway AI Interview Platform')}`),
    icsFold(`URL:${candidateJoinUrl}`),
    icsFold(`ORGANIZER;CN=${icsEscape(organizerName)}:mailto:${organizerEmail}`),
    ...attendees.map(a => {
      const role = a.role === 'chair' ? 'CHAIR' : 'REQ-PARTICIPANT';
      const stat = a.role === 'chair' ? 'ACCEPTED' : 'NEEDS-ACTION';
      return icsFold(
        `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=${role};PARTSTAT=${stat};RSVP=TRUE;CN=${icsEscape(a.name)}:mailto:${a.email}`,
      );
    }),
    // 15-minute popup reminder
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    icsFold('DESCRIPTION:Your interview is starting in 15 minutes!'),
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return lines.join('\r\n');
}

/**
 * Build a "Add to Google Calendar" URL (opens in browser, no API key needed).
 */
export function googleCalendarUrl(opts: {
  title: string;
  startAt: Date;
  durationMinutes?: number;
  description: string;
  attendeeEmails: string[];
}): string {
  const { title, startAt, durationMinutes = 60, description, attendeeEmails } = opts;
  const endAt = new Date(startAt.getTime() + durationMinutes * 60_000);

  const fmt = (d: Date) => d.toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';

  const params = new URLSearchParams({
    action:  'TEMPLATE',
    text:    title,
    dates:   `${fmt(startAt)}/${fmt(endAt)}`,
    details: description,
    add:     attendeeEmails.join(','),
    sf:      'true',
    output:  'xml',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
