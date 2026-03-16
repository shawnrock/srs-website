"use client";
import Link from "next/link";
import { ArrowRight, Users, BarChart3, Building2, Heart, Factory, Wifi, Shield, Car, Brain, Globe, MapPin, RefreshCw, GitBranch, Headphones, Video, Cloud, Zap, Activity, ExternalLink } from "lucide-react";
import { useState, useEffect, useRef } from "react";

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [started, target]);

  return <div ref={ref}>{count}{suffix}</div>;
}

const services = [
  { icon: Brain, title: "Artificial Intelligence", desc: "Enterprise AI solutions — from predictive analytics and NLP to generative AI and intelligent automation that transform decision-making at scale." },
  { icon: BarChart3, title: "Cloud & Data", desc: "Multi-cloud strategy on AWS, Azure & GCP — architecture, migration, data engineering, and real-time analytics for the modern enterprise." },
  { icon: RefreshCw, title: "Digital Transformation", desc: "End-to-end modernization — legacy migration, customer experience redesign, agile operating models, and process digitization." },
  { icon: GitBranch, title: "DevOps & Automation", desc: "CI/CD pipelines, infrastructure-as-code, Kubernetes orchestration, and intelligent automation that ship faster with fewer failures." },
  { icon: Users, title: "Global Talent Solutions", desc: "Elite technology talent across 40+ countries — contract, permanent, RPO, and managed teams powered by our Ampstek global network." },
  { icon: Headphones, title: "Managed Services", desc: "24/7 IT operations, proactive monitoring, L1–L3 support, and SLA-driven service delivery that keeps your enterprise running." },
];

const stats = [
  { value: 40, suffix: "+", label: "Countries", color: "bg-accent" },
  { value: 5000, suffix: "+", label: "Clients Worldwide", color: "bg-gold" },
  { value: 45, suffix: "+", label: "Global Offices", color: "bg-teal" },
  { value: 5, suffix: "", label: "Continents", color: "bg-accent" },
];

const globalRegions = [
  { name: "Americas", offices: 6, countries: ["USA (Princeton HQ)", "Canada (Toronto)", "Costa Rica", "Colombia (Bogotá)", "Mexico (Monterrey)", "Argentina (Buenos Aires)"] },
  { name: "Europe", offices: 23, countries: ["UK", "Germany", "France", "Sweden", "Denmark", "Austria", "Belgium", "Netherlands", "Romania", "Poland", "Hungary", "Spain", "Czech Republic", "Bulgaria", "Ireland", "Norway", "Croatia", "Slovakia", "Portugal", "Switzerland", "Greece"] },
  { name: "Asia Pacific", offices: 12, countries: ["India (Chennai HQ)", "Singapore", "Malaysia", "Philippines", "Vietnam", "Thailand", "Indonesia", "Sri Lanka", "South Korea", "Taiwan", "Hong Kong"] },
  { name: "Middle East & Africa", offices: 6, countries: ["UAE", "Turkey", "South Africa"] },
  { name: "ANZ", offices: 2, countries: ["Australia", "New Zealand"] },
];

const industries = [
  { icon: Building2, name: "Banking & Financial Services" },
  { icon: Heart, name: "Healthcare" },
  { icon: Factory, name: "Manufacturing" },
  { icon: Wifi, name: "Telecom" },
  { icon: Shield, name: "Insurance" },
  { icon: Car, name: "Automotive" },
];

const insights = [
  {
    tag: "Article",
    title: "The CIO's Playbook: Scaling AI Across the Enterprise",
    desc: "Strategic frameworks for deploying AI at scale while managing risk, talent, and transformation challenges.",
    color: "bg-primary",
  },
  {
    tag: "Success Story",
    title: "How a Global Insurer Cut Claims Processing by 60% with Automation",
    desc: "Intelligent RPA implementation reduced processing time, improved accuracy, and freed teams for strategic work.",
    color: "bg-teal",
  },
  {
    tag: "Insight",
    title: "Cloud-Native Architecture: 5 Patterns Every Enterprise Should Know",
    desc: "Essential architectural patterns for building resilient, scalable systems on modern cloud platforms.",
    color: "bg-accent",
  },
];

