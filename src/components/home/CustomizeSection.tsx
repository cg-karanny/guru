'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './CustomizeSection.module.css';
import EditableMedia from '@/components/EditableMedia/EditableMedia';

const TYPES = ['Indoor', 'Outdoor', 'Boat', 'RV', 'Pet'];

export default function CustomizeSection() {
  const [typeIdx, setTypeIdx] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setTypeIdx(i => (i + 1) % TYPES.length);
        setFade(true);
      }, 300);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className={`section-padding ${styles.section}`} aria-labelledby="customize-title">
      <div className="container">
        <div className={styles.grid}>
          {/* Image */}
          <div className={styles.imageSide}>
            <EditableMedia
              mediaKey="home_customize_section"
              alt="Custom shaped pet bed cushion perfectly tailored for comfort"
              type="image"
              className={`img-placeholder ${styles.img}`}
              defaultComponent={
                <div className={styles.imgLabel}>🐾 Calming round pet bed for dogs and cats</div>
              }
            />
            <div className={styles.imgBadge}>
              {/* <span>🌟</span> */}
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 512 512"><path d="M252 12c-5 .9-9.2 3.4-12.6 7.2-1.6 1.9-18.1 34.2-36.7 71.9l-33.9 68.5-74.6 10.8c-41.1 5.9-76.5 11.3-78.7 11.9-5.7 1.6-12.7 8.9-14.4 15-1.5 5.3-1 12.1 1.3 16.6.9 1.6 26.6 27.3 57.2 57.2 49.8 48.6 55.5 54.5 55.1 56.8-.3 1.4-2.7 14.9-5.2 30-5.1 29.6-5.1 31.2.1 33.1 3.3 1.3 7.2.3 8.9-2.4.7-1.1 3.8-16.7 6.9-34.5 4.6-26.9 5.3-32.7 4.3-34.6-.7-1.2-26.5-26.9-57.5-57-33.1-32.3-56.5-55.8-56.9-57.2-.7-3.2 1.1-7.1 3.9-8.3 2.1-.8 30.2-5 124.3-18.5 23.3-3.4 32.7-5.1 34.4-6.4 1.7-1.1 13.8-24.7 37-71.9 19-38.6 35.4-70.9 36.3-71.8 2.2-2.2 7.4-2.2 9.6 0 .9.9 17.3 33.2 36.3 71.8 23.5 47.7 35.3 70.7 37 71.9 1.8 1.3 21.4 4.5 79.4 12.8 42.4 6.1 78 11.6 79.3 12.1 2.8 1.2 4.6 5.1 3.8 8.3-.3 1.4-23.5 24.8-56.8 57.2-31 30.1-56.8 55.8-57.5 57-1 1.9 1 15.1 12.2 80.6 7.4 43.1 13.2 79.1 13 80-.9 2.8-4.4 5.2-7.2 5.1-1.6-.1-29.8-14.3-63.8-32.2-73.8-39-77.9-41-80.7-41-1.3 0-33.6 16.5-71.8 36.6s-70.7 36.6-72.2 36.6c-2.9.1-5.3-1.4-6.9-4.4-.7-1.2.7-11.2 4.6-34.5 3.1-17.9 5.4-33.7 5-35-.3-1.4-2-3-3.9-3.9-3-1.5-3.5-1.5-6.4 0-1.7.9-3.3 2.4-3.6 3.3-.3 1-3 16.4-6.1 34.3-6.1 35.5-6.2 38.1-1.6 44.9 5.5 8.2 15 12.1 24 9.7 2.5-.7 34.7-17.1 71.5-36.4 36.8-19.4 67.3-35.2 67.7-35.2s30.8 15.8 67.6 35.2c36.7 19.3 69 35.7 71.6 36.4 11.8 3.2 23.7-4.3 26.7-16.5 1-4.4.1-10.8-11.5-78.7-7-40.7-12.9-75.1-13.2-76.5-.4-2.2 5.4-8.3 55.1-56.8 30.6-29.9 56.3-55.6 57.2-57.2 2.3-4.5 2.8-11.3 1.3-16.6-1.8-6.4-8.7-13.5-14.9-15.1-2.5-.7-21.6-3.7-42.5-6.7s-54.3-7.8-74.2-10.7l-36.2-5.3-33.8-68.4c-18.6-37.7-35.1-70-36.7-71.9-5.1-5.8-13.1-8.6-20.6-7.2" /></svg>
              <div>
                <strong>100% Custom</strong>
                <p>Made to your exact specs</p>
              </div>
            </div>
          </div>

          {/* Text */}
          <div className={styles.textSide}>
            <span className="badge">Customization</span>
            <h2 id="customize-title">
              Customize your{' '}
              <span className={`${styles.dynamic} ${fade ? styles.visible : styles.hidden}`}>
                {TYPES[typeIdx]}
              </span>{' '}
              Cushion Covers
            </h2>
            <p>
              Cushion Guru offers complete freedom to customize cushion covers that reflect your personal style and the way you live.
              From precise sizing and premium fabrics to carefully selected colors and designs, every detail is chosen by you and crafted
              with intention. Whether enhancing a living space, refining a bedroom, or creating a thoughtful, made-to-order piece, Cushion Guru
              makes customization effortless—transforming your vision into beautifully tailored comfort.
            </p>
            <div className={styles.stats}>
              {[['500+', 'Fabric Options'], ['99%', 'Satisfaction Rate'], ['3-4wks', 'Avg. Delivery']].map(([num, lbl]) => (
                <div key={lbl} className={styles.stat}>
                  <strong>{num}</strong>
                  <span>{lbl}</span>
                </div>
              ))}
            </div>
            <Link href="/customize" className={`btn btn-primary btn-lg ${styles.ctaBtn}`}>
              Customize Now
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
