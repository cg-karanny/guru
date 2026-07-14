'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import styles from './HeroSlider.module.css';

const SLIDES = [
  {
    badge: 'PERFORMANCE',
    title: 'Outdoor Cushions',
    subtitle: 'Experience comfort that lasts with Cushion Guru\'s outdoor cushion covers where style meets durability, outdoors!',
    cta: 'Shop Now',
    href: '/shop/outdoor',
    mediaKey: 'home_slider_outdoor',
    gradient: 'linear-gradient(135deg, #1a4a28 0%, #FBB91E 100%)',
    emoji: '',
  },
  {
    badge: 'PERFORMANCE',
    title: 'Indoor Cushions',
    subtitle: 'Transform your living space with the exquisite elegance of the Indoor Cushion Cover from Cushion Guru, where comfort meets style seamlessly.',
    cta: 'Shop Now',
    href: '/shop/indoor',
    mediaKey: 'home_slider_indoor',
    gradient: 'linear-gradient(135deg, #2c1654 0%, #1a3c5e 100%)',
    emoji: '',
  },
  {
    badge: 'PERFORMANCE',
    title: 'Boat Cushions',
    subtitle: 'Where comfort meets style, cushion your Boat Cushions dreams with our bespoke Boat Cushions from Cushion Guru.',
    cta: 'Shop Now',
    href: '/shop/boat',
    mediaKey: 'home_slider_boat',
    gradient: 'linear-gradient(135deg, #0d2d4a 0%, #1a5d8a 100%)',
    emoji: '',
  },
  {
    badge: 'PERFORMANCE',
    title: 'Pet Beds',
    subtitle: 'Where comfort meets style, cushion your pet\'s dreams with our bespoke pet beds from Cushion Guru.',
    cta: 'Shop Now',
    href: '/shop/pet-bed',
    mediaKey: 'home_slider_pet-bed',
    gradient: 'linear-gradient(135deg, #6b3a2a 0%, #c0652b 100%)',
    emoji: '',
  },
  {
    badge: 'PERFORMANCE',
    title: 'RV Cushions',
    subtitle: 'Wrap your adventures in comfort with our RV cushion covers from Cushion Guru – where every journey feels like home.',
    cta: 'Shop Now',
    href: '/shop/rv',
    mediaKey: 'home_slider_rv',
    gradient: 'linear-gradient(135deg, #1a3c5e 0%, #FBB91E 100%)',
    emoji: '',
  },

];

import Image from 'next/image';
import EditableMedia from '@/components/EditableMedia/EditableMedia';

interface HeroSliderProps {
  initialBanners?: Record<string, string>;
}

export default function HeroSlider({ initialBanners = {} }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback((idx: number) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent(idx);
      setAnimating(false);
    }, 400);
  }, [animating]);

  const next = useCallback(() => goTo((current + 1) % SLIDES.length), [current, goTo]);
  const prev = useCallback(() => goTo((current - 1 + SLIDES.length) % SLIDES.length), [current, goTo]);

  useEffect(() => {
    timerRef.current = setTimeout(next, 5500);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, next]);

  const slide = SLIDES[current];

  return (
    <section
      className={`${styles.hero} ${styles.hasImage}`}
      aria-label="Hero slider"
      style={{ background: 'transparent' }}
    >
      <EditableMedia
        mediaKey={slide.mediaKey}
        type="image"
        initialUrl={initialBanners[slide.mediaKey]}
        alt={slide.title}
        priority={true}
        style={{ position: 'absolute', inset: 0, zIndex: -2 }}
        defaultComponent={
          <div style={{ position: 'absolute', inset: 0, background: slide.gradient, zIndex: -2 }} />
        }
      />
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.26)', zIndex: -1, pointerEvents: 'none' }} />
      {/* Slide content */}
      <div className={`container ${styles.content} ${animating ? styles.exit : styles.enter}`}>
        <span className={styles.badge}>{slide.badge}</span>
        <h1 className={styles.title}> {slide.title}</h1>
        <p className={styles.subtitle}>{slide.subtitle}</p>
        <div className={styles.ctas}>
          <Link href={slide.href} className="btn btn-accent btn-lg">{slide.cta}</Link>
          {/* <Link href="/customize" className="btn btn-ghost btn-lg">Customize Yours</Link> */}
        </div>
        <a href="#below-hero" className={styles.scrollCue} aria-label="Scroll down">
          <span>Scroll Down</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
            <polyline points="7 13 12 18 17 13" />
            <polyline points="7 6 12 11 17 6" />
          </svg>
        </a>
      </div>

      {/* Decorative shapes */}
      <div className={styles.blob1} aria-hidden="true" />
      <div className={styles.blob2} aria-hidden="true" />

      {/* Controls */}
      <button onClick={prev} className={`${styles.arrow} ${styles.arrowLeft}`} aria-label="Previous slide">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="22" height="22"><polyline points="15 18 9 12 15 6" /></svg>
      </button>
      <button onClick={next} className={`${styles.arrow} ${styles.arrowRight}`} aria-label="Next slide">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="22" height="22"><polyline points="9 18 15 12 9 6" /></svg>
      </button>

      {/* Dots */}
      <div className={styles.dots} role="tablist" aria-label="Slides">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
            role="tab"
            aria-selected={i === current}
          />
        ))}
      </div>

      {/* Slide counter */}
      <div className={styles.counter} aria-live="polite" aria-atomic="true">
        {String(current + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
      </div>
    </section>
  );
}
