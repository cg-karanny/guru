'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './InspireBanner.module.css';

const SPACES = ['home', 'office', 'pet'];

export default function InspireBanner() {
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const t = setInterval(() => {
      setFade(false);
      setTimeout(() => { setIdx(i => (i + 1) % SPACES.length); setFade(true); }, 300);
    }, 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <section className={styles.section} aria-label="Inspire banner">
      <div className={styles.imgBg}>
        <div className={styles.overlay} />
      </div>
      <div className={`container ${styles.content}`}>
        <h2>
          Tailored comfort for your{' '}
          <span className={`${styles.dynamic} ${fade ? styles.visible : styles.hidden}`}>
            {SPACES[idx]}
          </span>
          {' '}space.
        </h2>
        <p className={styles.sub}>Explore our products and inspire yourself to find the right balance for your home.</p>
        <Link href="/shop/indoor" className="btn btn-accent btn-lg">Shop Now</Link>
      </div>
    </section>
  );
}
