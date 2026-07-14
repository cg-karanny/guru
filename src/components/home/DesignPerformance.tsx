import React from 'react';
import styles from './DesignPerformance.module.css';
import EditableMedia from '@/components/EditableMedia/EditableMedia';

const BADGES = [
  { image: 'https://customcushion-upload-bucket-123.s3.us-east-1.amazonaws.com/sunbrellapageicons/stain-resistant_1_-100x100.webp', label: 'WATER & STAIN RESISTANT' },
  { image: 'https://customcushion-upload-bucket-123.s3.us-east-1.amazonaws.com/sunbrellapageicons/uv-protection-100x100.webp', label: 'UV/FADE RESISTANT' },
  { image: 'https://customcushion-upload-bucket-123.s3.us-east-1.amazonaws.com/sunbrellapageicons/bleach-cleanable-100x100.webp', label: 'BLEACH CLEANABLE' },
  { image: 'https://customcushion-upload-bucket-123.s3.us-east-1.amazonaws.com/sunbrellapageicons/mold-mildew-resistant_1_-100x100.webp', label: 'MOLD/MILDEW RESISTANT' },
  { image: 'https://customcushion-upload-bucket-123.s3.us-east-1.amazonaws.com/sunbrellapageicons/comfort-100x100.webp', label: 'BREATHABLE COMFORT' },
  { image: 'https://customcushion-upload-bucket-123.s3.us-east-1.amazonaws.com/sunbrellapageicons/weather-resistant-100x100.webp', label: 'SUN PROTECTION' },
];

