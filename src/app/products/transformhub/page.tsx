import Link from "next/link";
import { Zap, BarChart3, FileText, Users, Target, RefreshCw, ArrowRight, CheckCircle, Layers, Map } from "lucide-react";

export const metadata = { title: "TransformHub | SRS Infoway Products" };

export default function TransformHubPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-primary">
        <div className="max-w-7xl mx-auto px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gold/20 rounded-full mb-6">
                <span className="w-2 h-2 bg-gold rounded-full" />
                <span className="text-gold text-xs font-semibold uppercase tracking-wider">SRS Infoway Product</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-light text-white leading-tight mb-6">
                Know Where to<br /><span className="font-semibold">Transform First.</span>
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed mb-8 max-w-lg">
                TransformHub is SRS Infoway's digital transformation readiness platform — an automated assessment engine that analyses your technology stack, processes, and maturity gaps, then generates a prioritised, actionable roadmap in minutes.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/contact" className="px-8 py-4 bg-accent text-white font-semibold rounded-lg hover:bg-accent-dark transition-colors flex items-center gap-2">
                  Start Free Assessment <ArrowRight size={18} />
                </Link>
                <Link href="/contact" className="px-8 py-4 border border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors">
                  See Sample Report
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-4">
                <div className="text-xs text-gray-400 uppercase tracking-widest mb-2">Transformation Readiness Score</div>
                {[
                  { domain: "Cloud Infrastructure", score: 72, color: "bg-teal" },
                  { domain: "Data & Analytics", score: 48, color: "bg-gold" },
                  { domain: "Process Automation", score: 35, color: "bg-accent" },
                  { domain: "AI & ML Adoption", score: 21, color: "bg-red-400" },
                  { domain: "Security & Compliance", score: 85, color: "bg-green-400" },
                ].map((row, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">{row.domain}</span>
                      <span className="text-white font-semibold">{row.score}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full ${row.color} rounded-full`} style={{ width: `${row.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-gold">
        <div className="max-w-7xl mx-auto px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-white text-center">
            {[
              { value: "30min", label: "To Complete Assessment" },
              { value: "150+", label: "Maturity Dimensions Scored" },
              { value: "PDF", label: "Instant Report Download" },
              { value: "500+", label: "Enterprises Assessed" },
            ].map((s, i) => (
              <div key={i}>
                <div className="text-3xl font-bold mb-1">{s.value}</div>
                <div className="text-sm text-white/80">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-8 py-20">
          <div className="text-center mb-16">
            <div className="text-accent text-sm font-semibold uppercase tracking-widest mb-4">Platform Capabilities</div>
            <h2 className="text-4xl font-light text-primary">From Assessment <span className="font-semibold">to Roadmap</span></h2>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
              TransformHub doesn't just score your current state — it tells you exactly what to do next, in what order, and what outcomes to expect at each stage.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Layers, title: "Tech Stack Maturity Assessment", desc: "Evaluate 150+ dimensions across cloud, data, applications, DevOps, security, and AI readiness using SRS Infoway's proven Digital Maturity Model (DMM)." },
              { icon: Target, title: "Gap Analysis Engine", desc: "Automatically identify critical gaps between your current state and industry benchmarks — ranked by business impact, effort, and dependency order." },
              { icon: Map, title: "AI-Generated Transformation Roadmap", desc: "Receive a 12–36 month phased roadmap with prioritised initiatives, estimated timelines, indicative budgets, and expected ROI at each phase." },
              { icon: BarChart3, title: "Benchmark Against Industry Peers", desc: "See how your transformation readiness compares to peers in your industry and region — with percentile rankings across all 6 maturity domains." },
              { icon: FileText, title: "Instant Executive Report", desc: "A polished, board-ready PDF report is generated immediately on assessment completion — including scores, heat maps, gap analysis, and recommended next steps." },
              { icon: Users, title: "Collaborative Multi-Stakeholder Mode", desc: "Invite your CTO, CIO, and business unit heads to complete domain-specific sections simultaneously — consolidating views into one unified transformation picture." },
            ].map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="p-7 bg-surface rounded-xl border border-gray-100 hover:border-gold/40 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center mb-5">
                  <Icon size={24} className="text-gold" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The 6 Domains */}
      <section className="bg-surface">
        <div className="max-w-7xl mx-auto px-8 py-20">
          <div className="text-center mb-12">
            <div className="text-accent text-sm font-semibold uppercase tracking-widest mb-4">Assessment Framework</div>
            <h2 className="text-4xl font-light text-primary">The 6 Transformation <span className="font-semibold">Domains</span></h2>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto">TransformHub scores your organisation across six critical domains, each mapped to specific business outcomes.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { number: "01", domain: "Cloud & Infrastructure", outcomes: "Cost reduction, scalability, resilience", color: "border-teal text-teal" },
              { number: "02", domain: "Data & Analytics", outcomes: "Faster decisions, revenue insights, predictive models", color: "border-primary text-primary" },
              { number: "03", domain: "Process & Automation", outcomes: "Efficiency gains, error reduction, speed-to-market", color: "border-accent text-accent" },
              { number: "04", domain: "AI & Intelligent Systems", outcomes: "Competitive differentiation, cost savings, innovation", color: "border-gold text-gold" },
              { number: "05", domain: "Security & Compliance", outcomes: "Risk mitigation, regulatory readiness, trust", color: "border-teal-dark text-teal-dark" },
              { number: "06", domain: "Culture & Talent", outcomes: "Change adoption, capability building, retention", color: "border-primary-light text-primary-light" },
            ].map((d, i) => (
              <div key={i} className={`bg-white rounded-xl p-7 border-l-4 ${d.color.split(" ")[0]} shadow-sm`}>
                <div className={`text-3xl font-bold mb-2 ${d.color.split(" ")[1]}`}>{d.number}</div>
                <h3 className="text-lg font-semibold text-primary mb-2">{d.domain}</h3>
                <p className="text-sm text-gray-500">{d.outcomes}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="text-gold text-sm font-semibold uppercase tracking-widest mb-4">Built For</div>
              <h2 className="text-4xl font-light text-primary mb-8">Perfect For Every <span className="font-semibold">Transformation Stage</span></h2>
              <div className="space-y-4">
                {[
                  { role: "C-Suite & Board", benefit: "Get a clear, credible picture of where transformation investment should go — backed by data, not gut feel." },
                  { role: "CIO & Digital Leaders", benefit: "Benchmark your programme against industry peers and build a defensible, board-ready transformation business case." },
                  { role: "Strategy & Consulting Teams", benefit: "Accelerate discovery and assessment phases by 70% with automated scoring and instant gap analysis." },
                  { role: "IT & Operations Leaders", benefit: "Identify technology debt hotspots and prioritise modernisation initiatives by actual business impact." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-5 bg-surface rounded-xl border border-gray-100">
                    <CheckCircle size={20} className="text-gold shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-primary text-sm">{item.role}</div>
                      <div className="text-gray-500 text-sm mt-1">{item.benefit}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-gold text-sm font-semibold uppercase tracking-widest mb-4">How It Works</div>
              <div className="space-y-6">
                {[
                  { step: "01", title: "Complete the Assessment", desc: "Answer 150 curated questions across 6 domains in ~30 minutes. Invite colleagues to contribute their domain expertise." },
                  { step: "02", title: "Receive Your Scores", desc: "Instantly see your maturity score across all domains with gap analysis and peer benchmarking overlaid." },
                  { step: "03", title: "Download Your Roadmap", desc: "Get a 12–36 month transformation roadmap with phase sequencing, budget estimates, and expected business outcomes." },
                  { step: "04", title: "Engage SRS Infoway", desc: "Our transformation consultants can walk you through the roadmap and begin execution within days, not months." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-5">
                    <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">{item.step}</div>
                    <div>
                      <div className="font-semibold text-primary mb-1">{item.title}</div>
                      <div className="text-gray-500 text-sm">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary">
        <div className="max-w-7xl mx-auto px-8 py-16 text-center">
          <h2 className="text-3xl font-semibold text-white mb-4">Find Out Where Your Transformation Should Start</h2>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto">Take the free 30-minute TransformHub assessment and walk away with a board-ready roadmap — no consultant engagement required to get started.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-white font-semibold rounded-lg hover:bg-accent-dark transition-colors">
              Start Free Assessment <ArrowRight size={18} />
            </Link>
            <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 border border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors">
              Talk to a Consultant
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
