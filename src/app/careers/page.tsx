"use client";
import Link from "next/link";
import { useState } from "react";
import { Search, MapPin, Clock, Briefcase, ArrowRight, Filter, ChevronDown } from "lucide-react";

const jobs = [
  { id: 1, title: "Senior AI/ML Engineer", location: "Chennai, India", type: "Full-time", department: "AI & Automation", experience: "5-8 years", posted: "2 days ago" },
  { id: 2, title: "Cloud Solutions Architect", location: "Princeton, USA", type: "Full-time", department: "Cloud & Data", experience: "8-12 years", posted: "1 week ago" },
  { id: 3, title: "DevOps Platform Engineer", location: "Remote", type: "Full-time", department: "DevOps & Automation", experience: "6-10 years", posted: "3 days ago" },
  { id: 4, title: "Digital Transformation Consultant", location: "London, UK", type: "Full-time", department: "Digital Transformation", experience: "7-12 years", posted: "5 days ago" },
  { id: 5, title: "Full Stack Developer (React/Node)", location: "Bangalore, India", type: "Full-time", department: "Engineering", experience: "4-7 years", posted: "1 day ago" },
  { id: 6, title: "Data Engineering Lead", location: "Singapore", type: "Full-time", department: "Cloud & Data", experience: "8-12 years", posted: "4 days ago" },
  { id: 7, title: "Technical Recruiter", location: "Chennai, India", type: "Full-time", department: "Global Talent Solutions", experience: "3-6 years", posted: "2 days ago" },
  { id: 8, title: "Site Reliability Engineer (SRE)", location: "Toronto, Canada", type: "Full-time", department: "Managed Services", experience: "5-9 years", posted: "6 days ago" },
  { id: 9, title: "GenAI Solutions Architect", location: "Remote", type: "Full-time", department: "AI & Automation", experience: "7-11 years", posted: "1 week ago" },
];

const departments = ["All", "Engineering", "AI & Automation", "Cloud & Data", "DevOps & Automation", "Digital Transformation", "Global Talent Solutions", "Managed Services"];
const locations = ["All Locations", "Chennai, India", "Bangalore, India", "Princeton, USA", "London, UK", "Singapore", "Toronto, Canada", "Remote"];

export default function CareersPage() {
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("All");
  const [loc, setLoc] = useState("All Locations");

  const filtered = jobs.filter((j) => {
    const matchSearch = j.title.toLowerCase().includes(search.toLowerCase());
    const matchDept = dept === "All" || j.department === dept;
    const matchLoc = loc === "All Locations" || j.location === loc;
    return matchSearch && matchDept && matchLoc;
  });

  return (
    <>
      {/* Hero */}
      <section className="bg-primary">
        <div className="max-w-7xl mx-auto px-8 py-20">
          <div className="max-w-3xl">
            <div className="text-accent text-sm font-semibold uppercase tracking-widest mb-4">Careers</div>
            <h1 className="text-5xl md:text-6xl font-light text-white leading-tight">
              Build What's<br /><span className="font-semibold">Next</span>
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-accent to-gold mt-8 mb-8 rounded-full" />
            <p className="text-xl text-gray-400 leading-relaxed">
              Join a global team of engineers, consultants, and strategists solving the hardest problems in enterprise technology.
            </p>
          </div>
        </div>
      </section>

      {/* AI Interview Platform callout */}
      <section className="bg-accent/5 border-b border-accent/20">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-bold">AI</span>
              </div>
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-primary">Are you a recruiter?</span>{" "}
                Try our AI Interview Platform — automated video interviews with real-time proctoring and instant scoring.
              </p>
            </div>
            <Link href="/ai-interview" className="shrink-0 px-4 py-2 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-accent-dark transition-colors">
              Launch AI Interviews →
            </Link>
          </div>
        </div>
      </section>

      {/* Search & Filter - ATS style */}
      <section className="bg-white border-b border-gray-200 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-8 py-5">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs by title, skill, or keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>
            <div className="relative">
              <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                className="pl-9 pr-8 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent appearance-none bg-white"
              >
                {departments.map((d) => <option key={d}>{d}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={loc}
                onChange={(e) => setLoc(e.target.value)}
                className="pl-9 pr-8 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent appearance-none bg-white"
              >
                {locations.map((l) => <option key={l}>{l}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* Job Listings */}
      <section className="bg-surface">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="flex items-center justify-between mb-8">
            <p className="text-sm text-gray-500">{filtered.length} positions found</p>
            <Link href="/careers/apply" className="px-6 py-2.5 bg-accent text-white text-sm font-semibold rounded hover:bg-accent-dark transition-colors">
              Submit Your Resume
            </Link>
          </div>

          <div className="space-y-4">
            {filtered.map((job) => (
              <div key={job.id} className="bg-white rounded-xl p-6 border border-gray-100 hover:border-accent/30 hover:shadow-md transition-all group cursor-pointer">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-primary group-hover:text-accent transition-colors">{job.title}</h3>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
                      <span className="flex items-center gap-1"><Briefcase size={14} /> {job.type}</span>
                      <span className="flex items-center gap-1"><Clock size={14} /> {job.experience}</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <span className="px-3 py-1 bg-surface text-xs font-medium text-primary rounded-full">{job.department}</span>
                      <span className="px-3 py-1 bg-surface text-xs text-gray-500 rounded-full">{job.posted}</span>
                    </div>
                  </div>
                  <Link href="/careers/apply" className="px-6 py-2.5 border-2 border-accent text-accent text-sm font-semibold rounded hover:bg-accent hover:text-white transition-all whitespace-nowrap">
                    Apply Now
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No positions match your search criteria.</p>
              <button onClick={() => { setSearch(""); setDept("All"); setLoc("All Locations"); }} className="mt-4 text-accent font-semibold text-sm">
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Life at SRS */}
      <section id="life" className="bg-white">
        <div className="max-w-7xl mx-auto px-8 py-20">
          <div className="text-teal text-sm font-semibold uppercase tracking-widest mb-4">Life at SRS Infoway</div>
          <h2 className="text-4xl font-light text-primary mb-12">Why Join Us?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Global Impact", desc: "Work with Fortune 500 clients across 40+ countries." },
              { title: "Cutting-Edge Tech", desc: "Build with AI, cloud-native, and next-gen architectures." },
              { title: "Career Growth", desc: "Clear growth paths, certifications, and mentorship programs." },
              { title: "Flexible Work", desc: "Remote-first culture with offices across 5 continents." },
            ].map((b, i) => (
              <div key={i} className="bg-surface rounded-xl p-6 border border-gray-100">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <div className="w-3 h-3 bg-accent rounded-full" />
                </div>
                <h3 className="font-semibold text-primary mb-2">{b.title}</h3>
                <p className="text-sm text-gray-500">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
