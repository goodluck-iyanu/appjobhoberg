'use client'

import Link from 'next/link'
import { ArrowLeft, ShieldCheck, Printer, FileText } from '@/components/icons'

export default function TermsOfServicePage() {
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

        {/* Terms Document Card */}
        <div className="bg-white border border-[#d2d2d7]/80 rounded-3xl p-6 sm:p-12 shadow-sm print:border-none print:shadow-none print:p-0">
          {/* Header */}
          <div className="border-b border-gray-100 pb-8 mb-8">
            <div className="inline-flex items-center gap-2 bg-red-50 text-[#e02424] border border-red-100 text-[12px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4">
              <FileText className="w-3.5 h-3.5" />
              <span>Official Agreement</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1d1d1f] mb-3">
              Terms of Service
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
              <h2 className="text-[20px] font-bold text-[#1d1d1f] mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing, browsing, registering for, or using the Hoberg Jobs website (https://jobs.hoberg.com.ng) and related services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree with any part of these terms, you must immediately discontinue use of the platform.
              </p>
            </section>

            <section>
              <h2 className="text-[20px] font-bold text-[#1d1d1f] mb-3">2. Description of Service</h2>
              <p>
                Hoberg Jobs is an online remote job discovery and curation platform developed and operated by Hoberg Digital Agency. The platform aggregates, indexes, and organizes legitimate remote job vacancies from international hiring platforms, partner job feeds, verified recruiters, and employer submission portals.
              </p>
            </section>

            <section>
              <h2 className="text-[20px] font-bold text-[#1d1d1f] mb-3">3. Disclaimer of Employment &amp; Hiring Decisions</h2>
              <div className="bg-[#fafafc] border-l-4 border-[#e02424] p-4 rounded-r-2xl my-3 text-[14px] leading-relaxed">
                <p className="font-semibold text-[#1d1d1f]">
                  IMPORTANT LEGAL NOTICE REGARDING JOB PLACEMENT:
                </p>
                <p className="mt-1 text-[#1d1d1f]/85">
                  Hoberg Jobs is an independent directory and informational service provider. Hoberg Digital Agency is not an employment agency, headhunter, or employer of the listings presented. We do not guarantee job interviews, offers, placements, compensation packages, or employment outcomes. All hiring evaluations, application reviews, and final contract decisions remain solely and exclusively at the discretion of the respective hiring companies.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-[20px] font-bold text-[#1d1d1f] mb-3">4. User Accounts and Authentication</h2>
              <p>
                Users may browse public job listings without registration. To access personalized features (such as saving jobs, tracking application statuses, or managing career profiles), users authenticate via Google OAuth. You agree to provide accurate information and are responsible for maintaining the security of your Google credentials.
              </p>
            </section>

            <section>
              <h2 className="text-[20px] font-bold text-[#1d1d1f] mb-3">5. Hoberg Premium &amp; Paystack Billing</h2>
              <p>
                We offer optional paid membership tiers (&quot;Hoberg Premium&quot;) providing curated high-compensation feeds, application insights, and profile badges.
              </p>
              <ul className="list-disc pl-5 mt-3 space-y-2 text-[#1d1d1f]/85">
                <li>
                  <strong className="text-[#1d1d1f]">Billing Partner:</strong> All payments are processed in Nigerian Naira (NGN) securely through Paystack Payments Limited.
                </li>
                <li>
                  <strong className="text-[#1d1d1f]">Pricing &amp; Discounts:</strong> Standard pricing is ₦5,000 per month. Users qualifying for the Founding Member promotion receive the discounted rate of ₦4,000 per month.
                </li>
                <li>
                  <strong className="text-[#1d1d1f]">Cancellation:</strong> You may cancel or discontinue your subscription at any time via your account settings. Subscriptions remain active until the end of the current paid billing cycle.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-[20px] font-bold text-[#1d1d1f] mb-3">6. Acceptable Use and Platform Conduct</h2>
              <p>When utilizing Hoberg Jobs, you agree not to:</p>
              <ul className="list-disc pl-5 mt-3 space-y-2 text-[#1d1d1f]/85">
                <li>Use automated bots, scrapers, crawlers, or extraction scripts to harvest data without prior written authorization.</li>
                <li>Misrepresent your identity, qualifications, or credentials when submitting profile details.</li>
                <li>Attempt to bypass security features, compromise server integrity, or interfere with other users&apos; access.</li>
                <li>Post or transmit malicious, defamatory, or unlawful material through the platform.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[20px] font-bold text-[#1d1d1f] mb-3">7. Third-Party Links and External Content</h2>
              <p>
                Our platform provides external hyperlinks to independent employer websites and application forms. Hoberg Digital Agency does not control, endorse, or assume responsibility for the content, privacy policies, practices, or availability of third-party websites. You access external links entirely at your own discretion.
              </p>
            </section>

            <section>
              <h2 className="text-[20px] font-bold text-[#1d1d1f] mb-3">8. Intellectual Property</h2>
              <p>
                All platform software, user interface design, logos, graphics, brand assets, and proprietary content are the exclusive intellectual property of Hoberg Digital Agency and are protected by international copyright and trademark laws. Third-party company names, trademarks, and logos displayed on job postings remain the property of their respective owners.
              </p>
            </section>

            <section>
              <h2 className="text-[20px] font-bold text-[#1d1d1f] mb-3">9. Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by applicable law, Hoberg Digital Agency, its directors, employees, affiliates, and partners shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of, or inability to use, the platform or services.
              </p>
            </section>

            <section>
              <h2 className="text-[20px] font-bold text-[#1d1d1f] mb-3">10. Governing Law &amp; Jurisdiction</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria, without regard to its conflict of law principles. Any legal disputes arising under this agreement shall be subject to the exclusive jurisdiction of the competent courts in Nigeria.
              </p>
            </section>

            <section>
              <h2 className="text-[20px] font-bold text-[#1d1d1f] mb-3">11. Inquiries &amp; Legal Notices</h2>
              <p>For any legal notices, questions, or clarification regarding these Terms of Service, please contact:</p>
              <div className="bg-[#f5f5f7] border border-[#d2d2d7]/70 rounded-2xl p-5 mt-4 space-y-1 text-[14px]">
                <p><strong className="text-[#1d1d1f]">Entity:</strong> Hoberg Digital Agency</p>
                <p><strong className="text-[#1d1d1f]">Corporate Domain:</strong> https://hoberg.com.ng</p>
                <p><strong className="text-[#1d1d1f]">Jobs Platform:</strong> https://jobs.hoberg.com.ng</p>
                <p><strong className="text-[#1d1d1f]">Email:</strong> legal@hoberg.com.ng &bull; support@hoberg.com.ng</p>
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

