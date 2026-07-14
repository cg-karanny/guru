import React from 'react';
import Link from 'next/link';
import styles from './ReadyBanner.module.css';

export default function ReadyBanner() {
  return (
    <section className={styles.section} aria-label="CTA banner">
      <div className="container">
        <div className={styles.inner}>
          <div className={styles.text}>
            <h2>Ready to Transform Your Living Space?</h2>
            <p>Don&rsquo;t live with flat, faded cushions another season. Get your custom cushion in seconds!</p>
          </div>
          <Link href="/customize" className="btn btn-accent btn-lg" style={{ marginTop: '1rem', border: '1px solid black' }}>Customize Now</Link>
        </div>
      </div>
    </section>
  );
}
