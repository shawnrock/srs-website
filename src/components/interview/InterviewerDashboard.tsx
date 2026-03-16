"use client";
import React, { useState, useEffect, useRef } from 'react';

// ============================================
// INTERVIEWER DASHBOARD
// SRS Infoway — AI Interview Platform
// ============================================

const C = {
  bg: '#f4f6fb',
  surface: '#ffffff',
  surfaceAlt: '#f8fafc',
  border: '#e2e8f0',
  borderStrong: '#cbd5e1',
  text: '#1e293b',
  textMid: '#475569',
  textMuted: '#94a3b8',
  primary: '#0a2540',
  primaryLight: '#e8f0fb',
  cyan: '#0097a7',
  cyanLight: '#e0f7fa',
  green: '#059669',
  greenLight: '#d1fae5',
  amber: '#d97706',
  amberLight: '#fef3c7',
  red: '#dc2626',
  redLight: '#fee2e2',
  accent: '#e8542f',
  shadow: '0 1px 4px rgba(0,0,0,0.08)',
  shadowMd: '0 4px 16px rgba(0,0,0,0.10)',
};

interface BadgeProps { color?: string; children: React.ReactNode; style?: React.CSSProperties; }
const Badge = ({ color = 'gray', children, style }: BadgeProps) => {
  const map: Record<string, { bg: string; color: string; border: string }> = {
    green:  { bg: C.greenLight, color: C.green, border: '#a7f3d0' },
    amber:  { bg: C.amberLight, color: C.amber, border: '#fde68a' },
    red:    { bg: C.redLight,   color: C.red,   border: '#fecaca' },
    blue:   { bg: '#dbeafe',    color: '#1d4ed8', border: '#bfdbfe' },
    indigo: { bg: C.primaryLight, color: C.primary, border: '#c7d2fe' },
    cyan:   { bg: C.cyanLight,  color: C.cyan,  border: '#a5f3fc' },
    gray:   { bg: '#f1f5f9',    color: C.textMid, border: C.border },
  };
  const t = map[color] || map.gray;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      fontSize: 11, fontWeight: 600, padding: '3px 10px',
      borderRadius: 20, border: `1px solid ${t.border}`,
      background: t.bg, color: t.color, letterSpacing: '0.02em',
      ...style
    }}>{children}</span>
  );
};

interface CardProps { children: React.ReactNode; style?: React.CSSProperties; noPad?: boolean; }
const Card = ({ children, style, noPad }: CardProps) => (
  <div style={{
    background: C.surface, borderRadius: 12,
    border: `1px solid ${C.border}`,
    boxShadow: C.shadow,
    padding: noPad ? 0 : 20,
    ...style
  }}>{children}</div>
);

const Dot = ({ ok }: { ok: boolean }) => (
  <span style={{
    width: 8, height: 8, borderRadius: '50%', display: 'inline-block', flexShrink: 0,
    background: ok ? C.green : C.red,
    boxShadow: ok ? `0 0 0 2px #d1fae5` : `0 0 0 2px #fee2e2`
  }} />
);

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div style={{
    fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
    textTransform: 'uppercase', color: C.textMuted, marginBottom: 8
  }}>{children}</div>
);

interface BtnProps {
  onClick?: () => void;
  disabled?: boolean;
  variant?: string;
  size?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}
const Btn = ({ onClick, disabled, variant = 'primary', size = 'md', children, style }: BtnProps) => {
  const sizes: Record<string, string> = { sm: '7px 14px', md: '10px 22px', lg: '13px 32px' };
  const variants: Record<string, { bg: string; color: string; border: string }> = {
    primary:  { bg: C.primary, color: '#fff', border: C.primary },
    success:  { bg: C.green, color: '#fff', border: C.green },
    danger:   { bg: '#fff', color: C.red, border: '#fecaca' },
    ghost:    { bg: 'transparent', color: C.textMid, border: C.border },
    cyan:     { bg: C.cyan, color: '#fff', border: C.cyan },
  };
  const v = variants[variant] || variants.primary;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: sizes[size] || sizes.md,
        borderRadius: 8,
        border: `1px solid ${disabled ? C.border : v.border}`,
        background: disabled ? C.surfaceAlt : v.bg,
        color: disabled ? C.textMuted : v.color,
        fontWeight: 600, fontSize: size === 'sm' ? 12 : size === 'lg' ? 15 : 13,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'opacity 0.15s',
        ...style
      }}
    >{children}</button>
  );
};

