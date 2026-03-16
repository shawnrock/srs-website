import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata = { title: "Case Studies | SRS Infoway" };

const cases = [
  { tag: "Banking & Financial Services", title: "Fortune 100 Bank: AI-Powered Fraud Detection Saves $12M Annually", result: "$12M annual savings", desc: "92% fraud detection rate, 60% faster processing with advanced ML models detecting anomalies across millions of daily transactions in real-time.", color: "bg-primary" },
  { tag: "Insurance", title: "Global Insurer: Automating Claims Processing with Intelligent Automation", result: "60% faster claims", desc: "RPA and AI-powered document processing achieved 99.2% accuracy, reduced claims cycle time, and cut operational costs by 40%.", color: "bg-teal-dark" },
  { tag: "Healthcare", title: "Leading Hospital Network: Cloud Migration for 50+ Facilities", result: "99.99% uptime", desc: "Migrated EHR, lab, and imaging systems to AWS with 35% infrastructure cost reduction while maintaining HIPAA compliance and zero downtime.", color: "bg-accent" },
  { tag: "Automotive", title: "Tier-1 Automotive OEM: Connected Vehicle Platform on AWS", result: "50ms latency", desc: "Real-time telemetry platform processing 10M+ connected vehicles with predictive maintenance, over-the-air updates, and 50ms end-to-end latency.", color: "bg-primary-light" },
  { tag: "Manufacturing", title: "Fortune 500 Manufacturer: Predictive Maintenance with IoT & ML", result: "45% less downtime", desc: "IoT sensors and ML algorithms reduced unplanned maintenance by 45%, saved $2.1M in maintenance costs, with 8-month ROI.", color: "bg-teal" },
  { tag: "Telecom", title: "Global Telecom: 5G Network Optimization with AIOps", result: "40% fewer outages", desc: "AI-driven network monitoring reduced service interruptions by 40%, improved capacity utilization by 25%, and resolved incidents 3x faster.", color: "bg-primary" },
];

export default function CaseStudiesPage() {
  return (
    <>
      <section className="bg-primary">
        <div className="max-w-7xl mx-auto px-8 py-20">
          <div className="max-w-3xl">
            <div className="text-accent text-sm font-semibold uppercase tracking-widest mb-4">Case Studies</div>
            <h1 className="text-5xl md:text-6xl font-light text-white leading-tight">
              Client Success<br /><span className="font-semibold">Stories</span>
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-accent to-gold mt-8 mb-8 rounded-full" />
            <p className="text-xl text-gray-400 leading-relaxed">
              See how we've helped enterprises across industries achieve measurable outcomes with AI, cloud, and digital transformation.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-8 py-20">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cases.map((c, i) => (
              <Link key={i} href="/contact" className="group card-hover block">
                <div className={`${c.color} rounded-t-xl h-48 flex flex-col justify-between p-6`}>
                  <span className="text-white/70 text-xs font-semibold uppercase tracking-widest">{c.tag}</span>
                  <div>
                    <div className="text-2xl font-bold text-white">{c.result}</div>
                  </div>
                </div>
                <div className="bg-surface-alt rounded-b-xl p-6 border border-t-0 border-gray-100">
                  <h3 className="text-lg font-semibold text-primary leading-snug mb-3 group-hover:text-accent transition-colors">{c.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">{c.desc}</p>
                  <span className="text-accent text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                    Read Full Story <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
