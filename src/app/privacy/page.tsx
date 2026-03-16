import Link from "next/link";

export const metadata = { title: "Privacy Policy | SRS Infoway" };

export default function PrivacyPage() {
  return (
    <>
      <section className="bg-primary">
        <div className="max-w-7xl mx-auto px-8 py-20">
          <div className="text-accent text-sm font-semibold uppercase tracking-widest mb-4">Legal</div>
          <h1 className="text-5xl font-light text-white leading-tight">Privacy Policy</h1>
          <p className="text-gray-400 mt-4">Last updated: March 2026</p>
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-4xl mx-auto px-8 py-20 prose prose-gray max-w-none">
          <div className="space-y-10 text-gray-600 leading-relaxed">

            <div>
              <h2 className="text-2xl font-semibold text-primary mb-4">1. Introduction</h2>
              <p>SRS Infoway Inc. ("SRS Infoway", "we", "our", or "us") is committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or engage with our services.</p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-primary mb-4">2. Information We Collect</h2>
              <p className="mb-3">We may collect the following categories of personal information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Contact Information:</strong> Name, email address, phone number, company name, and job title when you fill out forms or contact us.</li>
                <li><strong>Usage Data:</strong> IP address, browser type, pages visited, time spent, and referring URL to help us understand how our website is used.</li>
                <li><strong>Resume & Career Data:</strong> If you apply for a position, we collect information you provide in your application including work history, skills, and references.</li>
                <li><strong>Communication Data:</strong> Records of communications you send to us including emails and support requests.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-primary mb-4">3. How We Use Your Information</h2>
              <p className="mb-3">We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Respond to your inquiries and provide the services you request</li>
                <li>Process job applications and manage recruitment</li>
                <li>Send service updates and marketing communications (with your consent)</li>
                <li>Improve our website and services through analytics</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-primary mb-4">4. Sharing Your Information</h2>
              <p>We do not sell, trade, or rent your personal information to third parties. We may share your information with trusted service providers who assist us in operating our website and conducting our business, subject to confidentiality agreements. We may also disclose information when required by law or to protect the rights and safety of SRS Infoway and others.</p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-primary mb-4">5. Data Retention</h2>
              <p>We retain personal information for as long as necessary to fulfil the purposes described in this policy, unless a longer retention period is required or permitted by law. Job application data is retained for up to 24 months after the position is filled.</p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-primary mb-4">6. Your Rights</h2>
              <p className="mb-3">Depending on your location, you may have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your personal information</li>
                <li>Object to or restrict processing of your data</li>
                <li>Withdraw consent where processing is based on consent</li>
              </ul>
              <p className="mt-3">To exercise any of these rights, please contact us at <a href="mailto:privacy@srsinfoway.com" className="text-accent hover:underline">privacy@srsinfoway.com</a>.</p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-primary mb-4">7. Cookies</h2>
              <p>Our website uses cookies and similar tracking technologies to enhance your browsing experience, analyse site traffic, and personalise content. You can control cookie settings through your browser preferences. Essential cookies required for site functionality cannot be disabled.</p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-primary mb-4">8. Security</h2>
              <p>We implement appropriate technical and organisational measures to protect your personal information against unauthorised access, alteration, disclosure, or destruction. We are ISO 27001 certified, reflecting our commitment to information security.</p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-primary mb-4">9. Contact Us</h2>
              <p>If you have any questions about this Privacy Policy or our data practices, please contact us:</p>
              <div className="mt-4 p-6 bg-surface rounded-xl">
                <p className="font-semibold text-primary">SRS Infoway Inc.</p>
                <p>1st Floor, Unit 1 & 2, TEK TOWER, No. 11, Old Mahabalipuram Road</p>
                <p>Okkiyam Thuraipakkam, Chennai - 600096, India</p>
                <p className="mt-2"><a href="mailto:privacy@srsinfoway.com" className="text-accent hover:underline">privacy@srsinfoway.com</a></p>
              </div>
            </div>

          </div>
        </div>
      </section>

      <section className="bg-surface">
        <div className="max-w-7xl mx-auto px-8 py-12 text-center">
          <p className="text-gray-500 mb-4">Questions about your data? We&apos;re here to help.</p>
          <Link href="/contact" className="px-8 py-3 bg-accent text-white font-semibold rounded hover:bg-accent-dark transition-colors text-sm">
            Contact Us
          </Link>
        </div>
      </section>
    </>
  );
}
