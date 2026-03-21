"use client";
import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader } from "lucide-react";

export default function AcceptInvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router    = useRouter();

  const [invite,      setInvite]      = useState<{ name: string; email: string } | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [tokenError,  setTokenError]  = useState("");
  const [password,    setPassword]    = useState("");
  const [confirm,     setConfirm]     = useState("");
  const [showPw,      setShowPw]      = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [error,       setError]       = useState("");
  const [done,        setDone]        = useState(false);

  useEffect(() => {
    fetch(`/api/invite/${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setTokenError(d.error);
        else setInvite({ name: d.name, email: d.email });
      })
      .catch(() => setTokenError("Failed to validate invite link."))
      .finally(() => setLoading(false));
  }, [token]);

  const passwordStrength = (): { label: string; color: string; pct: number } => {
    let score = 0;
    if (password.length >= 8)  score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return { label: "Weak",   color: "#ef4444", pct: 20 };
    if (score <= 2) return { label: "Fair",   color: "#f97316", pct: 45 };
    if (score <= 3) return { label: "Good",   color: "#eab308", pct: 65 };
    if (score <= 4) return { label: "Strong", color: "#22c55e", pct: 85 };
    return              { label: "Very Strong", color: "#16a34a", pct: 100 };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setSubmitting(true);
    try {
      const res  = await fetch(`/api/invite/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to set password."); return; }
      setDone(true);
      setTimeout(() => router.push("/ai-interview/login"), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const strength = passwordStrength();

  return (
    <section className="bg-surface min-h-[80vh] flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-8 py-16">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">

          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Shield size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-primary">Set Your Password</h1>
              <p className="text-xs text-gray-400">SRS Infoway — Interviewer Onboarding</p>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-12 text-gray-400 gap-2">
              <Loader size={18} className="animate-spin" />
              <span className="text-sm">Validating invite link…</span>
            </div>
          )}

          {/* Token error */}
          {!loading && tokenError && (
            <div className="text-center py-8">
              <AlertCircle size={44} className="text-red-300 mx-auto mb-4" />
              <p className="text-red-600 font-semibold mb-2">Invite Link Invalid</p>
              <p className="text-sm text-gray-500 mb-6">{tokenError}</p>
              <a href="/ai-interview/login" className="text-accent text-sm font-semibold hover:underline">
                Go to Login
              </a>
            </div>
          )}

          {/* Success */}
          {done && (
            <div className="text-center py-8">
              <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
              <p className="text-green-700 font-semibold text-lg mb-2">Password Set!</p>
              <p className="text-sm text-gray-500">Redirecting you to the login page…</p>
            </div>
          )}

          {/* Form */}
          {!loading && !tokenError && !done && invite && (
            <>
              <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-1">Invited as</p>
                <p className="font-semibold text-primary">{invite.name}</p>
                <p className="text-sm text-gray-500">{invite.email}</p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      placeholder="Create a strong password"
                      className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {/* Strength meter */}
                  {password && (
                    <div className="mt-2">
                      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{ width: `${strength.pct}%`, background: strength.color }}
                        />
                      </div>
                      <p className="text-xs mt-1" style={{ color: strength.color }}>
                        {strength.label}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPw ? "text" : "password"}
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      required
                      placeholder="Repeat your password"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                    />
                  </div>
                  {confirm && password !== confirm && (
                    <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                  )}
                </div>

                <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 space-y-1">
                  <p className="font-semibold text-gray-600 mb-1">Password requirements:</p>
                  {[
                    [password.length >= 8,              "At least 8 characters"],
                    [/[A-Z]/.test(password),            "One uppercase letter"],
                    [/[0-9]/.test(password),            "One number"],
                    [/[^A-Za-z0-9]/.test(password),     "One special character (recommended)"],
                  ].map(([ok, label], i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className={ok ? "text-green-500" : "text-gray-300"}>
                        {ok ? "✓" : "○"}
                      </span>
                      <span className={ok ? "text-green-700" : ""}>{label as string}</span>
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent-dark transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <><Loader size={16} className="animate-spin" /> Setting password…</>
                  ) : (
                    "Activate My Account"
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
