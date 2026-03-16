import { ArrowRight, Star, Quote } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Clients | SRS Infoway" };

const testimonials = [
  { name: "Margaret Chen", company: "GlobalBank Corp", role: "VP of Engineering", text: "SRS Infoway's AI implementation transformed our fraud detection capabilities. We've reduced false positives by 67% while improving real detection rates by 43% within the first year." },
  { name: "Dr. Rajesh Patel", company: "MedLife Health Systems", role: "CTO", text: "Their cloud migration expertise was invaluable during our transition to AWS. The team ensured zero downtime across our patient systems serving 2M+ patients across 150 facilities." },
  { name: "James Morrison", company: "AutoDrive Technologies", role: "Director of IT", text: "The DevOps transformation SRS Infoway delivered reduced our deployment time from 4 days to 2 hours. Our development velocity increased by 5x, making us more competitive in the EV space." },
  { name: "Sophia Laurent", company: "TelcoNext Communications", role: "Chief Digital Officer", text: "From legacy monoliths to microservices—SRS Infoway's digital transformation strategy positioned us perfectly for 5G scale. Our customer experience scores improved by 34%." },
  { name: "Richard Thompson", company: "SecureShield Insurance", role: "SVP Technology", text: "Their managed services platform reduced our infrastructure costs by 40% while improving security posture. We now sleep soundly knowing experts are managing 24/7 compliance monitoring." },
  { name: "Henrik Larsson", company: "ManufactPro Industries", role: "Head of IT", text: "SRS Infoway's talent solutions helped us build a world-class engineering team across 3 continents. Their consultants brought expertise that accelerated our Industry 4.0 initiatives by 18 months." },
];

const clientLogos = ["GlobalBank Corp", "MedLife Health Systems", "AutoDrive Technologies", "TelcoNext Communications", "SecureShield Insurance", "ManufactPro Industries", "FinServ Global", "CloudFirst Enterprises", "DataStream Analytics", "RetailEdge Inc", "EnergyTech Solutions", "AeroDynamics Corp"];

export default function ClientsPage() {
  return (
    <>
      <section className="bg-primary">
        <div className="max-w-7xl mx-auto px-8 py-20">
          <div className="max-w-3xl">
            <div className="text-accent text-sm font-semibold uppercase tracking-widest mb-4">Our Clients</div>
            <h1 className="text-5xl md:text-6xl font-light text-white leading-tight">
              Trusted by<br /><span className="font-semibold">Industry Leaders</span>
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-accent to-gold mt-8 mb-8 rounded-full" />
            <p className="text-xl text-gray-400 leading-relaxed">
              From Fortune 500 enterprises to high-growth innovators, our clients trust us to deliver technology solutions that drive real business outcomes.
            </p>
          </div>
        </div>
      </section>

      {/* Client logos grid */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {clientLogos.map((c, i) => (
              <div key={i} className="bg-surface rounded-xl p-5 flex items-center justify-center h-20 border border-gray-100 hover:shadow-md transition-shadow">
                <span className="text-sm font-semibold text-gray-400 text-center">{c}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-surface">
        <div className="max-w-7xl mx-auto px-8 py-20">
          <div className="text-teal text-sm font-semibold uppercase tracking-widest mb-4">Client Testimonials</div>
          <h2 className="text-4xl font-light text-primary mb-12">What Our Clients Say</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-xl p-8 border border-gray-100 card-hover">
                <Quote size={24} className="text-accent/30 mb-4" />
                <p className="text-gray-600 leading-relaxed mb-6 text-sm">{t.text}</p>
                <div className="flex items-center gap-1 mb-4">
                  {[1,2,3,4,5].map((s) => <Star key={s} size={14} className="text-gold fill-gold" />)}
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <div className="font-semibold text-primary text-sm">{t.name}</div>
                  <div className="text-xs text-gray-400">{t.role} - {t.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries served */}
      <section className="bg-primary-dark">
        <div className="max-w-7xl mx-auto px-8 py-16 text-center">
          <h3 className="text-2xl font-light text-white mb-4">Serving industries that power the global economy</h3>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {["Financial Services", "Telecom", "Manufacturing", "Healthcare", "Insurance", "Automotive"].map((ind, i) => (
              <span key={i} className="px-5 py-2 border border-white/20 text-white/70 rounded-full text-sm hover:border-accent hover:text-accent transition-colors cursor-pointer">{ind}</span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
