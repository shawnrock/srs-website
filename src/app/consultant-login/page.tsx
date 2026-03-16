"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Eye, EyeOff, Shield, ArrowRight } from "lucide-react";

export default function ConsultantLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/consultant-login/dashboard");
  };

  return (
    <section className="bg-surface min-h-[80vh] flex items-center">
      <div className="max-w-7xl mx-auto px-8 py-16 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side - branding */}
          <div className="hidden lg:block">
            <div className="text-accent text-sm font-semibold uppercase tracking-widest mb-4">Consultant Portal</div>
            <h1 className="text-5xl font-light text-primary leading-tight mb-6">
              Your Workspace,<br /><span className="font-semibold">All in One Place</span>
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-accent to-gold mb-8 rounded-full" />
            <p className="text-gray-500 leading-relaxed mb-8 max-w-md">
              Access your timesheets, project dashboards, payroll information, and communication tools through our secure consultant portal.
            </p>
            <div className="space-y-4">
              {[
                "View & submit timesheets",
                "Access project dashboards & documentation",
                "Manage payroll & benefits information",
                "Direct communication with your account manager",
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-6 h-6 bg-teal/10 rounded-full flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 bg-teal rounded-full" />
                  </div>
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* Right side - login form */}
          <div className="max-w-md mx-auto w-full lg:mx-0 lg:ml-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center gap-2 mb-8">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                  <Shield size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-primary">{isSignUp ? "Create Account" : "Consultant Login"}</h2>
                  <p className="text-xs text-gray-400">Secure access to your portal</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">First Name</label>
                      <input type="text" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Last Name</label>
                      <input type="text" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent" />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="email" placeholder="you@company.com"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type={showPassword ? "text" : "password"} placeholder="Enter your password"
                      className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {!isSignUp && (
                  <div className="flex items-center justify-between text-xs">
                    <label className="flex items-center gap-2 text-gray-500 cursor-pointer">
                      <input type="checkbox" className="rounded border-gray-300" />
                      Remember me
                    </label>
                    <a href="#" className="text-accent hover:underline">Forgot password?</a>
                  </div>
                )}

                {isSignUp && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Consultant ID</label>
                    <input type="text" placeholder="SRS-XXXX" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent" />
                  </div>
                )}

                <button type="submit" className="w-full py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent-dark transition-colors text-sm flex items-center justify-center gap-2">
                  {isSignUp ? "Create Account" : "Sign In"} <ArrowRight size={16} />
                </button>
              </form>

              <div className="mt-6 text-center text-xs text-gray-400">
                {isSignUp ? (
                  <>Already have an account? <button onClick={() => setIsSignUp(false)} className="text-accent font-semibold hover:underline">Sign In</button></>
                ) : (
                  <>New consultant? <button onClick={() => setIsSignUp(true)} className="text-accent font-semibold hover:underline">Create an account</button></>
                )}
              </div>
            </div>

            <p className="mt-4 text-xs text-gray-400 text-center">
              Protected by enterprise-grade security. Your data is encrypted end-to-end.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
