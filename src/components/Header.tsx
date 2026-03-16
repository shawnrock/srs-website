"use client";
import { useState } from "react";
import Link from "next/link";
import Logo from "./Logo";
import { Menu, X, ChevronDown, MapPin, Globe, Search } from "lucide-react";

const whatWeDo = [
  { name: "Artificial Intelligence", href: "/services#ai", desc: "ML, NLP & intelligent automation" },
  { name: "Cloud & Data", href: "/services#cloud", desc: "Multi-cloud architecture & analytics" },
  { name: "Digital Transformation", href: "/services#digital", desc: "End-to-end modernization" },
  { name: "DevOps & Automation", href: "/services#devops", desc: "CI/CD & infrastructure as code" },
  { name: "Global Talent Solutions", href: "/services#staffing", desc: "Workforce & staffing across 40+ countries" },
  { name: "Managed Services", href: "/services#managed", desc: "24/7 IT operations & support" },
];

const products = [
  { name: "AI Interview Platform", href: "/ai-interview", desc: "AI-powered video interviews & proctoring", badge: "Live" },
  { name: "TalentBridge", href: "/products/talentbridge", desc: "Global talent & consultant lifecycle management" },
  { name: "CloudIQ", href: "/products/cloudiq", desc: "Cloud cost optimisation & spend analytics" },
  { name: "TransformHub", href: "/products/transformhub", desc: "Digital transformation readiness & roadmaps" },
  { name: "DevPulse", href: "/products/devpulse", desc: "DevOps pipeline analytics & DORA metrics" },
];

const industries = [
  { name: "Banking & Financial Services", href: "/industries#bfsi" },
  { name: "Healthcare", href: "/industries#healthcare" },
  { name: "Manufacturing", href: "/industries#manufacturing" },
  { name: "Telecom", href: "/industries#telecom" },
  { name: "Insurance", href: "/industries#insurance" },
  { name: "Automotive", href: "/industries#automotive" },
];

