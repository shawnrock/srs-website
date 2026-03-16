import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";

export const metadata = { title: "Insights & Blog | SRS Infoway" };

const featuredPost = {
  tag: "Featured Report",
  title: "The CIO's Playbook: Scaling AI Across the Enterprise in 2026",
  desc: "Why 70% of enterprise AI projects fail to scale — and the 5 strategies leaders use to beat the odds.",
  date: "Mar 12, 2026",
  readTime: "12 min",
  color: "bg-primary"
};

const posts = [
  { tag: "AI & Automation", title: "Agentic AI: From Copilots to Autonomous Enterprise Workflows", desc: "How autonomous AI agents are transforming business processes and enabling decision-making at scale.", date: "Mar 10, 2026", readTime: "8 min", color: "bg-primary" },
  { tag: "Cloud Strategy", title: "Multi-Cloud vs. Hybrid Cloud: Making the Right Architecture Decision", desc: "A technical deep dive into architecture patterns, cost optimization, and vendor lock-in strategies.", date: "Mar 8, 2026", readTime: "6 min", color: "bg-teal-dark" },
  { tag: "Digital Transformation", title: "The True Cost of Technical Debt — And How to Pay It Down", desc: "Understanding hidden costs of legacy systems and building a business case for modernization.", date: "Mar 5, 2026", readTime: "7 min", color: "bg-accent" },
  { tag: "DevOps", title: "Platform Engineering: Why Every Enterprise Needs an Internal Developer Platform", desc: "Reducing cognitive load on developers and accelerating time-to-market with self-service platforms.", date: "Feb 28, 2026", readTime: "5 min", color: "bg-primary-light" },
  { tag: "Talent Strategy", title: "Building a Global Talent Pipeline in the Age of AI", desc: "Strategies for recruiting and retaining top engineering talent in a competitive market.", date: "Feb 22, 2026", readTime: "6 min", color: "bg-teal" },
  { tag: "Managed Services", title: "From Reactive to Predictive: AIOps and the Future of IT Operations", desc: "Implementing AI-driven operations to reduce MTTR, prevent incidents, and optimize infrastructure.", date: "Feb 15, 2026", readTime: "7 min", color: "bg-primary" },
];

export default function BlogPage() {
  return (
    <>
      <section className="bg-primary">
        <div className="max-w-7xl mx-auto px-8 py-20">
          <div className="max-w-3xl">
            <div className="text-accent text-sm font-semibold uppercase tracking-widest mb-4">Insights</div>
            <h1 className="text-5xl md:text-6xl font-light text-white leading-tight">
              Insights &<br /><span className="font-semibold">Perspectives</span>
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-accent to-gold mt-8 mb-8 rounded-full" />
            <p className="text-xl text-gray-400 leading-relaxed">
              Expert analysis on AI, cloud, digital transformation, and the future of enterprise technology.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-8 py-20">
          {/* Featured post */}
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            <div className={`${featuredPost.color} rounded-2xl h-80 flex items-end p-8`}>
              <span className="text-white/60 text-xs font-semibold uppercase tracking-widest">{featuredPost.tag}</span>
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-teal text-sm font-semibold uppercase tracking-widest mb-3">Featured</span>
              <h2 className="text-3xl font-semibold text-primary leading-snug mb-4">{featuredPost.title}</h2>
              <p className="text-gray-500 leading-relaxed mb-4">{featuredPost.desc}</p>
              <div className="flex items-center gap-4 text-xs text-gray-400 mb-6">
                <span>{featuredPost.date}</span>
                <span className="flex items-center gap-1"><Clock size={12} /> {featuredPost.readTime} read</span>
              </div>
              <Link href="/contact" className="text-accent font-semibold text-sm flex items-center gap-2 hover:gap-3 transition-all">
                Read Article <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, i) => (
              <Link key={i} href="/contact" className="group card-hover block">
                <div className={`${post.color} rounded-t-xl h-44 flex items-end p-5`}>
                  <span className="text-white/60 text-xs font-semibold uppercase tracking-widest">{post.tag}</span>
                </div>
                <div className="bg-surface-alt rounded-b-xl p-6 border border-t-0 border-gray-100">
                  <h3 className="text-lg font-semibold text-primary leading-snug mb-2 group-hover:text-accent transition-colors">{post.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-3">{post.desc}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>{post.date}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {post.readTime}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
