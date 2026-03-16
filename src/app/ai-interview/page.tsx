import Link from 'next/link';
import { Brain, Shield, Video, BarChart3, CheckCircle, ArrowRight, Users, Clock, Star } from 'lucide-react';

export const metadata = { title: 'AI Interview Platform | SRS Infoway' };

export default function AIInterviewPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-primary">
        <div className="max-w-7xl mx-auto px-8 py-20">
          <div className="max-w-3xl">
            <div className="text-accent text-sm font-semibold uppercase tracking-widest mb-4">AI-Powered Hiring</div>
            <h1 className="text-5xl md:text-6xl font-light text-white leading-tight">
              Intelligent<br /><span className="font-semibold">AI Interviews</span>
            </h1>
            <p className="text-xl text-gray-300 mt-6 max-w-2xl leading-relaxed">
              Transform your hiring process with AI-powered video interviews featuring real-time proctoring, automated evaluation, and instant candidate scoring.
            </p>
            <div className="w-32 h-1 bg-gradient-to-r from-accent to-gold mt-8 mb-10 rounded-full" />
            <div className="flex flex-wrap gap-4">
              <Link href="/ai-interview/login" className="px-8 py-4 bg-accent text-white font-semibold rounded-lg hover:bg-accent-dark transition-colors flex items-center gap-2">
                Start Interviewing <ArrowRight size={18} />
              </Link>
              <Link href="/contact" className="px-8 py-4 border border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors">
                Request Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-accent">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-white text-center">
            {[
              { value: '10x', label: 'Faster Screening' },
              { value: '95%', label: 'Detection Accuracy' },
              { value: '60%', label: 'Cost Reduction' },
              { value: '40+', label: 'Countries Served' },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-8 py-20">
          <div className="text-center mb-16">
            <div className="text-accent text-sm font-semibold uppercase tracking-widest mb-4">Platform Features</div>
            <h2 className="text-4xl font-light text-primary">Everything You Need to <span className="font-semibold">Hire Smarter</span></h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Brain, title: 'AI Question Generation', desc: 'Gemini AI generates tailored interview questions based on JD and candidate resume, ensuring relevant and challenging assessments.' },
              { icon: Video, title: 'HD Video Interviews', desc: 'Integrated Daily.co video conferencing with crystal-clear HD quality. Candidates and interviewers connect seamlessly.' },
              { icon: Shield, title: 'Real-time Proctoring', desc: 'MediaPipe face detection monitors gaze direction, multiple faces, tab switching, and camera-off events throughout the interview.' },
              { icon: BarChart3, title: 'Instant AI Scoring', desc: 'Post-interview AI evaluation scores technical depth, communication, confidence, and keyword coverage across all answers.' },
              { icon: Users, title: 'Interviewer Dashboard', desc: 'Live interviewer dashboard showing real-time transcripts, proctor alerts, and candidate video — all in one view.' },
              { icon: Star, title: 'Comprehensive Reports', desc: 'Detailed candidate reports with section scores, strengths, weaknesses, and hire/no-hire recommendations.' },
            ].map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="p-6 bg-surface rounded-xl border border-gray-100 hover:border-accent/30 transition-colors">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
                  <Icon size={24} className="text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-surface">
        <div className="max-w-7xl mx-auto px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-primary">How It <span className="font-semibold">Works</span></h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Create Interview', desc: 'Upload JD and candidate resume. AI generates tailored questions.' },
              { step: '02', title: 'Send Invite', desc: 'Candidate receives a unique interview link with one-click access.' },
              { step: '03', title: 'Live Interview', desc: 'Video interview with real-time AI proctoring and transcript capture.' },
              { step: '04', title: 'Get Report', desc: 'Instant AI evaluation report with scores and hire recommendation.' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white text-xl font-bold">{item.step}</div>
                <h3 className="font-semibold text-primary mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary">
        <div className="max-w-7xl mx-auto px-8 py-16 text-center">
          <h2 className="text-3xl font-semibold text-white mb-4">Ready to Transform Your Hiring?</h2>
          <p className="text-gray-300 mb-8">Join thousands of recruiters using SRS AI Interviews to find top talent faster.</p>
          <Link href="/ai-interview/login" className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-white font-semibold rounded-lg hover:bg-accent-dark transition-colors">
            Get Started Free <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
