import type { Metadata } from 'next';
import styles from './privacy.module.css';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Cushion Guru Privacy Policy — how we collect, use, and protect your personal information.',
};

const SECTIONS = [
  {
    title: '1. Information We Collect',
    items: [
      { label: 'Personal Information', text: 'When you visit our Site or use our services, we may collect personal information such as your name, email address, mailing address, phone number, and payment information.' },
      { label: 'Order Information', text: 'When you make a purchase, we collect information related to your order, including the products you purchase, shipping information, and billing information.' },
      { label: 'Customization Preferences', text: 'If you choose to customize your cushion covers, we may collect information about your customization preferences, including fabric choices, colors, and design specifications.' },
      { label: 'Communications', text: 'When you communicate with us, we may collect information related to those communications, including content and attachments.' },
      { label: 'Usage Information', text: 'We collect information about how you interact with our Site, including your IP address, browser type, device information, and pages visited.' },
    ],
  },
  {
    title: '2. How We Use Your Information',
    text: 'We may use the information we collect to: fulfill and manage orders; customize and personalize your shopping experience; communicate with you about your orders; provide customer support; improve our products, services, and Site; send you marketing communications (unless opted out); and comply with legal obligations.',
  },
  {
    title: '3. Information Sharing',
    text: 'We may share your information with service providers, business partners (such as Sunbrella), for legal compliance, and in business transfers. We do not sell your personal information.',
  },
  {
    title: '4. Data Security',
    text: 'We implement reasonable security measures to protect your personal information from unauthorized access, use, or disclosure. However, no method of transmission over the internet is completely secure.',
  },
  {
    title: '5. Your Choices',
    text: 'You may opt out of marketing communications by following the unsubscribe instructions in those communications or contacting us directly. You may also access or update your personal information by logging into your account.',
  },
  {
    title: '6. Children\'s Privacy',
    text: 'Our Site and services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children under 18.',
  },
  {
    title: '7. Changes to This Privacy Policy',
    text: 'We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the updated Privacy Policy on our Site.',
  },
  {
    title: '8. Contact Us',
    text: 'If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us at contact@cushionguru.com.',
  },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <section className={styles.hero}>
        <div className="container text-center">
          <h1>Privacy Policy</h1>
          <p>We are committed to protecting the privacy and security of your personal information.</p>
        </div>
      </section>
      <section className={`section-padding ${styles.section}`}>
        <div className="container-narrow">
          <div className={styles.intro}>
            By accessing or using our Site and services, you agree to the terms of this Privacy Policy.
          </div>
          {SECTIONS.map((s, i) => (
            <div key={i} className={styles.policySection}>
              <h2>{s.title}</h2>
              {s.text && <p>{s.text}</p>}
              {s.items && (
                <ul className={styles.list}>
                  {s.items.map((item, j) => (
                    <li key={j}>
                      <strong>{item.label}:</strong> {item.text}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
