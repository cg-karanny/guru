import type { Metadata } from 'next';
import Link from 'next/link';
import Newsletter from '@/components/home/Newsletter';
import styles from './shop.module.css';
import EditableMedia from '@/components/EditableMedia/EditableMedia';

export const metadata: Metadata = {
  title: 'Custom Outdoor Cushions | Weather-Resistant Sunbrella Fabrics | Cushion Guru',
  description: 'Durable outdoor patio cushions with Sunbrella fabrics. UV-fade resistant, water-repellent, mold-resistant. Custom sizes for any furniture. Fast shipping. Shop today.',
};

export default function OutdoorPage() {
  return (
    <>
      {/* Hero video */}
      <section className={styles.heroVideo}>
        <EditableMedia
          mediaKey="shop_outdoor_hero"
          alt="Showcase of premium custom outdoor cushions exposed to the elements"
          type="both"
          className={styles.heroMedia}
          style={{ borderRadius: 0 }}
          defaultComponent={
            <div className="video-placeholder-inner">
              <div className="video-placeholder-play">
                <svg viewBox="0 0 24 24" fill="white" width="28" height="28"><polygon points="5 3 19 12 5 21 5 3" /></svg>
              </div>
            </div>
          }
        />
        <div className={styles.heroOverlay}>
          <div className="container">
            <span className={styles.badge}>Outdoor Collection</span>
            <h1>Custom Outdoor Cushions | Sunbrella Fabrics & Weather-Resistant Protection</h1>
            <p>Crafted by Cushion Guru using Sunbrella® performance fabrics.</p>
            <Link href="/customize?type=outdoor" className="btn btn-accent" style={{ marginTop: '1rem', border: '1px solid black' }}>
              Customize Now
            </Link>
          </div>
        </div>
      </section>

      {/* Intro text */}
      <section className={`section-padding-sm ${styles.intro}`}>
        <div className="container-narrow text-center">
          <p className={styles.introText}>
            Cushion Guru designs and crafts custom outdoor cushions that bring refined comfort to open-air living. Precisely tailored for patios, decks, balconies, and poolside spaces, each cushion is made to withstand sun, weather, and daily use—while maintaining a soft, inviting feel and timeless style.
          </p>
        </div>
      </section>

      {/* Feature sections */}
      {[
        {
          title: 'Outdoor Living, Crafted by Cushion Guru',
          text: 'At Cushion Guru, we design and handcraft Custom Outdoor Cushions that elevate the way you live outside. Every piece is custom-made to fit your furniture perfectly, combining expert craftsmanship with thoughtful detailing. From Patio Chair Cushions to poolside lounges, our cushions are built to deliver long-lasting comfort, refined style, and confidence in every outdoor setting.',
          img: 'Sunbrella outdoor cushions for patio dining chairs',
        },
        {
          title: 'Performance You Can Trust, Powered by Sunbrella®',
          text: 'Cushion Guru Sunbrella Outdoor Cushions are made using authentic Sunbrella® performance fabrics, trusted worldwide for outdoor environments. These fabrics are fade-resistant, water-repellent, and mold-resistant, ensuring your Custom Outdoor Cushions maintain their beauty through sun, rain, and daily use—without sacrificing softness or comfort.',
          img: 'Replacement outdoor cushions on a garden sectional sofa',
          reverse: true,
        },
        {
          title: 'Custom Comfort Designed for Real Outdoor Life',
          text: 'No two outdoor spaces are the same. That\'s why Cushion Guru offers Replacement Outdoor Cushions with fully customized sizing, shapes, and comfort options to match your lifestyle. Whether you prefer firm support or plush relaxation, we tailor each Custom Outdoor Cushions order to your needs.',
          img: 'Custom outdoor cushion with weather-resistant Sunbrella fabric',
        },
        {
          title: 'Durable, Stylish, and Easy to Maintain',
          text: 'Outdoor living should be enjoyed, not worried about. Cushion Guru\'s Replacement Outdoor Cushions are designed for easy care and everyday durability. Sunbrella® fabrics clean effortlessly with simple soap and water, resist stains, and retain their color and texture—so your Custom Outdoor Cushions stay fresh, stylish, and ready to enjoy season after season.',
          img: 'Durable custom outdoor cushions made with water-repellent Sunbrella fabric',
          reverse: true,
        },
      ].map((section, i) => (
        <section key={i} className={`section-padding-sm ${i % 2 === 0 ? styles.sectionLight : styles.sectionWhite}`}>
          <div className="container">
            <div className={`${styles.featureGrid} ${section.reverse ? styles.reverse : ''}`}>
              <div className={styles.featureText}>
                <h2>{section.title}</h2>
                <p>{section.text}</p>
              </div>
              <EditableMedia
                mediaKey={`shop_outdoor_section_${i}`}
                alt={section.img}
                type="image"
                className={`img-placeholder ${styles.featureImg}`}
                defaultComponent={
                  <span className={styles.imgCaption}>{section.img}</span>
                }
              />
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className="container text-center">
          <div className={styles.tagline}>Custom-Tailored · Durable Marine Comfort · Performance Fabrics · Made for Life on the Water</div>
          <Link href="/customize?type=outdoor" className="btn btn-accent btn-lg" style={{ border: '1px solid black' }}>Customize Your Cushion</Link>
        </div>
      </section>

      <Newsletter />
    </>
  );
}
