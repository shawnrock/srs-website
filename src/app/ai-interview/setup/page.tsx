"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Brain, ArrowRight, CheckCircle, Upload, AlertTriangle, XCircle, ShieldAlert, FileText, X, Loader2 } from "lucide-react";

interface MismatchResult {
  compatible: boolean;
  matchScore: number;
  reason: string;
  mismatches: string[];
}

export default function SetupInterviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState("");
  const [mismatch, setMismatch] = useState<MismatchResult | null>(null);
  const [formData, setFormData] = useState({
    jobTitle: "",
    client: "",
    jobDescription: "",
    candidateName: "",
    candidateEmail: "",
    candidatePhone: "",
    candidateResume: "",
  });

  // Resume upload state
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const parseResumeFile = async (file: File) => {
    setParseError("");
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    const nameOk = file.name.match(/\.(pdf|docx|doc)$/i);
    if (!allowed.includes(file.type) && !nameOk) {
      setParseError("Only PDF and Word documents (.pdf, .docx) are supported.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setParseError("File is too large. Maximum size is 10 MB.");
      return;
    }
    setParsing(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/parse-resume', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to parse file');
      setFormData(prev => ({ ...prev, candidateResume: data.text }));
      setUploadedFileName(file.name);
    } catch (err: any) {
      setParseError(err.message);
    } finally {
      setParsing(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseResumeFile(file);
    e.target.value = ''; // reset so same file can be re-uploaded
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) parseResumeFile(file);
  };

  const clearResume = () => {
    setFormData(prev => ({ ...prev, candidateResume: '' }));
    setUploadedFileName('');
    setParseError('');
  };

  const createInterview = async () => {
    setLoading(true);
    setError("");
    try {
      const auth = JSON.parse(localStorage.getItem("ai_interview_auth") || "{}");
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
          recruiterEmail: auth.email,
          recruiterName: auth.name,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create interview");
      }

      const data = await res.json();

      // Send candidate invite email (best-effort)
      try {
        const baseUrl = window.location.origin;
        await fetch('/api/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'candidate_invite',
            candidate: { name: formData.candidateName, email: formData.candidateEmail },
            jd: { title: formData.jobTitle, client: formData.client },
            interviewUrl: data.interviewUrl || `${baseUrl}/ai-interview/room/${data.id}`,
          }),
        });
      } catch (emailErr) {
        console.warn('[Setup] Email send failed (non-blocking):', emailErr);
      }

      router.push(`/ai-interview/observe/${data.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMismatch(null);

    // Only validate if resume is provided
    if (formData.candidateResume.trim().length >= 50) {
      setValidating(true);
      try {
        const res = await fetch("/api/interviews/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jd: {
              title: formData.jobTitle,
              client: formData.client,
              description: formData.jobDescription,
            },
            resume: formData.candidateResume,
          }),
        });
        const result: MismatchResult = await res.json();

        // Show warning modal if match score is below 25 (completely unrelated)
        if (!result.compatible || result.matchScore < 25) {
          setMismatch(result);
          setValidating(false);
          return; // Stop here — wait for modal decision
        }
      } catch {
        // On error, proceed anyway
      } finally {
        setValidating(false);
      }
    }

    await createInterview();
  };

  const scoreColor = (score: number) =>
    score < 25 ? "text-red-600" : score < 50 ? "text-amber-600" : "text-green-600";

  const scoreBg = (score: number) =>
    score < 25 ? "bg-red-50 border-red-200" : score < 50 ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200";

  return (
    <div className="min-h-screen bg-surface">
      {/* Mismatch Warning Modal */}
      {mismatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            {/* Modal Header */}
            <div className="bg-red-600 px-6 py-5 flex items-start gap-3">
              <ShieldAlert size={28} className="text-white shrink-0 mt-0.5" />
              <div>
                <h2 className="text-white font-bold text-lg leading-tight">
                  Resume & Job Description Mismatch
                </h2>
                <p className="text-red-100 text-sm mt-1">
                  The AI has detected that the resume does not match the role.
                </p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-4">
              {/* Score badge */}
              <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${scoreBg(mismatch.matchScore)}`}>
                <div className={`text-3xl font-black ${scoreColor(mismatch.matchScore)}`}>
                  {mismatch.matchScore}%
                </div>
                <div>
                  <div className={`text-sm font-bold ${scoreColor(mismatch.matchScore)}`}>
                    Compatibility Score
                  </div>
                  <div className="text-xs text-gray-500">Below 25% indicates completely unrelated content</div>
                </div>
              </div>

              {/* Reason */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">AI Assessment:</p>
                <p className="text-sm text-gray-600 leading-relaxed">{mismatch.reason}</p>
              </div>

              {/* Mismatches list */}
              {mismatch.mismatches.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Issues Found:</p>
                  <ul className="space-y-1.5">
                    {mismatch.mismatches.map((m, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <XCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Advice */}
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-3">
                <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">
                  Please verify that the correct resume has been uploaded for this candidate and that it matches the job role. You may proceed anyway if this is intentional.
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 pb-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setMismatch(null)}
                className="flex-1 py-3 px-4 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm"
              >
                ← Go Back & Review
              </button>
              <button
                onClick={() => { setMismatch(null); createInterview(); }}
                disabled={loading}
                className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</>
                ) : (
                  <><AlertTriangle size={16} /> Proceed Anyway</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Resume / Profile
                <span className="ml-2 text-gray-400 font-normal">— used for AI compatibility check &amp; question generation</span>
              </label>

              {/* File upload drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => !parsing && fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl px-6 py-5 cursor-pointer transition-all mb-3
                  ${dragOver ? 'border-accent bg-accent/5' : 'border-gray-200 hover:border-accent/60 hover:bg-gray-50'}
                  ${parsing ? 'pointer-events-none opacity-70' : ''}`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  onChange={handleFileInput}
                />
                {parsing ? (
                  <div className="flex items-center gap-2 text-accent text-sm font-medium">
                    <Loader2 size={18} className="animate-spin" />
                    Extracting text from resume...
                  </div>
                ) : uploadedFileName ? (
                  <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
                    <FileText size={18} className="text-green-600" />
                    <span className="truncate max-w-xs">{uploadedFileName}</span>
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); clearResume(); }}
                      className="ml-1 p-0.5 rounded-full hover:bg-red-100 text-red-400 hover:text-red-600 transition-colors"
                      title="Remove file"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload size={22} className="text-gray-400" />
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-600">
                        Drop resume here or <span className="text-accent underline">browse</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">PDF or Word (.docx) · Max 10 MB</p>
                    </div>
                  </>
                )}
              </div>

              {parseError && (
                <p className="text-xs text-red-500 mb-2 flex items-center gap-1">
                  <XCircle size={13} /> {parseError}
                </p>
              )}

              {/* Divider */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 border-t border-gray-100" />
                <span className="text-xs text-gray-400">or paste text directly</span>
                <div className="flex-1 border-t border-gray-100" />
              </div>

              <textarea name="candidateResume" rows={5} value={formData.candidateResume} onChange={handleChange}
                placeholder="Paste candidate's resume text here for AI analysis and personalized question generation..."
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none" />
            </div>
          </div>

          <button type="submit" disabled={loading || validating}
            className="w-full py-4 bg-accent text-white font-semibold rounded-xl hover:bg-accent-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
            {validating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Checking Resume & JD Compatibility...
              </>
            ) : loading ? (
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
