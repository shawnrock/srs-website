"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users, Plus, RefreshCw, LogOut, ArrowLeft, Mail, Trash2, Ban,
  CheckCircle, Clock, AlertCircle, MapPin, X, Loader, ShieldCheck,
  ShieldOff, Send, ChevronDown, ChevronUp,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApprovedLocation {
  id: string;
  fingerprint: string;
  ipAddress: string;
  userAgentSummary: string;
  label: string;
  approvedAt: string;
  approvedBy: string;
  lastUsedAt?: string;
}

interface Interviewer {
  id: string;
  name: string;
  email: string;
  status: "invited" | "active" | "suspended";
  invitedAt: string;
  invitedBy: string;
  activatedAt?: string;
  lastLoginAt?: string;
  approvedLocations: ApprovedLocation[];
  createdAt: string;
}

interface LocationRequest {
  id: string;
  interviewerId: string;
  interviewerEmail: string;
  interviewerName: string;
  fingerprint: string;
  ipAddress: string;
  userAgentSummary: string;
  requestedAt: string;
  status: "pending" | "approved" | "rejected";
  resolvedAt?: string;
  resolvedBy?: string;
}

// ─── Status badge helper ──────────────────────────────────────────────────────

const STATUS = {
  invited:   { label: "Invited",   color: "#1d4ed8", bg: "#dbeafe" },
  active:    { label: "Active",    color: "#16a34a", bg: "#dcfce7" },
  suspended: { label: "Suspended", color: "#b91c1c", bg: "#fee2e2" },
};

function fmtDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function fmtDateTime(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function InterviewersPage() {
  const router = useRouter();

  const [interviewers, setInterviewers] = useState<Interviewer[]>([]);
  const [locRequests,  setLocRequests]  = useState<LocationRequest[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [activeUser,   setActiveUser]   = useState<{ email: string; name: string } | null>(null);

  // Invite modal
  const [showInvite,   setShowInvite]   = useState(false);
  const [inviteName,   setInviteName]   = useState("");
  const [inviteEmail,  setInviteEmail]  = useState("");
  const [inviting,     setInviting]     = useState(false);
  const [inviteError,  setInviteError]  = useState("");
  const [inviteSuccess,setInviteSuccess]= useState("");

  // Expanded rows
  const [expanded,     setExpanded]     = useState<Set<string>>(new Set());

  // Action loading states
  const [actionId,     setActionId]     = useState<string | null>(null);

  // ── Auth ────────────────────────────────────────────────────────────────────

  function getToken(): string | null {
    try {
      const raw = localStorage.getItem("ai_interview_auth");
      if (!raw) return null;
      return JSON.parse(raw)?.token ?? null;
    } catch { return null; }
  }

  function authHeaders(): HeadersInit {
    const t = getToken();
    return t ? { "Content-Type": "application/json", Authorization: `Bearer ${t}` }
             : { "Content-Type": "application/json" };
  }

  // ── Data fetching ────────────────────────────────────────────────────────────

  const fetchAll = useCallback(async () => {
    const token = getToken();
    if (!token) { router.push("/ai-interview/login"); return; }
    try {
      const [iRes, lRes] = await Promise.all([
        fetch("/api/admin/interviewers",                       { headers: authHeaders() }),
        fetch("/api/admin/location-requests?status=all",      { headers: authHeaders() }),
      ]);
      if (iRes.status === 401) { router.push("/ai-interview/login"); return; }
      if (iRes.ok) setInterviewers(await iRes.json());
      if (lRes.ok) setLocRequests(await lRes.json());
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem("ai_interview_auth");
    if (!raw) { router.push("/ai-interview/login"); return; }
    const auth = JSON.parse(raw);
    if (auth.role !== "Admin") { router.push("/ai-interview/admin"); return; }
    setActiveUser({ email: auth.email, name: auth.name });
    fetchAll();
  }, [router, fetchAll]);

  // ── Invite ────────────────────────────────────────────────────────────────────

  const sendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError("");
    setInviteSuccess("");
    if (!inviteName.trim() || !inviteEmail.trim()) {
      setInviteError("Name and email are required.");
      return;
    }
    setInviting(true);
    try {
      const res  = await fetch("/api/admin/interviewers", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ name: inviteName.trim(), email: inviteEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setInviteError(data.error || "Failed to send invite."); return; }
      setInviteSuccess(`Invite sent to ${inviteEmail}!`);
      setInviteName("");
      setInviteEmail("");
      await fetchAll();
      setTimeout(() => { setShowInvite(false); setInviteSuccess(""); }, 2500);
    } finally {
      setInviting(false);
    }
  };

  const resendInvite = async (id: string) => {
    setActionId(id);
    try {
      const res = await fetch(`/api/admin/interviewers/${id}/invite`, {
        method: "POST", headers: authHeaders(),
      });
      if (!res.ok) { const d = await res.json(); alert(d.error); }
      else alert("Invite email resent successfully.");
    } finally { setActionId(null); }
  };

  // ── Suspend / Activate ────────────────────────────────────────────────────────

  const toggleStatus = async (interviewer: Interviewer) => {
    const action = interviewer.status === "suspended" ? "activate" : "suspend";
    const label  = action === "suspend" ? "suspend" : "re-activate";
    if (!confirm(`Are you sure you want to ${label} ${interviewer.name}?`)) return;
    setActionId(interviewer.id);
    try {
      const res = await fetch(`/api/admin/interviewers/${interviewer.id}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        const updated = await res.json();
        setInterviewers(prev => prev.map(i => i.id === interviewer.id ? updated : i));
      }
    } finally { setActionId(null); }
  };

  // ── Delete ────────────────────────────────────────────────────────────────────

  const deleteInterviewer = async (interviewer: Interviewer) => {
    if (!confirm(`Delete ${interviewer.name}? This cannot be undone.`)) return;
    setActionId(interviewer.id);
    try {
      const res = await fetch(`/api/admin/interviewers/${interviewer.id}`, {
        method: "DELETE", headers: authHeaders(),
      });
      if (res.ok) setInterviewers(prev => prev.filter(i => i.id !== interviewer.id));
    } finally { setActionId(null); }
  };

  // ── Remove approved location ─────────────────────────────────────────────────

  const removeLocation = async (interviewer: Interviewer, locId: string) => {
    if (!confirm("Remove this approved location? The interviewer will need admin approval to log in from it again.")) return;
    const updated = interviewer.approvedLocations.filter(l => l.id !== locId);
    setActionId(interviewer.id + locId);
    try {
      const res = await fetch(`/api/admin/interviewers/${interviewer.id}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ approvedLocations: updated }),
      });
      if (res.ok) {
        const u = await res.json();
        setInterviewers(prev => prev.map(i => i.id === interviewer.id ? u : i));
      }
    } finally { setActionId(null); }
  };

  // ── Approve / Reject location request ────────────────────────────────────────

  const resolveRequest = async (req: LocationRequest, action: "approve" | "reject") => {
    setActionId(req.id);
    try {
      const res = await fetch(`/api/admin/location-requests/${req.id}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        const updated = await res.json();
        setLocRequests(prev => prev.map(r => r.id === req.id ? updated : r));
        // Refresh interviewers to reflect new approved location
        await fetchAll();
      }
    } finally { setActionId(null); }
  };

  // ── Logout ────────────────────────────────────────────────────────────────────

  const handleLogout = async () => {
    const token = getToken();
    if (token) await fetch("/api/auth/logout", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    localStorage.removeItem("ai_interview_auth");
    router.push("/ai-interview/login");
  };

  const toggleExpand = (id: string) =>
    setExpanded(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const pendingCount = locRequests.filter(r => r.status === "pending").length;

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-surface">

      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <header className="bg-primary border-b border-primary-light">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/ai-interview/admin"
              className="p-2 text-gray-400 hover:text-white transition-colors" title="Back to Dashboard">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-white">Interviewer Management</h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Manage access, locations and invitations · {activeUser?.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchAll}
              className="p-2 text-gray-400 hover:text-white transition-colors" title="Refresh">
              <RefreshCw size={18} />
            </button>
            <button
              onClick={() => { setShowInvite(true); setInviteError(""); setInviteSuccess(""); }}
              className="flex items-center gap-2 px-4 py-2 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-accent-dark transition-colors">
              <Plus size={16} /> Invite Interviewer
            </button>
            <button onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-white transition-colors" title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-8 space-y-8">

        {/* ── Stats row ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Interviewers", value: interviewers.length,                                       icon: Users },
            { label: "Active",             value: interviewers.filter(i => i.status === "active").length,    icon: CheckCircle },
            { label: "Pending Invite",     value: interviewers.filter(i => i.status === "invited").length,   icon: Clock },
            { label: "Location Requests",  value: pendingCount,                                               icon: AlertCircle },
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

        {/* ── Pending Location Approval Requests ────────────────────────────── */}
        {pendingCount > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-amber-200 flex items-center gap-3">
              <AlertCircle size={18} className="text-amber-600" />
              <h2 className="font-semibold text-amber-800">
                {pendingCount} Pending Location Approval{pendingCount > 1 ? "s" : ""}
              </h2>
            </div>
            <div className="divide-y divide-amber-100">
              {locRequests.filter(r => r.status === "pending").map(req => (
                <div key={req.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-primary text-sm">{req.interviewerName}</div>
                    <div className="text-xs text-gray-500">{req.interviewerEmail}</div>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <MapPin size={11} className="text-amber-500" />
                      <span className="text-xs text-gray-600 font-mono">{req.ipAddress}</span>
                      <span className="text-gray-300">·</span>
                      <span className="text-xs text-gray-500 truncate max-w-xs">{req.userAgentSummary}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">Requested {fmtDateTime(req.requestedAt)}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => resolveRequest(req, "approve")}
                      disabled={actionId === req.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors">
                      {actionId === req.id ? <Loader size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
                      Approve
                    </button>
                    <button
                      onClick={() => resolveRequest(req, "reject")}
                      disabled={actionId === req.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 text-xs font-semibold rounded-lg hover:bg-red-200 disabled:opacity-50 transition-colors">
                      <ShieldOff size={12} />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Interviewers Table ────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-primary flex items-center gap-2">
              <Users size={16} className="text-accent" /> Interviewers
            </h2>
            <span className="text-xs text-gray-400">{interviewers.length} total</span>
          </div>

          {loading ? (
            <div className="py-20 text-center text-gray-400 flex items-center justify-center gap-2">
              <Loader size={18} className="animate-spin" /> Loading…
            </div>
          ) : interviewers.length === 0 ? (
            <div className="py-20 text-center">
              <Users size={40} className="text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">No interviewers yet</p>
              <button onClick={() => setShowInvite(true)}
                className="text-accent text-sm font-semibold hover:underline">
                Invite your first interviewer
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {interviewers.map(iv => {
                const st   = STATUS[iv.status];
                const isEx = expanded.has(iv.id);
                const isBusy = actionId === iv.id;
                const pending = locRequests.filter(
                  r => r.interviewerId === iv.id && r.status === "pending",
                ).length;

                return (
                  <div key={iv.id}>
                    {/* Main row */}
                    <div className="px-6 py-4 flex items-center gap-4 hover:bg-surface/50 transition-colors">
                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {iv.name.charAt(0).toUpperCase()}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-primary">{iv.name}</span>
                          {pending > 0 && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                              {pending} location pending
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 truncate">{iv.email}</div>
                        <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5 flex-wrap">
                          <span>Invited {fmtDate(iv.invitedAt)} by {iv.invitedBy}</span>
                          {iv.lastLoginAt && <><span>·</span><span>Last login {fmtDateTime(iv.lastLoginAt)}</span></>}
                          <span className="flex items-center gap-0.5">
                            <MapPin size={10} />
                            {iv.approvedLocations.length}/2 locations
                          </span>
                        </div>
                      </div>

                      {/* Status badge */}
                      <span className="text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0"
                        style={{ color: st.color, background: st.bg }}>
                        {st.label}
                      </span>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {iv.status === "invited" && (
                          <button onClick={() => resendInvite(iv.id)} disabled={isBusy}
                            title="Resend invite email"
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-blue-50 text-blue-700 font-semibold rounded-lg hover:bg-blue-100 disabled:opacity-50">
                            {isBusy ? <Loader size={12} className="animate-spin" /> : <Send size={12} />}
                            Resend
                          </button>
                        )}

                        {iv.status !== "invited" && (
                          <button onClick={() => toggleStatus(iv)} disabled={isBusy}
                            title={iv.status === "suspended" ? "Re-activate" : "Suspend"}
                            className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg disabled:opacity-50 transition-colors ${
                              iv.status === "suspended"
                                ? "bg-green-50 text-green-700 hover:bg-green-100"
                                : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                            }`}>
                            {isBusy ? <Loader size={12} className="animate-spin" /> :
                              iv.status === "suspended" ? <CheckCircle size={12} /> : <Ban size={12} />}
                            {iv.status === "suspended" ? "Activate" : "Suspend"}
                          </button>
                        )}

                        <button
                          onClick={() => toggleExpand(iv.id)}
                          className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                          title={isEx ? "Collapse" : "View locations"}>
                          {isEx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>

                        <button onClick={() => deleteInterviewer(iv)} disabled={isBusy}
                          title="Delete interviewer"
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Expanded: Approved Locations */}
                    {isEx && (
                      <div className="px-6 pb-4 bg-gray-50 border-t border-gray-100">
                        <div className="pt-4">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                            <MapPin size={11} /> Approved Login Locations (max 2)
                          </p>
                          {iv.approvedLocations.length === 0 ? (
                            <p className="text-xs text-gray-400 italic">No approved locations yet.</p>
                          ) : (
                            <div className="space-y-2">
                              {iv.approvedLocations.map(loc => (
                                <div key={loc.id}
                                  className="flex items-start gap-3 p-3 bg-white border border-gray-100 rounded-lg">
                                  <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                    <MapPin size={13} className="text-green-600" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-semibold text-primary">{loc.label}</span>
                                      <span className="text-xs text-gray-400 font-mono">{loc.ipAddress}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 truncate mt-0.5">{loc.userAgentSummary}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                      Approved {fmtDate(loc.approvedAt)} by {loc.approvedBy}
                                      {loc.lastUsedAt && ` · Last used ${fmtDateTime(loc.lastUsedAt)}`}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => removeLocation(iv, loc.id)}
                                    disabled={actionId === iv.id + loc.id}
                                    title="Remove this location"
                                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0">
                                    {actionId === iv.id + loc.id
                                      ? <Loader size={13} className="animate-spin" />
                                      : <X size={13} />}
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Resolved requests for this user */}
                          {locRequests.filter(r => r.interviewerId === iv.id && r.status !== "pending").length > 0 && (
                            <div className="mt-4">
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                Location Request History
                              </p>
                              <div className="space-y-1.5">
                                {locRequests
                                  .filter(r => r.interviewerId === iv.id && r.status !== "pending")
                                  .slice(0, 5)
                                  .map(r => (
                                    <div key={r.id}
                                      className="flex items-center gap-2 text-xs text-gray-500 p-2 bg-white border border-gray-100 rounded-lg">
                                      <span className={r.status === "approved" ? "text-green-600" : "text-red-500"}>
                                        {r.status === "approved" ? "✓" : "✗"}
                                      </span>
                                      <span className="font-mono text-gray-600">{r.ipAddress}</span>
                                      <span className="truncate flex-1">{r.userAgentSummary}</span>
                                      <span className={`font-semibold ${r.status === "approved" ? "text-green-600" : "text-red-500"}`}>
                                        {r.status}
                                      </span>
                                      <span>{fmtDate(r.resolvedAt)}</span>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── All resolved location requests ────────────────────────────────── */}
        {locRequests.filter(r => r.status !== "pending").length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-primary">Location Request History</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {locRequests.filter(r => r.status !== "pending").slice(0, 20).map(r => (
                <div key={r.id} className="px-6 py-3 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-sm text-primary">{r.interviewerName}</span>
                    <span className="text-gray-300 mx-1.5">·</span>
                    <span className="text-xs text-gray-400 font-mono">{r.ipAddress}</span>
                    <div className="text-xs text-gray-400 truncate">{r.userAgentSummary}</div>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    r.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                  }`}>
                    {r.status}
                  </span>
                  <span className="text-xs text-gray-400">{fmtDate(r.resolvedAt)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ── Invite Modal ──────────────────────────────────────────────────────── */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-primary">Invite Interviewer</h2>
                <p className="text-sm text-gray-400 mt-0.5">They will receive an email to set their password.</p>
              </div>
              <button onClick={() => setShowInvite(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>

            {inviteSuccess ? (
              <div className="text-center py-8">
                <CheckCircle size={44} className="text-green-500 mx-auto mb-3" />
                <p className="font-semibold text-green-700">{inviteSuccess}</p>
                <p className="text-sm text-gray-400 mt-1">An invite email with a set-password link has been sent.</p>
              </div>
            ) : (
              <form onSubmit={sendInvite} className="space-y-4">
                {inviteError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                    {inviteError}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={inviteName}
                    onChange={e => setInviteName(e.target.value)}
                    required
                    placeholder="e.g. Priya Sharma"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={e => setInviteEmail(e.target.value)}
                      required
                      placeholder="priya@srsinfoway.com"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700 space-y-1">
                  <p className="font-semibold">What happens after you send the invite:</p>
                  <p>• An email with a secure link is sent to the interviewer</p>
                  <p>• They set their own password via the link (valid 72 hours)</p>
                  <p>• Their first 2 login locations are auto-approved</p>
                  <p>• New locations beyond that require your approval</p>
                  <p>• Only 1 active login session allowed at a time</p>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowInvite(false)}
                    className="flex-1 py-3 border border-gray-200 text-gray-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors text-sm">
                    Cancel
                  </button>
                  <button type="submit" disabled={inviting}
                    className="flex-1 py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent-dark transition-colors text-sm disabled:opacity-60 flex items-center justify-center gap-2">
                    {inviting ? <><Loader size={16} className="animate-spin" /> Sending…</> : <><Send size={16} /> Send Invite</>}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
