"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, RefreshCw, ExternalLink, Users, Clock, CheckCircle, Circle, AlertCircle, LogOut, Copy, Trash2, Mail, UserCog, Search, X, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  scheduled:   { label: "Scheduled",   color: "#a16207", bg: "#fef9c3" },
  waiting:     { label: "Waiting",      color: "#1d4ed8", bg: "#dbeafe" },
  in_progress: { label: "In Progress",  color: "#16a34a", bg: "#dcfce7" },
  completed:   { label: "Completed",    color: "#475569", bg: "#f1f5f9" },
  abandoned:   { label: "Abandoned",    color: "#dc2626", bg: "#fee2e2" },
};

interface SessionSummary {
  id: string;
  status: string;
  candidate: { name: string; email: string };
  jd: { title: string; client: string };
  createdAt: string;
  observerUrl: string;
  interviewUrl: string;
  questionsCount: number;
  recruiterName?: string;
  recruiterEmail?: string;
}

const PAGE_SIZES = [10, 25, 50];

export default function AdminDashboard() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [copiedId, setCopiedId]   = useState<string | null>(null);
  const [emailingId, setEmailingId] = useState<string | null>(null);
  const [emailedId, setEmailedId]  = useState<string | null>(null);

  // ── Filter / Sort / Pagination state ────────────────────────
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter,   setDateFilter]   = useState("all");
  const [sortBy,       setSortBy]       = useState<"date"|"name"|"status"|"position">("date");
  const [sortDir,      setSortDir]      = useState<"desc"|"asc">("desc");
  const [page,         setPage]         = useState(1);
  const [pageSize,     setPageSize]     = useState(10);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/interviews");
      if (res.ok) setSessions(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  const copyLink = (sessionId: string, interviewUrl: string) => {
    const link = interviewUrl || `${window.location.origin}/ai-interview/session/${sessionId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(sessionId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const emailReport = async (sessionId: string) => {
    const email = prompt("Send report to email address:");
    if (!email) return;
    setEmailingId(sessionId);
    try {
      const res = await fetch(`/api/interviews/${sessionId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setEmailedId(sessionId);
        setTimeout(() => setEmailedId(null), 3000);
      } else {
        const d = await res.json();
        alert(d.error || "Failed to send email");
      }
    } finally {
      setEmailingId(null);
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (!confirm("Cancel and delete this interview session?")) return;
    await fetch(`/api/interviews/${sessionId}`, { method: "DELETE" });
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  useEffect(() => {
    const raw = localStorage.getItem("ai_interview_auth");
    if (!raw) { router.push("/ai-interview/login"); return; }
    const auth = JSON.parse(raw);
    if (auth.role !== "Admin") { router.push("/ai-interview/interviewer"); return; }
    setIsAdmin(auth.role === "Admin");
    fetchSessions();
    const interval = setInterval(fetchSessions, 15000);
    return () => clearInterval(interval);
  }, [router, fetchSessions]);

  // ── Derived: filtered + sorted + paginated ──────────────────
  const filtered = useMemo(() => {
    const now = Date.now();
    const cutoff: Record<string, number> = {
      today: 86400000, week: 7 * 86400000, month: 30 * 86400000, quarter: 90 * 86400000,
    };

    let list = sessions.filter(s => {
      // Status filter
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      // Date filter
      if (dateFilter !== "all") {
        const ms = now - new Date(s.createdAt).getTime();
        if (ms > (cutoff[dateFilter] ?? Infinity)) return false;
      }
      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const hit = (
          s.candidate.name.toLowerCase().includes(q) ||
          s.candidate.email.toLowerCase().includes(q) ||
          s.jd.title.toLowerCase().includes(q) ||
          s.jd.client.toLowerCase().includes(q) ||
          (s.recruiterName || "").toLowerCase().includes(q) ||
          (s.recruiterEmail || "").toLowerCase().includes(q)
        );
        if (!hit) return false;
      }
      return true;
    });

    // Sort
    list.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "date")     cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "name")     cmp = a.candidate.name.localeCompare(b.candidate.name);
      if (sortBy === "position") cmp = a.jd.title.localeCompare(b.jd.title);
      if (sortBy === "status")   cmp = a.status.localeCompare(b.status);
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [sessions, search, statusFilter, dateFilter, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated  = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("desc"); }
    setPage(1);
  };

  const resetFilters = () => {
    setSearch(""); setStatusFilter("all"); setDateFilter("all");
    setSortBy("date"); setSortDir("desc"); setPage(1);
  };

  const hasActiveFilters = search || statusFilter !== "all" || dateFilter !== "all";

  const handleLogout = async () => {
    try {
      const raw = localStorage.getItem("ai_interview_auth");
      const token = raw ? JSON.parse(raw)?.token : null;
      if (token) {
        await fetch("/api/auth/logout", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      }
    } catch { /* ignore */ }
    localStorage.removeItem("ai_interview_auth");
    router.push("/ai-interview/login");
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-primary border-b border-primary-light">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white">AI Interview Dashboard</h1>
            <p className="text-xs text-gray-400 mt-0.5">SRS Infoway — Recruiter Portal</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchSessions}
              className="p-2 text-gray-400 hover:text-white transition-colors" title="Refresh">
              <RefreshCw size={18} />
            </button>
            <Link href="/ai-interview/admin/reports"
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors"
              style={{ background: '#e8f0fb', color: '#0a2540', border: '1px solid #c7d2fe' }}>
              📊 Reports & Analytics
            </Link>
            <Link href="/ai-interview/admin/interviewers"
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors"
              style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}>
              <UserCog size={15} /> Interviewers
            </Link>
            <Link href="/ai-interview/setup"
              className="flex items-center gap-2 px-4 py-2 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-accent-dark transition-colors">
              <Plus size={16} /> New Interview
            </Link>
            <button onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-white transition-colors" title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Interviews", value: sessions.length, icon: Users },
            { label: "In Progress", value: sessions.filter(s => s.status === "in_progress").length, icon: Clock },
            { label: "Completed", value: sessions.filter(s => s.status === "completed").length, icon: CheckCircle },
            { label: "Scheduled", value: sessions.filter(s => s.status === "scheduled").length, icon: Circle },
          ].map(({ label, value, icon: Icon }, i) => (
            <div key={i} className="bg-white rounded-xl p-5 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400 uppercase tracking-wider">{label}</span>
                <Icon size={16} className="text-accent" />
              </div>
              <div className="text-3xl font-bold text-primary">{value}</div>
            </div>
          ))}
        </div>

        {/* ── Filter / Sort Bar ─────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
          <div className="flex flex-wrap gap-3 items-center">

            {/* Search */}
            <div className="flex items-center gap-2 flex-1 min-w-48 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
              <Search size={14} className="text-gray-400 shrink-0" />
              <input
                type="text" placeholder="Search candidate, position, client, interviewer…"
                value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-full"
              />
              {search && <button onClick={() => { setSearch(""); setPage(1); }}><X size={13} className="text-gray-400 hover:text-gray-600" /></button>}
            </div>

            {/* Status */}
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-700 outline-none cursor-pointer">
              <option value="all">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="waiting">Waiting</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="abandoned">Abandoned</option>
            </select>

            {/* Date range */}
            <select value={dateFilter} onChange={e => { setDateFilter(e.target.value); setPage(1); }}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-700 outline-none cursor-pointer">
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last 90 Days</option>
            </select>

            {/* Sort */}
            <select value={sortBy} onChange={e => { setSortBy(e.target.value as typeof sortBy); setPage(1); }}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-700 outline-none cursor-pointer">
              <option value="date">Sort: Date</option>
              <option value="name">Sort: Candidate Name</option>
              <option value="position">Sort: Position</option>
              <option value="status">Sort: Status</option>
            </select>

            <button onClick={() => { setSortDir(d => d === "asc" ? "desc" : "asc"); setPage(1); }}
              title={sortDir === "desc" ? "Newest first — click for oldest first" : "Oldest first — click for newest first"}
              className="flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-600 hover:bg-gray-100 transition-colors">
              {sortDir === "desc" ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
              {sortDir === "desc" ? "Desc" : "Asc"}
            </button>

            {/* Per page */}
            <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-700 outline-none cursor-pointer">
              {PAGE_SIZES.map(n => <option key={n} value={n}>Show {n}</option>)}
            </select>

            {/* Clear filters */}
            {hasActiveFilters && (
              <button onClick={resetFilters}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-accent border border-accent/30 rounded-lg hover:bg-accent/5 transition-colors">
                <X size={13} /> Clear Filters
              </button>
            )}
          </div>

          {/* Active filter chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-400">Active filters:</span>
              {statusFilter !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
                  Status: {STATUS_CONFIG[statusFilter]?.label || statusFilter}
                  <button onClick={() => { setStatusFilter("all"); setPage(1); }}><X size={10} /></button>
                </span>
              )}
              {dateFilter !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded-full font-medium">
                  Date: {dateFilter === "today" ? "Today" : dateFilter === "week" ? "Last 7 days" : dateFilter === "month" ? "Last 30 days" : "Last 90 days"}
                  <button onClick={() => { setDateFilter("all"); setPage(1); }}><X size={10} /></button>
                </span>
              )}
              {search && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-700 text-xs rounded-full font-medium">
                  Search: &quot;{search}&quot;
                  <button onClick={() => { setSearch(""); setPage(1); }}><X size={10} /></button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── Sessions table ────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="font-semibold text-primary">All Interviews</h2>
              {hasActiveFilters && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                  {filtered.length} of {sessions.length} shown
                </span>
              )}
            </div>
            <span className="text-xs text-gray-400">
              {filtered.length > 0 ? `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, filtered.length)} of ${filtered.length}` : "0 results"}
            </span>
          </div>

          {loading ? (
            <div className="py-20 text-center text-gray-400">Loading sessions...</div>
          ) : sessions.length === 0 ? (
            <div className="py-20 text-center">
              <AlertCircle size={40} className="text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">No interviews yet</p>
              <Link href="/ai-interview/setup" className="text-accent text-sm font-semibold hover:underline">
                Create your first interview
              </Link>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <Search size={40} className="text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500 font-medium mb-1">No interviews match your filters</p>
              <p className="text-gray-400 text-sm mb-4">Try adjusting or clearing the filters above</p>
              <button onClick={resetFilters} className="text-accent text-sm font-semibold hover:underline">Clear all filters</button>
            </div>
          ) : (
            <>
              {/* Column headers */}
              <div className="px-6 py-2 border-b border-gray-50 bg-gray-50 grid gap-4 text-xs font-bold text-gray-400 uppercase tracking-wider"
                style={{ gridTemplateColumns: '1fr auto auto' }}>
                <div className="flex items-center gap-4">
                  <button onClick={() => toggleSort("name")} className="flex items-center gap-1 hover:text-gray-600 transition-colors">
                    Candidate {sortBy === "name" ? (sortDir === "asc" ? <ChevronUp size={11}/> : <ChevronDown size={11}/>) : null}
                  </button>
                  <span className="text-gray-200">|</span>
                  <button onClick={() => toggleSort("position")} className="flex items-center gap-1 hover:text-gray-600 transition-colors">
                    Position {sortBy === "position" ? (sortDir === "asc" ? <ChevronUp size={11}/> : <ChevronDown size={11}/>) : null}
                  </button>
                  <span className="text-gray-200">|</span>
                  <button onClick={() => toggleSort("date")} className="flex items-center gap-1 hover:text-gray-600 transition-colors">
                    Date {sortBy === "date" ? (sortDir === "asc" ? <ChevronUp size={11}/> : <ChevronDown size={11}/>) : null}
                  </button>
                </div>
                <button onClick={() => toggleSort("status")} className="flex items-center gap-1 hover:text-gray-600 transition-colors">
                  Status {sortBy === "status" ? (sortDir === "asc" ? <ChevronUp size={11}/> : <ChevronDown size={11}/>) : null}
                </button>
                <span>Actions</span>
              </div>

              <div className="divide-y divide-gray-50">
                {paginated.map((s) => {
                  const st = STATUS_CONFIG[s.status] || STATUS_CONFIG.scheduled;
                  return (
                    <div key={s.id} className="px-6 py-4 flex items-center gap-4 hover:bg-surface/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-primary truncate">{s.candidate.name}</span>
                          <span className="text-gray-300">·</span>
                          <span className="text-sm text-gray-500 truncate">{s.jd.title}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span>{s.jd.client}</span>
                          <span>·</span>
                          <span>{s.candidate.email}</span>
                          <span>·</span>
                          <span>{new Date(s.createdAt).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                          {s.recruiterName && <><span>·</span><span>👤 {s.recruiterName}</span></>}
                        </div>
                      </div>
                      <span className="text-xs font-semibold px-3 py-1 rounded-full shrink-0"
                        style={{ color: st.color, background: st.bg }}>
                        {st.label}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => copyLink(s.id, s.interviewUrl)}
                          title="Copy candidate interview link"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-teal text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity">
                          <Copy size={12} /> {copiedId === s.id ? "Copied!" : "Copy Link"}
                        </button>
                        <Link href={`/ai-interview/interview/${s.id}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-light transition-colors">
                          <ExternalLink size={12} /> Interviewer
                        </Link>
                        {s.status === "completed" && (
                          <>
                            <Link href={`/ai-interview/report/${s.id}`}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-teal text-white text-xs font-semibold rounded-lg hover:bg-teal-dark transition-colors">
                              Report
                            </Link>
                            <button onClick={() => emailReport(s.id)}
                              disabled={emailingId === s.id}
                              title="Email report PDF to recruiter"
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50">
                              <Mail size={12} />
                              {emailingId === s.id ? "Sending…" : emailedId === s.id ? "Sent!" : "Email"}
                            </button>
                          </>
                        )}
                        {isAdmin && s.status !== "in_progress" && (
                          <button onClick={() => deleteSession(s.id)}
                            title="Delete this interview (Admin only)"
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── Pagination ──────────────────────────────── */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    Page {page} of {totalPages} · {filtered.length} interviews
                  </span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setPage(1)} disabled={page === 1}
                      className="px-2 py-1 text-xs rounded-md border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">«</button>
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                      className="p-1.5 rounded-md border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">
                      <ChevronLeft size={14} />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                      const n = start + i;
                      return n <= totalPages ? (
                        <button key={n} onClick={() => setPage(n)}
                          className={`px-3 py-1 text-xs rounded-md border transition-colors ${n === page ? "bg-primary text-white border-primary font-bold" : "border-gray-200 hover:bg-gray-50"}`}>
                          {n}
                        </button>
                      ) : null;
                    })}
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                      className="p-1.5 rounded-md border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">
                      <ChevronRight size={14} />
                    </button>
                    <button onClick={() => setPage(totalPages)} disabled={page === totalPages}
                      className="px-2 py-1 text-xs rounded-md border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">»</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
