"use client";
import { useState, useRef } from "react";
import { Upload, CheckCircle, User, Mail, Phone, Briefcase, FileText } from "lucide-react";

export default function ApplyPage() {
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "", position: "",
    experience: "", resume: null as File | null, coverLetter: "", linkedin: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <section className="bg-surface min-h-[70vh] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-8">
          <div className="w-20 h-20 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-teal" />
          </div>
          <h2 className="text-3xl font-semibold text-primary mb-4">Application Submitted!</h2>
          <p className="text-gray-500 leading-relaxed mb-8">
            Thank you for your interest in SRS Infoway. Our talent acquisition team will review your application and reach out within 3-5 business days.
          </p>
          <div className="bg-white rounded-xl p-6 border border-gray-100 text-left mb-6">
            <div className="text-xs text-teal font-semibold uppercase tracking-widest mb-3">Application ID</div>
            <div className="text-lg font-mono text-primary">SRS-2026-{Math.floor(Math.random() * 9000 + 1000)}</div>
          </div>
          <a href="/careers" className="text-accent font-semibold text-sm hover:underline">Back to Careers</a>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="bg-primary">
        <div className="max-w-7xl mx-auto px-8 py-16">
          <div className="text-accent text-sm font-semibold uppercase tracking-widest mb-4">ATS Portal</div>
          <h1 className="text-4xl md:text-5xl font-light text-white">Submit Your Application</h1>
          <div className="w-24 h-1 bg-gradient-to-r from-accent to-gold mt-6 rounded-full" />
        </div>
      </section>

      <section className="bg-surface">
        <div className="max-w-3xl mx-auto px-8 py-12">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Info */}
            <div className="bg-white rounded-xl p-8 border border-gray-100">
              <h3 className="text-lg font-semibold text-primary mb-6 flex items-center gap-2"><User size={20} className="text-accent" /> Personal Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">First Name *</label>
                  <input type="text" required value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Last Name *</label>
                  <input type="text" required value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Email *</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Phone *</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="tel" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent" />
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-600 mb-1.5">LinkedIn Profile</label>
                <input type="url" placeholder="https://linkedin.com/in/yourprofile" value={formData.linkedin} onChange={(e) => setFormData({...formData, linkedin: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent" />
              </div>
            </div>

            {/* Professional Info */}
            <div className="bg-white rounded-xl p-8 border border-gray-100">
              <h3 className="text-lg font-semibold text-primary mb-6 flex items-center gap-2"><Briefcase size={20} className="text-accent" /> Professional Details</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Position Applying For *</label>
                  <select required value={formData.position} onChange={(e) => setFormData({...formData, position: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent appearance-none bg-white">
                    <option value="">Select a position</option>
                    <option>Senior SAP Consultant</option>
                    <option>Java Full Stack Developer</option>
                    <option>Cloud Architect - AWS</option>
                    <option>Business Analyst - BFSI</option>
                    <option>Data Engineer</option>
                    <option>Project Manager</option>
                    <option>React.js Developer</option>
                    <option>Oracle DBA</option>
                    <option>DevOps Engineer</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Years of Experience *</label>
                  <select required value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent appearance-none bg-white">
                    <option value="">Select experience</option>
                    <option>0-2 years</option>
                    <option>3-5 years</option>
                    <option>5-8 years</option>
                    <option>8-12 years</option>
                    <option>12+ years</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Resume Upload */}
            <div className="bg-white rounded-xl p-8 border border-gray-100">
              <h3 className="text-lg font-semibold text-primary mb-6 flex items-center gap-2"><FileText size={20} className="text-accent" /> Documents</h3>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-accent transition-colors cursor-pointer">
                <Upload size={32} className="text-gray-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-primary">Upload your resume</p>
                <p className="text-xs text-gray-400 mt-1">PDF, DOC, or DOCX (Max 5MB)</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => { if (e.target.files?.[0]) setFormData({...formData, resume: e.target.files[0]}); }}
                />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-4 px-6 py-2 border border-accent text-accent text-sm font-semibold rounded hover:bg-accent hover:text-white transition-all">
                  {formData.resume ? formData.resume.name : "Choose File"}
                </button>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Cover Letter (Optional)</label>
                <textarea rows={4} placeholder="Tell us why you're a great fit for this role..."
                  value={formData.coverLetter} onChange={(e) => setFormData({...formData, coverLetter: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none" />
              </div>
            </div>

            <button type="submit" className="w-full py-4 bg-accent text-white font-semibold rounded-lg hover:bg-accent-dark transition-colors text-sm tracking-wide">
              Submit Application
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
