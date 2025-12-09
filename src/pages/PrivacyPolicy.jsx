import React from 'react';
import { motion } from 'framer-motion';

export default function PrivacyPolicy() {
  const sections = [
    {
      title: "Introduction",
      content: `OnTrak Solutions LLC ("we," "us," or "our") respects your privacy and is committed to protecting your personal information. This Privacy Policy describes how we collect, use, disclose, and safeguard your information when you visit our website, use our services, or interact with us in any way.\n\nThis policy applies to information collected through our website, mobile applications, and any other electronic communications. By using our services, you consent to the data practices described in this policy.`
    },
    {
      title: "Information We Collect",
      subsections: [
        {
          subtitle: "Personal Information You Provide",
          content: `We may collect personal information that you voluntarily provide to us, including:\n\n• Contact Information: Name, email address, phone number, mailing address\n• Business Information: Business name, industry, time in business, business structure\n• Financial Information: Bank statements, revenue information, credit information\n• Identity Verification: Social Security Number, driver's license, government-issued ID\n• Application Data: Information provided in funding applications\n• Communication Records: Records of communications with us`
        },
        {
          subtitle: "Information Collected Automatically",
          content: `When you visit our website, we may automatically collect:\n\n• IP address and device identifiers\n• Browser type and version\n• Pages visited and time spent on our site\n• Referring website addresses\n• Cookies and similar tracking technologies\n• Location data (with your consent)`
        },
        {
          subtitle: "Information from Third Parties",
          content: `We may receive information about you from:\n\n• Credit reporting agencies\n• Business partners and referral sources\n• Public records and databases\n• Social media platforms\n• Marketing and analytics providers`
        }
      ]
    },
    {
      title: "How We Use Your Information",
      content: `We use your information for the following purposes:\n\nBusiness Operations:\n• Processing funding applications and making credit decisions\n• Providing customer service and support\n• Communicating about your account and our services\n• Conducting business transactions\n• Managing risk and preventing fraud\n\nMarketing and Communications:\n• Sending promotional materials and newsletters\n• Personalizing your experience with our services\n• Conducting market research and analysis\n• Improving our website and services\n\nLegal and Compliance:\n• Complying with applicable laws and regulations\n• Responding to legal requests and court orders\n• Protecting our rights and interests\n• Ensuring security and preventing misuse`
    },
    {
      title: "How We Share Your Information",
      content: `We may share your information in the following circumstances:\n\nService Providers:\nWe may share information with third-party service providers who perform services on our behalf, including payment processors, credit reporting agencies, technology providers, and marketing services.\n\nBusiness Partners:\nWe may share information with business partners for joint marketing activities or referral programs, with your consent.\n\nLegal Requirements:\nWe may disclose information when required by law, to comply with legal processes, respond to government requests, protect our rights, or prevent fraud.\n\nBusiness Transfers:\nIn the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.`
    },
    {
      title: "Your Privacy Rights",
      content: `Depending on your location, you may have certain rights regarding your personal information:\n\nGeneral Rights:\n• Access: Request information about the personal data we have about you\n• Correction: Request correction of inaccurate or incomplete information\n• Deletion: Request deletion of your personal information (subject to legal requirements)\n• Opt-Out: Opt out of marketing communications\n\nCalifornia Residents (CCPA/CPRA):\n• Right to know what personal information is collected and how it's used\n• Right to delete personal information\n• Right to opt-out of the sale or sharing of personal information\n• Right to correct inaccurate personal information\n• Right to limit use of sensitive personal information\n• Right to non-discrimination for exercising your rights\n\nOther State Residents:\nResidents of Virginia, Colorado, Connecticut, Utah, Iowa, Delaware, New Hampshire, New Jersey, and other states with comprehensive privacy laws may have similar rights.`
    },
    {
      title: "How to Exercise Your Rights",
      content: `To exercise your privacy rights, you may:\n\n• Email us at info@ontrak.co\n• Call us at (302) 520-5200\n• Submit a request through our contact form\n\nWe will respond to your request within the timeframe required by applicable law, typically within 30-45 days.`
    },
    {
      title: "Cookies and Tracking Technologies",
      content: `We use cookies and similar tracking technologies to enhance your experience on our website:\n\nTypes of Cookies We Use:\n• Essential Cookies: Necessary for website functionality\n• Analytics Cookies: Help us understand how visitors use our site\n• Marketing Cookies: Used to deliver relevant advertisements\n• Preference Cookies: Remember your settings and preferences\n\nManaging Cookies:\nYou can control cookies through your browser settings. Note that disabling certain cookies may affect website functionality.`
    },
    {
      title: "Data Security",
      content: `We implement appropriate technical and organizational measures to protect your personal information, including:\n\n• Encryption of data in transit and at rest\n• Access controls and authentication procedures\n• Regular security assessments and updates\n• Employee training on data protection\n• Secure data centers and infrastructure\n\nWhile we strive to protect your information, no method of transmission or storage is 100% secure. We cannot guarantee absolute security.`
    },
    {
      title: "Data Retention",
      content: `We retain your personal information for as long as necessary to:\n\n• Provide our services to you\n• Comply with legal and regulatory requirements\n• Resolve disputes and enforce agreements\n• Maintain business records as required by law\n\nWhen information is no longer needed, we securely delete or anonymize it in accordance with our data retention policy.`
    },
    {
      title: "International Data Transfers",
      content: `Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place for such transfers, including standard contractual clauses, adequacy decisions by relevant authorities, and certification schemes.`
    },
    {
      title: "Children's Privacy",
      content: `Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from children under 18. If we learn that we have collected information from a child under 18, we will delete it promptly.`
    },
    {
      title: "Third-Party Links",
      content: `Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to review the privacy policies of any third-party sites you visit.`
    },
    {
      title: "Changes to This Privacy Policy",
      content: `We may update this Privacy Policy from time to time. When we make changes, we will:\n\n• Post the updated policy on our website\n• Update the "Last Updated" date\n• Notify you of significant changes via email or website notice\n\nYour continued use of our services after changes become effective constitutes acceptance of the updated policy.`
    },
    {
      title: "Contact Us",
      content: `If you have questions about this Privacy Policy or our privacy practices, please contact us:\n\nOnTrak Solutions LLC\nPrivacy Officer\nEmail: info@ontrak.co\nPhone: (302) 520-5200`
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-[#08708E] via-[#065a72] to-slate-900 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl text-white/70">
              Last Updated: December 1, 2025
            </p>
          </motion.div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" className="w-full">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H0Z" fill="#f8fafc"/>
          </svg>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {sections.map((section, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl p-6 shadow-sm"
              >
                <h2 className="text-lg font-semibold text-[#08708E] mb-3">{section.title}</h2>
                {section.content && (
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{section.content}</p>
                )}
                {section.subsections && (
                  <div className="space-y-4 mt-4">
                    {section.subsections.map((subsection, subIndex) => (
                      <div key={subIndex}>
                        <h3 className="text-sm font-semibold text-slate-800 mb-2">{subsection.subtitle}</h3>
                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{subsection.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-2xl p-6 shadow-sm border-t-4 border-slate-200"
            >
              <p className="text-sm text-slate-500 italic">
                Important Notice: This Privacy Policy is provided for informational purposes and should be reviewed by qualified legal counsel to ensure compliance with applicable laws and regulations in your jurisdiction.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}