"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  RefreshCw, ExternalLink, Clock, CheckCircle, Circle,
  AlertCircle, LogOut, Copy, Users, Video, Plus,
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  scheduled:   { label: "Scheduled",   color: "#a16207", bg: "#fef9c3" },
  waiting:     { label: "Waiting",     color: "#1d4ed8", bg: "#dbeafe" },
  in_progress: { label: "In Progress", color: "#16a34a", bg: "#dcfce7" },
  completed:   { label: "Completed",   color: "#475569", bg: "#f1f5f9" },
};

interface SessionSummary {
  id: string;
  status: string;
  candidate: { name: string; email: string };
  jd: { title: string; client: string };
  createdAt: string;
  observerUrl: string;
  interviewUrl: string;
  recruiterEmail?: string;
  questionsCount: number;
}

export default function InterviewerDashboard() {
  const router  = useRouter();
  const [sessions,  setSessions]  = useState<SessionSummary[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [user,      setUser]      = useState<{ name: string; email: string; token: string } | null>(null);
  const [copiedId,  setCopiedId]  = useState<string | null>(null);

  function getToken(): string | null {
    try { return JSON.parse(localStorage.getItem("ai_interview_auth") ?? "")?.token ?? null; }
    catch { return null; }
  }

  const fetchSessions = useCallback(async (email: string) => {
    try {
      const res = await fetch(`/api/interviews?recruiterEmail=${encodeURIComponent(email)}`);
      if (res.ok) setSessions(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem("ai_interview_auth");
    if (!raw) { router.push("/ai-interview/login"); return; }
    const auth = JSON.parse(raw);
    // Admins should use the admin panel
    if (auth.role === "Admin") { router.push("/ai-interview/admin"); return; }
    setUser({ name: auth.name, email: auth.email, token: auth.token });
    fetchSessions(auth.email);
    const interval = setInterval(() => fetchSessions(auth.email), 15000);
    return () => clearInterval(interval);
  }, [router, fetchSessions]);

  const handleLogout = async () => {
    const token = getToken();
    if (token) {
      await fetch("/api/auth/logout", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    }
    localStorage.removeItem("ai_interview_auth");
    router.push("/ai-interview/login");
  };

  const copyLink = (sessionId: string, interviewUrl: string) => {
    const link = interviewUrl || `${window.location.origin}/ai-interview/session/${sessionId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(sessionId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const inProgress  = sessions.filter(s => s.status === "in_progress").length;
  const completed   = sessions.filter(s => s.status === "completed").length;
  const scheduled   = sessions.filter(s => s.status === "scheduled" || s.status === "waiting").length;

  return (
    <div className="min-h-screen bg-surface">

      {/* Header */}
      <header className="bg-primary border-b border-primary-light">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white">My Interviews</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Welcome back, <span className="text-white font-medium">{user?.name}</span>
              {" "}· {user?.email}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => user && fetchSessions(user.email)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Refresh">
              <RefreshCw size={18} />
            </button>
            <Link
              href="/ai-interview/setup"
              className="flex items-center gap-2 px-4 py-2 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-accent-dark transition-colors">
              <Plus size={16} /> New Interview
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-8">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Assigned",  value: sessions.length, icon: Users        },
            { label: "In Progress",     value: inProgress,      icon: Clock        },
            { label: "Completed",       value: completed,       icon: CheckCircle  },
            { label: "Upcoming",        value: scheduled,       icon: Circle       },
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

        {/* Interview list */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-primary flex items-center gap-2">
              <Video size={16} className="text-accent" /> Assigned Interviews
            </h2>
            <span className="text-xs text-gray-400">{sessions.length} total</span>
          </div>

          {loading ? (
            <div className="py-20 text-center text-gray-400">Loading your interviews…</div>
          ) : sessions.length === 0 ? (
            <div className="py-20 text-center">
              <AlertCircle size={40} className="text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500 font-medium mb-1">No interviews assigned yet</p>
              <p className="text-sm text-gray-400">
                Your administrator will assign interviews to you. Check back soon.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {sessions.map(s => {
                const st = STATUS_CONFIG[s.status] || STATUS_CONFIG.scheduled;
                return (
                  <div key={s.id} className="px-6 py-4 flex items-center gap-4 hover:bg-surface/50 transition-colors">
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-primary truncate">{s.candidate.name}</span>
                        <span className="text-gray-300">·</span>
                        <span className="text-sm text-gray-500 truncate">{s.jd.title}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                        <span>{s.jd.client}</span>
                        <span>·</span>
                        <span>{s.candidate.email}</span>
                        <span>·</span>
                        <span>{new Date(s.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Status */}
                    <span
                      className="text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0"
                      style={{ color: st.color, background: st.bg }}>
                      {st.label}
                    </span>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Copy candidate link */}
                      <button
                        onClick={() => copyLink(s.id, s.interviewUrl)}
                        title="Copy candidate interview link"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-teal text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity">
                        <Copy size={12} />
                        {copiedId === s.id ? "Copied!" : "Copy Link"}
                      </button>

                      {/* Join as interviewer */}
                      {(s.status === "waiting" || s.status === "in_progress" || s.status === "scheduled") && (
                        <Link
                          href={`/ai-interview/interview/${s.id}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-light transition-colors">
                          <ExternalLink size={12} />
                          {s.status === "in_progress" ? "Join Live" : "Open Panel"}
                        </Link>
                      )}

                      {/* View report */}
                      {s.status === "completed" && (
                        <Link
                          href={`/ai-interview/report/${s.id}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-teal text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-colors">
                          <CheckCircle size={12} />
                          View Report
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Info box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700">
          <p className="font-semibold mb-1">How to conduct an interview:</p>
          <ol className="list-decimal list-inside space-y-1 text-blue-600">
            <li>Copy the candidate link and share it with the candidate via email or chat</li>
            <li>Once the candidate joins, click <strong>Open Panel</strong> to start the interview</li>
            <li>After the interview, the report is automatically generated — click <strong>View Report</strong></li>
          </ol>
        </div>
      </main>
    </div>
  );
}
