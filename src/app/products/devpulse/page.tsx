import Link from "next/link";
import { Activity, GitBranch, Clock, TrendingUp, Bell, Shield, ArrowRight, CheckCircle, BarChart3, RefreshCw } from "lucide-react";

export const metadata = { title: "DevPulse | SRS Infoway Products" };

export default function DevPulsePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-primary">
        <div className="max-w-7xl mx-auto px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/20 rounded-full mb-6">
                <span className="w-2 h-2 bg-accent rounded-full" />
                <span className="text-accent text-xs font-semibold uppercase tracking-wider">SRS Infoway Product</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-light text-white leading-tight mb-6">
                Measure What<br /><span className="font-semibold">Actually Matters.</span>
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed mb-8 max-w-lg">
                DevPulse is SRS Infoway's engineering intelligence platform — tracking DORA metrics, CI/CD pipeline health, deployment frequency, and team velocity so engineering leaders can make data-driven decisions at speed.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/contact" className="px-8 py-4 bg-accent text-white font-semibold rounded-lg hover:bg-accent-dark transition-colors flex items-center gap-2">
                  Connect Your Pipeline <ArrowRight size={18} />
                </Link>
                <Link href="/contact" className="px-8 py-4 border border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors">
                  View Live Demo
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                <div className="text-xs text-gray-400 uppercase tracking-widest mb-4">DORA Metrics — Last 30 Days</div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { metric: "Deployment Frequency", value: "14.2/day", trend: "+22%", status: "Elite", color: "text-green-400" },
                    { metric: "Lead Time for Changes", value: "1.4 hrs", trend: "-38%", status: "Elite", color: "text-green-400" },
                    { metric: "Change Failure Rate", value: "2.1%", trend: "-61%", status: "High", color: "text-teal" },
                    { metric: "MTTR", value: "18 min", trend: "-44%", status: "Elite", color: "text-green-400" },
                  ].map((m, i) => (
                    <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="text-xs text-gray-400 mb-2">{m.metric}</div>
                      <div className="text-xl font-bold text-white">{m.value}</div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">{m.trend} vs last month</span>
                        <span className={`text-xs font-bold ${m.color}`}>{m.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-accent">
        <div className="max-w-7xl mx-auto px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-white text-center">
            {[
              { value: "4", label: "DORA Metrics Tracked" },
              { value: "50+", label: "CI/CD Integrations" },
              { value: "3x", label: "Faster Incident Response" },
              { value: "Real-time", label: "Pipeline Visibility" },
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
            <h2 className="text-4xl font-light text-primary">Engineering Intelligence <span className="font-semibold">At Every Level</span></h2>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
              DevPulse connects to your existing toolchain in minutes and begins delivering actionable insights on delivery performance, reliability, and engineering health — no code changes required.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Activity, title: "DORA Metrics Dashboard", desc: "Track all four DORA metrics — Deployment Frequency, Lead Time for Changes, Change Failure Rate, and MTTR — with industry benchmark overlays to see exactly where you stand." },
              { icon: GitBranch, title: "CI/CD Pipeline Analytics", desc: "Visualise pipeline health across GitHub Actions, Jenkins, GitLab CI, CircleCI, and Azure DevOps. Identify bottlenecks, flaky tests, and slow stages killing your throughput." },
              { icon: Clock, title: "Lead Time Breakdown", desc: "Drill into lead time at every stage — from first commit to code review, build, test, staging, and production deploy — to pinpoint exactly where time is being lost." },
              { icon: Bell, title: "Incident & Alerting Intelligence", desc: "Integrated with PagerDuty, OpsGenie, and Slack. DevPulse correlates deployment events with incidents to surface deployment-caused outages before your on-call team escalates." },
              { icon: TrendingUp, title: "Team & Sprint Velocity", desc: "Track team-level deployment cadence, review cycle time, and commit-to-deploy time. Identify high-performing teams and replicate their practices across the organisation." },
              { icon: BarChart3, title: "Executive Engineering Reports", desc: "Weekly automated reports for VPs and CTOs — delivery performance, reliability trends, DORA tier movement, and risk indicators — all without pulling engineers away from work." },
            ].map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="p-7 bg-surface rounded-xl border border-gray-100 hover:border-accent/40 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-5">
                  <Icon size={24} className="text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DORA Tiers */}
      <section className="bg-surface">
        <div className="max-w-7xl mx-auto px-8 py-20">
          <div className="text-center mb-12">
            <div className="text-accent text-sm font-semibold uppercase tracking-widest mb-4">DORA Performance Tiers</div>
            <h2 className="text-4xl font-light text-primary">Where Do You <span className="font-semibold">Rank?</span></h2>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto">DevPulse benchmarks your metrics against the Google DORA research tiers so you always know your current performance tier and what it takes to reach the next level.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { tier: "Elite", color: "bg-green-500", deployFreq: "Multiple/day", leadTime: "<1 hour", cfr: "<5%", mttr: "<1 hour" },
              { tier: "High", color: "bg-teal", deployFreq: "1/day–1/week", leadTime: "1 day–1 week", cfr: "5–10%", mttr: "<1 day" },
              { tier: "Medium", color: "bg-gold", deployFreq: "1/week–1/month", leadTime: "1 week–1 month", cfr: "10–15%", mttr: "1 day–1 week" },
              { tier: "Low", color: "bg-accent", deployFreq: "<1/month", leadTime: ">1 month", cfr: ">15%", mttr: ">1 week" },
            ].map((t, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                <div className={`${t.color} py-3 px-5 text-white font-bold`}>{t.tier} Performer</div>
                <div className="p-5 space-y-3">
                  <div className="text-xs text-gray-400 uppercase tracking-widest">Deploy Frequency</div>
                  <div className="text-sm font-semibold text-primary">{t.deployFreq}</div>
                  <div className="text-xs text-gray-400 uppercase tracking-widest">Lead Time</div>
                  <div className="text-sm font-semibold text-primary">{t.leadTime}</div>
                  <div className="text-xs text-gray-400 uppercase tracking-widest">Change Failure Rate</div>
                  <div className="text-sm font-semibold text-primary">{t.cfr}</div>
                  <div className="text-xs text-gray-400 uppercase tracking-widest">MTTR</div>
                  <div className="text-sm font-semibold text-primary">{t.mttr}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations + Who it's for */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-8 py-20 grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <div className="text-accent text-sm font-semibold uppercase tracking-widest mb-4">Integrations</div>
            <h2 className="text-4xl font-light text-primary mb-6">Connects to Your <span className="font-semibold">Existing Toolchain</span></h2>
            <p className="text-gray-500 mb-6 leading-relaxed">DevPulse ingests data from your CI/CD, version control, incident management, and project management tools — with no agents or code changes.</p>
            <div className="grid grid-cols-3 gap-3">
              {["GitHub", "GitLab", "Bitbucket", "Jenkins", "CircleCI", "Azure DevOps", "PagerDuty", "OpsGenie", "Jira", "Linear", "Datadog", "Slack"].map((tool, i) => (
                <div key={i} className="bg-surface rounded-lg px-3 py-2.5 text-center text-xs font-semibold text-gray-600 border border-gray-100">
                  {tool}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-accent text-sm font-semibold uppercase tracking-widest mb-4">Built For</div>
            <div className="space-y-4">
              {[
                { role: "CTOs & VP Engineering", benefit: "Board-level delivery reports, DORA trend analysis, and engineering health scores without asking engineers for status updates." },
                { role: "Engineering Managers", benefit: "Team-level performance insights, sprint velocity trends, and review cycle bottlenecks — with actionable coaching recommendations." },
                { role: "Platform & DevOps Teams", benefit: "Pipeline health monitoring, flaky test tracking, build duration trends, and deployment success rates across every service." },
                { role: "SRE & Incident Response", benefit: "Correlate deployments to incidents, track MTTR over time, and build evidence for SLA conversations with full audit trails." },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-5 bg-surface rounded-xl border border-gray-100">
                  <CheckCircle size={20} className="text-accent shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-primary text-sm">{item.role}</div>
                    <div className="text-gray-500 text-sm mt-1">{item.benefit}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary">
        <div className="max-w-7xl mx-auto px-8 py-16 text-center">
          <h2 className="text-3xl font-semibold text-white mb-4">See Your Engineering Performance in Real Time</h2>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto">Connect DevPulse to your pipeline in under 10 minutes and get your first DORA metrics dashboard — free for the first 30 days.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-white font-semibold rounded-lg hover:bg-accent-dark transition-colors">
              Start Free Trial <ArrowRight size={18} />
            </Link>
            <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 border border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors">
              Book a Demo
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
