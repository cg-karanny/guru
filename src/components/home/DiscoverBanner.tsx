import React from 'react';
import Link from 'next/link';
import styles from './DiscoverBanner.module.css';

export default function DiscoverBanner() {
  return (
    <section className={styles.section} aria-label="Discover Cushion Guru">
      <div className={styles.overlay} />
      <div className={`container ${styles.content}`}>
        <span className={styles.eyebrow}>Explore Our Collection</span>
        <h2>Discover Now</h2>
        <p>Create Your Custom Cushion</p>
        <Link href="/customize" className="btn btn-accent btn-lg">Start Customizing</Link>
      </div>
    </section>
  );
}
