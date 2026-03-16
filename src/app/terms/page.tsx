import Link from "next/link";

export const metadata = { title: "Terms of Use | SRS Infoway" };

export default function TermsPage() {
  return (
    <>
      <section className="bg-primary">
        <div className="max-w-7xl mx-auto px-8 py-20">
          <div className="text-accent text-sm font-semibold uppercase tracking-widest mb-4">Legal</div>
          <h1 className="text-5xl font-light text-white leading-tight">Terms of Use</h1>
          <p className="text-gray-400 mt-4">Last updated: March 2026</p>
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-4xl mx-auto px-8 py-20">
          <div className="space-y-10 text-gray-600 leading-relaxed">

            <div>
              <h2 className="text-2xl font-semibold text-primary mb-4">1. Acceptance of Terms</h2>
              <p>By accessing and using the SRS Infoway website (srsinfoway.com), you accept and agree to be bound by these Terms of Use and our Privacy Policy. If you do not agree to these terms, please do not use our website.</p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-primary mb-4">2. Use of the Website</h2>
              <p className="mb-3">You agree to use this website only for lawful purposes and in a manner that does not infringe the rights of others. You must not:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use the site in any way that violates applicable local, national, or international laws or regulations</li>
                <li>Transmit unsolicited or unauthorised advertising or promotional material</li>
                <li>Attempt to gain unauthorised access to any part of our website or systems</li>
                <li>Engage in any conduct that restricts or inhibits anyone&apos;s use or enjoyment of the website</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-primary mb-4">3. Intellectual Property</h2>
              <p>All content on this website — including text, graphics, logos, images, and software — is the property of SRS Infoway Inc. and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.</p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-primary mb-4">4. Disclaimer of Warranties</h2>
              <p>This website is provided "as is" without any representations or warranties, express or implied. SRS Infoway makes no representations or warranties regarding the accuracy, completeness, or suitability of the information and materials found on this website.</p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-primary mb-4">5. Limitation of Liability</h2>
              <p>To the maximum extent permitted by law, SRS Infoway shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising out of your use of, or inability to use, this website or its content.</p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-primary mb-4">6. Third-Party Links</h2>
              <p>Our website may contain links to third-party websites. These links are provided for your convenience only. SRS Infoway has no control over the content of those sites and accepts no responsibility for them or for any loss or damage that may arise from your use of them.</p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-primary mb-4">7. Changes to Terms</h2>
              <p>SRS Infoway reserves the right to modify these Terms of Use at any time. Changes will be effective immediately upon posting to the website. Your continued use of the website after any changes constitutes your acceptance of the new terms.</p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-primary mb-4">8. Governing Law</h2>
              <p>These terms shall be governed by and construed in accordance with the laws of India. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts in Chennai, Tamil Nadu, India.</p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-primary mb-4">9. Contact</h2>
              <p>For questions about these Terms of Use, please contact us at <a href="mailto:legal@srsinfoway.com" className="text-accent hover:underline">legal@srsinfoway.com</a> or through our <Link href="/contact" className="text-accent hover:underline">contact page</Link>.</p>
            </div>

          </div>
        </div>
      </section>

      <section className="bg-surface">
        <div className="max-w-7xl mx-auto px-8 py-12 text-center">
          <p className="text-gray-500 mb-4">Have questions about our terms?</p>
          <Link href="/contact" className="px-8 py-3 bg-accent text-white font-semibold rounded hover:bg-accent-dark transition-colors text-sm">
            Contact Us
          </Link>
        </div>
      </section>
    </>
  );
}
