"use client";
import { useState } from "react";
import Link from "next/link";
import { MapPin, Phone, Mail, CheckCircle, Send } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <section className="bg-surface min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-8">
          <div className="w-20 h-20 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-teal" />
          </div>
          <h2 className="text-3xl font-semibold text-primary mb-4">Message Sent!</h2>
          <p className="text-gray-500 leading-relaxed">Thank you for reaching out. Our team will respond within 24 hours.</p>
          <button onClick={() => setSubmitted(false)} className="mt-6 text-accent font-semibold text-sm hover:underline">Send another message</button>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="bg-primary">
        <div className="max-w-7xl mx-auto px-8 py-20">
          <div className="max-w-3xl">
            <div className="text-accent text-sm font-semibold uppercase tracking-widest mb-4">Get in Touch</div>
            <h1 className="text-5xl md:text-6xl font-light text-white leading-tight">
              Let&apos;s Build<br /><span className="font-semibold">Something Extraordinary</span>
            </h1>
            <p className="text-lg text-gray-200 mt-6 max-w-2xl">Whether you need AI strategy, cloud architecture, or elite technology talent — our team is ready to help.</p>
            <div className="w-32 h-1 bg-gradient-to-r from-accent to-gold mt-8 rounded-full" />
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-8 py-20">
          <div className="grid lg:grid-cols-5 gap-16">
            {/* Contact info */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-semibold text-primary mb-8">Global Offices</h2>
              <div className="space-y-6">
                {[
                  { icon: MapPin, label: "Global Headquarters", value: "1st Floor, Unit 1 & 2, TEK TOWER, No. 11, Old Mahabalipuram Road, Okkiyam Thuraipakkam, Chennai - 600096, India", phone: "+91-824-831-0402" },
                  { icon: MapPin, label: "North America", value: "Princeton, New Jersey, USA", phone: "" },
                  { icon: MapPin, label: "Europe", value: "London, United Kingdom", phone: "" },
                  { icon: Mail, label: "Email", value: "contact@srsinfoway.com", phone: "" },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-12 h-12 bg-surface rounded-xl flex items-center justify-center shrink-0">
                      <item.icon size={20} className="text-accent" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{item.label}</div>
                      <div className="text-sm text-primary">{item.value}</div>
                      {item.phone && <div className="text-sm text-gray-500 mt-1">{item.phone}</div>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Map placeholder */}
              <div className="mt-10 bg-surface rounded-xl h-48 flex items-center justify-center border border-gray-100">
                <div className="text-center">
                  <MapPin size={32} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Global presence across 40+ countries</p>
                </div>
              </div>
            </div>

            {/* Contact form */}
            <div className="lg:col-span-3">
              <div className="bg-surface rounded-2xl p-8 border border-gray-100">
                <h2 className="text-2xl font-semibold text-primary mb-2">Send us a message</h2>
                <p className="text-sm text-gray-500 mb-8">Fill out the form and our team will get back to you within 24 hours.</p>

                <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">First Name *</label>
                      <input type="text" required className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">Last Name *</label>
                      <input type="text" required className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent" />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">Email *</label>
                      <input type="email" required className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">Phone</label>
                      <input type="tel" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Subject *</label>
                    <select required className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent appearance-none">
                      <option value="">Select a subject</option>
                      <option value="ai-automation">AI & Automation</option>
                      <option value="cloud-data">Cloud & Data</option>
                      <option value="digital-transformation">Digital Transformation</option>
                      <option value="devops-automation">DevOps & Automation</option>
                      <option value="global-talent">Global Talent Solutions</option>
                      <option value="managed-services">Managed Services</option>
                      <option value="partnership">Partnership Inquiry</option>
                      <option value="general">General Inquiry</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Message *</label>
                    <textarea rows={5} required placeholder="Tell us about your project or requirements..."
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none" />
                  </div>
                  <button type="submit" className="px-8 py-3.5 bg-accent text-white font-semibold rounded-lg hover:bg-accent-dark transition-colors text-sm flex items-center gap-2">
                    Send Message <Send size={16} />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface">
        <div className="max-w-7xl mx-auto px-8 py-16">
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-primary mb-8">Trusted by 5,000+ enterprises across 40+ countries</h3>
            <div className="flex flex-wrap justify-center gap-8">
              <Link href="/services" className="text-accent font-semibold hover:underline">Explore Services</Link>
              <Link href="/case-studies" className="text-accent font-semibold hover:underline">View Case Studies</Link>
              <Link href="/careers" className="text-accent font-semibold hover:underline">Find Opportunities</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
