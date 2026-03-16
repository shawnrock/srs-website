"use client";
import { use, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle, AlertCircle, Star, User, Briefcase } from "lucide-react";

interface Report {
  candidate: string;
  position: string;
  client: string;
  overallScore: number;
  recommendation: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  technicalDepth: number;
  communicationScore: number;
  confidenceLevel: number;
  sections: Array<{ label: string; score: number }>;
  proctoring: { score: number; totalAlerts: number; warnings: number; redFlags: number };
  interviewDate: string;
  totalQuestions: number;
  questionsAnswered: number;
  answerTranscripts?: Record<string, string>;
}

function ScoreBar({ score, color = "#e8542f" }: { score: number; color?: string }) {
  return (
    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${score}%`, background: color }} />
    </div>
  );
}

export default function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/interviews/${id}/report`)
      .then(r => r.json())
      .then(data => { if (data.error) throw new Error(data.error); setReport(data); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500">Generating AI Report...</p>
      </div>
    </div>
  );

  if (error || !report) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="text-center">
        <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
        <p className="text-gray-600">{error || "Report not found"}</p>
        <Link href="/ai-interview/admin" className="mt-4 inline-block text-accent text-sm hover:underline">Back to Dashboard</Link>
      </div>
    </div>
  );

  const scoreColor = report.overallScore >= 80 ? "#0097a7" : report.overallScore >= 60 ? "#e8542f" : "#dc2626";
  const recIcon = report.recommendation?.includes("Recommended") && !report.recommendation?.includes("Not")
    ? <CheckCircle size={20} className="text-teal" />
    : report.recommendation?.includes("Conditional")
    ? <AlertCircle size={20} className="text-amber-500" />
    : <XCircle size={20} className="text-red-500" />;

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-primary border-b border-primary-light">
        <div className="max-w-5xl mx-auto px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white">Interview Report</h1>
            <p className="text-xs text-gray-400 mt-0.5">{report.candidate} — {report.position}</p>
          </div>
          <Link href="/ai-interview/admin"
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors text-sm">
            <ArrowLeft size={16} /> Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-8 space-y-6">
        {/* Top card */}
        <div className="bg-white rounded-xl p-8 border border-gray-100">
          <div className="flex flex-wrap items-start gap-8">
            <div className="flex items-center justify-center w-28 h-28 rounded-full border-4 shrink-0"
              style={{ borderColor: scoreColor }}>
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: scoreColor }}>{report.overallScore}</div>
                <div className="text-xs text-gray-400">/ 100</div>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {recIcon}
                <span className="font-semibold text-primary text-lg">{report.recommendation}</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">{report.summary}</p>
              <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1"><User size={12} /> {report.candidate}</span>
                <span className="flex items-center gap-1"><Briefcase size={12} /> {report.position} at {report.client}</span>
                <span>{new Date(report.interviewDate).toLocaleDateString()}</span>
                <span>{report.questionsAnswered}/{report.totalQuestions} questions answered</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Scores */}
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h2 className="font-semibold text-primary mb-5">Section Scores</h2>
            <div className="space-y-4">
              {report.sections?.map((s, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-600">{s.label}</span>
                    <span className="font-semibold text-primary">{s.score}%</span>
                  </div>
                  <ScoreBar score={s.score} color={s.score >= 70 ? "#0097a7" : s.score >= 50 ? "#e8542f" : "#dc2626"} />
                </div>
              ))}
            </div>
          </div>

          {/* Proctoring + Strengths/Weaknesses */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h2 className="font-semibold text-primary mb-4">Proctoring Summary</h2>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-surface rounded-lg">
                  <div className="text-2xl font-bold text-primary">{report.proctoring.score}%</div>
                  <div className="text-xs text-gray-400">Score</div>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg">
                  <div className="text-2xl font-bold text-amber-600">{report.proctoring.warnings}</div>
                  <div className="text-xs text-gray-400">Warnings</div>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{report.proctoring.redFlags}</div>
                  <div className="text-xs text-gray-400">Red Flags</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h2 className="font-semibold text-primary mb-4">Strengths &amp; Areas to Improve</h2>
              <div className="space-y-2">
                {report.strengths?.slice(0, 3).map((s, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle size={14} className="text-teal mt-0.5 shrink-0" /> {s}
                  </div>
                ))}
                {report.weaknesses?.slice(0, 2).map((w, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <AlertCircle size={14} className="text-amber-500 mt-0.5 shrink-0" /> {w}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