export default function InterviewerDashboard({ sessionId }: { sessionId: string }) {
  const [session, setSession] = useState<any>(null);
  const [status, setStatus] = useState('connecting');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState<any[]>([]);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [answerTranscripts, setAnswerTranscripts] = useState<Record<number, string>>({});
  const [proctorAlerts, setProctorAlerts] = useState<any[]>([]);
  const [latestAlert, setLatestAlert] = useState<any>(null);
  const [faceStatus, setFaceStatus] = useState({ detected: true, eyeContact: true, faceCount: 1, gazeDirection: null as any });
  const [report, setReport] = useState<any>(null);
  const [candidateConnected, setCandidateConnected] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [dailyUrl, setDailyUrl] = useState<string | null>(null);
  const [profileAnalysis, setProfileAnalysis] = useState<any>(null);
  const [camPermission, setCamPermission] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');
  const camStreamRef = useRef<MediaStream | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);
  const reportFetchedRef = useRef(false);

  useEffect(() => {
    if (navigator.permissions) {
      Promise.all([
        navigator.permissions.query({ name: 'camera' as PermissionName }).catch(() => ({ state: 'prompt' })),
        navigator.permissions.query({ name: 'microphone' as PermissionName }).catch(() => ({ state: 'prompt' })),
      ]).then(([cam, mic]) => {
        if ((cam as any).state === 'granted' && (mic as any).state === 'granted') {
          setCamPermission('granted');
        }
      });
    }
  }, []);

  const requestCameraPermission = async () => {
    setCamPermission('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      camStreamRef.current = stream;
      setCamPermission('granted');
    } catch (err: any) {
      console.warn('[Camera] Permission denied:', err.message);
      setCamPermission('denied');
    }
  };

  useEffect(() => {
    let stopped = false;

    const loadSession = async () => {
      try {
        const r = await fetch(`/api/interviews/${sessionId}/observer`);
        const data = await r.json();
        if (stopped) return;
        setSession(data);
        setQuestions(data.questions || []);
        setCurrentQuestion(data.currentQuestion || 0);
        setAnswerTranscripts(data.answerTranscripts || {});
        setProctorAlerts(data.proctorAlerts || []);
        if (data.status === 'in_progress') { setInterviewStarted(true); setStatus('in_progress'); }
        if (data.status === 'completed') {
          setStatus('completed');
          if (data.report) setReport(data.report);
        }
        if (data.status === 'waiting' || data.status === 'in_progress' || data.candidateConnected || data.candidateWs) {
          setCandidateConnected(true);
        }
        if (data.profileAnalysis) setProfileAnalysis(data.profileAnalysis);

        try {
          const tokenRes = await fetch(`/api/interviews/${sessionId}/daily-token?role=interviewer`);
          if (tokenRes.ok && !stopped) {
            const { roomUrl, token } = await tokenRes.json();
            setDailyUrl(`${roomUrl}?t=${token}&userName=Interviewer`);
          }
        } catch (err: any) {
          console.warn('[Daily.co] Interviewer token fetch failed:', err.message);
        }
      } catch (err) {
        console.error('[API] Failed to load session:', err);
      }
    };

    loadSession();

    // Poll REST every 4 s — primary mechanism on Vercel where WS is unavailable
    const poll = setInterval(async () => {
      if (stopped) return;
      try {
        const r = await fetch(`/api/interviews/${sessionId}/observer`);
        const data = await r.json();
        if (stopped) return;
        if (data.status === 'waiting' || data.status === 'in_progress') setCandidateConnected(true);
        if (data.status === 'in_progress') { setInterviewStarted(true); setStatus('in_progress'); }
        if (data.status === 'completed') {
          setStatus('completed');
          clearInterval(poll);
          if (data.report) {
            setReport(data.report);
            reportFetchedRef.current = true;
          } else if (!reportFetchedRef.current) {
            reportFetchedRef.current = true;
            setGeneratingReport(true);
            fetch(`/api/interviews/${sessionId}/report`)
              .then(res => res.json())
              .then(rpt => { setReport(rpt); setGeneratingReport(false); })
              .catch(() => setGeneratingReport(false));
          }
        }
        if (data.answerTranscripts) setAnswerTranscripts(data.answerTranscripts);
        if (data.proctorAlerts) setProctorAlerts(data.proctorAlerts);
        if (data.currentQuestion !== undefined) setCurrentQuestion(data.currentQuestion);
      } catch (_) {}
    }, 4000);

    return () => { stopped = true; clearInterval(poll); };
  }, [sessionId]);

  useEffect(() => {
    const wsUrl = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws?session=${sessionId}&role=interviewer`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => setStatus('connected');
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        switch (msg.type) {
          case 'session_joined':
            setStatus(msg.session?.status || 'connected');
            if (msg.session?.questions) setQuestions(msg.session.questions);
            if (msg.session?.currentQuestion !== undefined) setCurrentQuestion(msg.session.currentQuestion);
            if (msg.session?.answerTranscripts) setAnswerTranscripts(msg.session.answerTranscripts);
            if (msg.session?.proctorAlerts) setProctorAlerts(msg.session.proctorAlerts);
            if (msg.session?.status === 'in_progress') setInterviewStarted(true);
            break;
          case 'candidate_connected':
            setCandidateConnected(true);
            if (msg.status === 'in_progress') { setInterviewStarted(true); setStatus('in_progress'); }
            break;
          case 'candidate_disconnected':
            setCandidateConnected(false); setStatus('disconnected'); break;
          case 'interview_started':
            setInterviewStarted(true); setCurrentQuestion(msg.questionIndex); setStatus('in_progress'); break;
          case 'transcript_update':
            if (msg.isFinal) {
              setAnswerTranscripts(prev => ({ ...prev, [msg.questionIndex]: (prev[msg.questionIndex] || '') + ' ' + msg.text }));
              setLiveTranscript('');
            } else {
              setLiveTranscript(msg.text || '');
            }
            break;
          case 'question_change':
            setCurrentQuestion(msg.questionIndex); setLiveTranscript(''); break;
          case 'proctor_alert':
            setProctorAlerts(prev => [...prev, { ...msg.alert, timestamp: msg.alert?.timestamp || Date.now() }]);
            setLatestAlert(msg.alert);
            break;
          case 'face_data':
            setFaceStatus({ detected: msg.detected, eyeContact: msg.eyeContact, faceCount: msg.faceCount, gazeDirection: msg.gazeDirection ?? null });
            break;
          case 'interview_complete':
            setGeneratingReport(false); setStatus('completed'); break;
          case 'status_change':
            setStatus(msg.status); break;
          default: break;
        }
      } catch (err) {}
    };
    ws.onclose = () => { setStatus(prev => prev !== 'completed' ? 'disconnected' : prev); };
    return () => ws.close();
  }, [sessionId]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [liveTranscript, answerTranscripts]);

  useEffect(() => {
    if (!latestAlert) return;
    const t = setTimeout(() => setLatestAlert(null), 8000);
    return () => clearTimeout(t);
  }, [latestAlert]);

  const patchSession = (body: object) =>
    fetch(`/api/interviews/${sessionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

  const startInterview = async () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'start_interview' }));
    } else {
      await patchSession({ action: 'start_interview' });
      setInterviewStarted(true);
      setCurrentQuestion(0);
      setStatus('in_progress');
    }
  };

  const nextQuestion = async () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'next_question' }));
    } else {
      const res = await patchSession({ action: 'next_question' });
      const data = await res.json();
      if (data.status === 'completed') {
        setStatus('completed');
        if (!reportFetchedRef.current) {
          reportFetchedRef.current = true;
          setGeneratingReport(true);
          fetch(`/api/interviews/${sessionId}/report`)
            .then(r => r.json())
            .then(rpt => { setReport(rpt); setGeneratingReport(false); })
            .catch(() => setGeneratingReport(false));
        }
      } else {
        setCurrentQuestion(data.currentQuestion ?? currentQuestion + 1);
        setLiveTranscript('');
      }
    }
  };

  const endInterview = async () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'end_interview' }));
    } else {
      await patchSession({ action: 'end_interview' });
      setStatus('completed');
      if (!reportFetchedRef.current) {
        reportFetchedRef.current = true;
        setGeneratingReport(true);
        fetch(`/api/interviews/${sessionId}/report`)
          .then(r => r.json())
          .then(rpt => { setReport(rpt); setGeneratingReport(false); })
          .catch(() => setGeneratingReport(false));
      }
    }
  };

  const isLastQuestion = currentQuestion >= questions.length - 1;

  // ── REPORT VIEW ────────────────────────────────────────────────
  if (report && !report.error) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'system-ui, -apple-system, sans-serif', color: C.text }}>
        <header style={{
          background: C.surface, borderBottom: `1px solid ${C.border}`,
          padding: '12px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: 'linear-gradient(135deg, #0a2540, #e8542f)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 800, fontSize: 12
            }}>SRS</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>SRS Infoway</div>
              <div style={{ fontSize: 11, color: C.textMuted }}>Interviewer — Evaluation Report</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Badge color="green">✓ Report Ready</Badge>
            <a href={`/ai-interview/report/${sessionId}`}
              style={{ fontSize: 12, color: C.cyan, textDecoration: 'none', fontWeight: 600, padding: '6px 14px', border: `1px solid ${C.cyan}`, borderRadius: 8 }}>
              Full Report →
            </a>
            <a href="/ai-interview/admin"
              style={{ fontSize: 12, color: C.textMid, textDecoration: 'none', fontWeight: 600, padding: '6px 14px', border: `1px solid ${C.border}`, borderRadius: 8 }}>
              Dashboard
            </a>
          </div>
        </header>

        <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 20px' }}>
          <Card style={{ marginBottom: 20, textAlign: 'center', padding: '32px 28px' }}>
            <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 16 }}>
              {session?.candidate?.name} &bull; {session?.jd?.title} &bull; {session?.jd?.client}
            </div>
            <div style={{
              fontSize: 72, fontWeight: 800, lineHeight: 1,
              color: report.overallScore >= 80 ? C.green : report.overallScore >= 60 ? C.amber : C.red
            }}>
              {report.overallScore}
              <span style={{ fontSize: 24, color: C.textMuted, fontWeight: 400 }}>/100</span>
            </div>
            <div style={{ marginTop: 14 }}>
              <Badge
                color={report.recommendation?.includes('Recommended') && !report.recommendation?.includes('Not') ? 'green' : report.recommendation?.includes('Conditional') ? 'amber' : 'red'}
                style={{ fontSize: 13, padding: '6px 20px', borderRadius: 20 }}
              >
                {report.recommendation}
              </Badge>
            </div>
          </Card>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Technical', value: report.technicalDepth },
              { label: 'Communication', value: report.communicationScore },
              { label: 'Confidence', value: report.confidenceLevel },
              { label: 'Overall', value: report.overallScore },
            ].map((item, i) => (
              <Card key={i} style={{ textAlign: 'center', padding: 16 }}>
                <div style={{ fontSize: 11, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{item.label}</div>
                <div style={{
                  fontSize: 32, fontWeight: 700,
                  color: (item.value || 0) >= 80 ? C.green : (item.value || 0) >= 60 ? C.amber : C.red
                }}>{item.value || 0}<span style={{ fontSize: 13, color: C.textMuted, fontWeight: 400 }}>/100</span></div>
              </Card>
            ))}
          </div>

          {report.summary && (
            <Card style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 14, color: C.primary, margin: '0 0 10px', fontWeight: 700 }}>Summary</h3>
              <p style={{ fontSize: 13, color: C.textMid, lineHeight: 1.7, margin: 0 }}>{report.summary}</p>
            </Card>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <Card>
              <h3 style={{ fontSize: 13, color: C.green, margin: '0 0 12px', fontWeight: 700 }}>✓ Strengths</h3>
              {report.strengths?.map((s: string, i: number) => (
                <div key={i} style={{ fontSize: 12, color: C.textMid, marginBottom: 6, display: 'flex', gap: 6 }}>
                  <span style={{ color: C.green, fontWeight: 700 }}>+</span> {s}
                </div>
              ))}
            </Card>
            <Card>
              <h3 style={{ fontSize: 13, color: C.red, margin: '0 0 12px', fontWeight: 700 }}>⚠ Areas for Improvement</h3>
              {report.weaknesses?.map((w: string, i: number) => (
                <div key={i} style={{ fontSize: 12, color: C.textMid, marginBottom: 6, display: 'flex', gap: 6 }}>
                  <span style={{ color: C.amber, fontWeight: 700 }}>–</span> {w}
                </div>
              ))}
            </Card>
          </div>

          {proctorAlerts.length > 0 && (
            <Card style={{ marginBottom: 20, border: `1px solid ${proctorAlerts.some((a: any) => a.severity === 'high') ? '#fecaca' : '#fde68a'}` }}>
              <h3 style={{ fontSize: 14, color: C.amber, margin: '0 0 12px', fontWeight: 700 }}>
                Integrity Alerts ({proctorAlerts.length})
                {proctorAlerts.filter((a: any) => a.severity === 'high').length > 0 && (
                  <Badge color="red" style={{ marginLeft: 8 }}>
                    {proctorAlerts.filter((a: any) => a.severity === 'high').length} HIGH
                  </Badge>
                )}
              </h3>
              {proctorAlerts.map((a: any, i: number) => {
                const isHigh = a.severity === 'high';
                const isInfo = a.severity === 'info';
                const bg = isHigh ? '#fff5f5' : isInfo ? '#eff6ff' : '#fffbeb';
                const border = isHigh ? '#fecaca' : isInfo ? '#bfdbfe' : '#fde68a';
                const color = isHigh ? C.red : isInfo ? '#2563eb' : C.amber;
                const icon = isHigh ? '🚨' : isInfo ? '🎙️' : '⚠️';
                return (
                  <div key={i} style={{
                    fontSize: 12, marginBottom: 6, display: 'flex', gap: 8, alignItems: 'flex-start',
                    padding: '8px 12px', borderRadius: 8, background: bg, border: `1px solid ${border}`
                  }}>
                    <span style={{ fontSize: 14, flexShrink: 0 }}>{icon}</span>
                    <div>
                      <strong style={{ color }}>{a.check || a.type}</strong>
                      <span style={{ color: C.textMid, marginLeft: 6 }}>{a.detail || a.message || 'Alert triggered'}</span>
                    </div>
                  </div>
                );
              })}
            </Card>
          )}

          <Card style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: 14, color: C.text, margin: '0 0 16px', fontWeight: 700 }}>Interviewer Decision</h3>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              {[
                { label: '✓ Approve for L2', decision: 'approve', variant: 'success' },
                { label: '⏸ Hold', decision: 'hold', variant: 'ghost', style: { color: C.amber, borderColor: '#fde68a' } },
                { label: '✕ Reject', decision: 'reject', variant: 'danger' },
              ].map((btn, i) => (
                <Btn key={i} variant={btn.variant} size="lg" style={btn.style || {}}
                  onClick={() => {
                    fetch(`/api/interviews/${sessionId}/disposition`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ disposition: btn.decision, by: 'Interviewer' })
                    }).then(() => alert(`Candidate ${btn.decision}d successfully!`));
                  }}>
                  {btn.label}
                </Btn>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // ── MAIN INTERVIEW CONTROL VIEW ───────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'system-ui, -apple-system, sans-serif', color: C.text }}>

      {latestAlert && (
        <div style={{
          position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
          zIndex: 9999, minWidth: 340, maxWidth: 520,
          background: '#fff',
          border: `2px solid ${latestAlert.severity === 'high' ? C.red : latestAlert.severity === 'info' ? '#2563eb' : C.amber}`,
          borderRadius: 12, padding: '14px 18px',
          boxShadow: `0 8px 32px ${latestAlert.severity === 'high' ? 'rgba(220,38,38,0.2)' : latestAlert.severity === 'info' ? 'rgba(37,99,235,0.15)' : 'rgba(217,119,6,0.2)'}`,
          display: 'flex', alignItems: 'flex-start', gap: 12,
          animation: 'slideDown 0.3s ease'
        }}>
          <span style={{
            width: 36, height: 36, borderRadius: 8, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            background: latestAlert.severity === 'high' ? C.redLight : latestAlert.severity === 'info' ? '#eff6ff' : C.amberLight
          }}>
            {latestAlert.severity === 'high' ? '🚨' : latestAlert.severity === 'info' ? '🎙️' : '⚠️'}
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: latestAlert.severity === 'high' ? C.red : latestAlert.severity === 'info' ? '#2563eb' : C.amber, marginBottom: 3 }}>
              {latestAlert.check}
            </div>
            <div style={{ fontSize: 12, color: C.textMid, lineHeight: 1.5 }}>{latestAlert.detail}</div>
          </div>
          <button onClick={() => setLatestAlert(null)}
            style={{ background: 'none', border: 'none', color: C.textMuted, cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: 0, flexShrink: 0 }}>
            ×
          </button>
        </div>
      )}

      <header style={{
        background: C.surface, borderBottom: `1px solid ${C.border}`,
        padding: '0 24px', height: 54,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #0a2540, #e8542f)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 12
          }}>SRS</div>
          <span style={{ fontWeight: 700, fontSize: 15 }}>SRS Infoway</span>
          <Badge color={interviewStarted ? 'indigo' : 'gray'}>
            {interviewStarted ? '● Interview in Progress' : 'Interviewer Dashboard'}
          </Badge>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Dot ok={candidateConnected} />
            <span style={{ fontSize: 12, color: C.textMid, fontWeight: 500 }}>
              {candidateConnected ? 'Candidate Online' : 'Waiting for Candidate'}
            </span>
          </div>
          {dailyUrl && <Badge color="cyan">▶ Video Live</Badge>}
          <Badge color={
            status === 'in_progress' ? 'green' :
            status === 'completed'   ? 'indigo' :
            status === 'disconnected'? 'red'    : 'amber'
          }>
            {status.toUpperCase()}
          </Badge>
          <a href="/ai-interview/admin"
            style={{ fontSize: 12, color: C.textMid, textDecoration: 'none', fontWeight: 600 }}>
            ← Dashboard
          </a>
        </div>
      </header>

      <div style={{ display: 'flex', height: 'calc(100vh - 54px)' }}>

        {/* ── Main Panel ────────────────── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 20px 24px' }}>

          {camPermission !== 'granted' && (
            <Card style={{
              marginBottom: 16, textAlign: 'center', padding: '28px 24px',
              border: `1px solid ${camPermission === 'denied' ? '#fecaca' : '#bfdbfe'}`,
              background: camPermission === 'denied' ? '#fff5f5' : '#f0f8ff'
            }}>
              {camPermission === 'denied' ? (
                <>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>🚫</div>
                  <h3 style={{ fontSize: 16, margin: '0 0 8px', color: C.red }}>Camera Access Blocked</h3>
                  <p style={{ fontSize: 13, color: C.textMid, margin: '0 0 14px' }}>
                    Camera access was blocked. Please allow camera access in your browser settings and refresh.
                  </p>
                  <Btn variant="ghost" onClick={() => window.location.reload()}>Refresh Page</Btn>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>🎥</div>
                  <h3 style={{ fontSize: 16, margin: '0 0 8px', color: C.text }}>Enable Camera &amp; Microphone</h3>
                  <p style={{ fontSize: 13, color: C.textMid, margin: '0 0 18px' }}>
                    Grant camera and microphone access to enable the video call. Click <strong>"Allow"</strong> when prompted.
                  </p>
                  <Btn
                    variant="primary" size="lg"
                    disabled={camPermission === 'requesting'}
                    onClick={requestCameraPermission}
                    style={{ boxShadow: '0 4px 18px rgba(10,37,64,0.25)' }}
                  >
                    {camPermission === 'requesting' ? '⏳ Waiting for permission…' : '🎥 Allow Camera & Mic'}
                  </Btn>
                </>
              )}
            </Card>
          )}

          {dailyUrl && camPermission === 'granted' && (
            <Card noPad style={{ marginBottom: 16, overflow: 'hidden', height: interviewStarted ? 300 : 360 }}>
              <iframe
                key={dailyUrl}
                src={dailyUrl}
                allow="camera *; microphone *; autoplay *; display-capture *; fullscreen *; speaker-selection *"
                allowFullScreen
                style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                title="Interview Video Call"
              />
            </Card>
          )}

          {session && !interviewStarted && (
            <Card style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ fontSize: 20, margin: '0 0 4px', fontWeight: 700 }}>{session.candidate?.name}</h2>
                  <p style={{ fontSize: 13, color: C.textMid, margin: '0 0 10px' }}>
                    {session.jd?.title} &bull; {session.jd?.client}
                  </p>
                </div>
                <div style={{
                  textAlign: 'center', background: C.primaryLight,
                  borderRadius: 10, padding: '8px 16px', border: `1px solid #c7d2fe`
                }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: C.primary }}>{questions.length}</div>
                  <div style={{ fontSize: 11, color: C.primary, fontWeight: 600 }}>Questions</div>
                </div>
              </div>
            </Card>
          )}

          {profileAnalysis && !interviewStarted && (
            <Card style={{ marginBottom: 16, border: `1px solid ${C.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h3 style={{ fontSize: 14, margin: 0, fontWeight: 700 }}>🤖 AI Profile Analysis</h3>
                <Badge color={profileAnalysis.matchScore >= 70 ? 'green' : profileAnalysis.matchScore >= 50 ? 'amber' : 'red'}>
                  Match Score: {profileAnalysis.matchScore}
                </Badge>
              </div>
              {profileAnalysis.keySkills?.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase' }}>Key Skills</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {profileAnalysis.keySkills.map((skill: string, i: number) => (
                      <span key={i} style={{ fontSize: 11, background: C.primaryLight, border: `1px solid #c7d2fe`, borderRadius: 20, padding: '2px 10px', color: C.primary }}>{skill}</span>
                    ))}
                  </div>
                </div>
              )}
              {profileAnalysis.summary && (
                <p style={{ fontSize: 12, color: C.textMid, margin: 0, lineHeight: 1.6 }}>{profileAnalysis.summary}</p>
              )}
            </Card>
          )}

          {!interviewStarted && !generatingReport && status !== 'completed' && (
            <Card style={{ textAlign: 'center', padding: '36px 28px', marginBottom: 16 }}>
              {!candidateConnected ? (
                <>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>⏳</div>
                  <h3 style={{ fontSize: 20, margin: '0 0 8px', fontWeight: 700 }}>Waiting for Candidate</h3>
                  <p style={{ color: C.textMid, fontSize: 13, margin: '0 0 16px' }}>
                    The candidate needs to join before you can start.
                  </p>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 16px'
                  }}>
                    <span style={{ fontSize: 11, color: C.textMuted }}>Interview Link:</span>
                    <code style={{ fontSize: 11, color: C.cyan, fontFamily: 'monospace' }}>
                      {typeof window !== 'undefined' ? `${window.location.origin}/ai-interview/session/${sessionId}` : ''}
                    </code>
                  </div>
                </>
              ) : (
                <>
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%', background: C.greenLight,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 26, margin: '0 auto 14px'
                  }}>✅</div>
                  <h3 style={{ fontSize: 20, margin: '0 0 8px', fontWeight: 700 }}>Candidate is Ready</h3>
                  <p style={{ color: C.textMid, fontSize: 13, margin: '0 0 22px' }}>
                    <strong>{session?.candidate?.name}</strong> has joined. You have <strong>{questions.length} questions</strong> to ask.
                    {dailyUrl ? ' Video is connected.' : ' Setting up video...'}
                  </p>
                  <Btn variant="primary" size="lg" onClick={startInterview}
                    style={{ boxShadow: '0 4px 18px rgba(10,37,64,0.25)' }}>
                    ▶ Start Interview
                  </Btn>
                </>
              )}
            </Card>
          )}

          {generatingReport && (
            <Card style={{ textAlign: 'center', padding: '48px 28px', marginBottom: 16 }}>
              <div style={{ fontSize: 48, marginBottom: 16, animation: 'spin 2s linear infinite' }}>⚙</div>
              <h3 style={{ fontSize: 20, margin: '0 0 8px', fontWeight: 700 }}>Generating AI Evaluation Report…</h3>
              <p style={{ color: C.textMid, fontSize: 13, maxWidth: 420, margin: '0 auto' }}>
                AI is analyzing the full transcript and evaluating answers. This takes 15–30 seconds.
              </p>
            </Card>
          )}

          {interviewStarted && !generatingReport && status !== 'completed' && (
            <>
              <div style={{
                background: 'linear-gradient(135deg, #0a2540, #e8542f)',
                borderRadius: 12, padding: 22, marginBottom: 14,
                boxShadow: '0 4px 16px rgba(10,37,64,0.2)'
              }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                  Question {currentQuestion + 1} of {questions.length}
                  {questions[currentQuestion]?.category && (
                    <span style={{ marginLeft: 8, background: 'rgba(255,255,255,0.15)', padding: '2px 8px', borderRadius: 10, fontSize: 10 }}>
                      {questions[currentQuestion].category}
                    </span>
                  )}
                </div>
                <h2 style={{ fontSize: 18, margin: 0, lineHeight: 1.5, color: '#fff', fontWeight: 600 }}>
                  {questions[currentQuestion]?.text || questions[currentQuestion]?.question || `Question ${currentQuestion + 1}`}
                </h2>
                {questions[currentQuestion]?.keywords && (
                  <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {questions[currentQuestion].keywords.map((kw: string, i: number) => (
                      <span key={i} style={{ fontSize: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 10, color: 'rgba(255,255,255,0.9)' }}>
                        {kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <Card style={{ marginBottom: 14, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <SectionLabel>Live Candidate Transcript</SectionLabel>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.green, display: 'inline-block', animation: 'pulse 1.5s infinite', marginBottom: 8 }} />
                </div>
                <div style={{ maxHeight: 160, overflowY: 'auto' }}>
                  {answerTranscripts[currentQuestion] ? (
                    <p style={{ fontSize: 13, color: C.text, lineHeight: 1.7, margin: 0 }}>
                      {answerTranscripts[currentQuestion]}
                      {liveTranscript && <span style={{ color: C.textMuted, fontStyle: 'italic' }}> {liveTranscript}</span>}
                    </p>
                  ) : (
                    <p style={{ fontSize: 13, color: C.textMuted, fontStyle: 'italic', margin: 0 }}>
                      {liveTranscript || 'Waiting for candidate to speak…'}
                    </p>
                  )}
                  <div ref={transcriptEndRef} />
                </div>
              </Card>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span style={{ fontSize: 12, color: C.textMuted }}>
                  {answerTranscripts[currentQuestion]
                    ? `${answerTranscripts[currentQuestion].split(/\s+/).length} words captured`
                    : 'No response yet'}
                </span>
                <div style={{ display: 'flex', gap: 10 }}>
                  {!isLastQuestion ? (
                    <Btn variant="primary" onClick={nextQuestion}>Next Question →</Btn>
                  ) : (
                    <Btn variant="success" onClick={endInterview}>End Interview &amp; Generate Report</Btn>
                  )}
                  <Btn variant="danger" onClick={endInterview} size="sm">End Early</Btn>
                </div>
              </div>

              <Card style={{ padding: 12 }}>
                <SectionLabel>Progress</SectionLabel>
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${questions.length},1fr)`, gap: 6 }}>
                  {questions.map((q: any, i: number) => (
                    <div key={i} style={{
                      padding: '6px 4px', borderRadius: 8, textAlign: 'center',
                      background: i === currentQuestion ? C.primaryLight : answerTranscripts[i] ? C.greenLight : C.surfaceAlt,
                      border: `1px solid ${i === currentQuestion ? C.primary : answerTranscripts[i] ? '#a7f3d0' : C.border}`
                    }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: i === currentQuestion ? C.primary : C.textMid }}>Q{i + 1}</div>
                      <div style={{ fontSize: 9, color: C.textMuted, marginTop: 2 }}>
                        {i === currentQuestion ? 'Now' : answerTranscripts[i] ? `${answerTranscripts[i].split(/\s+/).length}w` : '–'}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}

          {report?.error && (
            <Card style={{ marginTop: 16, border: `1px solid #fecaca`, background: '#fff5f5' }}>
              <h3 style={{ color: C.red, fontSize: 15, margin: '0 0 8px' }}>Report Generation Failed</h3>
              <p style={{ color: C.textMid, fontSize: 13, margin: 0 }}>{report.error}</p>
            </Card>
          )}
        </div>

        {/* ── Sidebar ────────────────────── */}
        <div style={{
          width: 240, borderLeft: `1px solid ${C.border}`,
          overflowY: 'auto', background: C.surface, padding: '16px 14px'
        }}>

          <SectionLabel>Proctoring Status</SectionLabel>
          <Card style={{ marginBottom: 14, padding: 12 }}>
            {[
              { label: 'Face Detected', ok: faceStatus.detected },
              { label: 'Eye Contact', ok: faceStatus.eyeContact },
              { label: 'Single Person', ok: faceStatus.faceCount <= 1 },
              { label: 'Video Call', ok: !!dailyUrl },
            ].map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: i < 3 ? `1px solid ${C.border}` : 'none' }}>
                <Dot ok={c.ok} />
                <span style={{ fontSize: 12, fontWeight: 500, color: c.ok ? C.text : C.red }}>{c.label}</span>
              </div>
            ))}
          </Card>

          <SectionLabel>Alerts ({proctorAlerts.length})</SectionLabel>
          {proctorAlerts.length === 0 ? (
            <div style={{
              background: C.surfaceAlt, borderRadius: 8, padding: '10px 12px', marginBottom: 14,
              border: `1px solid ${C.border}`, fontSize: 11, color: C.textMuted, textAlign: 'center'
            }}>
              ✓ No alerts
            </div>
          ) : (
            <div style={{ marginBottom: 14, maxHeight: 200, overflowY: 'auto' }}>
              {[...proctorAlerts].reverse().map((a: any, i: number) => {
                const isHigh = a.severity === 'high';
                return (
                  <div key={i} style={{
                    background: isHigh ? '#fff5f5' : '#fffbeb',
                    border: `1px solid ${isHigh ? '#fecaca' : '#fde68a'}`,
                    borderRadius: 8, padding: '7px 10px', marginBottom: 6, fontSize: 10
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                      <span>{isHigh ? '🚨' : '⚠️'}</span>
                      <strong style={{ color: isHigh ? C.red : C.amber }}>{a.check || a.type || 'Alert'}</strong>
                    </div>
                    <p style={{ color: C.textMid, margin: 0, lineHeight: 1.4 }}>{a.detail || a.message || ''}</p>
                  </div>
                );
              })}
            </div>
          )}

          {interviewStarted && Object.keys(answerTranscripts).length > 0 && (
            <>
              <SectionLabel>Captured Answers</SectionLabel>
              <div style={{ marginBottom: 14, maxHeight: 220, overflowY: 'auto' }}>
                {Object.entries(answerTranscripts).map(([qi, text]) => (
                  <div key={qi} style={{
                    background: C.surfaceAlt, borderRadius: 8, padding: 8,
                    marginBottom: 6, border: `1px solid ${C.border}`
                  }}>
                    <div style={{ fontSize: 10, color: C.primary, fontWeight: 700, marginBottom: 3 }}>
                      Q{parseInt(qi) + 1}
                    </div>
                    <p style={{ fontSize: 10, color: C.textMid, margin: 0, lineHeight: 1.4 }}>
                      {(text as string).length > 120 ? (text as string).substring(0, 120) + '…' : text as string}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}

          <SectionLabel>Session Info</SectionLabel>
          <Card style={{ padding: 12, marginBottom: 14 }}>
            {[
              ['ID', sessionId.split('-')[0] + '…'],
              ['Status', status.toUpperCase()],
              ['Questions', questions.length],
              ['Video', dailyUrl ? 'Connected' : 'Waiting'],
            ].map(([l, v], i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0', borderBottom: i < 3 ? `1px solid ${C.border}` : 'none' }}>
                <span style={{ fontSize: 11, color: C.textMuted }}>{l}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: l === 'Video' ? (dailyUrl ? C.green : C.amber) : C.text }}>{v}</span>
              </div>
            ))}
          </Card>

          {profileAnalysis && (
            <>
              <SectionLabel>Profile Analysis</SectionLabel>
              <Card style={{ padding: 10, marginBottom: 14, border: `1px solid ${profileAnalysis.matchScore >= 70 ? '#a7f3d0' : profileAnalysis.matchScore >= 50 ? '#fde68a' : '#fecaca'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Badge color={profileAnalysis.matchScore >= 70 ? 'green' : profileAnalysis.matchScore >= 50 ? 'amber' : 'red'} style={{ fontSize: 10 }}>
                    {profileAnalysis.matchScore}% Match
                  </Badge>
                </div>
                {profileAnalysis.experienceYears && (
                  <div style={{ fontSize: 11, color: C.textMid }}>Experience: {profileAnalysis.experienceYears} yrs</div>
                )}
              </Card>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes spin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes slideDown {
          from { opacity:0; transform:translate(-50%,-16px); }
          to   { opacity:1; transform:translate(-50%,0); }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
      `}</style>
    </div>
  );
}
