"use client";
import { use, useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft, CheckCircle, XCircle, AlertCircle, Shield, User,
  Briefcase, Clock, MessageSquare, BarChart2, ChevronDown, ChevronUp,
  FileText, Star, AlertTriangle, Eye, Printer
} from "lucide-react";

// ── Colour tokens ─────────────────────────────────────────────
const C = {
  navy:    '#0a2540', orange:  '#e8542f', slate:   '#475569',
  muted:   '#94a3b8', light:   '#f4f6fb', border:  '#e2e8f0',
  green:   '#059669', greenBg: '#d1fae5',
  amber:   '#d97706', amberBg: '#fef3c7',
  red:     '#dc2626', redBg:   '#fee2e2',
  blue:    '#2563eb', blueBg:  '#dbeafe',
  white:   '#ffffff',
};

const scoreColor  = (s: number) => s >= 75 ? C.green : s >= 50 ? C.amber : s > 0 ? C.red : C.muted;
const scoreBg     = (s: number) => s >= 75 ? C.greenBg : s >= 50 ? C.amberBg : s > 0 ? C.redBg : C.light;
const fmtDate     = (iso: string) => iso ? new Date(iso).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtTime     = (iso: string) => iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
const fmtDur      = (mins: number) => !mins || mins <= 0 ? '—' : mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)}h ${mins % 60}m`;

// ── Small helpers ─────────────────────────────────────────────
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 24, ...style }}>
      {children}
    </div>
  );
}

function SectionTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
      <div style={{ color: C.orange }}>{icon}</div>
      <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.navy }}>{children}</h2>
    </div>
  );
}

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div style={{ background: C.light, borderRadius: 99, height: 8, overflow: 'hidden', flex: 1 }}>
      <div style={{ width: `${Math.min(score, 100)}%`, height: '100%', background: color, borderRadius: 99, transition: 'width 0.6s ease' }} />
    </div>
  );
}

function RecBadge({ rec }: { rec: string }) {
  const isRec  = rec?.toLowerCase().includes('recommended') && !rec?.toLowerCase().includes('not');
  const isCond = rec?.toLowerCase().includes('conditional');
  const color  = isRec ? C.green : isCond ? C.amber : C.red;
  const bg     = isRec ? C.greenBg : isCond ? C.amberBg : C.redBg;
  const Icon   = isRec ? CheckCircle : isCond ? AlertCircle : XCircle;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 99, background: bg, color, fontSize: 13, fontWeight: 700 }}>
      <Icon size={15} /> {rec || '—'}
    </span>
  );
}

function AlertBadge({ severity }: { severity: string }) {
  const high = severity === 'high';
  return (
    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700,
      background: high ? C.redBg : C.amberBg, color: high ? C.red : C.amber, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {high ? '🚨 Red Flag' : '⚠ Warning'}
    </span>
  );
}

// ── Q&A Accordion row ─────────────────────────────────────────
function QARow({ idx, question, answer, feedback }: { idx: number; question: any; answer: string; feedback: any }) {
  const [open, setOpen] = useState(false);
  const hasAnswer = answer && answer.trim().length > 0;
  const score = feedback?.score ?? null;

  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden', marginBottom: 10 }}>
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 18px',
          background: open ? C.light : C.white, border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: C.navy, color: C.white,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>
          {idx + 1}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, lineHeight: 1.5 }}>
            {question?.question || question?.text || `Question ${idx + 1}`}
          </div>
          {question?.category && (
            <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{question.category}</div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {score !== null && (
            <span style={{ fontSize: 12, fontWeight: 700, color: scoreColor(score * 10), background: scoreBg(score * 10), padding: '2px 10px', borderRadius: 99 }}>
              {score}/10
            </span>
          )}
          {!hasAnswer && (
            <span style={{ fontSize: 11, color: C.muted, background: C.light, padding: '2px 10px', borderRadius: 99 }}>No answer</span>
          )}
          <div style={{ color: C.muted }}>{open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</div>
        </div>
      </button>

      {/* Expanded */}
      {open && (
        <div style={{ padding: '16px 18px', background: C.white, borderTop: `1px solid ${C.border}` }}>
          {hasAnswer ? (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Candidate's Answer</div>
              <div style={{ fontSize: 13, color: C.slate, lineHeight: 1.7, background: C.light, borderRadius: 8, padding: '12px 16px', whiteSpace: 'pre-wrap' }}>
                {answer}
              </div>
              {feedback?.feedback && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>AI Feedback</div>
                  <div style={{ fontSize: 12, color: C.slate, lineHeight: 1.6, padding: '10px 14px', background: C.blueBg || '#eff6ff', borderRadius: 8, borderLeft: `3px solid ${C.blue}` }}>
                    {feedback.feedback}
                  </div>
                </div>
              )}
              {feedback?.keywordsHit?.length > 0 && (
                <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  <span style={{ fontSize: 11, color: C.muted, alignSelf: 'center' }}>Keywords matched:</span>
                  {feedback.keywordsHit.map((k: string, i: number) => (
                    <span key={i} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: C.greenBg, color: C.green, fontWeight: 600 }}>{k}</span>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={{ color: C.muted, fontSize: 13, fontStyle: 'italic' }}>
              This question was not answered by the candidate.
            </div>
          )}
          {question?.expectedAnswer && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: '#f0fdf4', borderRadius: 8, borderLeft: `3px solid ${C.green}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.green, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Expected Answer Guide</div>
              <div style={{ fontSize: 12, color: C.slate, lineHeight: 1.6 }}>{question.expectedAnswer}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════
