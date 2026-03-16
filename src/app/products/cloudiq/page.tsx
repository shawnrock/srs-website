import Link from "next/link";
import { Cloud, TrendingDown, Bell, BarChart3, Shield, Zap, ArrowRight, CheckCircle, Settings, Eye } from "lucide-react";

export const metadata = { title: "CloudIQ | SRS Infoway Products" };

export default function CloudIQPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-primary">
        <div className="max-w-7xl mx-auto px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal/20 rounded-full mb-6">
                <span className="w-2 h-2 bg-teal rounded-full" />
                <span className="text-teal text-xs font-semibold uppercase tracking-wider">SRS Infoway Product</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-light text-white leading-tight mb-6">
                Stop Overpaying<br /><span className="font-semibold">for Cloud.</span>
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed mb-8 max-w-lg">
                CloudIQ is SRS Infoway's intelligent multi-cloud cost optimisation platform — giving enterprises real-time visibility, automated rightsizing recommendations, and measurable savings across AWS, Azure, and GCP.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/contact" className="px-8 py-4 bg-accent text-white font-semibold rounded-lg hover:bg-accent-dark transition-colors flex items-center gap-2">
                  Get a Free Audit <ArrowRight size={18} />
                </Link>
                <Link href="/contact" className="px-8 py-4 border border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors">
                  Watch Demo
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-4">
                <div className="text-xs text-gray-400 uppercase tracking-widest mb-2">Monthly Cloud Spend Analysis</div>
                {[
                  { label: "Idle Resources Detected", value: "$48,200", color: "bg-accent" },
                  { label: "Rightsizing Savings", value: "$31,700", color: "bg-gold" },
                  { label: "Reserved Instance Gaps", value: "$22,900", color: "bg-teal" },
                  { label: "Total Recoverable", value: "$102,800", color: "bg-green-500" },
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between bg-white/5 rounded-xl px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${row.color}`} />
                      <span className="text-gray-300 text-sm">{row.label}</span>
                    </div>
                    <span className="text-white font-bold text-sm">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-teal">
        <div className="max-w-7xl mx-auto px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-white text-center">
            {[
              { value: "35%", label: "Avg. Cost Reduction" },
              { value: "$2.4M+", label: "Client Savings YTD" },
              { value: "3", label: "Cloud Providers Supported" },
              { value: "<5min", label: "Time to First Insight" },
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
            <h2 className="text-4xl font-light text-primary">Full-Spectrum Cloud <span className="font-semibold">Cost Intelligence</span></h2>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
              CloudIQ connects to your cloud accounts in minutes and begins surfacing cost anomalies, waste, and optimisation opportunities automatically.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Eye, title: "Unified Multi-Cloud Dashboard", desc: "Single pane of glass across AWS, Azure, and GCP. Drill down by account, region, service, team, or tag — with real-time cost and usage metrics refreshed every 15 minutes." },
              { icon: TrendingDown, title: "Rightsizing Recommendations", desc: "AI analyses 30 days of utilisation data and recommends right-sized EC2, VM, and GCE instances — with projected savings shown before you click a single button." },
              { icon: Bell, title: "Anomaly Detection & Alerts", desc: "ML-powered spend anomaly detection sends Slack or email alerts the moment your cloud bill deviates from forecast — often catching runaway costs within the hour." },
              { icon: BarChart3, title: "Chargeback & Showback", desc: "Allocate cloud costs to business units, products, or teams automatically using tag-based policies. Showback reports arrive in inboxes weekly with no manual effort." },
              { icon: Zap, title: "Reserved Instance & Savings Plans", desc: "CloudIQ models your workload patterns to recommend optimal RI and Savings Plan purchases — balancing flexibility with maximum discount rates across all three clouds." },
              { icon: Shield, title: "Policy & Governance Engine", desc: "Set budget thresholds, enforce tagging policies, and auto-remediate idle resources on a schedule. Governance rules run continuously without human intervention." },
            ].map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="p-7 bg-surface rounded-xl border border-gray-100 hover:border-teal/40 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-teal/10 rounded-xl flex items-center justify-center mb-5">
                  <Icon size={24} className="text-teal" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-surface">
        <div className="max-w-7xl mx-auto px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-primary">How <span className="font-semibold">CloudIQ Works</span></h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Connect in Minutes", desc: "Link your AWS, Azure, or GCP accounts via read-only IAM role. No agents, no code changes, no downtime." },
              { step: "02", title: "Discover Waste", desc: "CloudIQ analyses your entire environment and surfaces idle resources, oversized instances, and spend anomalies automatically." },
              { step: "03", title: "Act on Recommendations", desc: "One-click rightsizing, scheduling, and RI purchase actions — or export recommendations to Jira/ServiceNow for team review." },
              { step: "04", title: "Track Savings", desc: "A live savings tracker shows exactly how much CloudIQ has saved you, updated daily and included in your monthly executive report." },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-teal rounded-full flex items-center justify-center mx-auto mb-4 text-white text-xl font-bold">{item.step}</div>
                <h3 className="font-semibold text-primary mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cloud providers + Who it's for */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-8 py-20 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-teal text-sm font-semibold uppercase tracking-widest mb-4">Supported Clouds</div>
            <h2 className="text-4xl font-light text-primary mb-6">All Three Clouds. <span className="font-semibold">One Platform.</span></h2>
            <div className="space-y-4 mb-8">
              {[
                { cloud: "Amazon Web Services (AWS)", services: "EC2, RDS, S3, Lambda, EKS, ECS, ElastiCache, Redshift + 80 more" },
                { cloud: "Microsoft Azure", services: "VMs, AKS, SQL Database, Blob Storage, App Services, Cosmos DB + 60 more" },
                { cloud: "Google Cloud Platform (GCP)", services: "Compute Engine, GKE, BigQuery, Cloud SQL, Cloud Run, Spanner + 50 more" },
              ].map((item, i) => (
                <div key={i} className="p-5 bg-surface rounded-xl border border-gray-100">
                  <div className="font-semibold text-primary text-sm mb-1">{item.cloud}</div>
                  <div className="text-gray-500 text-xs">{item.services}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-teal text-sm font-semibold uppercase tracking-widest mb-4">Built For</div>
            <div className="space-y-4">
              {[
                { role: "CTOs & VP Engineering", benefit: "Board-ready cloud spend reports with savings trend, anomaly history, and projected annual cost." },
                { role: "FinOps & Finance Teams", benefit: "Accurate cost allocation, chargeback reports, and budget vs. actuals across every team and project." },
                { role: "DevOps & Platform Teams", benefit: "Rightsizing and scheduling recommendations that integrate with your existing CI/CD and IaC pipelines." },
                { role: "Cloud & Infrastructure Architects", benefit: "Reserved instance modelling, commitment coverage analysis, and architecture-level cost simulation." },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-5 bg-surface rounded-xl border border-gray-100">
                  <CheckCircle size={20} className="text-teal shrink-0 mt-0.5" />
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
          <h2 className="text-3xl font-semibold text-white mb-4">Find Out How Much You're Overspending</h2>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto">Get a free cloud cost audit — our team will connect CloudIQ to your account and deliver a savings report within 48 hours, at no cost.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-white font-semibold rounded-lg hover:bg-accent-dark transition-colors">
              Get Free Audit <ArrowRight size={18} />
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
