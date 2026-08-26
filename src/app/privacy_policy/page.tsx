'use client'

import Link from 'next/link'
import { ArrowLeft, ShieldCheck, Printer, Download, FileText } from '@/components/icons'

export default function PrivacyPolicyPage() {
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="flex-1 bg-[#f5f5f7] py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Navigation & Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 print:hidden">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[#86868b] hover:text-[#1d1d1f] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Hoberg Jobs</span>
          </Link>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-[#1d1d1f] font-semibold text-[13px] px-4 py-2 rounded-xl border border-[#d2d2d7] shadow-sm transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#e02424]" />
            <span>Download as PDF / Print</span>
          </button>
        </div>

        {/* Policy Document Card */}
        <div className="bg-white border border-[#d2d2d7]/80 rounded-3xl p-6 sm:p-12 shadow-sm print:border-none print:shadow-none print:p-0">
          {/* Header */}
          <div className="border-b border-gray-100 pb-8 mb-8">
            <div className="inline-flex items-center gap-2 bg-red-50 text-[#e02424] border border-red-100 text-[12px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Official Legal Document</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1d1d1f] mb-3">
              Privacy Policy
            </h1>
            <p className="text-[14px] text-[#86868b]">
              Effective Date: January 1, 2025 &bull; Last Revised: August 26, 2026
            </p>
            <p className="text-[14px] text-[#86868b] mt-1">
              Platform: <span className="font-semibold text-[#1d1d1f]">Hoberg Jobs</span> (jobs.hoberg.com.ng) &bull; Operator: <span className="font-semibold text-[#1d1d1f]">Hoberg Digital Agency</span> (hoberg.com.ng)
            </p>
          </div>

          {/* Document Content */}
          <div className="space-y-8 text-[15px] sm:text-[16px] text-[#1d1d1f]/90 leading-relaxed font-normal">
            <section>
              <h2 className="text-[20px] font-bold text-[#1d1d1f] mb-3">1. Overview and Scope</h2>
              <p>
                Hoberg Digital Agency (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) operates Hoberg Jobs (accessible via https://jobs.hoberg.com.ng). This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you access our remote employment platform, aggregate feeds, search tools, and premium advisory services.
              </p>
              <p className="mt-2">
                We are committed to maintaining the highest level of privacy and data security standards in compliance with the Nigeria Data Protection Regulation (NDPR), the General Data Protection Regulation (GDPR), and applicable global privacy statutes.
              </p>
            </section>

            <section>
              <h2 className="text-[20px] font-bold text-[#1d1d1f] mb-3">2. Information We Collect</h2>
              <p>We only collect information necessary to facilitate your remote career discovery and account experience:</p>
              <ul className="list-disc pl-5 mt-3 space-y-2 text-[#1d1d1f]/85">
                <li>
                  <strong className="text-[#1d1d1f]">Account Information:</strong> When you sign in via Google OAuth, we receive your verified name, primary email address, and profile picture avatar as permitted by Google&apos;s authentication service.
                </li>
                <li>
                  <strong className="text-[#1d1d1f]">Career and Profile Data:</strong> Voluntary information you supply in your profile, such as your country of residence, career field, current job title, skills, preferred roles, portfolio link, and LinkedIn profile.
                </li>
                <li>
                  <strong className="text-[#1d1d1f]">Application Records:</strong> Jobs you save, bookmark, or mark as applied within your dashboard to assist you in tracking your career progress.
                </li>
                <li>
                  <strong className="text-[#1d1d1f]">Technical and Analytical Data:</strong> Standard server logs, device type, browser identifiers, IP address, and anonymized referral metrics to maintain platform reliability and protect against fraudulent activity.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-[20px] font-bold text-[#1d1d1f] mb-3">3. How We Use Your Information</h2>
              <p>Your information is used strictly for legitimate business and service delivery purposes, including:</p>
              <ul className="list-disc pl-5 mt-3 space-y-2 text-[#1d1d1f]/85">
                <li>Providing real-time curated remote job search, filtering, and indexing services.</li>
                <li>Authenticating user sessions securely without requiring or storing sensitive passwords.</li>
                <li>Displaying personalized career match recommendations and relevant opportunities.</li>
                <li>Providing customer assistance, billing management, and advisory communications.</li>
                <li>Preventing malicious bot activities, scraping abuse, and cybersecurity threats.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[20px] font-bold text-[#1d1d1f] mb-3">4. Payments and Financial Security</h2>
              <p>
                All premium membership transactions are processed through our authorized payment partner, <strong className="text-[#1d1d1f]">Paystack Payments Limited</strong> (a PCI-DSS Level 1 certified payment gateway).
              </p>
              <p className="mt-2">
                Hoberg Jobs does not process, store, or have access to your credit card numbers, debit card PINs, CVV codes, or bank account credentials. All financial transactions are encrypted end-to-end and handled directly by Paystack.
              </p>
            </section>

            <section>
              <h2 className="text-[20px] font-bold text-[#1d1d1f] mb-3">5. Third-Party Job Listings and Employer Sites</h2>
              <p>
                Hoberg Jobs aggregates and displays verified remote employment listings from legitimate global organizations, partner API networks, and verified recruiters.
              </p>
              <p className="mt-2">
                When you click &quot;Apply on Official Site,&quot; you are directed to the employer&apos;s independent career portal. We encourage you to review the privacy policies of any third-party websites you visit, as Hoberg Digital Agency is not responsible for the data collection practices of external companies.
              </p>
            </section>

            <section>
              <h2 className="text-[20px] font-bold text-[#1d1d1f] mb-3">6. Data Retention and User Rights</h2>
              <p>
                You maintain complete ownership of your personal profile. Under applicable privacy laws, you are entitled to the following rights at any time:
              </p>
              <ul className="list-disc pl-5 mt-3 space-y-2 text-[#1d1d1f]/85">
                <li><strong className="text-[#1d1d1f]">Right to Access:</strong> View all personal data linked to your account directly in your profile dashboard.</li>
                <li><strong className="text-[#1d1d1f]">Right to Rectification:</strong> Edit, update, or modify your profile details at any moment.</li>
                <li><strong className="text-[#1d1d1f]">Right to Erasure (Deletion):</strong> Request full deletion of your profile, account records, and associated data by contacting our data protection team.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[20px] font-bold text-[#1d1d1f] mb-3">7. Information Sharing and Disclosure</h2>
              <p>
                We do not sell, rent, monetize, or trade your personal information with any third-party advertisers or data brokers under any circumstances. We may only disclose data when strictly required by law, valid court subpoenas, or to prevent severe fraudulent misuse of the service.
              </p>
            </section>

            <section>
              <h2 className="text-[20px] font-bold text-[#1d1d1f] mb-3">8. Contact and Inquiries</h2>
              <p>
                If you have questions, feedback, or data requests regarding this Privacy Policy, please contact our legal and support team:
              </p>
              <div className="bg-[#f5f5f7] border border-[#d2d2d7]/70 rounded-2xl p-5 mt-4 space-y-1 text-[14px]">
                <p><strong className="text-[#1d1d1f]">Entity:</strong> Hoberg Digital Agency</p>
                <p><strong className="text-[#1d1d1f]">Official Website:</strong> https://hoberg.com.ng</p>
                <p><strong className="text-[#1d1d1f]">Support Portal:</strong> https://jobs.hoberg.com.ng</p>
                <p><strong className="text-[#1d1d1f]">Email:</strong> support@hoberg.com.ng</p>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Print Specific CSS */}
      <style jsx global>{`
        @media print {
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
          }
          header, footer, button, .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
