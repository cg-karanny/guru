import type { Metadata } from 'next';
import styles from './faq.module.css';
import FAQAccordion from './FAQAccordion';
import Newsletter from '@/components/home/Newsletter';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | Custom Cushions | Cushion Guru',
  description: 'Common questions about custom cushions, shipping, measurements, fabrics & materials. Get answers from Cushion Guru experts.',
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How long does it take to receive my custom cushions?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Most custom cushions are shipped within 3-4 weeks of order confirmation. We ensure quality craftsmanship without unnecessary delays."
      }
    },
    {
      "@type": "Question",
      "name": "What fabrics do you offer?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We offer 500+ fabric options including premium Sunbrella® fabrics for outdoor use, luxury interior fabrics, and durable materials for RVs and boats."
      }
    },
    {
      "@type": "Question",
      "name": "How do I know what size to order?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Check our 'How to Measure' guide for step-by-step instructions. Our team also offers free measurement consultation via email."
      }
    },
    {
      "@type": "Question",
      "name": "Is shipping really free?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! We offer completely free worldwide shipping on all custom cushion orders."
      }
    },
    {
      "@type": "Question",
      "name": "What is your return policy?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "If you're not completely satisfied, we offer a 30-day return policy with no questions asked."
      }
    },
    {
      "@type": "Question",
      "name": "Can you make cushions for odd-shaped furniture?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Absolutely! We specialize in custom-shaped cushions. Email us your measurements and photos for a quote."
      }
    },
    {
      "@type": "Question",
      "name": "Do you use Sunbrella fabrics?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, we are proud partners with Sunbrella® and use their premium fabrics for all outdoor cushions."
      }
    }
  ]
};

export default function FAQPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className={styles.hero}>
        <div className="container text-center">
          <h1>Frequently Asked Questions About Custom Cushions</h1>
          <p>Everything you need to know about our custom cushions</p>
        </div>
      </section>
      <section className={`section-padding ${styles.section}`}>
        <div className="container-narrow">
          <FAQAccordion />
        </div>
      </section>
      <Newsletter />
    </>
  );
}
