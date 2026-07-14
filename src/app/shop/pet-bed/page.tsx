import type { Metadata } from 'next';
import Link from 'next/link';
import Newsletter from '@/components/home/Newsletter';
import styles from './petbed.module.css';
import EditableMedia from '@/components/EditableMedia/EditableMedia';

export const metadata: Metadata = {
  title: 'Luxury Custom Pet Beds | Orthopedic Comfort & Style | Cushion Guru',
  description: 'Luxury custom pet beds with memory foam & premium fabrics. Washable, durable, stylish. Perfect size for your pet. Free design consultation. Shop now.',
};

const BED_TYPES = [
  { label: 'SMALL BED BREEDS', examples: 'French Bulldog, Pug, Dachshund, Corgi', emoji: '' },
  { label: 'MEDIUM BED BREEDS', examples: 'Beagle, Basset Hound, Springer Spaniel', emoji: '' },
  { label: 'LARGE BED BREEDS', examples: 'Boxer, Collie, German Shepard, Golden Retriever', emoji: '' },
  { label: 'X-LARGE BED BREEDS', examples: 'Great Dane, Mastiff, Irish Wolfhound, St. Bernard', emoji: '' },
];

const SIZES = [
  {
    name: 'Pillow Bed',
    img: 'Large pillow pet bed with washable Sunbrella cover',
    sizes: ['SMALL: 25″ × 25″ × 8″ – for dogs < 30 lbs', 'MEDIUM: 38″ × 29″ × 10″ – for dogs 30–60 lbs', 'LARGE: 47″ × 37″ × 10″ – for dogs 60–90 lbs'],
    desc: 'Our large floor pillow for dogs provides a spacious, cloud-like lounging area that fits perfectly into any room.',
  },
  {
    name: 'Round Bed',
    img: 'Calming round pet bed for dogs and cats',
    sizes: ['SMALL: 24″ dia, 8″ thick – dogs < 30 lbs', 'MEDIUM: 31″ dia, 8.5″ thick – dogs 30–60 lbs', 'LARGE: 41″ dia, 10″ thick – dogs 60–90 lbs', 'X-LARGE: 48″ dia, 11″ thick – dogs > 90 lbs'],
    desc: 'Designed for "freestyle sleepers," this calming round dog bed features a bolstered rim that offers a sense of security and head support.',
  },
  {
    name: 'Lounger Bed',
    img: 'Orthopedic pet bed for senior dogs with memory foam fill',
    sizes: ['SMALL: 22″ × 22″ × 7″ – dogs < 30 lbs', 'MEDIUM: 28″ × 28″ × 8″ – dogs 30–60 lbs', 'LARGE: 42″ × 31″ × 8″ – dogs 60–90 lbs', 'X-LARGE: 48″ × 36″ × 8″ – dogs > 90 lbs'],
    desc: 'The Lounger is a premium orthopedic dog bed with a mini-flange detail for a sophisticated furniture look.',
  },
];

export default function PetBedPage() {
  return (
    <>
      {/* Hero */}
      <section className={styles.hero}>
        <EditableMedia
          mediaKey="shop_pet_bed_video"
          alt="Video demonstrating our luxury custom pet beds and their premium features"
          type="both"
          className={styles.heroMedia}
          style={{ borderRadius: 0 }}
          defaultComponent={
            <div className="video-placeholder-inner">
              {/* <div className="video-placeholder-play">
                <svg viewBox="0 0 24 24" fill="white" width="30" height="30"><polygon points="5 3 19 12 5 21 5 3" /></svg>
              </div> */}
            </div>
          }
        />
        <div className={styles.heroOverlay}>
          <div className="container">
            <span className={styles.badge}>Pet Collection</span>
            <h1>Custom Pet Beds | Premium Comfort for Your Furry Friends</h1>
            <p>Where comfort meets style — cushion your pet&rsquo;s dreams with our bespoke pet beds.</p>
            <Link href="/customize?type=pet-bed" className="btn btn-accent" style={{ marginTop: '1rem', border: '1px solid black' }}>Customize Now</Link>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className={`section-padding-sm ${styles.intro}`}>
        <div className="container-narrow text-center">
          <p className={styles.introText}>
            Rest assured, whether indoors or outdoors, your pet&rsquo;s comfort is guaranteed with Cushion Guru&rsquo;s high-quality materials and expert craftsmanship. Made with durable Sunbrella fabric, each custom pet bed offers a cozy retreat for your furry friend.
          </p>
        </div>
      </section>

      {/* Breed sizes */}
      <section className={`section-padding-sm ${styles.breedSection}`}>
        <div className="container">
          <div className="section-title">
            <h2>Find the Right Size for Your Pet</h2>
            <div className="divider" />
          </div>
          <div className={styles.breedGrid}>
            {BED_TYPES.map((b, i) => (
              <div key={i} className={styles.breedCard}>
                <span className={styles.breedEmoji}>{b.emoji}</span>
                <EditableMedia
                  mediaKey={`pet_breed_${i}`}
                  alt={`Example of ${b.label.toLowerCase()} enjoying a custom pet bed`}
                  type="image"
                  className={`img-placeholder ${styles.breedImg}`}
                />
                <div className={styles.breedInfo}>
                  <strong>{b.label}</strong>
                  <p>{b.examples}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bed types */}
      {SIZES.map((size, i) => (
        <section key={i} className={`section-padding-sm ${i % 2 === 0 ? styles.sectionWhite : styles.sectionLight}`}>
          <div className="container">
            <div className={`${styles.sizeGrid} ${i % 2 === 1 ? styles.reverse : ''}`}>
              <div className={styles.sizeText}>
                <h2>{size.name} Sizes</h2>
                <p style={{ marginBottom: '1.5rem' }}>{size.desc}</p>
                <ul className={styles.sizeList}>
                  {size.sizes.map((s, j) => <li key={j}><span>✓</span> {s}</li>)}
                </ul>
                <p className={styles.sizeNote}>We recommend these sizes, but feel free to customize them to fit your needs.</p>
                {/* <Link href="/customize?type=pet-bed" className="btn btn-primary" style={{ marginTop: '1rem', border: '2px solid black' }}>Customize Now</Link> */}
              </div>
              <EditableMedia
                mediaKey={`pet_size_${i}`}
                alt={size.img}
                type="image"
                className={`img-placeholder ${styles.sizeImg}`}
                defaultComponent={
                  <span className={styles.imgCaption}>{size.img}</span>
                }
              />
            </div>
          </div>
        </section>
      ))}

      {/* Guide */}
      <section className={`section-padding-sm ${styles.guide}`}>
        <div className="container text-center">
          <EditableMedia
            mediaKey="pet_guide_img"
            alt="Durable pet bed fabric resistant to stains and pet hair"
            type="image"
            className={`img-placeholder ${styles.guideImg}`}
            defaultComponent={
              <span className={styles.imgCaption}>🐾 Durable pet bed fabric resistant to stains and pet hair</span>
            }
          />
          <h2>DOG BED SIZE GUIDE</h2>
          <p>Give your pet the comfort they deserve. Customize your pet bed in any shape, any size, and any design, with hundreds of authentic Sunbrella® fabric options to choose from.</p>
          <Link href="/customize?type=pet-bed" className="btn btn-accent btn-lg" style={{ border: '1px solid black' }}>Customize Now</Link>
          <p className={styles.customNote}>We do provide a lot of other custom shapes as well! <Link href="/contact">Drop us a Chat</Link> and we&rsquo;ll assist you.</p>
        </div>
      </section>

      <Newsletter />
    </>
  );
}
