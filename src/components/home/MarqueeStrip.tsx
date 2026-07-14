'use client';

import React from 'react';
import Image from 'next/image';
import styles from './MarqueeStrip.module.css';

const ITEMS = [
  { src: 'https://customcushion-upload-bucket-123.s3.us-east-1.amazonaws.com/StripImages/5-year-limited-warranty.webp', alt: '5 Year Limited Warranty' },
  { src: 'https://customcushion-upload-bucket-123.s3.us-east-1.amazonaws.com/StripImages/bureau-veritas.webp', alt: 'Bureau Veritas Certified' },
  { src: 'https://customcushion-upload-bucket-123.s3.us-east-1.amazonaws.com/StripImages/greenguard.webp', alt: 'GREENGUARD Gold Certified' },
  { src: 'https://customcushion-upload-bucket-123.s3.us-east-1.amazonaws.com/StripImages/oeko-tex.webp', alt: 'OEKO-TEX Standard 100 Certified' },
  { src: 'https://customcushion-upload-bucket-123.s3.us-east-1.amazonaws.com/StripImages/reach-compliance.webp', alt: 'REACH Compliance Certified' },
  { src: 'https://customcushion-upload-bucket-123.s3.us-east-1.amazonaws.com/StripImages/skin-cancer.webp', alt: 'Skin Cancer Foundation Recommended' }
];

export default function MarqueeStrip() {
  const doubled = [...ITEMS, ...ITEMS];
  return (
    <div className={styles.strip} aria-hidden="true">
      <div className={styles.track}>
        {doubled.map((item, i) => (
          <span key={i} className={styles.item}>
            <div className={styles.imgWrapper}>
              <Image src={item.src} alt={item.alt} fill style={{ objectFit: 'contain' }} sizes="250px" />
            </div>
          </span>
        ))}
      </div>
    </div>
  );
}
