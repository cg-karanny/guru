import type { Metadata } from 'next';
import styles from './faq.module.css';
import FAQAccordion from './FAQAccordion';
import Newsletter from '@/components/home/Newsletter';
import { getManagedPageContent } from '@/lib/pageContent';
import { pageContentDefaults } from '@/lib/pageContentDefaults';

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getManagedPageContent('faq', pageContentDefaults.faq);
  return { title: seo.metaTitle, description: seo.metaDescription, category: seo.category, keywords: [...seo.tags] };
}

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

export default async function FAQPage() {
  const content = await getManagedPageContent('faq', pageContentDefaults.faq);
  const dynamicJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: content.faqs.map(item => ({
      '@type': 'Question', name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(dynamicJsonLd) }}
      />
      <section className={styles.hero}>
        <div className="container text-center">
          <h1>{content.title}</h1>
          <p>{content.subtitle}</p>
        </div>
      </section>
      <section className={`section-padding ${styles.section}`}>
        <div className="container-narrow">
          <FAQAccordion faqs={content.faqs} />
        </div>
      </section>
      <Newsletter />
    </>
  );
}
