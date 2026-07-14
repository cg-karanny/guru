import React from 'react';
import styles from './FeatureBanner.module.css';

const FEATURES = [
  { icon: '', label: 'Free Shipping Worldwide' },
  { icon: '', label: 'Guaranteed Perfect Fit' },
  { icon: '', label: 'Factory Direct Pricing' },
  { icon: '', label: 'Fast Turnaround' },
];

export default function FeatureBanner() {
  return (
    <div id="below-hero" className={styles.banner}>
      <div className="container">
        <div className={styles.grid}>
          {FEATURES.map((f, i) => (
            <div key={i} className={styles.item}>
              <span className={styles.icon} aria-hidden="true">{f.icon}</span>
              <span className={styles.label}>{f.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