const careers = [
  { name: "Search Jobs", href: "/careers" },
  { name: "Apply Now", href: "/careers/apply" },
  { name: "Life at SRS Infoway", href: "/careers#life" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      {/* Utility bar - TEKsystems style */}
      <div className="bg-white border-b border-gray-100 hidden lg:block">
        <div className="max-w-7xl mx-auto px-8 flex justify-end items-center h-10 gap-6 text-sm text-gray-500">
          <Link href="/contact" className="flex items-center gap-1.5 hover:text-primary transition-colors">
            <MapPin size={14} /> Locations
          </Link>
          <div className="flex items-center gap-1.5">
            <Globe size={14} />
            <span>IN</span>
            <span className="text-gray-300">English</span>
            <ChevronDown size={12} />
          </div>
          <button onClick={() => setSearchOpen(!searchOpen)} className="hover:text-primary transition-colors">
            <Search size={18} />
          </button>
        </div>
      </div>

      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-primary/95 flex items-start justify-center pt-32">
          <div className="w-full max-w-3xl px-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-white text-2xl font-light">What are you looking for?</h2>
              <button onClick={() => setSearchOpen(false)} className="text-white hover:text-accent transition-colors">
                <X size={28} />
              </button>
            </div>
            <input
              type="text"
              placeholder="Search services, industries, insights..."
              className="w-full bg-transparent border-b-2 border-white/30 text-white text-3xl font-light py-4 focus:outline-none focus:border-accent placeholder-white/40"
              autoFocus
            />
          </div>
        </div>
      )}

      {/* Main navigation - TEKsystems style */}
      <header className="bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between h-20">
          <Link href="/" className="shrink-0">
            <Logo variant="dark" />
          </Link>

          {/* Desktop nav - TEKsystems style with dropdowns */}
          <nav className="hidden lg:flex items-center gap-0">
            {/* What We Do */}
            <div className="relative group">
              <button className="px-5 py-7 text-primary font-semibold text-[15px] flex items-center gap-1.5 border-b-3 border-transparent hover:border-accent transition-colors">
                What We Do <ChevronDown size={15} className="text-gray-400 group-hover:text-accent transition-colors" />
              </button>
              <div className="absolute top-full left-0 pt-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="bg-white shadow-2xl border-t-3 border-accent w-64">
                  <div className="py-3">
                    {whatWeDo.map((s) => (
                      <Link key={s.name} href={s.href} className="block px-6 py-3 text-sm font-medium text-primary hover:bg-surface hover:text-accent transition-colors">
                        {s.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Products */}
            <div className="relative group">
              <button className="px-5 py-7 text-primary font-semibold text-[15px] flex items-center gap-1.5 border-b-3 border-transparent hover:border-accent transition-colors">
                Products <ChevronDown size={15} className="text-gray-400 group-hover:text-accent transition-colors" />
              </button>
              <div className="absolute top-full left-0 pt-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="bg-white shadow-2xl border-t-3 border-accent w-72">
                  <div className="py-3">
                    {products.map((p) => (
                      <Link key={p.name} href={p.href} className="flex items-center justify-between px-6 py-3 text-sm font-medium text-primary hover:bg-surface hover:text-accent transition-colors group/item">
                        <span>{p.name}</span>
                        {p.badge && (
                          <span className="ml-2 px-2 py-0.5 bg-accent text-white text-[10px] font-bold rounded-full uppercase tracking-wider">{p.badge}</span>
                        )}
                      </Link>
                    ))}
                  </div>
                  <div className="border-t border-gray-100 px-6 py-3">
                    <Link href="/ai-interview" className="text-xs text-accent font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                      Explore All Products →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Industries */}
            <div className="relative group">
              <button className="px-5 py-7 text-primary font-semibold text-[15px] flex items-center gap-1.5 border-b-3 border-transparent hover:border-accent transition-colors">
                Industries <ChevronDown size={15} className="text-gray-400 group-hover:text-accent transition-colors" />
              </button>
              <div className="absolute top-full left-0 pt-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="bg-white shadow-2xl border-t-3 border-accent w-72">
                  <div className="py-3">
                    {industries.map((i) => (
                      <Link key={i.name} href={i.href} className="block px-6 py-3 text-sm font-medium text-primary hover:bg-surface hover:text-accent transition-colors">
                        {i.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Insights */}
            <div className="relative group">
              <button className="px-5 py-7 text-primary font-semibold text-[15px] flex items-center gap-1.5 border-b-3 border-transparent hover:border-accent transition-colors">
                Insights <ChevronDown size={15} className="text-gray-400 group-hover:text-accent transition-colors" />
              </button>
              <div className="absolute top-full left-0 pt-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="bg-white shadow-2xl border-t-3 border-accent w-64">
                  <div className="py-3">
                    <Link href="/blog" className="block px-6 py-3 text-sm font-medium text-primary hover:bg-surface hover:text-accent transition-colors">Blog & Articles</Link>
                    <Link href="/case-studies" className="block px-6 py-3 text-sm font-medium text-primary hover:bg-surface hover:text-accent transition-colors">Case Studies</Link>
                    <Link href="/clients" className="block px-6 py-3 text-sm font-medium text-primary hover:bg-surface hover:text-accent transition-colors">Client Success</Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Careers */}
            <div className="relative group">
              <button className="px-5 py-7 text-primary font-semibold text-[15px] flex items-center gap-1.5 border-b-3 border-transparent hover:border-accent transition-colors">
                Careers <ChevronDown size={15} className="text-gray-400 group-hover:text-accent transition-colors" />
              </button>
              <div className="absolute top-full left-0 pt-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="bg-white shadow-2xl border-t-3 border-accent w-64">
                  <div className="py-3">
                    {careers.map((c) => (
                      <Link key={c.name} href={c.href} className="block px-6 py-3 text-sm font-medium text-primary hover:bg-surface hover:text-accent transition-colors">
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Who We Are */}
            <div className="relative group">
              <button className="px-5 py-7 text-primary font-semibold text-[15px] flex items-center gap-1.5 border-b-3 border-transparent hover:border-accent transition-colors">
                Who We Are <ChevronDown size={15} className="text-gray-400 group-hover:text-accent transition-colors" />
              </button>
              <div className="absolute top-full right-0 pt-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="bg-white shadow-2xl border-t-3 border-accent w-64">
                  <div className="py-3">
                    <Link href="/about" className="block px-6 py-3 text-sm font-medium text-primary hover:bg-surface hover:text-accent transition-colors">About SRS Infoway</Link>
                    <Link href="/about#leadership" className="block px-6 py-3 text-sm font-medium text-primary hover:bg-surface hover:text-accent transition-colors">Leadership</Link>
                    <Link href="/about#partners" className="block px-6 py-3 text-sm font-medium text-primary hover:bg-surface hover:text-accent transition-colors">Our Partners</Link>
                    <Link href="/contact" className="block px-6 py-3 text-sm font-medium text-primary hover:bg-surface hover:text-accent transition-colors">Contact Us</Link>
                    <Link href="/consultant-login" className="block px-6 py-3 text-sm font-medium text-primary hover:bg-surface hover:text-accent transition-colors">Consultant Login</Link>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          {/* Desktop CTA */}
          <Link href="/contact" className="hidden lg:inline-flex px-5 py-2.5 bg-accent text-white font-semibold text-sm rounded hover:bg-accent-dark transition-colors">
            Contact Us
          </Link>

          {/* Mobile toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 rounded-lg hover:bg-surface">
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg max-h-[80vh] overflow-y-auto">
            <div className="px-6 py-4 flex flex-col gap-0">
              <Link href="/" onClick={() => setMobileOpen(false)} className="py-4 text-primary font-semibold border-b border-gray-100">Home</Link>
              <Link href="/services" onClick={() => setMobileOpen(false)} className="py-4 text-primary font-semibold border-b border-gray-100">What We Do</Link>
              <Link href="/ai-interview" onClick={() => setMobileOpen(false)} className="py-4 text-primary font-semibold border-b border-gray-100 flex items-center gap-2">
                Products <span className="px-2 py-0.5 bg-accent text-white text-[10px] font-bold rounded-full">New</span>
              </Link>
              <Link href="/industries" onClick={() => setMobileOpen(false)} className="py-4 text-primary font-semibold border-b border-gray-100">Industries</Link>
              <Link href="/blog" onClick={() => setMobileOpen(false)} className="py-4 text-primary font-semibold border-b border-gray-100">Insights</Link>
              <Link href="/careers" onClick={() => setMobileOpen(false)} className="py-4 text-primary font-semibold border-b border-gray-100">Careers</Link>
              <Link href="/about" onClick={() => setMobileOpen(false)} className="py-4 text-primary font-semibold border-b border-gray-100">Who We Are</Link>
              <Link href="/ai-interview" onClick={() => setMobileOpen(false)} className="py-4 text-primary font-semibold border-b border-gray-100">AI Interview</Link>
              <Link href="/consultant-login" onClick={() => setMobileOpen(false)} className="py-4 text-primary font-semibold border-b border-gray-100">Consultant Login</Link>
              <Link href="/contact" onClick={() => setMobileOpen(false)} className="mt-4 px-6 py-3 bg-accent text-white font-semibold rounded text-center">Contact Us</Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
