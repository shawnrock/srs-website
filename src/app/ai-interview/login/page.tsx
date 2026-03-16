"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function AIInterviewLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    // Simple demo auth - in production connect to real auth
    if (email && password) {
      localStorage.setItem("ai_interview_auth", JSON.stringify({ email, loggedIn: true }));
      router.push("/ai-interview/admin");
    } else {
      setError("Please enter email and password.");
    }
  };

  return (
    <section className="bg-surface min-h-[80vh] flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-8 py-16">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Shield size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-primary">AI Interview Platform</h1>
              <p className="text-xs text-gray-400">SRS Infoway — Recruiter Login</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input name="email" type="email" required placeholder="you@srsinfoway.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input name="password" type={showPassword ? "text" : "password"} required placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit"
              className="w-full py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent-dark transition-colors text-sm flex items-center justify-center gap-2">
              Sign In <ArrowRight size={16} />
            </button>
          </form>

          <p className="mt-6 text-xs text-gray-400 text-center">
            Protected by enterprise-grade security. Authorized personnel only.
          </p>
        </div>
      </div>
    </section>
  );
}
