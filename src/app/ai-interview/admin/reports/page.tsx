"use client";
import React, { useState, useEffect, useCallback } from 'react';

// ─── Colour tokens ───────────────────────────────────────────
const C = {
  bg: '#f4f6fb', surface: '#ffffff', border: '#e2e8f0',
  text: '#1e293b', textMid: '#475569', textMuted: '#94a3b8',
  primary: '#0a2540', accent: '#e8542f',
  green: '#059669', greenLight: '#d1fae5',
  amber: '#d97706', amberLight: '#fef3c7',
  red: '#dc2626',   redLight: '#fee2e2',
  blue: '#2563eb',  blueLight: '#dbeafe',
  cyan: '#0097a7',  cyanLight: '#e0f7fa',
};

// ─── Tiny helpers ────────────────────────────────────────────
const fmt = (n: number) => n >= 100 ? n.toString() : n.toString();
const fmtDate = (iso: string) => iso ? new Date(iso).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtTime = (iso: string) => iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
const fmtDur = (mins: number) => mins <= 0 ? '—' : mins < 60 ? `${mins}m` : `${Math.floor(mins/60)}h ${mins%60}m`;

const scoreColor = (s: number) =>
  s >= 75 ? C.green : s >= 50 ? C.amber : C.red;
const scoreLabel = (rec: string) => {
  if (!rec) return { label: '—', color: C.textMuted };
  if (rec.toLowerCase().includes('not')) return { label: 'Not Recommended', color: C.red };
  if (rec.toLowerCase().includes('conditional')) return { label: 'Conditional', color: C.amber };
  return { label: 'Recommended', color: C.green };
};

// ─── Card / Badge ─────────────────────────────────────────────
const Card = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', padding: 20, ...style }}>
    {children}
  </div>
);
const Pill = ({ children, color = C.textMid, bg = '#f1f5f9' }: { children: React.ReactNode; color?: string; bg?: string }) => (
  <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: bg, color, letterSpacing: '0.03em', whiteSpace: 'nowrap' }}>
    {children}
  </span>
);

// ─── Stat card ────────────────────────────────────────────────
const StatCard = ({ icon, label, value, sub, color }: { icon: string; label: string; value: string | number; sub?: string; color?: string }) => (
  <Card style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '18px 20px' }}>
    <div style={{ fontSize: 28, width: 44, height: 44, borderRadius: 10, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: color || C.primary, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>{sub}</div>}
    </div>
  </Card>
);

// ─── SKILL CHIPS INPUT ───────────────────────────────────────
const SkillInput = ({ skills, onChange }: { skills: string[]; onChange: (s: string[]) => void }) => {
  const [input, setInput] = useState('');
  const add = () => {
    const v = input.trim();
    if (v && !skills.includes(v)) onChange([...skills, v]);
    setInput('');
  };
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 10px', background: '#fff', minHeight: 38 }}>
      {skills.map(s => (
        <span key={s} style={{ background: C.blueLight, color: C.blue, fontSize: 12, padding: '2px 10px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
          {s}
          <button onClick={() => onChange(skills.filter(x => x !== s))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: C.blue, fontSize: 14, lineHeight: 1 }}>×</button>
        </span>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } }}
        placeholder={skills.length ? '' : 'Type skill, press Enter…'}
        style={{ border: 'none', outline: 'none', fontSize: 13, flex: 1, minWidth: 140, background: 'transparent' }}
      />
      {input && <button onClick={add} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, border: `1px solid ${C.blue}`, background: C.blueLight, color: C.blue, cursor: 'pointer', fontWeight: 700 }}>Add</button>}
    </div>
  );
};