function GlobalImpactSection() {
  const [activeRegion, setActiveRegion] = useState("Americas");
  const region = globalRegions.find((r) => r.name === activeRegion)!;

  return (
    <section className="bg-primary-dark">
      <div className="max-w-7xl mx-auto px-8 py-20">
        {/* Header + Stats row */}
        <div className="grid lg:grid-cols-2 gap-12 items-start mb-16">
          <div>
            <div className="text-accent text-sm font-semibold uppercase tracking-widest mb-4">Global Impact</div>
            <h2 className="text-4xl font-light text-white leading-tight mb-4">
              Talent is Everywhere.<br /><span className="font-semibold">So Are We.</span>
            </h2>
            <p className="text-gray-400 leading-relaxed max-w-lg">
              Through the SRS Infoway &amp; Ampstek global network, we deliver local expertise with worldwide consistency — across 5 continents, 40+ countries, and 45+ offices.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <span className="text-xs text-gray-500">Powered by</span>
              <span className="text-white font-bold text-sm">SRS Infoway</span>
              <span className="text-gray-500 text-xs">&</span>
              <span className="text-white font-bold text-sm">Ampstek</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <div className={`h-1.5 ${stat.color}`} />
                <div className="p-5">
                  <div className="text-3xl font-bold text-white">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Region tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {globalRegions.map((r) => (
            <button
              key={r.name}
              onClick={() => setActiveRegion(r.name)}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeRegion === r.name
                  ? "bg-accent text-white"
                  : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white"
              }`}
            >
              {r.name} <span className="ml-1 opacity-60">{r.offices}</span>
            </button>
          ))}
        </div>

        {/* Region detail */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <Globe size={24} className="text-accent" />
            <h3 className="text-xl font-semibold text-white">{region.name}</h3>
            <span className="px-3 py-1 bg-accent/20 text-accent text-xs font-semibold rounded-full">{region.offices} offices</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {region.countries.map((country, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-300 py-2 px-3 bg-white/5 rounded-lg">
                <MapPin size={12} className="text-accent shrink-0" />
                {country}
              </div>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div className="mt-12 flex flex-wrap items-center gap-6 justify-center">
          <span className="text-xs text-gray-500 uppercase tracking-widest">Certified &amp; Partnered</span>
          {["ISO 9001", "ISO 27001", "AWS", "Microsoft", "Adobe", "UiPath"].map((cert, i) => (
            <span key={i} className="px-4 py-2 border border-white/10 text-white/60 rounded-lg text-sm font-medium hover:border-accent hover:text-accent transition-colors">
              {cert}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      {/* ===== HERO SECTION ===== */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-8 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-primary leading-[1.1] tracking-tight">
                Powering the Next<br />
                Wave of<br />
                <span className="font-semibold">Enterprise Innovation</span>
              </h1>
              <div className="w-32 h-1 bg-gradient-to-r from-accent to-gold mt-8 mb-8 rounded-full" />
              <p className="text-lg text-gray-500 max-w-md leading-relaxed">
                From AI-driven automation to cloud-native architectures, we partner with global enterprises to engineer solutions that transform operations, accelerate growth, and future-proof your business — across 5 continents and 40+ countries.
              </p>
              <div className="flex flex-wrap gap-4 mt-10">
                <Link href="/services" className="px-8 py-3.5 bg-accent text-white font-semibold rounded hover:bg-accent-dark transition-colors text-sm tracking-wide">
                  Explore Our Services
                </Link>
                <Link href="/contact" className="px-8 py-3.5 border-2 border-primary text-primary font-semibold rounded hover:bg-primary hover:text-white transition-all text-sm tracking-wide">
                  Talk to an Expert
                </Link>
              </div>
            </div>
            <div className="hidden lg:block relative">
              <div className="relative w-full aspect-square max-w-lg ml-auto">
                <div className="absolute top-0 right-0 w-72 h-72 bg-primary rounded-3xl" />
                <div className="absolute top-16 right-16 w-72 h-72 bg-teal rounded-3xl opacity-80" />
                <div className="absolute top-32 right-32 w-72 h-72 bg-accent/20 rounded-3xl" />
                <div className="absolute bottom-8 left-8 bg-white rounded-2xl shadow-2xl p-6 z-10 w-64">
                  <div className="text-xs font-semibold text-accent uppercase tracking-widest mb-2">Trusted Globally</div>
                  <div className="text-4xl font-bold text-primary">5,000+</div>
                  <div className="text-sm text-gray-500 mt-1">Enterprise clients across 40+ countries</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== WHAT WE DO ===== */}
      <section className="bg-surface">
        <div className="max-w-7xl mx-auto px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-16">
            <div className="relative hidden lg:block">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary rounded-2xl h-48 flex items-center justify-center">
                  <Brain size={48} className="text-white/40" />
                </div>
                <div className="bg-teal rounded-2xl h-48 mt-12 flex items-center justify-center">
                  <BarChart3 size={48} className="text-white/40" />
                </div>
                <div className="bg-accent/80 rounded-2xl h-48 -mt-8 flex items-center justify-center">
                  <RefreshCw size={48} className="text-white/40" />
                </div>
                <div className="bg-primary-light rounded-2xl h-48 mt-4 flex items-center justify-center">
                  <GitBranch size={48} className="text-white/40" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-10 lg:-ml-20 relative z-10">
              <h2 className="text-4xl font-light text-primary mb-4">What We Do</h2>
              <p className="text-gray-500 leading-relaxed mb-6">
                We are fully engaged, hands-on collaborators — passionate about creating solutions that fuel business, technology, and people transformation.
              </p>
              <Link href="/services" className="text-accent font-semibold text-sm flex items-center gap-2 hover:gap-3 transition-all">
                Learn About Our Services <ArrowRight size={16} />
              </Link>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s, i) => (
              <div key={i} className="bg-white rounded-xl p-8 card-hover border border-gray-100">
                <div className="w-14 h-14 bg-surface rounded-xl flex items-center justify-center mb-5">
                  <s.icon size={26} className="text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                <Link href="/services" className="text-accent text-sm font-semibold mt-4 inline-flex items-center gap-1 hover:gap-2 transition-all">
                  Learn more <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== OUR PRODUCTS ===== */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-8 py-20">
          <div className="text-center mb-14">
            <div className="text-accent text-sm font-semibold uppercase tracking-widest mb-4">Built In-House. Deployed Globally.</div>
            <h2 className="text-4xl font-light text-primary mb-4">Our Products</h2>
            <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Proprietary platforms engineered by SRS Infoway to automate hiring, optimise cloud costs, accelerate transformation, and give your teams real-time operational intelligence.
            </p>
          </div>

          {/* Featured product — AI Interview */}
          <div className="bg-gradient-to-br from-primary to-teal rounded-2xl p-10 mb-8 grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-accent text-white text-xs font-bold rounded-full uppercase tracking-wider">Live Now</span>
                <span className="text-white/60 text-sm">Featured Product</span>
              </div>
              <h3 className="text-3xl font-semibold text-white mb-4">SRS AI Interview Platform</h3>
              <p className="text-white/80 leading-relaxed mb-6">
                End-to-end AI-powered video interviewing — auto-generate role-specific questions from a JD, conduct live proctored interviews with gaze tracking, transcribe answers in real time, and receive a detailed candidate evaluation report powered by Google Gemini.
              </p>
              <ul className="space-y-2 mb-8">
                {["AI question generation from Job Description", "Live video with real-time speech transcription", "Face & gaze proctoring via MediaPipe", "Auto-scored evaluation report in seconds"].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-white/80 text-sm">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/ai-interview" className="inline-flex items-center gap-2 px-7 py-3 bg-accent text-white font-semibold rounded hover:bg-accent-dark transition-colors text-sm">
                Explore AI Interview <ArrowRight size={16} />
              </Link>
            </div>
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative w-full max-w-sm">
                <div className="bg-white/10 backdrop-blur rounded-2xl p-8 border border-white/20">
                  <div className="w-16 h-16 bg-accent/20 rounded-xl flex items-center justify-center mb-5">
                    <Video size={32} className="text-accent" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: "60%", label: "Faster Hiring" },
                      { value: "5x", label: "More Interviews/Day" },
                      { value: "98%", label: "Accuracy Score" },
                      { value: "Zero", label: "Bias Risk" },
                    ].map((stat, i) => (
                      <div key={i} className="bg-white/10 rounded-xl p-3 text-center">
                        <div className="text-xl font-bold text-white">{stat.value}</div>
                        <div className="text-white/60 text-xs mt-0.5">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Other products grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Users,
                name: "TalentBridge",
                tagline: "Global Workforce Management",
                desc: "Track placements, contracts, timesheets, and compliance across 40+ countries from a single platform.",
                href: "/products/talentbridge",
                color: "bg-teal/10 text-teal",
              },
              {
                icon: Cloud,
                name: "CloudIQ",
                tagline: "Cloud Cost Optimisation",
                desc: "Real-time multi-cloud spend analytics, rightsizing alerts, and automated cost-saving recommendations.",
                href: "/products/cloudiq",
                color: "bg-blue-50 text-blue-600",
              },
              {
                icon: Zap,
                name: "TransformHub",
                tagline: "Transformation Readiness",
                desc: "Automated tech-stack audit with a custom digital transformation roadmap generated in minutes.",
                href: "/products/transformhub",
                color: "bg-gold/10 text-gold",
              },
              {
                icon: Activity,
                name: "DevPulse",
                tagline: "DevOps Intelligence",
                desc: "DORA metrics, CI/CD pipeline performance, and deployment analytics benchmarked against industry peers.",
                href: "/products/devpulse",
                color: "bg-accent/10 text-accent",
              },
            ].map((prod, i) => (
              <Link key={i} href={prod.href} className="group bg-surface rounded-xl p-7 border border-gray-100 hover:shadow-xl hover:border-accent/30 transition-all block">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${prod.color}`}>
                  <prod.icon size={22} />
                </div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">{prod.tagline}</div>
                <h3 className="text-lg font-semibold text-primary mb-2 group-hover:text-accent transition-colors">{prod.name}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{prod.desc}</p>
                <div className="mt-4 text-accent text-xs font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                  Learn More <ArrowRight size={12} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== GLOBAL IMPACT ===== */}
      <GlobalImpactSection />

      {/* ===== INDUSTRIES ===== */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-8 py-16">
          <div className="text-center mb-12">
            <div className="text-teal text-sm font-semibold uppercase tracking-widest mb-4">Industries We Serve</div>
            <h2 className="text-3xl font-light text-primary">Deep Expertise Across Verticals</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {industries.map((ind, i) => (
              <Link key={i} href="/industries" className="text-center group">
                <div className="w-20 h-20 mx-auto mb-3 rounded-full border-2 border-gray-200 group-hover:border-accent flex items-center justify-center transition-colors">
                  <ind.icon size={28} className="text-gray-400 group-hover:text-accent transition-colors" />
                </div>
                <div className="text-xs font-semibold text-primary">{ind.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SUCCESS STORY ===== */}
      <section className="bg-surface">
        <div className="max-w-7xl mx-auto px-8 py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative order-2 lg:order-1">
            <div className="w-full aspect-[4/3] bg-gradient-to-br from-primary to-teal rounded-2xl flex items-center justify-center">
              <div className="grid grid-cols-2 gap-6 p-8">
                <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-white">40%</div>
                  <div className="text-white/70 text-xs mt-1">Cost Reduction</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-white">3x</div>
                  <div className="text-white/70 text-xs mt-1">Faster Deployment</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-white">99.9%</div>
                  <div className="text-white/70 text-xs mt-1">Uptime Achieved</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-accent-light">$12M</div>
                  <div className="text-white/70 text-xs mt-1">Annual Savings</div>
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="text-teal text-sm font-semibold uppercase tracking-widest mb-4">Success Story</div>
            <h2 className="text-3xl md:text-4xl font-light text-primary leading-tight mb-6">
              Fortune 100 Bank Saves $12M Annually with AI-Powered Operations
            </h2>
            <p className="text-gray-500 leading-relaxed mb-8">
              A global banking leader transformed core operations with enterprise AI and cloud migration, delivering dramatic cost savings, accelerated deployment cycles, and best-in-class reliability.
            </p>
            <Link href="/case-studies" className="text-accent font-semibold text-sm flex items-center gap-2 hover:gap-3 transition-all">
              Read the Case Study <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== PARTNERSHIPS ===== */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-8 py-20 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-teal text-sm font-semibold uppercase tracking-widest mb-4">Technology Alliances</div>
            <h2 className="text-4xl font-light text-primary leading-tight mb-6">Strategic Technology Alliances</h2>
            <p className="text-gray-500 leading-relaxed">
              The world&apos;s leading technology and software providers partner with us because of our scale, full-stack capabilities and speed. Together, we deliver sustainable growth across your business.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {["AWS", "Microsoft", "Google Cloud", "SAP", "Oracle", "Salesforce", "UiPath", "ServiceNow"].map((partner, i) => (
              <div key={i} className="bg-surface rounded-xl p-6 flex items-center justify-center h-24 border border-gray-100 hover:shadow-lg transition-shadow">
                <span className="text-xl font-bold text-gray-400">{partner}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== LATEST INSIGHTS ===== */}
      <section className="bg-surface">
        <div className="max-w-7xl mx-auto px-8 py-20">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="text-teal text-sm font-semibold uppercase tracking-widest mb-4">Thinking Forward</div>
              <h2 className="text-4xl font-light text-primary">Latest Insights</h2>
            </div>
            <Link href="/blog" className="text-accent font-semibold text-sm flex items-center gap-2 hover:gap-3 transition-all hidden md:flex">
              View All Insights <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {insights.map((item, i) => (
              <Link key={i} href="/blog" className="group block">
                <div className={`${item.color} rounded-t-xl h-52 flex items-end p-6`}>
                  <div className="text-white/80 text-xs font-semibold uppercase tracking-widest">{item.tag}</div>
                </div>
                <div className="bg-white rounded-b-xl p-6 border border-t-0 border-gray-100">
                  <h3 className="text-lg font-semibold text-primary leading-snug mb-3 group-hover:text-accent transition-colors">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                  <div className="mt-4 text-accent text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                    Read More <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center md:hidden">
            <Link href="/blog" className="text-accent font-semibold text-sm flex items-center gap-2 justify-center">
              View All Insights <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FEATURED REPORT ===== */}
      <section className="bg-primary">
        <div className="max-w-7xl mx-auto px-8 py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-accent text-sm font-semibold uppercase tracking-widest mb-4">Report</div>
            <h2 className="text-3xl md:text-4xl font-light text-white leading-tight mb-6">
              2026 Digital<br />Transformation Report
            </h2>
            <p className="text-gray-400 leading-relaxed mb-8 max-w-lg">
              How leaders are scaling AI, modernizing cloud infrastructure, and improving ROI across the enterprise.
            </p>
            <Link href="/case-studies" className="text-accent font-semibold text-sm flex items-center gap-2 hover:gap-3 transition-all">
              Read This Report <ArrowRight size={16} />
            </Link>
          </div>
          <div className="relative">
            <div className="w-full aspect-[4/3] bg-gradient-to-br from-teal to-primary-light rounded-2xl flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 border-2 border-white/30 rounded-full flex items-center justify-center">
                  <BarChart3 size={32} className="text-white" />
                </div>
                <div className="text-white text-lg font-light">2026 Digital Transformation Report</div>
                <div className="text-white/60 text-sm mt-1">Global Enterprise Edition</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CAREERS CTA ===== */}
      <section className="bg-primary-dark">
        <div className="max-w-7xl mx-auto px-8 py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-accent text-sm font-semibold uppercase tracking-widest mb-4">Build Your Career</div>
            <h2 className="text-4xl font-light text-white leading-tight mb-6">
              Find Your Next Opportunity
            </h2>
            <p className="text-gray-400 leading-relaxed max-w-lg">
              Whether you are a seasoned IT professional or just starting your career, SRS Infoway offers exciting roles across the globe. Join our team of innovators and leaders.
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <Link href="/careers" className="px-8 py-3.5 bg-accent text-white font-semibold rounded hover:bg-accent-dark transition-colors text-sm tracking-wide">
                Search Jobs
              </Link>
              <Link href="/careers/apply" className="px-8 py-3.5 border-2 border-white/30 text-white font-semibold rounded hover:bg-white/10 transition-all text-sm tracking-wide">
                Submit Your Resume
              </Link>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="grid grid-cols-2 gap-4 max-w-sm">
              <div className="bg-white/5 rounded-xl p-6 text-center border border-white/10">
                <div className="text-3xl font-bold text-accent">200+</div>
                <div className="text-white/60 text-xs mt-1">Open Positions</div>
              </div>
              <div className="bg-white/5 rounded-xl p-6 text-center border border-white/10">
                <div className="text-3xl font-bold text-teal">40+</div>
                <div className="text-white/60 text-xs mt-1">Countries</div>
              </div>
              <div className="bg-white/5 rounded-xl p-6 text-center border border-white/10">
                <div className="text-3xl font-bold text-gold">6</div>
                <div className="text-white/60 text-xs mt-1">Industries</div>
              </div>
              <div className="bg-white/5 rounded-xl p-6 text-center border border-white/10">
                <div className="text-3xl font-bold text-white">500+</div>
                <div className="text-white/60 text-xs mt-1">Team Members</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
