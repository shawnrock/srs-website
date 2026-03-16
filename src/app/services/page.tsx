import Link from "next/link";
import { ArrowRight, Users, BarChart3, Brain, RefreshCw, GitBranch, Headphones } from "lucide-react";

export const metadata = { title: "Services | SRS Infoway" };

const services = [
  {
    id: "ai",
    icon: Brain,
    title: "Artificial Intelligence",
    desc: "We design and deploy enterprise AI systems that turn data into competitive advantage — from predictive analytics and natural language processing to computer vision, generative AI, and intelligent process automation. Our AI engineers work alongside your teams to build models that scale, with governance and explainability built in.",
    features: ["Predictive Analytics & ML Ops", "Natural Language Processing & Conversational AI", "Computer Vision & Document Intelligence", "Generative AI & LLM Integration"],
  },
  {
    id: "cloud",
    icon: BarChart3,
    title: "Cloud & Data",
    desc: "We architect, migrate, and optimize multi-cloud environments on AWS, Azure, and GCP — building modern data platforms that unify your data estate, enable real-time analytics, and power AI workloads at scale.",
    features: ["Cloud Migration & Modernization", "Data Lake & Warehouse Architecture", "Real-Time Analytics & BI Dashboards", "Cloud-Native Application Development"],
  },
  {
    id: "digital",
    icon: RefreshCw,
    title: "Digital Transformation",
    desc: "We help enterprises reimagine how they operate — modernizing legacy systems, redesigning customer journeys, building agile operating models, and digitizing end-to-end business processes for speed, efficiency, and resilience.",
    features: ["Legacy System Modernization", "Customer Experience Redesign", "Agile & DevSecOps Operating Models", "Business Process Digitization"],
  },
  {
    id: "devops",
    icon: GitBranch,
    title: "DevOps & Automation",
    desc: "We build the engineering backbone that lets your teams ship faster and break less — CI/CD pipelines, infrastructure-as-code, Kubernetes orchestration, automated testing, and AIOps that reduce toil and accelerate time-to-market.",
    features: ["CI/CD Pipeline Architecture", "Infrastructure as Code (Terraform, Pulumi)", "Kubernetes & Container Orchestration", "AIOps & Intelligent Monitoring"],
  },
  {
    id: "staffing",
    icon: Users,
    title: "Global Talent Solutions",
    desc: "Powered by our Ampstek global network across 40+ countries, we deliver elite technology talent at scale — contract, permanent, RPO, managed teams, and workforce consulting that keeps your projects staffed and moving.",
    features: ["Contract & Permanent Staffing", "Recruitment Process Outsourcing (RPO)", "Managed Teams & Offshore Delivery", "Workforce Strategy & Planning"],
  },
  {
    id: "managed",
    icon: Headphones,
    title: "Managed Services",
    desc: "We run your IT so you can run your business — 24/7 operations, proactive monitoring, L1–L3 support, application management, and SLA-driven service delivery that reduces costs and improves reliability.",
    features: ["24/7 IT Operations & NOC", "L1–L3 Help Desk & Incident Management", "Application Management Services", "SLA-Driven Delivery & Reporting"],
  },
];

export default function ServicesPage() {
  return (
    <>
      <section className="bg-primary">
        <div className="max-w-7xl mx-auto px-8 py-20">
          <div className="max-w-3xl">
            <div className="text-accent text-sm font-semibold uppercase tracking-widest mb-4">What We Do</div>
            <h1 className="text-5xl md:text-6xl font-light text-white leading-tight">
              Technology Services That<br /><span className="font-semibold">Drive Real Outcomes</span>
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-accent to-gold mt-8 mb-8 rounded-full" />
            <p className="text-xl text-gray-400 leading-relaxed">
              From strategy to execution, we deliver end-to-end technology services that help enterprises modernize, innovate, and scale — across every layer of your technology stack.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-8 py-20">
          <div className="space-y-20">
            {services.map((s, i) => (
              <div key={s.id} id={s.id} className="grid lg:grid-cols-2 gap-16 items-center">
                <div className={i % 2 === 1 ? "order-2 lg:order-1" : ""}>
                  <div className="bg-gradient-to-br from-primary to-teal rounded-2xl h-72 flex items-center justify-center">
                    <s.icon size={64} className="text-white/20" />
                  </div>
                </div>
                <div className={i % 2 === 1 ? "order-1 lg:order-2" : ""}>
                  <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mb-5">
                    <s.icon size={26} className="text-accent" />
                  </div>
                  <h2 className="text-3xl font-semibold text-primary mb-4">{s.title}</h2>
                  <p className="text-gray-500 leading-relaxed mb-6">{s.desc}</p>
                  <ul className="space-y-2 mb-6">
                    {s.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-accent rounded-full shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/contact" className="text-accent font-semibold text-sm flex items-center gap-2 hover:gap-3 transition-all">
                    Get Started <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
