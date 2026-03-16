import Link from "next/link";
import { ArrowRight, Building2, Heart, Factory, Wifi, Shield, Car, TrendingUp, Globe, Clock, Award } from "lucide-react";

export const metadata = { title: "Industries | SRS Infoway" };

const industries = [
  {
    id: "bfsi",
    icon: Building2,
    name: "Banking & Financial Services",
    headline: "Modernize core banking, automate compliance, and deliver hyper-personalized digital experiences.",
    desc: "We help financial institutions reduce risk, improve operational efficiency, and accelerate digital-first strategies. Our solutions empower banks and fintech companies to stay competitive in an increasingly digital landscape.",
    useCases: ["Core banking modernization", "Regulatory compliance automation", "Fraud detection with AI", "Digital lending platforms"],
    color: "from-primary to-primary-light"
  },
  {
    id: "healthcare",
    icon: Heart,
    name: "Healthcare & Life Sciences",
    headline: "Transform patient care with AI diagnostics, interoperable health data platforms, and regulatory-compliant digital solutions.",
    desc: "We enable healthcare providers and life sciences organizations to improve patient outcomes while reducing costs. Our solutions integrate seamlessly with existing systems and comply with stringent healthcare regulations.",
    useCases: ["EHR/EMR integration", "AI-powered diagnostics", "Clinical trial automation", "Telehealth platforms"],
    color: "from-teal to-teal-dark"
  },
  {
    id: "manufacturing",
    icon: Factory,
    name: "Manufacturing",
    headline: "Drive smart factory initiatives with IoT, predictive maintenance, supply chain optimization, and Industry 4.0 solutions.",
    desc: "We help manufacturers increase throughput and reduce downtime through connected, intelligent operations. Our platform leverages real-time data analytics and advanced automation to optimize production and minimize waste.",
    useCases: ["Predictive maintenance", "Supply chain visibility", "Digital twin technology", "Quality automation"],
    color: "from-accent to-accent-dark"
  },
  {
    id: "telecom",
    icon: Wifi,
    name: "Telecom & Media",
    headline: "Enable next-gen connectivity with network modernization, 5G infrastructure, customer experience platforms, and AI-driven network optimization.",
    desc: "We partner with telecom and media companies to modernize their infrastructure and enhance customer experiences. Our solutions support rapid technology evolution while maintaining operational excellence.",
    useCases: ["5G network deployment", "Customer churn prediction", "Network performance AI", "OSS/BSS modernization"],
    color: "from-primary-light to-teal"
  },
  {
    id: "insurance",
    icon: Shield,
    name: "Insurance",
    headline: "Accelerate claims processing, underwriting automation, and fraud detection with AI-powered platforms.",
    desc: "We help insurers improve policyholder experience and reduce loss ratios through intelligent automation and data-driven decision-making. Our solutions streamline complex operations and enable faster time-to-market for new products.",
    useCases: ["Automated claims processing", "Underwriting AI", "Fraud detection", "Digital policyholder portals"],
    color: "from-gold to-accent"
  },
  {
    id: "automotive",
    icon: Car,
    name: "Automotive & Mobility",
    headline: "Power connected vehicles, autonomous driving platforms, and smart mobility solutions with edge computing, AI, and cloud-native architectures.",
    desc: "We enable automotive manufacturers and mobility service providers to deliver next-generation solutions that transform transportation. Our expertise spans connected vehicles, autonomous technologies, and sustainable mobility ecosystems.",
    useCases: ["Connected vehicle platforms", "ADAS & autonomous driving", "EV charging networks", "Smart mobility apps"],
    color: "from-primary to-teal"
  },
];

const stats = [
  { icon: TrendingUp, value: "5000+", label: "Clients Worldwide" },
  { icon: Globe, value: "40+", label: "Countries Served" },
  { icon: Clock, value: "15+", label: "Years of Expertise" },
  { icon: Award, value: "6", label: "Industries Served" },
];

export default function IndustriesPage() {
  return (
    <>
      <section className="bg-primary">
        <div className="max-w-7xl mx-auto px-8 py-20">
          <div className="max-w-3xl">
            <div className="text-accent text-sm font-semibold uppercase tracking-widest mb-4">Industries</div>
            <h1 className="text-5xl md:text-6xl font-light text-white leading-tight">
              Deep Industry Expertise<br /><span className="font-semibold">Tailored Solutions</span>
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-accent to-gold mt-8 mb-8 rounded-full" />
            <p className="text-xl text-gray-400 leading-relaxed">
              We combine deep domain knowledge with cutting-edge technology to solve the unique challenges of each industry we serve.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-8 py-20">
          <div className="grid md:grid-cols-2 gap-8">
            {industries.map((ind) => (
              <div key={ind.id} id={ind.id} className="group card-hover">
                <div className={`bg-gradient-to-br ${ind.color} rounded-t-xl h-48 flex items-center justify-center`}>
                  <ind.icon size={56} className="text-white/30 group-hover:text-white/60 transition-colors" />
                </div>
                <div className="bg-surface rounded-b-xl p-8 border border-t-0 border-gray-100">
                  <h3 className="text-2xl font-semibold text-primary mb-2 group-hover:text-accent transition-colors">{ind.name}</h3>
                  <p className="text-base font-medium text-gray-700 leading-relaxed mb-4">{ind.headline}</p>
                  <p className="text-sm text-gray-600 leading-relaxed mb-6">{ind.desc}</p>

                  <div className="mb-6 border-t pt-6">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Use Cases</p>
                    <ul className="space-y-2">
                      {ind.useCases.map((useCase, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-accent font-bold mt-0.5">•</span>
                          <span>{useCase}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link href="/contact" className="text-accent text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                    Learn More <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">Why SRS Infoway</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-accent to-gold mx-auto rounded-full" />
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-white rounded-xl p-8 text-center shadow-sm hover:shadow-md transition-shadow">
                <stat.icon size={40} className="text-accent mx-auto mb-4" />
                <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <p className="text-gray-600 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