// ─── MAIN PAGE ───────────────────────────────────────────────
export default function AdminReportsPage() {
  const [tab, setTab] = useState<'overview' | 'search' | 'all'>('overview');
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<any>(null);
  const [interviewers, setInterviewers] = useState<any[]>([]);
  const [recent, setRecent] = useState<any[]>([]);

  // Search state
  const [skills, setSkills] = useState<string[]>([]);
  const [days, setDays] = useState<string>('30');
  const [minScore, setMinScore] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [interviewer, setInterviewer] = useState('');
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  // Load overview on mount
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const r = await fetch('/api/admin/reports');
        const d = await r.json();
        setOverview(d.overview);
        setInterviewers(d.interviewers || []);
        setRecent(d.recent || []);
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  const runSearch = useCallback(async () => {
    setSearching(true);
    setSearched(true);
    try {
      const params = new URLSearchParams();
      if (skills.length) params.set('skills', skills.join(','));
      if (days) params.set('days', days);
      if (minScore) params.set('minScore', minScore);
      if (recommendation) params.set('recommendation', recommendation);
      if (interviewer) params.set('interviewer', interviewer);
      if (query) params.set('q', query);
      const r = await fetch(`/api/admin/candidates?${params}`);
      const d = await r.json();
      setSearchResults(d.results || []);
    } catch (e) { console.error(e); }
    setSearching(false);
  }, [skills, days, minScore, recommendation, interviewer, query]);

  // ── TABLE: candidate row ───────────────────────────────────
  const CandidateRow = ({ r }: { r: any }) => {
    const rec = scoreLabel(r.recommendation);
    const [expanded, setExpanded] = useState(false);
    const hasExtra = r.interviewerNotes || r.candidateInfo?.totalExperience || r.candidateInfo?.noticePeriod || r.candidateInfo?.location || r.candidateInfo?.currentSalary || r.candidateInfo?.expectedSalary;
    return (
      <>
        <tr style={{ borderBottom: expanded ? 'none' : `1px solid ${C.border}`, transition: 'background 0.1s', cursor: hasExtra ? 'pointer' : 'default', background: expanded ? '#f0f8ff' : undefined }}
          onClick={() => hasExtra && setExpanded(e => !e)}>
          <td style={{ padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {hasExtra && <span style={{ fontSize: 12, color: C.textMuted, transition: 'transform 0.15s', display: 'inline-block', transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>}
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: C.text }}>{r.candidateName}</div>
                <div style={{ fontSize: 11, color: C.textMuted }}>{r.candidateEmail}</div>
              </div>
            </div>
          </td>
          <td style={{ padding: '12px 14px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{r.position}</div>
            <div style={{ fontSize: 11, color: C.textMuted }}>{r.client}</div>
          </td>
          <td style={{ padding: '12px 14px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxWidth: 220 }}>
              {(r.skills || []).slice(0, 5).map((s: string, i: number) => (
                <Pill key={i} color={C.blue} bg={C.blueLight}>{s}</Pill>
              ))}
              {r.skills?.length > 5 && <Pill>+{r.skills.length - 5}</Pill>}
            </div>
          </td>
          <td style={{ padding: '12px 14px', textAlign: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: 18, color: scoreColor(r.overallScore || 0) }}>
              {r.overallScore || 0}
              <span style={{ fontSize: 11, fontWeight: 400, color: C.textMuted }}>/100</span>
            </div>
          </td>
          <td style={{ padding: '12px 14px', textAlign: 'center' }}>
            <Pill color={rec.color} bg={rec.color + '20'}>{rec.label}</Pill>
          </td>
          <td style={{ padding: '12px 14px' }}>
            <div style={{ fontSize: 13, color: C.text }}>{fmtDate(r.interviewDate)}</div>
            <div style={{ fontSize: 11, color: C.textMuted }}>{fmtTime(r.interviewDate)}</div>
          </td>
          <td style={{ padding: '12px 14px', textAlign: 'center' }}>
            <span style={{ fontSize: 13, color: C.textMid }}>{fmtDur(r.interviewDurationMinutes)}</span>
          </td>
          <td style={{ padding: '12px 14px' }}>
            <div style={{ fontSize: 12, color: C.textMid }}>{r.interviewerName}</div>
          </td>
          <td style={{ padding: '12px 14px', textAlign: 'center' }}>
            <div style={{ fontSize: 11 }}>
              {r.proctorRedFlags > 0
                ? <span style={{ color: C.red, fontWeight: 700 }}>🚨 {r.proctorRedFlags} flags</span>
                : <span style={{ color: C.green }}>✓ Clean</span>}
            </div>
          </td>
        </tr>
        {expanded && hasExtra && (
          <tr style={{ borderBottom: `1px solid ${C.border}`, background: '#f8fbff' }}>
            <td colSpan={9} style={{ padding: '0 14px 16px 32px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: r.interviewerNotes ? '1fr 1fr' : '1fr', gap: 16, paddingTop: 12 }}>
                {/* Candidate Info */}
                {(r.candidateInfo?.totalExperience || r.candidateInfo?.currentSalary || r.candidateInfo?.noticePeriod || r.candidateInfo?.locationPreference) && (
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>📋 Candidate Details</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {[
                        { label: 'Total Exp', value: r.candidateInfo?.totalExperience },
                        { label: 'Relevant Exp', value: r.candidateInfo?.relevantExperience },
                        { label: 'Qualification', value: r.candidateInfo?.highestDegree },
                        { label: 'Current Location', value: r.candidateInfo?.currentLocation },
                        { label: 'Current CTC', value: r.candidateInfo?.currentSalary },
                        { label: 'Expected CTC', value: r.candidateInfo?.expectedSalary },
                        { label: 'Location Pref', value: r.candidateInfo?.locationPreference },
                        { label: 'Notice Period', value: r.candidateInfo?.noticePeriod },
                      ].filter(f => f.value).map(f => (
                        <div key={f.label} style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px' }}>
                          <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 600, marginBottom: 3 }}>{f.label}</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{f.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Interviewer Notes */}
                {r.interviewerNotes && (
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>📝 Interviewer Notes</div>
                    <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, padding: '12px 14px', fontSize: 13, color: C.textMid, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                      {r.interviewerNotes}
                    </div>
                  </div>
                )}
              </div>
            </td>
          </tr>
        )}
      </>
    );
  };

  const tableHead = (cols: string[]) => (
    <thead>
      <tr style={{ background: '#f8fafc', borderBottom: `2px solid ${C.border}` }}>
        {cols.map(c => (
          <th key={c} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: c.match(/Score|Duration|Rec/) ? 'center' : 'left', whiteSpace: 'nowrap' }}>
            {c}
          </th>
        ))}
      </tr>
    </thead>
  );

  const TABLE_COLS = ['Candidate', 'Position', 'Skills', 'Score', 'Recommendation', 'Date', 'Duration', 'Interviewer', 'Proctoring'];

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'system-ui,-apple-system,sans-serif', color: C.text }}>

      {/* Header */}
      <header style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '0 28px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: 'linear-gradient(135deg,#0a2540,#e8542f)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 12 }}>SRS</div>
          <span style={{ fontWeight: 700, fontSize: 16 }}>SRS Infoway</span>
          <span style={{ fontSize: 11, color: C.textMuted, background: '#f1f5f9', padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>Interview Analytics & Reports</span>
        </div>
        <a href="/ai-interview/admin" style={{ fontSize: 12, color: C.textMid, textDecoration: 'none', fontWeight: 600 }}>← Back to Admin</a>
      </header>

      {/* Tabs */}
      <div style={{ borderBottom: `1px solid ${C.border}`, background: C.surface, padding: '0 28px', display: 'flex', gap: 0 }}>
        {([['overview', '📊 Overview'], ['search', '🔍 Candidate Search'], ['all', '📋 All Interviews']] as [typeof tab, string][]).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            style={{ padding: '14px 20px', border: 'none', background: 'none', fontSize: 13, fontWeight: tab === key ? 700 : 500, color: tab === key ? C.primary : C.textMid, borderBottom: tab === key ? `2px solid ${C.accent}` : '2px solid transparent', cursor: 'pointer', transition: 'all 0.15s' }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ padding: '28px 28px 40px' }}>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: C.textMuted }}>
            <div style={{ fontSize: 36, marginBottom: 16, animation: 'spin 2s linear infinite', display: 'inline-block' }}>⚙</div>
            <p>Loading analytics…</p>
          </div>
        ) : (

          <>
            {/* ── OVERVIEW TAB ─────────────────────────────────── */}
            {tab === 'overview' && (
              <>
                {/* Stat cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 28 }}>
                  <StatCard icon="🎙️" label="Total Interviews" value={fmt(overview?.total || 0)} />
                  <StatCard icon="📅" label="This Month" value={fmt(overview?.thisMonth || 0)} />
                  <StatCard icon="📆" label="This Week" value={fmt(overview?.thisWeek || 0)} />
                  <StatCard icon="⭐" label="Avg AI Score" value={`${overview?.avgScore || 0}/100`} color={scoreColor(overview?.avgScore || 0)} />
                  <StatCard icon="⏱" label="Avg Duration" value={fmtDur(overview?.avgDurationMinutes || 0)} />
                </div>

                {/* Interviewer performance table */}
                {interviewers.length > 0 ? (
                  <Card style={{ padding: 0, overflow: 'hidden', marginBottom: 28 }}>
                    <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>👤 Interviewer Performance</span>
                      <span style={{ fontSize: 11, color: C.textMuted }}>{interviewers.length} interviewer{interviewers.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                          <tr style={{ background: '#f8fafc', borderBottom: `2px solid ${C.border}` }}>
                            {['Interviewer', 'Email', 'Total Interviews', 'Avg Score', 'Avg Duration', 'Recommended', 'Conditional', 'Not Recommended', 'Last Interview'].map(c => (
                              <th key={c} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: c.match(/Total|Avg|Rec|Cond|Not/) ? 'center' : 'left', whiteSpace: 'nowrap' }}>{c}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {interviewers.map((iv: any, i: number) => (
                            <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}
                              onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                              <td style={{ padding: '12px 14px', fontWeight: 700 }}>{iv.name}</td>
                              <td style={{ padding: '12px 14px', color: C.textMid, fontSize: 12 }}>{iv.email}</td>
                              <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 700, fontSize: 16, color: C.primary }}>{iv.totalInterviews}</td>
                              <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                <span style={{ fontWeight: 800, color: scoreColor(iv.avgScore) }}>{iv.avgScore}</span>
                                <span style={{ fontSize: 11, color: C.textMuted }}>/100</span>
                              </td>
                              <td style={{ padding: '12px 14px', textAlign: 'center', color: C.textMid }}>{fmtDur(iv.avgDurationMinutes)}</td>
                              <td style={{ padding: '12px 14px', textAlign: 'center' }}><Pill color={C.green} bg={C.greenLight}>{iv.recommended}</Pill></td>
                              <td style={{ padding: '12px 14px', textAlign: 'center' }}><Pill color={C.amber} bg={C.amberLight}>{iv.conditional}</Pill></td>
                              <td style={{ padding: '12px 14px', textAlign: 'center' }}><Pill color={C.red} bg={C.redLight}>{iv.notRecommended}</Pill></td>
                              <td style={{ padding: '12px 14px', fontSize: 12, color: C.textMid }}>{fmtDate(iv.lastInterviewDate)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                ) : (
                  <Card style={{ textAlign: 'center', padding: '48px 28px', color: C.textMuted }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
                    <p>No interview data yet. Data appears here after interviews are completed and reports generated.</p>
                  </Card>
                )}
              </>
            )}

            {/* ── CANDIDATE SEARCH TAB ─────────────────────────── */}
            {tab === 'search' && (
              <>
                <Card style={{ marginBottom: 24 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 18 }}>🔍 Search Candidates</div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 16, marginBottom: 16 }}>
                    {/* Skills */}
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: C.textMid, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Skills (match any)</label>
                      <SkillInput skills={skills} onChange={setSkills} />
                      <div style={{ fontSize: 10, color: C.textMuted, marginTop: 4 }}>e.g. React, .NET, Python, SAP</div>
                    </div>

                    {/* Date range preset */}
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: C.textMid, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Interview Period</label>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {[['15', 'Last 15 days'], ['30', '1 Month'], ['60', '2 Months'], ['90', '3 Months'], ['365', '1 Year'], ['', 'All Time']].map(([v, label]) => (
                          <button key={v} onClick={() => setDays(v)}
                            style={{ padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, border: `1px solid ${days === v ? C.primary : C.border}`, background: days === v ? C.primary : C.surface, color: days === v ? '#fff' : C.textMid, cursor: 'pointer', transition: 'all 0.15s' }}>
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Min score */}
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: C.textMid, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Minimum Score</label>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {[['', 'Any'], ['50', '50+'], ['60', '60+'], ['70', '70+'], ['80', '80+']].map(([v, label]) => (
                          <button key={v} onClick={() => setMinScore(v)}
                            style={{ padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, border: `1px solid ${minScore === v ? C.primary : C.border}`, background: minScore === v ? C.primary : C.surface, color: minScore === v ? '#fff' : C.textMid, cursor: 'pointer' }}>
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Recommendation */}
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: C.textMid, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Recommendation</label>
                      <select value={recommendation} onChange={e => setRecommendation(e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, background: '#fff', color: C.text }}>
                        <option value="">All</option>
                        <option value="Recommended">Recommended</option>
                        <option value="Conditional">Conditional Pass</option>
                        <option value="Not Recommended">Not Recommended</option>
                      </select>
                    </div>

                    {/* Interviewer */}
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: C.textMid, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Interviewer</label>
                      <select value={interviewer} onChange={e => setInterviewer(e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, background: '#fff', color: C.text }}>
                        <option value="">All Interviewers</option>
                        {interviewers.map((iv: any) => (
                          <option key={iv.email} value={iv.email}>{iv.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Free text */}
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: C.textMid, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Keyword Search</label>
                      <input value={query} onChange={e => setQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && runSearch()}
                        placeholder="Candidate name, position, client…"
                        style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, boxSizing: 'border-box' }} />
                    </div>
                  </div>

                  <button onClick={runSearch} disabled={searching}
                    style={{ padding: '10px 32px', borderRadius: 8, border: 'none', background: searching ? '#94a3b8' : 'linear-gradient(135deg,#0a2540,#e8542f)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: searching ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                    {searching ? '⏳ Searching…' : '🔍 Search Candidates'}
                  </button>
                </Card>

                {/* Results */}
                {searched && (
                  <Card style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700 }}>
                        {searching ? 'Searching…' : `${searchResults.length} candidate${searchResults.length !== 1 ? 's' : ''} found`}
                      </span>
                      {searchResults.length > 0 && (
                        <button onClick={() => {
                          const rows = [TABLE_COLS.join(',')].concat(
                            searchResults.map(r => [
                              r.candidateName, r.candidateEmail, r.position, r.client,
                              (r.skills || []).join(';'), r.overallScore, r.recommendation,
                              fmtDate(r.interviewDate), fmtDur(r.interviewDurationMinutes),
                              r.interviewerName,
                            ].map(v => `"${String(v||'').replace(/"/g,'""')}"`).join(','))
                          ).join('\n');
                          const a = document.createElement('a');
                          a.href = URL.createObjectURL(new Blob([rows], { type: 'text/csv' }));
                          a.download = `srs-candidates-${Date.now()}.csv`;
                          a.click();
                        }} style={{ fontSize: 12, padding: '5px 14px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, color: C.textMid, cursor: 'pointer', fontWeight: 600 }}>
                          ⬇ Export CSV
                        </button>
                      )}
                    </div>
                    {searchResults.length === 0 && !searching ? (
                      <div style={{ textAlign: 'center', padding: '48px 28px', color: C.textMuted }}>
                        <div style={{ fontSize: 36, marginBottom: 12 }}>🔎</div>
                        <p>No candidates match your filters. Try broadening the search.</p>
                      </div>
                    ) : (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                          {tableHead(TABLE_COLS)}
                          <tbody>{searchResults.map((r, i) => <CandidateRow key={i} r={r} />)}</tbody>
                        </table>
                      </div>
                    )}
                  </Card>
                )}
              </>
            )}

            {/* ── ALL INTERVIEWS TAB ────────────────────────────── */}
            {tab === 'all' && (
              <Card style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700 }}>{recent.length} interview records</span>
                  {recent.length > 0 && (
                    <button onClick={() => {
                      const rows = [TABLE_COLS.join(',')].concat(
                        recent.map(r => [
                          r.candidateName, r.candidateEmail, r.position, r.client,
                          (r.skills || []).join(';'), r.overallScore, r.recommendation,
                          fmtDate(r.interviewDate), fmtDur(r.interviewDurationMinutes),
                          r.interviewerName,
                        ].map(v => `"${String(v||'').replace(/"/g,'""')}"`).join(','))
                      ).join('\n');
                      const a = document.createElement('a');
                      a.href = URL.createObjectURL(new Blob([rows], { type: 'text/csv' }));
                      a.download = `srs-all-interviews-${Date.now()}.csv`;
                      a.click();
                    }} style={{ fontSize: 12, padding: '5px 14px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, color: C.textMid, cursor: 'pointer', fontWeight: 600 }}>
                      ⬇ Export CSV
                    </button>
                  )}
                </div>
                {recent.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 28px', color: C.textMuted }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
                    <p>No completed interviews archived yet.<br />Complete an interview and generate a report to populate this list.</p>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      {tableHead(TABLE_COLS)}
                      <tbody>{recent.map((r, i) => <CandidateRow key={i} r={r} />)}</tbody>
                    </table>
                  </div>
                )}
              </Card>
            )}
          </>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
