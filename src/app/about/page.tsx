import Link from "next/link";
import { ArrowRight, Target, Eye, Heart, Award, Users, Globe, Linkedin } from "lucide-react";

export const metadata = { title: "About Us | SRS Infoway" };

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-primary">
        <div className="max-w-7xl mx-auto px-8 py-20">
          <div className="max-w-3xl">
            <div className="text-accent text-sm font-semibold uppercase tracking-widest mb-4">About SRS Infoway</div>
            <h1 className="text-5xl md:text-6xl font-light text-white leading-tight">
              Engineering Tomorrow's<br /><span className="font-semibold">Enterprise, Today</span>
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-accent to-gold mt-8 mb-8 rounded-full" />
            <p className="text-xl text-gray-400 leading-relaxed max-w-2xl">
              For over a decade, SRS Infoway has been a trusted partner to Fortune 500 companies, mid-market leaders, and high-growth enterprises — delivering technology solutions that drive measurable business outcomes.
            </p>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-8 py-20">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Target, title: "Our Mission", desc: "To accelerate enterprise transformation through technology, talent, and trusted partnerships — delivering measurable outcomes that matter.", color: "bg-accent" },
              { icon: Eye, title: "Our Vision", desc: "To be the most trusted global technology partner for enterprises navigating the AI-first, cloud-native future.", color: "bg-teal" },
              { icon: Heart, title: "Our Values", desc: "Innovation First. Client Obsession. Global Mindset. Integrity Always.", color: "bg-gold" },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className={`h-1.5 ${item.color} rounded-t-xl`} />
                <div className="bg-surface rounded-b-xl p-8">
                  <div className={`w-14 h-14 ${item.color} rounded-xl flex items-center justify-center mb-5`}>
                    <item.icon size={26} className="text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-primary mb-3">{item.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About detail */}
      <section className="bg-surface">
        <div className="max-w-7xl mx-auto px-8 py-20 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-teal text-sm font-semibold uppercase tracking-widest mb-4">Our Story</div>
            <h2 className="text-4xl font-light text-primary leading-tight mb-6">From Chennai to the World</h2>
            <p className="text-gray-500 leading-relaxed mb-6">
              Founded in Chennai, India as a focused IT staffing firm, SRS Infoway has evolved into a full-spectrum technology services powerhouse. Through strategic expansion via Ampstek, we've grown to serve enterprise clients across 40+ countries with 45+ offices spanning 5 continents.
            </p>
            <p className="text-gray-500 leading-relaxed mb-8">
              Today, we're trusted by Fortune 500 enterprises across BFSI, Healthcare, Manufacturing, Telecom, Insurance, and Automotive sectors. Our journey from a lean startup to a global network reflects our unwavering commitment to delivering transformative technology solutions, world-class talent, and outcomes that drive real business value.
            </p>
            <Link href="/contact" className="text-accent font-semibold text-sm flex items-center gap-2 hover:gap-3 transition-all">
              Partner with Us <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Award, label: "Founded", value: "2010" },
              { icon: Users, label: "Team Size", value: "450+" },
              { icon: Globe, label: "Countries", value: "40+" },
              { icon: Target, label: "Clients", value: "5,000+" },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-xl p-6 text-center shadow-sm">
                <s.icon size={28} className="text-accent mx-auto mb-3" />
                <div className="text-3xl font-bold text-primary">{s.value}</div>
                <div className="text-sm text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section id="leadership" className="bg-white">
        <div className="max-w-7xl mx-auto px-8 py-20">
          <div className="text-teal text-sm font-semibold uppercase tracking-widest mb-4">Leadership</div>
          <h2 className="text-4xl font-light text-primary mb-12">Our Leadership Team</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* CEO — Rekha Pathy */}
            <div className="group">
              <div className="bg-gradient-to-br from-primary to-teal rounded-xl h-64 mb-5 flex flex-col items-center justify-center gap-3 relative overflow-hidden">
                <div className="w-24 h-24 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center">
                  <Users size={36} className="text-white/60" />
                </div>
                <a
                  href="https://www.linkedin.com/in/rekha-pathy-810a9914a/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-4 right-4 w-9 h-9 bg-white/10 hover:bg-[#0077b5] rounded-lg flex items-center justify-center transition-colors"
                  title="View LinkedIn Profile"
                >
                  <Linkedin size={16} className="text-white" />
                </a>
              </div>
              <h3 className="text-lg font-semibold text-primary group-hover:text-accent transition-colors">Rekha Pathy</h3>
              <div className="text-accent text-sm font-semibold mb-2">Chief Executive Officer (CEO)</div>
              <p className="text-gray-500 text-sm leading-relaxed">
                A strategic leader driving SRS Infoway's global vision, business growth, and operational excellence. Rekha brings a client-first approach and deep industry expertise to steer the company's expansion across 40+ countries.
              </p>
              <a
                href="https://www.linkedin.com/in/rekha-pathy-810a9914a/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#0077b5] hover:underline"
              >
                <Linkedin size={14} /> Connect on LinkedIn
              </a>
            </div>

            {/* CTO — Shanker Babu */}
            <div className="group">
              <div className="bg-gradient-to-br from-teal to-primary-light rounded-xl h-64 mb-5 flex flex-col items-center justify-center gap-3 relative overflow-hidden">
                <div className="w-24 h-24 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center">
                  <Users size={36} className="text-white/60" />
                </div>
                <a
                  href="https://www.linkedin.com/in/shankerbabu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-4 right-4 w-9 h-9 bg-white/10 hover:bg-[#0077b5] rounded-lg flex items-center justify-center transition-colors"
                  title="View LinkedIn Profile"
                >
                  <Linkedin size={16} className="text-white" />
                </a>
              </div>
              <h3 className="text-lg font-semibold text-primary group-hover:text-accent transition-colors">Shanker Babu</h3>
              <div className="text-accent text-sm font-semibold mb-2">Chief Technology Officer (CTO)</div>
              <p className="text-gray-500 text-sm leading-relaxed">
                A technology visionary with deep expertise in AI, cloud architecture, and enterprise digital transformation. Shanker architects the technology strategy behind SRS Infoway's proprietary platforms and global delivery model.
              </p>
              <a
                href="https://www.linkedin.com/in/shankerbabu"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#0077b5] hover:underline"
              >
                <Linkedin size={14} /> Connect on LinkedIn
              </a>
            </div>

            {/* COO — Sangeetha Salem Viswanathan */}
            <div className="group">
              <div className="bg-gradient-to-br from-primary-light to-primary rounded-xl h-64 mb-5 flex flex-col items-center justify-center gap-3 relative overflow-hidden">
                <div className="w-24 h-24 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center">
                  <Users size={36} className="text-white/60" />
                </div>
                <a
                  href="https://www.linkedin.com/in/sangeetha-salem-viswanathan-a87280212/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-4 right-4 w-9 h-9 bg-white/10 hover:bg-[#0077b5] rounded-lg flex items-center justify-center transition-colors"
                  title="View LinkedIn Profile"
                >
                  <Linkedin size={16} className="text-white" />
                </a>
              </div>
              <h3 className="text-lg font-semibold text-primary group-hover:text-accent transition-colors">Sangeetha Salem Viswanathan</h3>
              <div className="text-accent text-sm font-semibold mb-2">Chief Operating Officer (COO)</div>
              <p className="text-gray-500 text-sm leading-relaxed">
                Driving operational excellence, delivery governance, and process innovation across SRS Infoway's global delivery centers and client engagements.
              </p>
              <a
                href="https://www.linkedin.com/in/sangeetha-salem-viswanathan-a87280212/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#0077b5] hover:underline"
              >
                <Linkedin size={14} /> Connect on LinkedIn
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section id="partners" className="bg-surface">
        <div className="max-w-7xl mx-auto px-8 py-20 text-center">
          <div className="text-teal text-sm font-semibold uppercase tracking-widest mb-4">Our Partners</div>
          <h2 className="text-4xl font-light text-primary mb-12">Technology Alliances</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
            {["AWS", "Microsoft", "Google Cloud", "SAP", "Oracle", "Salesforce", "UiPath", "ServiceNow"].map((p, i) => (
              <div key={i} className="bg-white rounded-xl p-6 flex items-center justify-center h-20 border border-gray-100 hover:shadow-lg transition-shadow">
                <span className="text-lg font-bold text-gray-400">{p}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
