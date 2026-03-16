import Link from "next/link";
import { Users, Globe, FileCheck, BarChart3, Clock, Shield, ArrowRight, CheckCircle, RefreshCw, Briefcase } from "lucide-react";

export const metadata = { title: "TalentBridge | SRS Infoway Products" };

export default function TalentBridgePage() {
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
                Global Talent,<br /><span className="font-semibold">One Platform.</span>
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed mb-8 max-w-lg">
                TalentBridge is SRS Infoway's end-to-end workforce management platform — connecting recruiters, consultants, and clients across 40+ countries with complete lifecycle visibility.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/contact" className="px-8 py-4 bg-accent text-white font-semibold rounded-lg hover:bg-accent-dark transition-colors flex items-center gap-2">
                  Request a Demo <ArrowRight size={18} />
                </Link>
                <Link href="/contact" className="px-8 py-4 border border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors">
                  Talk to Sales
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: "40+", label: "Countries Covered" },
                    { value: "12K+", label: "Active Consultants" },
                    { value: "98%", label: "Placement Accuracy" },
                    { value: "3x", label: "Faster Time-to-Fill" },
                  ].map((s, i) => (
                    <div key={i} className="bg-white/5 rounded-xl p-5 text-center border border-white/10">
                      <div className="text-3xl font-bold text-white">{s.value}</div>
                      <div className="text-xs text-gray-400 mt-1">{s.label}</div>
                    </div>
                  ))}
                </div>
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
              { value: "500+", label: "Enterprise Clients" },
              { value: "45+", label: "Global Offices" },
              { value: "99.5%", label: "Platform Uptime" },
              { value: "<24h", label: "Avg. Onboarding Time" },
            ].map((s, i) => (
              <div key={i}>
                <div className="text-3xl font-bold mb-1">{s.value}</div>
                <div className="text-sm text-white/80">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-8 py-20">
          <div className="text-center mb-16">
            <div className="text-accent text-sm font-semibold uppercase tracking-widest mb-4">Platform Capabilities</div>
            <h2 className="text-4xl font-light text-primary">Everything Talent, <span className="font-semibold">End to End</span></h2>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
              From sourcing and screening to contracts, timesheets, payroll, and compliance — TalentBridge manages every stage of the consultant and permanent hire lifecycle.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Users, title: "Consultant Lifecycle Management", desc: "Onboard, deploy, manage, and offboard contractors and permanent hires with automated workflows, document collection, and approval chains across all global entities." },
              { icon: Globe, title: "Multi-Country Compliance Engine", desc: "Built-in compliance rules for 40+ countries — right-to-work checks, tax codes, employment classifications, GDPR, and local labour law — updated in real time." },
              { icon: FileCheck, title: "Timesheet & Expense Portal", desc: "Mobile-friendly timesheet submission with multi-level approvals, overtime rules, currency conversion, and direct payroll integration for accurate, on-time payments." },
              { icon: BarChart3, title: "Real-Time Analytics Dashboard", desc: "Live dashboards for headcount, bill rate benchmarking, margin analysis, diversity metrics, and talent pipeline velocity — all filterable by region, client, or role." },
              { icon: Briefcase, title: "Requisition & Sourcing Engine", desc: "Publish roles to global job boards, internal talent pools, and partner networks simultaneously. AI-ranked candidates surface to recruiters in under 60 seconds." },
              { icon: RefreshCw, title: "Vendor Management System (VMS)", desc: "Manage preferred suppliers, subcontractor tiers, rate cards, and performance scorecards from a centralised supplier portal — eliminating email-based procurement chaos." },
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
            <h2 className="text-4xl font-light text-primary">How <span className="font-semibold">TalentBridge Works</span></h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Post & Source", desc: "Raise a requisition and let AI distribute it across job boards, talent pools, and partner networks instantly." },
              { step: "02", title: "Screen & Select", desc: "Ranked shortlists, integrated video interviews via SRS AI Interview, and one-click offer generation." },
              { step: "03", title: "Onboard Globally", desc: "Automated compliance checks, contract generation, right-to-work verification, and digital signatures in one flow." },
              { step: "04", title: "Manage & Pay", desc: "Timesheets, expenses, milestone billing, and payroll — synced across your ERP or finance system in real time." },
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

      {/* Integration / Who It's For */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-8 py-20 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-teal text-sm font-semibold uppercase tracking-widest mb-4">Integrations</div>
            <h2 className="text-4xl font-light text-primary mb-6">Works With Your <span className="font-semibold">Existing Stack</span></h2>
            <p className="text-gray-500 leading-relaxed mb-8">
              TalentBridge connects with the tools your HR, finance, and operations teams already use — no rip-and-replace required.
            </p>
            <div className="grid grid-cols-3 gap-4">
              {["SAP SuccessFactors", "Workday", "Oracle HCM", "Salesforce", "QuickBooks", "ADP", "Greenhouse", "Lever", "Bullhorn"].map((tool, i) => (
                <div key={i} className="bg-surface rounded-lg px-3 py-2.5 text-center text-xs font-semibold text-gray-600 border border-gray-100">
                  {tool}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-teal text-sm font-semibold uppercase tracking-widest mb-4">Built For</div>
            <div className="space-y-4">
              {[
                { role: "Global HR & TA Leaders", benefit: "Full workforce visibility — headcount, costs, and performance across every region in one dashboard." },
                { role: "Staffing & RPO Agencies", benefit: "Manage hundreds of clients and thousands of contractors without spreadsheets or siloed tools." },
                { role: "Procurement & Finance", benefit: "Rate card enforcement, PO management, invoice reconciliation, and spend analytics built in." },
                { role: "IT & Operations", benefit: "Single sign-on, role-based access, audit trails, and GDPR-ready data governance out of the box." },
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
          <h2 className="text-3xl font-semibold text-white mb-4">Ready to Unify Your Global Workforce?</h2>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto">See how TalentBridge can reduce your time-to-fill by 3x and bring full compliance confidence across every country you hire in.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-white font-semibold rounded-lg hover:bg-accent-dark transition-colors">
              Book a Demo <ArrowRight size={18} />
            </Link>
            <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 border border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors">
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
