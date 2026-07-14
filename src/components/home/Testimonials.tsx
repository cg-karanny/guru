'use client';

import React, { useState } from 'react';
import styles from './Testimonials.module.css';

const REVIEWS = [
  { name: 'Robert H.', loc: 'Austin, TX', rating: 5, text: 'I saved over $500 by going factory-direct with Cushion Guru instead of using a local shop. The 3-week turnaround was exactly as promised. Don\'t waste your money elsewhere.' },
  { name: 'David L.', loc: 'Scottsdale, AZ', rating: 5, text: 'Finally, a company that gets it right. The replacement cushions for our patio set are much thicker and more comfortable than the originals. The water-resistant quality is a game-changer for our poolside lounge.' },
  { name: 'Linda K.', loc: 'Chicago, IL', rating: 5, text: 'We had a very long, narrow window seat that needed a custom touch. The ordering process was so simple, and the foam density is perfect—firm enough to sit on but soft enough to read for hours. It\'s now the favorite spot in our house.' },
  { name: 'Michelle W.', loc: 'New York, NY', rating: 5, text: 'Beautiful craftsmanship! The Indoor cushion covers added such a sophisticated touch to our living room. You can really feel the quality of the fabric compared to big-box store alternatives.' },
  { name: 'Sarah M.', loc: 'Palm Beach, FL', rating: 5, text: 'I was hesitant to order custom cushions online, but Cushion Guru exceeded my expectations. We live in Florida, and the Sunbrella fabric has held up beautifully against the intense sun and afternoon rain. They still look brand new after a full season!' },
];

export default function Testimonials() {
  const [active, setActive] = useState(0);

  return (
    <section className={`section-padding ${styles.section}`} aria-labelledby="testimonials-title">
      <div className="container">
        <div className="section-title">
          <span className="eyebrow">Reviews</span>
          <h2 id="testimonials-title">What Our Customers Are Saying</h2>
          <div className="divider" />
        </div>

        <div className={styles.grid}>
          {REVIEWS.map((r, i) => (
            <article key={i} className={`${styles.card} ${i === active ? styles.featured : ''}`} onClick={() => setActive(i)}>
              <div className={styles.stars}>
                {Array.from({ length: r.rating }).map((_, j) => (
                  <svg key={j} viewBox="0 0 24 24" fill="#d4a855" width="16" height="16"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                ))}
              </div>
              <p className={styles.text}>&ldquo;{r.text}&rdquo;</p>
              <div className={styles.author}>
                <div className={styles.avatar}>{r.name[0]}</div>
                <div>
                  <strong>{r.name}</strong>
                  <span>{r.loc}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className={styles.dots}>
          {REVIEWS.map((_, i) => (
            <button key={i} className={`${styles.dot} ${i === active ? styles.dotActive : ''}`} onClick={() => setActive(i)} aria-label={`Review ${i+1}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
