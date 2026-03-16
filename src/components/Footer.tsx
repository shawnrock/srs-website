import Link from "next/link";
import Logo from "./Logo";
import { MapPin, Phone, Mail, Linkedin, Facebook, Twitter, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer>
      {/* Teal CTA section - TEKsystems style */}
      <div className="bg-teal">
        <div className="max-w-7xl mx-auto px-8 py-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="text-3xl md:text-4xl font-light text-white leading-tight">IT and Business Services</h3>
            <p className="text-white/80 mt-3 text-lg max-w-xl">
              Your business demands align with our technology expertise. Partner with us, and we will design and execute outcome-based solutions.
            </p>
          </div>
          <Link
            href="/services"
            className="px-8 py-3.5 border-2 border-white/60 text-white font-semibold rounded hover:bg-white hover:text-teal transition-all whitespace-nowrap text-sm tracking-wide"
          >
            Explore Our Services
          </Link>
        </div>
      </div>

      {/* Dark navy footer - TEKsystems style */}
      <div className="bg-primary-dark text-white">
        <div className="max-w-7xl mx-auto px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
            {/* Logo + socials */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <Logo variant="light" />
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-sm">
                Global IT solutions provider delivering world-class consulting, AI, cloud, and digital transformation to Fortune 500 companies across 40+ countries on 5 continents.
              </p>
              <div className="flex gap-3">
                {[
                  { Icon: Linkedin, href: "https://www.linkedin.com/company/srs-infoway/posts/?feedView=all" },
                  { Icon: Facebook, href: "#" },
                  { Icon: Twitter, href: "#" },
                  { Icon: Youtube, href: "#" },
                ].map(({ Icon, href }, i) => (
                  <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-accent transition-colors">
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>

            {/* What We Do */}
            <div>
              <h4 className="font-semibold text-sm tracking-wider uppercase mb-6 text-gray-300">What We Do</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link href="/services#ai" className="hover:text-accent transition-colors">Artificial Intelligence</Link></li>
                <li><Link href="/services#cloud" className="hover:text-accent transition-colors">Cloud & Data</Link></li>
                <li><Link href="/services#digital" className="hover:text-accent transition-colors">Digital Transformation</Link></li>
                <li><Link href="/services#devops" className="hover:text-accent transition-colors">DevOps & Automation</Link></li>
                <li><Link href="/services#staffing" className="hover:text-accent transition-colors">Global Talent Solutions</Link></li>
                <li><Link href="/services#managed" className="hover:text-accent transition-colors">Managed Services</Link></li>
              </ul>
            </div>

            {/* Products */}
            <div>
              <h4 className="font-semibold text-sm tracking-wider uppercase mb-6 text-gray-300">Products</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>
                  <Link href="/ai-interview" className="hover:text-accent transition-colors flex items-center gap-2">
                    AI Interview
                    <span className="px-1.5 py-0.5 bg-accent text-white text-[9px] font-bold rounded uppercase tracking-wider">Live</span>
                  </Link>
                </li>
                <li><Link href="/products/talentbridge" className="hover:text-accent transition-colors">TalentBridge</Link></li>
                <li><Link href="/products/cloudiq" className="hover:text-accent transition-colors">CloudIQ</Link></li>
                <li><Link href="/products/transformhub" className="hover:text-accent transition-colors">TransformHub</Link></li>
                <li><Link href="/products/devpulse" className="hover:text-accent transition-colors">DevPulse</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-sm tracking-wider uppercase mb-6 text-gray-300">Company</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link href="/about" className="hover:text-accent transition-colors">About Us</Link></li>
                <li><Link href="/case-studies" className="hover:text-accent transition-colors">Case Studies</Link></li>
                <li><Link href="/blog" className="hover:text-accent transition-colors">Insights</Link></li>
                <li><Link href="/clients" className="hover:text-accent transition-colors">Clients</Link></li>
                <li><Link href="/careers" className="hover:text-accent transition-colors">Careers</Link></li>
                <li><Link href="/consultant-login" className="hover:text-accent transition-colors">Consultant Portal</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-sm tracking-wider uppercase mb-6 text-gray-300">Get in Touch</h4>
              <ul className="space-y-4 text-sm text-gray-400">
                <li className="flex gap-3">
                  <MapPin size={16} className="text-accent shrink-0 mt-0.5" />
                  <span>1st Floor, Unit 1 & 2, TEK TOWER, No. 11, Old Mahabalipuram Road, Okkiyam Thuraipakkam, Chennai - 600096</span>
                </li>
                <li className="flex gap-3">
                  <Phone size={16} className="text-accent shrink-0" />
                  <a href="tel:+918248310402" className="hover:text-accent transition-colors">+91-824-831-0402</a>
                </li>
                <li className="flex gap-3">
                  <Mail size={16} className="text-accent shrink-0" />
                  <a href="mailto:contact@srsinfoway.com" className="hover:text-accent transition-colors">contact@srsinfoway.com</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <p>&copy; {new Date().getFullYear()} SRS Infoway Inc. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-accent transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-accent transition-colors">Terms of Use</Link>
              <Link href="#" className="hover:text-accent transition-colors">Cookie Notice</Link>
              <Link href="#" className="hover:text-accent transition-colors">Accessibility</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
