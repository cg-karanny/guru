import React from 'react';
import Link from 'next/link';
import styles from './ShopByCategory.module.css';
import EditableMedia from '@/components/EditableMedia/EditableMedia';

const CATEGORIES = [
  { href: '/shop/indoor', label: 'Indoor Cushions', emoji: '' },
  { href: '/shop/outdoor', label: 'Outdoor Cushions', emoji: '' },
  { href: '/shop/rv', label: 'RV Cushions', emoji: '' },
  { href: '/shop/pet-bed', label: 'Pet Bed', emoji: '' },
  { href: '/shop/boat', label: 'Boat Cushions', emoji: '' },
];

export default function ShopByCategory() {
  return (
    <section className={`section-padding ${styles.section}`} aria-labelledby="shop-cat-title">
      <div className="container">
        <div className="section-title">
          <span className="eyebrow">Browse</span>
          <h2 id="shop-cat-title">Shop Custom Cushions by Category</h2>
          <div className="divider" />
          <p>Select your furniture type to begin customizing your perfect replacement cushions.</p>
        </div>
        <div className={styles.grid}>
          {CATEGORIES.map((cat, i) => (
            <article key={cat.href} className={styles.card}>
              <div className={styles.imgWrap}>
                <EditableMedia
                  mediaKey={`home_cat_${cat.label.toLowerCase().replace(/[^a-z]/g, '')}`}
                  alt={`Custom ${cat.label.toLowerCase()} collection`}
                  type="image"
                  className={`img-placeholder ${styles.img}`}
                // defaultComponent={
                //   <span className={styles.catEmoji}>{cat.emoji}</span>
                // }
                />
                <div className={styles.overlay} />
              </div>
              <div className={styles.cardContent}>
                <h3>{cat.label}</h3>
                <Link href={`/customize?type=${cat.label.toLowerCase().replace(' ', '-')}`} className="btn btn-primary btn-sm">
                  Customize Now
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