export default function DesignPerformance() {
  return (
    <section className={`section-padding ${styles.section}`} aria-labelledby="design-perf-title">
      <div className="container">
        <div className={styles.grid}>
          {/* Text */}
          <div className={styles.textSide}>
            <span className="badge badge-accent">Partnership</span>
            <h2 id="design-perf-title">Design &amp; Performance</h2>
            <div className={styles.logoRow}>
              <div className={styles.brandLogoBox}>
                <EditableMedia
                  mediaKey="home_brand_cushionguru"
                  alt="Cushion Guru premium custom cushion brand logo"
                  type="image"
                  className={styles.brandLogoImg}
                  objectFit="contain"
                  defaultComponent={
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--brand-primary)', padding: '0.4rem 0.75rem', display: 'block', textAlign: 'center' }}>Cushion Guru</span>
                  }
                />
              </div>
              <span className={styles.cross}>✘</span>
              <div className={styles.brandLogoBox}>
                <EditableMedia
                  mediaKey="home_brand_sunbrella"
                  alt="Sunbrella outdoor fabric collection in neutral tones"
                  type="image"
                  className={styles.brandLogoImg}
                  objectFit="contain"
                  defaultComponent={
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--brand-primary)', padding: '0.4rem 0.75rem', display: 'block', textAlign: 'center' }}>Sunbrella®</span>
                  }
                />
              </div>
            </div>
            {/* <p className={styles.quote}>&ldquo;Your Vision, Our Craftsmanship&rdquo;</p> */}
            <p>
              In a groundbreaking collaboration, Cushion Guru proudly partners with Sunbrella, combining their renowned fabric expertise
              with our commitment to comfort and style. With Sunbrella&rsquo;s premium quality fabrics, we elevate our cushion covers to
              unparalleled excellence, ensuring durability, fade resistance, and easy maintenance. Experience the pinnacle of luxury and
              performance as we deliver nothing short of perfection in every stitch, setting the standard as the premier destination for
              top-tier fabric cushion covers.
            </p>

            {/* Badge grid */}
            {/* <div className={styles.badgeGrid}>
              {BADGES.map((b, i) => (
                <div key={i} className={styles.badge}>
                  <div className={styles.badgeIcon}>
                    <img src={b.image} alt={b.label} className={styles.badgeImg} />
                  </div>
                  <span className={styles.badgeLabel}>{b.label}</span>
                </div>
              ))}
            </div> */}
          </div>

          {/* Image side */}
          {/* <div className={styles.imageSide}>
            <div className={styles.imgFrame}>
              <EditableMedia
                mediaKey="home_design_performance"
                alt="High performance weather resistant custom cushions on outdoor patio furniture"
                type="image"
                className={`img-placeholder ${styles.mainImg}`}
                defaultComponent={
                  <div className={styles.imgLabel}>Cushion Guru × Sunbrella®<br />Partnership Photo</div>
                }
              />
              <div className={styles.floatCard}>
                <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 512 512"><g strokeWidth="0"><path d="M186.9.9c-10.9 3.4-17.7 11.4-29 34.6-10.1 20.7-13.3 24.5-23.7 27.9-4.2 1.4-13.5 3.2-20.7 4.1-26.8 3.3-37.2 8.1-43.2 20.3-2.6 5.2-2.8 6.6-2.7 16.7 0 7.6.8 14.2 2.4 21.5 1.6 7 2.4 13.9 2.4 20.6.1 10 .1 10.1-3.6 15.7-2.1 3.1-10.2 12-18.1 19.9-17.2 17.2-19.8 21.5-20.5 33.1-.4 7.4-.3 8.1 3.3 15.5 3.3 6.7 5.8 9.6 18.5 22.2 8.1 8 16 16.7 17.6 19.5 2.6 4.5 2.9 5.9 2.9 14 0 5.8-.9 13.1-2.5 20.5-3.5 16.4-3.5 30.4.1 38.1 3.9 8.3 11.5 14 23.1 17.4l5.7 1.6-2.8 5.2c-12.6 22.8-38.9 72.7-39.5 75-1.6 6.7 4.1 16.5 10.8 18.6 1.7.5 10.5 1.2 19.6 1.5 9.1.4 22.2.9 29.2 1.2l12.6.6 17.6 21.3c18.3 22.2 21.1 24.5 28.4 24.5 3.9-.1 10.8-3.4 12.6-6.2.8-1.2 12.2-21.9 25.4-45.8 23-42 24-43.6 28.2-45.7 9.8-5 19.8-5 29.9 0 4.2 2.1 4.9 3.3 29 47.1 26.6 48.4 27.3 49.4 35.6 50.4 8.4.9 10.9-1.1 28.8-22.7 8.9-10.7 16.9-20.3 17.7-21.3 1.3-1.5 4.9-1.9 30.5-2.8 16-.6 30.4-1.5 32.2-2.1 1.7-.6 4.7-2.7 6.6-4.8 4.3-4.7 5.4-10.1 3.4-15.7-.8-2.1-10.4-20.5-21.5-40.9l-20-37 5.8-1.6c12.2-3.3 21.7-11.6 24.6-21.5 2.1-7.4 1.5-20.9-1.7-34.9-1.5-6.4-2.3-13.4-2.3-19.5-.1-8.7.1-9.9 2.8-14.5 1.6-2.8 9.2-11.3 17.1-19 18.8-18.5 22.7-24.8 22.7-37.3 0-4.9-.7-7.7-3.2-13-2.6-5.6-5.4-9-17.5-20.9-8-7.9-16.1-16.7-18.1-19.7-5.2-7.8-5.6-15.5-1.8-34.1 5.4-26.8 3.7-39.6-6.8-49-7.6-6.9-14.9-9-43.2-12.5-13.2-1.7-19.2-4.1-25.1-10.5-5.2-5.5-7.3-9.2-15-25.9-14.8-32.3-31.4-38.1-61-21.6-28.7 16.1-35.8 17.1-53.4 8.1-4.2-2.1-12.5-6.4-18.4-9.4-14-7.2-23.6-9.2-31.8-6.8m137.9 17.3c4.3 3.4 6.9 7.6 14.7 23.3 10.2 20.6 16.6 29 25.5 33.5 7.3 3.7 18.3 6.7 27.5 7.5 20.7 1.9 31.7 5.5 34.7 11.6 2.6 4.9 2.3 15.4-.8 31.1-2.2 10.9-2.6 15.2-2.2 24.3.4 10.7.6 11.4 4.3 18.1 2.9 5.2 7.5 10.5 18.9 21.9 25.8 25.6 25.9 28.5 1 53-14.2 14-21.5 23.5-23.4 30.4-1.9 6.8-1.2 23.8 1.5 36.6 2.8 13.7 3.2 25.2 1 29.5-3.3 6.4-10.9 9.2-31.5 11.5-14.9 1.7-21.4 3.3-29.8 7.3-9.7 4.6-18.5 15.6-25.4 31.6-4.9 11.6-10.9 21.7-14.9 25-7.3 6.2-14.1 4.7-35.5-7.6-24.6-14.1-39.8-15.2-60.6-4.3-31.1 16.3-35.3 17.7-41.7 13.3-4.7-3.1-11-12.9-16.2-24.6-2.3-5.3-6.1-12.6-8.4-16.2-11.2-17.3-18.7-20.9-53.3-25.5-13.1-1.7-21.6-4.8-24.6-8.8-1.8-2.5-2.1-4.2-2-13.5.1-6.8.9-14.3 2.3-20.6 2.2-10.5 2.8-25.9 1.2-32.9-1.8-7.5-7.4-15-23.2-30.7-25.1-24.9-25-28.5.3-52.3C76.6 179.1 85 168.2 87 161.2c1.9-6.9 1.2-23.8-1.5-36.7-3.3-15.7-3.3-26-.2-30.6 3.8-5.7 10.5-7.6 41-11.8 4.3-.6 11.5-2.5 16-4.3 12.8-5 20.5-14.1 29.7-34.9 6-13.4 11.3-21.5 16-24.7 2.9-2 4.3-2.3 8.4-1.7 7 .9 15.8 4.5 26.3 10.7 24.2 14.4 41.1 14.6 65.3.9 22.5-12.9 30.4-15 36.8-9.9M133.4 369.7c8.6 2.7 11.2 4.9 17.2 14 1.9 2.9 5.2 9.4 7.4 14.4 8.3 19.2 17.3 30.2 27.2 33.5 6 2 17.2 1.5 23.2-1l3.7-1.6-5.5 10.3c-24.7 45.9-30.5 56.2-31.6 56.2-.8 0-9.3-9.6-19-21.4-9.7-11.7-18.4-21.7-19.3-22.3-1-.5-15.8-1.6-32.9-2.4-17.2-.8-31.4-1.6-31.6-1.8s9.5-18.6 21.5-41l21.8-40.6 5 .6c2.8.4 8.5 1.8 12.9 3.1m285 36.9c12 22.3 21.5 40.9 21.1 41.2-.4.4-14.5 1.2-31.4 1.7-24.3.8-31.2 1.4-32.8 2.5-1.2.8-10 11.1-19.7 22.7-9.7 11.7-18 21.3-18.4 21.3s-7-11.6-14.7-25.7c-7.7-14.2-16-29.3-18.3-33.6-3.3-6.1-3.9-7.8-2.5-7.2 11 4.8 22.9 4.1 31.4-1.7 7-4.7 12.2-12.1 20.4-29.3 8.6-17.8 13.7-24.8 20.3-27.6 5.8-2.5 14.6-4.7 19.2-4.8l3.6-.1z" /><path d="M237 69c-33 4.6-62.4 19.2-86 42.9-36.8 36.9-51.5 88.1-39.8 138.6 13.5 58.4 61.7 103.4 121.3 113 11.6 1.9 35.4 1.9 47 0 53.2-8.6 97.7-45.4 116.3-96 19.1-51.9 6.9-111.3-31.2-152.2-21.1-22.7-48.8-38.2-79.5-44.4-11-2.3-37.7-3.3-48.1-1.9m42.5 16.7c47.5 8.2 87.5 43 102.9 89.3 12.1 36.6 7.6 77.6-12.1 109.9-19.9 32.8-51 54.7-89.3 62.8-11.8 2.5-38.2 2.5-50 0-53.9-11.4-93.6-50.5-105.6-104.2-2.5-11.3-3-35.3-1-47.6 12.2-73.9 81.2-123 155.1-110.2" /><path d="M250.8 127.7c-.9 1-6.8 12.3-13.2 25-6.4 12.8-11.7 23.3-11.9 23.3-.1 0-12 1.8-26.5 3.9-29.2 4.3-30.2 4.6-30.2 11.2 0 4-1.1 2.8 31.3 33.9l7.7 7.5-4.5 26.3c-4.1 24.1-4.4 26.5-3 29.1 3.3 6.5 5.8 5.9 32.1-7.9 12.6-6.6 23.3-12 23.8-12 .6 0 11.3 5.4 23.9 12.1 25.4 13.2 28.1 14 32 8.7l2-2.6-4.6-26.9-4.6-26.8 19.4-19.1c17-16.7 19.5-19.5 19.5-22.2 0-1.8-.9-4.1-2.2-5.5-2.1-2.3-4.2-2.7-25.8-5.6-12.9-1.8-25-3.4-26.8-3.8-3.2-.5-3.7-1.4-14.9-23.7-6.3-12.7-12.2-23.9-13.1-24.9s-2.9-1.7-5.2-1.7-4.3.7-5.2 1.7m14.6 41.2c4.7 9.8 9.5 18.6 10.4 19.5 1.3 1.1 8.1 2.5 22.1 4.5 11.2 1.6 20.5 3.2 20.7 3.4.3.3-6.1 6.7-14.1 14.3-8.1 7.7-15.1 14.9-15.5 16.1-.6 1.5.2 8.8 2.5 22.4 1.9 11.1 3.4 20.4 3.2 20.5-.2.2-8.5-3.9-18.4-9.1-10-5.2-19.1-9.5-20.3-9.5s-10.3 4.3-20.2 9.6-18.1 9.4-18.4 9.2c-.2-.3 1.2-9.3 3.2-20.1 2-10.9 3.4-20.7 3-22-.3-1.2-7.2-8.8-15.4-17-8.2-8.1-14.6-14.7-14.3-14.7 6.4-.3 40.8-6.2 42.4-7.3 1.3-.9 5.6-8.7 10.7-19.6 4.6-9.9 8.7-18.1 9.1-18.1.3 0 4.5 8 9.3 17.9" /></g></svg>
                <div>
                  <strong>Sunbrella® Certified</strong>
                  <p>Premium fabric partner since 2018</p>
                </div>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </section>
  );
}
