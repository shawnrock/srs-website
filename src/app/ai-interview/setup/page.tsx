"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Brain, ArrowRight, CheckCircle, Upload } from "lucide-react";

export default function SetupInterviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    jobTitle: "",
    client: "",
    jobDescription: "",
    candidateName: "",
    candidateEmail: "",
    candidatePhone: "",
    candidateResume: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jd: {
            title: formData.jobTitle,
            client: formData.client,
            description: formData.jobDescription,
          },
          candidate: {
            name: formData.candidateName,
            email: formData.candidateEmail,
            phone: formData.candidatePhone,
            resume: formData.candidateResume,
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create interview");
      }

      const data = await res.json();
      router.push(`/ai-interview/observe/${data.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-primary border-b border-primary-light">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <h1 className="text-xl font-semibold text-white">Create New Interview</h1>
          <p className="text-xs text-gray-400 mt-0.5">AI will generate tailored questions based on JD and resume</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-8 py-10">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Details */}
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h2 className="font-semibold text-primary mb-5 flex items-center gap-2">
              <Brain size={18} className="text-accent" /> Job Details
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Job Title *</label>
                <input name="jobTitle" type="text" required value={formData.jobTitle} onChange={handleChange}
                  placeholder="e.g. Senior React Developer"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Client Company *</label>
                <input name="client" type="text" required value={formData.client} onChange={handleChange}
                  placeholder="e.g. Goldman Sachs"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent" />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Job Description *</label>
              <textarea name="jobDescription" required rows={5} value={formData.jobDescription} onChange={handleChange}
                placeholder="Paste the full job description here..."
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none" />
            </div>
          </div>

          {/* Candidate Details */}
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h2 className="font-semibold text-primary mb-5 flex items-center gap-2">
              <Upload size={18} className="text-accent" /> Candidate Details
            </h2>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Full Name *</label>
                <input name="candidateName" type="text" required value={formData.candidateName} onChange={handleChange}
                  placeholder="John Smith"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Email *</label>
                <input name="candidateEmail" type="email" required value={formData.candidateEmail} onChange={handleChange}
                  placeholder="john@email.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent" />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Phone</label>
              <input name="candidatePhone" type="tel" value={formData.candidatePhone} onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Resume / Profile (paste text)</label>
              <textarea name="candidateResume" rows={6} value={formData.candidateResume} onChange={handleChange}
                placeholder="Paste candidate's resume text here for AI analysis and personalized question generation..."
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none" />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-4 bg-accent text-white font-semibold rounded-xl hover:bg-accent-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating AI Questions...
              </>
            ) : (
              <>
                <CheckCircle size={18} /> Create Interview &amp; Generate Questions <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