export default function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [report, setReport]   = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    Promise.all([
      fetch(`/api/interviews/${id}/report`).then(r => r.json()),
      fetch(`/api/interviews/${id}`).then(r => r.json()),
    ])
      .then(([rpt, sess]) => {
        if (rpt.error) throw new Error(rpt.error);
        setReport(rpt);
        setSession(sess);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: C.light, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 44, height: 44, border: `3px solid ${C.border}`, borderTopColor: C.orange, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: C.muted, fontSize: 14 }}>Loading interview report…</p>
    </div>
  );

  if (error || !report) return (
    <div style={{ minHeight: '100vh', background: C.light, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
      <AlertCircle size={48} color={C.red} />
      <p style={{ color: C.slate }}>{error || 'Report not found'}</p>
      <Link href="/ai-interview/admin/reports" style={{ color: C.orange, fontSize: 14 }}>← Back to Reports</Link>
    </div>
  );

  const questions   = session?.questions || [];
  const transcripts = report.answerTranscripts || {};
  const alerts      = report.proctoring?.alerts || session?.proctorAlerts || [];
  const durationMin = session?.interviewDurationMinutes ||
    (session?.interviewStartedAt
      ? Math.round((new Date(report.interviewDate).getTime() - new Date(session.interviewStartedAt).getTime()) / 60000)
      : 0);

  const qFeedback: Record<number, any> = {};
  if (report.questionFeedback) {
    report.questionFeedback.forEach((f: any, i: number) => { qFeedback[i] = f; });
  }
  if (report.keywordAnalysis?.perQuestion) {
    report.keywordAnalysis.perQuestion.forEach((q: any) => {
      if (q && !qFeedback[q.questionIndex]) qFeedback[q.questionIndex] = q;
    });
  }

  const recColor = report.recommendation?.toLowerCase().includes('not') ? C.red
    : report.recommendation?.toLowerCase().includes('conditional') ? C.amber : C.green;

  const infoFields = [
    { label: 'Total Experience',    value: session?.candidateInfo?.totalExperience },
    { label: 'Relevant Experience', value: session?.candidateInfo?.relevantExperience },
    { label: 'Highest Degree',      value: session?.candidateInfo?.highestDegree },
    { label: 'Current Location',    value: session?.candidateInfo?.currentLocation },
    { label: 'Current CTC',         value: session?.candidateInfo?.currentSalary },
    { label: 'Expected CTC',        value: session?.candidateInfo?.expectedSalary },
    { label: 'Notice Period',       value: session?.candidateInfo?.noticePeriod },
    { label: 'Location Preference', value: session?.candidateInfo?.locationPreference },
  ].filter(f => f.value);

  return (
    <div style={{ minHeight: '100vh', background: C.light, fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* ── Header bar ─────────────────────────────────────── */}
      <div style={{ background: C.navy, padding: '0 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link href="/ai-interview/admin/reports"
              style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8', textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>
              <ArrowLeft size={15} /> Reports
            </Link>
            <div style={{ width: 1, height: 16, background: '#334155' }} />
            <div>
              <div style={{ color: C.white, fontWeight: 700, fontSize: 15 }}>Interview Report</div>
              <div style={{ color: '#94a3b8', fontSize: 11 }}>
                {report.candidate || session?.candidate?.name} — {report.position || session?.jd?.title}
              </div>
            </div>
          </div>
          <button onClick={() => window.print()}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 8,
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
              color: C.white, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            <Printer size={13} /> Print / Save PDF
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── 1. TOP SUMMARY CARD ────────────────────────────── */}
        <Card>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start' }}>
            {/* Score circle */}
            <div style={{ width: 110, height: 110, borderRadius: '50%', border: `5px solid ${recColor}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: recColor, lineHeight: 1 }}>
                {report.overallScore > 0 ? report.overallScore : '—'}
              </div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>/100</div>
            </div>

            {/* Main info */}
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ marginBottom: 10 }}><RecBadge rec={report.recommendation} /></div>
              <h1 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 800, color: C.navy }}>
                {report.candidate || session?.candidate?.name || '—'}
              </h1>
              <div style={{ fontSize: 14, color: C.slate, marginBottom: 14 }}>
                {report.position || session?.jd?.title}
                {(report.client || session?.jd?.client) && <span style={{ color: C.muted }}> · {report.client || session?.jd?.client}</span>}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                {[
                  { icon: <User size={13} />,       label: session?.recruiterName || 'Interviewer' },
                  { icon: <Clock size={13} />,       label: `${fmtDate(report.interviewDate || session?.interviewStartedAt)} at ${fmtTime(report.interviewDate || session?.interviewStartedAt)}` },
                  { icon: <Clock size={13} />,       label: fmtDur(durationMin) },
                  { icon: <MessageSquare size={13} />, label: `${report.questionsAnswered || Object.keys(transcripts).length}/${report.totalQuestions || questions.length} questions answered` },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: C.muted }}>
                    {item.icon}{item.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Score chips */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, flexShrink: 0 }}>
              {[
                { label: 'Technical',      value: report.technicalDepth },
                { label: 'Communication',  value: report.communicationScore },
                { label: 'Confidence',     value: report.confidenceLevel },
                { label: 'Proctoring',     value: report.proctoring?.score },
              ].map(({ label, value }) => value != null && (
                <div key={label} style={{ textAlign: 'center', background: C.light, borderRadius: 10, padding: '10px 14px', minWidth: 80 }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: scoreColor(value) }}>{value}</div>
                  <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

          {/* ── 2. AI SUMMARY ──────────────────────────────── */}
          {report.summary && (
            <Card style={{ gridColumn: '1 / -1' }}>
              <SectionTitle icon={<FileText size={17} />}>AI Interview Summary</SectionTitle>
              <p style={{ margin: 0, fontSize: 14, color: C.slate, lineHeight: 1.8 }}>{report.summary}</p>
            </Card>
          )}

          {/* ── 3. STRENGTHS & IMPROVEMENTS ───────────────── */}
          <Card>
            <SectionTitle icon={<Star size={17} />}>Strengths</SectionTitle>
            {(report.strengths?.length > 0) ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {report.strengths.map((s: string, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <CheckCircle size={15} color={C.green} style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: 13, color: C.slate, lineHeight: 1.6 }}>{s}</span>
                  </div>
                ))}
              </div>
            ) : <p style={{ color: C.muted, fontSize: 13 }}>No strengths recorded.</p>}
          </Card>

          <Card>
            <SectionTitle icon={<AlertCircle size={17} />}>Areas to Improve</SectionTitle>
            {((report.weaknesses || report.areasForImprovement)?.length > 0) ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(report.weaknesses || report.areasForImprovement).map((w: string, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <AlertTriangle size={15} color={C.amber} style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: 13, color: C.slate, lineHeight: 1.6 }}>{w}</span>
                  </div>
                ))}
              </div>
            ) : <p style={{ color: C.muted, fontSize: 13 }}>No improvement areas recorded.</p>}
          </Card>

          {/* ── 4. SCORE BREAKDOWN ─────────────────────────── */}
          {report.sections?.length > 0 && (
            <Card style={{ gridColumn: '1 / -1' }}>
              <SectionTitle icon={<BarChart2 size={17} />}>Score Breakdown</SectionTitle>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                {report.sections.map((s: any, i: number) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: C.slate }}>{s.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: scoreColor(s.score) }}>{s.score}%</span>
                    </div>
                    <ScoreBar score={s.score} color={scoreColor(s.score)} />
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* ── 5. Q&A TRANSCRIPT ────────────────────────────── */}
        <Card>
          <SectionTitle icon={<MessageSquare size={17} />}>
            Question & Answer Transcript ({questions.length > 0 ? questions.length : Object.keys(transcripts).length} questions)
          </SectionTitle>
          {questions.length > 0 ? (
            questions.map((q: any, idx: number) => (
              <QARow
                key={idx}
                idx={idx}
                question={q}
                answer={transcripts[idx] || transcripts[String(idx)] || ''}
                feedback={qFeedback[idx]}
              />
            ))
          ) : Object.keys(transcripts).length > 0 ? (
            Object.entries(transcripts).map(([idx, answer]) => (
              <QARow
                key={idx}
                idx={parseInt(idx)}
                question={{ question: `Question ${parseInt(idx) + 1}` }}
                answer={answer as string}
                feedback={qFeedback[parseInt(idx)]}
              />
            ))
          ) : (
            <p style={{ color: C.muted, fontSize: 13 }}>No transcript available for this interview.</p>
          )}
        </Card>

        {/* ── 6. PROCTORING REPORT ─────────────────────────── */}
        <Card>
          <SectionTitle icon={<Shield size={17} />}>Proctoring Report</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
            {[
              { label: 'Integrity Score', value: `${report.proctoring?.score ?? '—'}%`, color: scoreColor(report.proctoring?.score ?? 0) },
              { label: 'Total Alerts',    value: report.proctoring?.totalAlerts ?? alerts.length, color: C.slate },
              { label: 'Warnings',        value: report.proctoring?.warnings ?? '—', color: C.amber },
              { label: 'Red Flags',       value: report.proctoring?.redFlags ?? '—', color: C.red },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ textAlign: 'center', background: C.light, borderRadius: 10, padding: '14px 10px' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color }}>{value}</div>
                <div style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>

          {alerts.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 110px auto', gap: 10,
                padding: '7px 14px', background: C.light, borderRadius: 8,
                fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <span>Time</span><span>Alert</span><span>Type</span><span>Severity</span>
              </div>
              {alerts.map((a: any, i: number) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 110px auto', gap: 10,
                  padding: '10px 14px', borderRadius: 8, border: `1px solid ${C.border}`,
                  background: a.severity === 'high' ? '#fff5f5' : C.white, alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: C.muted, whiteSpace: 'nowrap' }}>
                    {a.timestamp ? new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : `#${i + 1}`}
                  </span>
                  <span style={{ fontSize: 13, color: C.slate }}>{a.message || a.description || a.type}</span>
                  <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>{a.type || '—'}</span>
                  <AlertBadge severity={a.severity} />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px',
              background: C.greenBg, borderRadius: 10, color: C.green, fontWeight: 600, fontSize: 13 }}>
              <CheckCircle size={18} /> No proctoring alerts — clean interview session
            </div>
          )}
        </Card>

        {/* ── 7. CANDIDATE PROFILE ────────────────────────── */}
        {infoFields.length > 0 && (
          <Card>
            <SectionTitle icon={<User size={17} />}>Candidate Profile (Self-Submitted)</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
              {infoFields.map(({ label, value }) => (
                <div key={label} style={{ background: C.light, borderRadius: 10, padding: '12px 16px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>{label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>{value}</div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ── 8. INTERVIEWER NOTES ─────────────────────────── */}
        {session?.interviewerNotes && (
          <Card>
            <SectionTitle icon={<Eye size={17} />}>Interviewer Notes</SectionTitle>
            <div style={{ background: C.light, borderRadius: 10, padding: '14px 18px',
              fontSize: 13, color: C.slate, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
              {session.interviewerNotes}
            </div>
          </Card>
        )}

        {/* ── Footer ───────────────────────────────────────── */}
        <div style={{ textAlign: 'center', padding: '12px 0 24px', color: C.muted, fontSize: 12 }}>
          SRS Infoway AI Interview Platform · Report generated {fmtDate(report.interviewDate)} · Session ID: {id}
        </div>
      </div>

      <style>{`
        @media print {
          button { display: none !important; }
          body { background: white !important; }
        }
      `}</style>
    </div>
  );
}
