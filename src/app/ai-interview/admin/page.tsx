"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, RefreshCw, ExternalLink, Users, Clock, CheckCircle, Circle, AlertCircle, LogOut, Copy, Trash2 } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  scheduled: { label: "Scheduled", color: "#a16207", bg: "#fef9c3" },
  waiting: { label: "Waiting", color: "#1d4ed8", bg: "#dbeafe" },
  in_progress: { label: "In Progress", color: "#16a34a", bg: "#dcfce7" },
  completed: { label: "Completed", color: "#475569", bg: "#f1f5f9" },
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
}

export default function AdminDashboard() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  const deleteSession = async (sessionId: string) => {
    if (!confirm("Cancel and delete this interview session?")) return;
    await fetch(`/api/interviews/${sessionId}`, { method: "DELETE" });
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  useEffect(() => {
    const auth = localStorage.getItem("ai_interview_auth");
    if (!auth) { router.push("/ai-interview/login"); return; }
    fetchSessions();
    const interval = setInterval(fetchSessions, 15000);
    return () => clearInterval(interval);
  }, [router, fetchSessions]);

  const handleLogout = () => {
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

        {/* Sessions table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-primary">All Interviews</h2>
            <span className="text-xs text-gray-400">{sessions.length} total</span>
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
          ) : (
            <div className="divide-y divide-gray-50">
              {sessions.map((s) => {
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
                        <span>{new Date(s.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full"
                      style={{ color: st.color, background: st.bg }}>
                      {st.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => copyLink(s.id, s.interviewUrl)}
                        title="Copy candidate interview link"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-teal text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity">
                        <Copy size={12} /> {copiedId === s.id ? "Copied!" : "Copy Link"}
                      </button>
                      <Link href={`/ai-interview/observe/${s.id}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-light transition-colors">
                        <ExternalLink size={12} /> Observe
                      </Link>
                      {s.status === "completed" && (
                        <Link href={`/ai-interview/report/${s.id}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-teal text-white text-xs font-semibold rounded-lg hover:bg-teal-dark transition-colors">
                          Report
                        </Link>
                      )}
                      {s.status !== "in_progress" && (
                        <button onClick={() => deleteSession(s.id)}
                          title="Delete this interview"
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
