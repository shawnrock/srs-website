"use client";
import React, { useState, useEffect, useCallback } from 'react';

// ─── Colour tokens ────────────────────────────────────────────
const C = {
  bg: '#f4f6fb', surface: '#ffffff', border: '#e2e8f0',
  text: '#1e293b', textMid: '#475569', textMuted: '#94a3b8',
  primary: '#0a2540', accent: '#e8542f',
  green: '#059669', greenLight: '#d1fae5',
  amber: '#d97706', amberLight: '#fef3c7',
  red: '#dc2626', redLight: '#fee2e2',
  blue: '#2563eb', blueLight: '#dbeafe',
};

// ─── Helpers ──────────────────────────────────────────────────
const fmtDate = (iso: string) => iso ? new Date(iso).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtTime = (iso: string) => iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
const fmtDur = (mins: number) => !mins || mins <= 0 ? '—' : mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h ${mins % 60}m`;
const todayISO = () => new Date().toISOString().slice(0, 10);

const scoreColor = (s: number) => s >= 75 ? C.green : s >= 50 ? C.amber : s > 0 ? C.red : C.textMuted;
const recLabel = (rec: string) => {
  if (!rec) return { label: '—', color: C.textMuted, bg: '#f1f5f9' };
  if (rec.toLowerCase().includes('not')) return { label: 'Not Recommended', color: C.red, bg: C.redLight };
  if (rec.toLowerCase().includes('conditional')) return { label: 'Conditional', color: C.amber, bg: C.amberLight };
  if (rec.toLowerCase().includes('recommend')) return { label: 'Recommended', color: C.green, bg: C.greenLight };
  return { label: rec, color: C.textMuted, bg: '#f1f5f9' };
};

// ─── Reusable components ──────────────────────────────────────
const Card = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', ...style }}>
    {children}
  </div>
);

const Badge = ({ label, color, bg }: { label: string; color: string; bg: string }) => (
  <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, color, background: bg, whiteSpace: 'nowrap' }}>
    {label}
  </span>
);

const StatTile = ({ icon, label, value, color }: { icon: string; label: string; value: string | number; color?: string }) => (
  <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
    <div style={{ fontSize: 24, width: 40, height: 40, borderRadius: 8, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>
    <div>
      <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: color || C.primary, lineHeight: 1.1, marginTop: 2 }}>{value}</div>
    </div>
  </div>
);

// ─── Export to CSV helper ────────────────────────────────────
function exportCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const lines = [headers, ...rows].map(r =>
    r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')
  ).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([lines], { type: 'text/csv' }));
  a.download = filename;
  a.click();
}

// ═══════════════════════════════════════════════════════════════
// DAILY STATUS REPORT TAB
// ═══════════════════════════════════════════════════════════════
function DailyReportTab({ interviewers, recent }: { interviewers: any[]; recent: any[] }) {
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [selectedIv, setSelectedIv] = useState('');

  // Filter interviews for selected date
  const dayInterviews = recent.filter(r => {
    const d = r.interviewDate ? r.interviewDate.slice(0, 10) : '';
    const matchDate = d === selectedDate;
    const matchIv = !selectedIv || (r.interviewerEmail || '').toLowerCase() === selectedIv.toLowerCase();
    return matchDate && matchIv;
  });

  // Per-interviewer summary for selected date
  const ivSummary: Record<string, { name: string; email: string; interviews: any[] }> = {};
  for (const r of dayInterviews) {
    const key = (r.interviewerEmail || r.interviewerName || 'unknown').toLowerCase();
    if (!ivSummary[key]) ivSummary[key] = { name: r.interviewerName || 'Unknown', email: r.interviewerEmail || '', interviews: [] };
    ivSummary[key].interviews.push(r);
  }
  const ivList = Object.values(ivSummary);

  const totalToday = dayInterviews.length;
  const totalDurToday = dayInterviews.reduce((s, r) => s + (r.interviewDurationMinutes || 0), 0);
  const recommended = dayInterviews.filter(r => recLabel(r.recommendation).label === 'Recommended').length;
  const notRecommended = dayInterviews.filter(r => recLabel(r.recommendation).label === 'Not Recommended').length;
  const conditional = dayInterviews.filter(r => recLabel(r.recommendation).label === 'Conditional').length;

  const handleExport = () => {
    exportCSV(
      `daily-report-${selectedDate}.csv`,
      ['Interviewer', 'Interviewer Email', 'Candidate', 'Candidate Email', 'Position', 'Client', 'Time', 'Duration', 'Score', 'Recommendation'],
      dayInterviews.map(r => [
        r.interviewerName, r.interviewerEmail,
        r.candidateName, r.candidateEmail,
        r.jobTitle || r.position, r.client,
        fmtTime(r.interviewDate), fmtDur(r.interviewDurationMinutes),
        r.overallScore || 0, recLabel(r.recommendation).label,
      ])
    );
  };

  return (
    <div>
      {/* Controls */}
      <Card style={{ padding: '20px 24px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: C.textMid, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Report Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, color: C.text, background: '#fff' }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: C.textMid, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Filter by Interviewer</label>
          <select
            value={selectedIv}
            onChange={e => setSelectedIv(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, background: '#fff', color: C.text }}>
            <option value="">All Interviewers</option>
            {interviewers.map((iv: any) => (
              <option key={iv.email} value={iv.email}>{iv.name} ({iv.email})</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
          <button onClick={() => setSelectedDate(todayISO())}
            style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${C.border}`, background: '#f8fafc', color: C.textMid, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Today
          </button>
          {dayInterviews.length > 0 && (
            <button onClick={handleExport}
              style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${C.primary}`, background: C.primary, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              ⬇ Export CSV
            </button>
          )}
        </div>
      </Card>

      {/* Day summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14, marginBottom: 24 }}>
        <StatTile icon="🎙️" label="Interviews Today" value={totalToday} />
        <StatTile icon="⏱" label="Total Time" value={fmtDur(totalDurToday)} />
        <StatTile icon="✅" label="Recommended" value={recommended} color={C.green} />
        <StatTile icon="⚠️" label="Conditional" value={conditional} color={C.amber} />
        <StatTile icon="❌" label="Not Recommended" value={notRecommended} color={C.red} />
        <StatTile icon="👥" label="Interviewers Active" value={ivList.length} />
      </div>

      {/* Per-interviewer breakdown */}
      {dayInterviews.length === 0 ? (
        <Card style={{ padding: '60px 28px', textAlign: 'center', color: C.textMuted }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>No interviews on {fmtDate(selectedDate + 'T00:00:00')}</p>
          <p style={{ fontSize: 13 }}>Select a different date or check back later.</p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {ivList.map(iv => {
            const ivRec = iv.interviews.filter(r => recLabel(r.recommendation).label === 'Recommended').length;
            const ivCond = iv.interviews.filter(r => recLabel(r.recommendation).label === 'Conditional').length;
            const ivNot = iv.interviews.filter(r => recLabel(r.recommendation).label === 'Not Recommended').length;
            const ivDur = iv.interviews.reduce((s: number, r: any) => s + (r.interviewDurationMinutes || 0), 0);
            return (
              <Card key={iv.email} style={{ padding: 0, overflow: 'hidden' }}>
                {/* Interviewer header */}
                <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg, #0a2540 0%, #1e3a5f 100%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 16, color: '#fff' }}>👤 {iv.name}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{iv.email}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 14px', textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{iv.interviews.length}</div>
                      <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Interviews</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 14px', textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{fmtDur(ivDur)}</div>
                      <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Time</div>
                    </div>
                    <div style={{ background: 'rgba(5,150,105,0.25)', borderRadius: 8, padding: '6px 14px', textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#6ee7b7' }}>{ivRec}</div>
                      <div style={{ fontSize: 10, color: '#6ee7b7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recommended</div>
                    </div>
                    <div style={{ background: 'rgba(217,119,6,0.25)', borderRadius: 8, padding: '6px 14px', textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#fcd34d' }}>{ivCond}</div>
                      <div style={{ fontSize: 10, color: '#fcd34d', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Conditional</div>
                    </div>
                    <div style={{ background: 'rgba(220,38,38,0.25)', borderRadius: 8, padding: '6px 14px', textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#fca5a5' }}>{ivNot}</div>
                      <div style={{ fontSize: 10, color: '#fca5a5', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Not Rec.</div>
                    </div>
                  </div>
                </div>

                {/* Candidate rows for this interviewer */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: `2px solid ${C.border}` }}>
                        {['Time', 'Candidate', 'Email', 'Position / Client', 'Duration', 'Score', 'Result', ''].map(h => (
                          <th key={h} style={{ padding: '9px 14px', fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {iv.interviews.map((r: any, i: number) => {
                        const rec = recLabel(r.recommendation);
                        return (
                          <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                            <td style={{ padding: '11px 14px', whiteSpace: 'nowrap', color: C.textMid, fontSize: 12 }}>{fmtTime(r.interviewDate)}</td>
                            <td style={{ padding: '11px 14px', fontWeight: 700, color: C.text }}>{r.candidateName}</td>
                            <td style={{ padding: '11px 14px', color: C.textMid, fontSize: 12 }}>{r.candidateEmail}</td>
                            <td style={{ padding: '11px 14px' }}>
                              <div style={{ fontWeight: 600, color: C.text }}>{r.jobTitle || r.position}</div>
                              <div style={{ fontSize: 11, color: C.textMuted }}>{r.client}</div>
                            </td>
                            <td style={{ padding: '11px 14px', color: C.textMid, whiteSpace: 'nowrap' }}>{fmtDur(r.interviewDurationMinutes)}</td>
                            <td style={{ padding: '11px 14px', textAlign: 'center' }}>
                              {r.overallScore > 0
                                ? <span style={{ fontWeight: 800, fontSize: 15, color: scoreColor(r.overallScore) }}>{r.overallScore}<span style={{ fontSize: 10, color: C.textMuted, fontWeight: 400 }}>/100</span></span>
                                : <span style={{ color: C.textMuted, fontSize: 12 }}>—</span>}
                            </td>
                            <td style={{ padding: '11px 14px' }}><Badge label={rec.label} color={rec.color} bg={rec.bg} /></td>
                            <td style={{ padding: '11px 14px' }}>
                              <a href={`/ai-interview/report/${r.id || r.sessionId}`} target="_blank" rel="noopener noreferrer"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 7,
                                  background: '#0a2540', color: '#fff', fontSize: 11, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                                📄 View Report
                              </a>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CANDIDATE SEARCH TAB
// ═══════════════════════════════════════════════════════════════
function CandidateSearchTab({ interviewers }: { interviewers: any[] }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [position, setPosition] = useState('');
  const [selectedIv, setSelectedIv] = useState('');
  const [days, setDays] = useState('30');
  const [minScore, setMinScore] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = useCallback(async () => {
    setSearching(true);
    setSearched(true);
    try {
      const params = new URLSearchParams();
      if (name) params.set('q', name);
      if (email) params.set('email', email);
      if (position) params.set('position', position);
      if (days) params.set('days', days);
      if (minScore) params.set('minScore', minScore);
      if (recommendation) params.set('recommendation', recommendation);
      if (selectedIv) params.set('interviewer', selectedIv);
      const r = await fetch(`/api/admin/candidates?${params}`);
      const d = await r.json();
      setResults(d.results || []);
    } catch { /* ignore */ }
    setSearching(false);
  }, [name, email, position, days, minScore, recommendation, selectedIv]);

  const handleExport = () => {
    exportCSV(
      `candidates-${Date.now()}.csv`,
      ['Candidate', 'Email', 'Position', 'Client', 'Interviewer', 'Date', 'Duration', 'Score', 'Recommendation'],
      results.map(r => [
        r.candidateName, r.candidateEmail,
        r.jobTitle || r.position, r.client,
        r.interviewerName, fmtDate(r.interviewDate), fmtDur(r.interviewDurationMinutes),
        r.overallScore || 0, recLabel(r.recommendation).label,
      ])
    );
  };

  const BtnGroup = ({ label, options, value, onChange }: { label: string; options: [string, string][]; value: string; onChange: (v: string) => void }) => (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.textMid, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {options.map(([v, lbl]) => (
          <button key={v} onClick={() => onChange(v)}
            style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, border: `1.5px solid ${value === v ? C.primary : C.border}`, background: value === v ? C.primary : '#fff', color: value === v ? '#fff' : C.textMid, cursor: 'pointer', transition: 'all 0.12s' }}>
            {lbl}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      {/* Search filters */}
      <Card style={{ padding: '24px', marginBottom: 24 }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: C.primary, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          🔍 Search Interviewed Candidates
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 18, marginBottom: 20 }}>
          {[
            { label: 'Candidate Name', value: name, onChange: setName, placeholder: 'e.g. John Smith' },
            { label: 'Candidate Email', value: email, onChange: setEmail, placeholder: 'e.g. john@gmail.com' },
            { label: 'Position / Job Title', value: position, onChange: setPosition, placeholder: 'e.g. React Developer' },
          ].map(f => (
            <div key={f.label}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.textMid, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{f.label}</div>
              <input value={f.value} onChange={e => f.onChange(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && search()}
                placeholder={f.placeholder}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, boxSizing: 'border-box', color: C.text }} />
            </div>
          ))}

          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.textMid, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Interviewer</div>
            <select value={selectedIv} onChange={e => setSelectedIv(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, background: '#fff', color: C.text }}>
              <option value="">All Interviewers</option>
              {interviewers.map((iv: any) => (
                <option key={iv.email} value={iv.email}>{iv.name} ({iv.email})</option>
              ))}
            </select>
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.textMid, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Recommendation</div>
            <select value={recommendation} onChange={e => setRecommendation(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, background: '#fff', color: C.text }}>
              <option value="">All Outcomes</option>
              <option value="Recommended">✅ Recommended</option>
              <option value="Conditional">⚠️ Conditional Pass</option>
              <option value="Not Recommended">❌ Not Recommended</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 22 }}>
          <BtnGroup
            label="Interview Period"
            value={days}
            onChange={setDays}
            options={[['7', 'Last 7 days'], ['15', '15 days'], ['30', '1 Month'], ['60', '2 Months'], ['90', '3 Months'], ['365', '1 Year'], ['', 'All Time']]}
          />
          <BtnGroup
            label="Minimum Score"
            value={minScore}
            onChange={setMinScore}
            options={[['', 'Any'], ['50', '50+'], ['60', '60+'], ['70', '70+'], ['80', '80+'], ['90', '90+']]}
          />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={search} disabled={searching}
            style={{ padding: '11px 32px', borderRadius: 8, border: 'none', background: searching ? '#94a3b8' : C.accent, color: '#fff', fontWeight: 700, fontSize: 14, cursor: searching ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            {searching ? '⏳ Searching…' : '🔍 Search Candidates'}
          </button>
          <button onClick={() => { setName(''); setEmail(''); setPosition(''); setSelectedIv(''); setDays('30'); setMinScore(''); setRecommendation(''); setResults([]); setSearched(false); }}
            style={{ padding: '11px 20px', borderRadius: 8, border: `1px solid ${C.border}`, background: '#f8fafc', color: C.textMid, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
            Clear
          </button>
        </div>
      </Card>

      {/* Results */}
      {searched && (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: C.primary }}>
              {searching ? 'Searching…' : `${results.length} candidate${results.length !== 1 ? 's' : ''} found`}
            </span>
            {results.length > 0 && (
              <button onClick={handleExport}
                style={{ fontSize: 12, padding: '6px 14px', borderRadius: 8, border: `1px solid ${C.border}`, background: '#f8fafc', color: C.textMid, cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                ⬇ Export CSV
              </button>
            )}
          </div>

          {results.length === 0 && !searching ? (
            <div style={{ textAlign: 'center', padding: '60px 28px', color: C.textMuted }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔎</div>
              <p style={{ fontWeight: 600 }}>No candidates match your filters</p>
              <p style={{ fontSize: 13, marginTop: 4 }}>Try broadening the search criteria</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: `2px solid ${C.border}` }}>
                    {['Candidate', 'Position / Client', 'Interviewer', 'Date', 'Duration', 'Score', 'Result', 'Proctoring', ''].map(h => (
                      <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((r: any, i: number) => {
                    const rec = recLabel(r.recommendation);
                    return (
                      <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ fontWeight: 700, color: C.text }}>{r.candidateName}</div>
                          <div style={{ fontSize: 11, color: C.textMuted }}>{r.candidateEmail}</div>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ fontWeight: 600, color: C.text }}>{r.jobTitle || r.position}</div>
                          <div style={{ fontSize: 11, color: C.textMuted }}>{r.client}</div>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ fontSize: 13, color: C.textMid }}>{r.interviewerName}</div>
                          <div style={{ fontSize: 11, color: C.textMuted }}>{r.interviewerEmail}</div>
                        </td>
                        <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                          <div style={{ fontSize: 13, color: C.text }}>{fmtDate(r.interviewDate)}</div>
                          <div style={{ fontSize: 11, color: C.textMuted }}>{fmtTime(r.interviewDate)}</div>
                        </td>
                        <td style={{ padding: '12px 14px', color: C.textMid, whiteSpace: 'nowrap' }}>{fmtDur(r.interviewDurationMinutes)}</td>
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                          {(r.overallScore || 0) > 0
                            ? <span style={{ fontWeight: 800, fontSize: 16, color: scoreColor(r.overallScore) }}>{r.overallScore}<span style={{ fontSize: 10, color: C.textMuted, fontWeight: 400 }}>/100</span></span>
                            : <span style={{ color: C.textMuted }}>—</span>}
                        </td>
                        <td style={{ padding: '12px 14px' }}><Badge label={rec.label} color={rec.color} bg={rec.bg} /></td>
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                          {(r.proctorRedFlags || 0) > 0
                            ? <span style={{ color: C.red, fontWeight: 700, fontSize: 12 }}>🚨 {r.proctorRedFlags} flags</span>
                            : <span style={{ color: C.green, fontSize: 12 }}>✓ Clean</span>}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <a href={`/ai-interview/report/${r.id || r.sessionId}`} target="_blank" rel="noopener noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 7,
                              background: '#0a2540', color: '#fff', fontSize: 11, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                            📄 View Report
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════
export default function AdminReportsPage() {
  const [tab, setTab] = useState<'daily' | 'search'>('daily');
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<any>(null);
  const [interviewers, setInterviewers] = useState<any[]>([]);
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/admin/reports');
        const d = await r.json();
        setOverview(d.overview);
        setInterviewers(d.interviewers || []);
        setRecent(d.recent || []);
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, []);

  const totalDur = recent.reduce((s, r) => s + (r.interviewDurationMinutes || 0), 0);
  const recommended = recent.filter(r => recLabel(r.recommendation).label === 'Recommended').length;

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'system-ui,-apple-system,sans-serif', color: C.text }}>

      {/* Header */}
      <div style={{ background: C.primary, padding: '0 28px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg,#e8542f,#0a2540)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 12 }}>SRS</div>
          <span style={{ fontWeight: 700, fontSize: 16, color: '#fff' }}>Reports & Analytics</span>
          <span style={{ fontSize: 11, color: '#64748b', background: 'rgba(255,255,255,0.1)', padding: '3px 10px', borderRadius: 20 }}>Admin View</span>
        </div>
        <a href="/ai-interview/admin" style={{ fontSize: 13, color: '#94a3b8', textDecoration: 'none', fontWeight: 600 }}>← Back to Dashboard</a>
      </div>

      {/* Top summary bar */}
      {!loading && (
        <div style={{ background: '#0f3460', padding: '14px 28px', display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          {[
            { label: 'Total Completed', value: overview?.total || 0, icon: '🎙️' },
            { label: 'Today', value: overview?.today || 0, icon: '☀️' },
            { label: 'This Week', value: overview?.thisWeek || 0, icon: '📆' },
            { label: 'This Month', value: overview?.thisMonth || 0, icon: '📅' },
            { label: 'Recommended', value: recommended, icon: '✅' },
            { label: 'Total Duration', value: fmtDur(totalDur), icon: '⏱' },
            { label: 'Active Interviewers', value: interviewers.length, icon: '👥' },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>{s.icon}</span>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{s.value}</div>
                <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
              </div>
              <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.1)', marginLeft: 8 }} />
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '0 28px', display: 'flex', gap: 0 }}>
        {([['daily', '📅 Daily Status Report'], ['search', '🔍 Candidate Search']] as [typeof tab, string][]).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            style={{ padding: '16px 24px', border: 'none', background: 'none', fontSize: 14, fontWeight: tab === key ? 700 : 500, color: tab === key ? C.primary : C.textMid, borderBottom: tab === key ? `3px solid ${C.accent}` : '3px solid transparent', cursor: 'pointer', transition: 'all 0.15s' }}>
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: '28px 28px 48px', maxWidth: 1400, margin: '0 auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: C.textMuted }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div>
            <p>Loading report data…</p>
          </div>
        ) : (
          <>
            {tab === 'daily' && <DailyReportTab interviewers={interviewers} recent={recent} />}
            {tab === 'search' && <CandidateSearchTab interviewers={interviewers} />}
          </>
        )}
      </div>
    </div>
  );
}
