import React from 'react';
import styles from './WhyUpgrade.module.css';

const REASONS = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="36" height="36">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
      </svg>
    ),
    title: 'Precision-Fit Technology',
    text: 'Odd shape? No problem. We review every dimension to ensure your custom window seat or bench cushion fits perfectly. No guessing, just results.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="36" height="36">
        <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
      </svg>
    ),
    title: 'Luxury Hospitality Standards',
    text: 'Every cushion we create reflects the same premium quality trusted by top hotels and resorts worldwide. Exceptional durability, refined detailing, and long-lasting.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="36" height="36">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: 'Weather-Proof Performance',
    text: 'We use Sunbrella® performance fabrics. Fade-resistant, mold-resistant, and bleach-cleanable. Built to withstand the harsh sun and rain.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="36" height="36">
        <path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
      </svg>
    ),
    title: 'Direct-to-Consumer Savings',
    text: 'Stop paying 400% markups at local upholstery shops. Get luxury custom cushions delivered directly from our factory to your door.',
  },
];

export default function WhyUpgrade() {
  return (
    <section className={`section-padding ${styles.section}`} aria-labelledby="why-title">
      <div className="container">
        <div className="section-title">
          <span className="eyebrow">Why Choose Us</span>
          <h2 id="why-title">Why Homeowners Upgrade to Cushion Guru</h2>
          <div className="divider" />
        </div>
        <div className={styles.grid}>
          {REASONS.map((r, i) => (
            <article key={i} className={styles.card}>
              <div className={styles.iconWrap}>{r.icon}</div>
              <h3>{r.title}</h3>
              <p>{r.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
