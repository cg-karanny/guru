import type { Metadata } from 'next';
import Link from 'next/link';
import styles from './measure.module.css';
import EditableMedia from '@/components/EditableMedia/EditableMedia';

export const metadata: Metadata = {
  title: 'How to Measure for Custom Cushions | Step-by-Step Guide | Cushion Guru',
  description: 'Complete guide on how to measure for custom cushions. Accurate measurement tips, video tutorial, common mistakes to avoid. Perfect fit guaranteed.',
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Measure for Custom Cushions",
  "description": "Learn the proper way to measure your furniture for perfectly-fitting custom cushions",
  "step": [
    {
      "@type": "HowToStep",
      "name": "Gather Your Tools",
      "text": "Get a soft measuring tape, notepad, and pen"
    },
    {
      "@type": "HowToStep",
      "name": "Measure Length",
      "text": "Measure the longest part of your cushion from end to end"
    },
    {
      "@type": "HowToStep",
      "name": "Measure Width",
      "text": "Measure the side-to-side width of your cushion"
    },
    {
      "@type": "HowToStep",
      "name": "Measure Thickness",
      "text": "Measure the depth/thickness of your current cushion"
    },
    {
      "@type": "HowToStep",
      "name": "Double-Check",
      "text": "Take measurements twice to ensure accuracy"
    }
  ]
};

const SHAPES = [
  {
    name: 'Standard Rectangle & Square',
    img: 'Measuring a rectangle cushion with tailor tape',
    steps: [
      'Measure Width (Side to Side): Measure the back of the seat frame from left to right. Then measure the front.',
      'Measure Depth (Front to Back): Measure from the front edge of the frame to the very back rest.',
      'Determine Thickness: Standard bench pads are 2–3″. Deep seating often starts at 4–6″.',
    ],
  },
  {
    name: 'Trapezoid',
    img: 'Trapezoid cushion measuring guide',
    steps: [
      'Measure Back Width: Measure the width at the very back of the seat, where it meets the backrest.',
      'Measure Front Width: Measure the width at the very front edge of the seat.',
      'Measure Depth (Center): Measure from the center of the front edge straight back to the center of the rear edge.',
    ],
  },
  {
    name: 'T-Shape Cushions',
    img: 'T-shape cushion measurement diagram',
    steps: [
      'Total Front Width: Measure the total width across the very front, including the "ears".',
      'Back Width (Between Arms): Measure the width at the back, fitting strictly between the arms.',
      'Total Depth vs. Ear Depth: We need the Total Depth and the Ear Depth.',
    ],
  },
  {
    name: 'L-Shape',
    img: 'L-shape corner bench cushion measuring guide',
    steps: [
      'Back Lengths (Long Sides): Measure the total length of the back edge for Leg 1 and Leg 2.',
      'Seat Depth: Measure how deep the seat is from front to back for both legs.',
      'Inner Lengths: Measure the interior edges to confirm the angle is 90 degrees.',
    ],
  },
  {
    name: 'Round Cushions',
    img: 'Round cushion diameter measurement guide',
    steps: [
      'Measure the Diameter: Measure straight across the widest part in 2-3 different directions.',
      'Papasan Chairs (Bowl Shape): Lay the tape along the bowl\'s curve, from edge to edge.',
    ],
  },
  {
    name: 'Triangle Cushions',
    img: 'Triangle corner cushion measuring guide',
    steps: [
      'Measure All Three Sides: Measure Side A, Side B, and Side C separately.',
      'Check the Corner Angle: Confirm if the back corner is a perfect 90-degree angle.',
    ],
  },
  {
    name: 'Throw Pillow',
    img: 'Throw Pillow measuring guide',
    steps: [
      'Measure Length: Measure from one end of the pillow to the other (longest side).',
      'Measure Width: Measure the side perpendicular to the length.',
      'Measure Thickness (Depth): Measure the fullness/height of the pillow when placed flat.',
      'Check Shape: Ensure the pillow is fluffed naturally before measuring for accuracy.'
    ],
  },
  {
    name: 'Pillow',
    img: 'Pillow measuring guide',
    steps: [
      'Measure Length: Measure the longest side of the pillow from edge to edge.',
      'Measure Width: Measure the shorter side perpendicular to the length.',
      'Measure Thickness (Depth): Measure the side height when the pillow is laid flat.',
      'Ensure Proper Shape: Make sure the pillow is not compressed while measuring.'
    ],
  },
];

const RULES = [
  { num: '1', title: 'Measure the Furniture, Not the Foam', text: 'Old foam compresses and warps over time. For the best fit, measure the inside dimensions of the furniture frame where the cushion will sit.' },
  { num: '2', title: 'Use a Firm Tape Measure', text: 'Cloth measuring tapes can stretch. Use a retractable metal tape measure for straight lines and rigid accuracy.' },
  { num: '3', title: 'Width vs. Depth', text: 'Width is always left-to-right (looking at the seat). Depth is front-to-back. Getting these swapped is the most common mistake!' },
  { num: '4', title: 'Round to the Nearest 0.5 Inch', text: 'Don\'t guess. If you are between inches, round down for a snug fit inside a frame, or round up if the cushion sits on top.' },
];

export default function HowToMeasurePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero */}
      <section className={styles.hero}>
        <div className="container text-center">
          <h1>How to Measure for Custom Cushions | Accurate Sizing Guide</h1>
          <p>Perfect fit starts with perfect measurements. Follow this guide to measure your furniture frames accurately.</p>
        </div>
      </section>

      {/* Critical rules */}
      <section className={`section-padding-sm ${styles.rules}`}>
        <div className="container">
          <h2 className={styles.sectionHead}>Critical Measuring Rules</h2>
          <div className={styles.rulesGrid}>
            {RULES.map(r => (
              <div key={r.num} className={styles.rule}>
                <div className={styles.ruleNum}>{r.num}</div>
                <div>
                  <h3>{r.title}</h3>
                  <p>{r.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shapes */}
      {SHAPES.map((shape, i) => (
        <section key={i} className={`section-padding-sm ${i % 2 === 0 ? styles.sectionLight : styles.sectionWhite}`}>
          <div className="container">
            <div className={styles.shapeGrid}>
              <div className={styles.shapeText}>
                <h2>{shape.name}</h2>
                <ol className={styles.steps}>
                  {shape.steps.map((step, j) => <li key={j}>{step}</li>)}
                </ol>
              </div>
              <EditableMedia
                mediaKey={`measure_${shape.name.toLowerCase().replace(/[^a-z]/g, '')}`}
                alt={shape.img}
                type="image"
                className={`img-placeholder ${styles.shapeImg}`}
                priority={i === 0}
                defaultComponent={
                  <span className={styles.imgCaption}>{shape.img}</span>
                }
              />
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className="container text-center">
          <h2>Still not sure?</h2>
          <p>Complex shapes like papasan chairs or antique furniture can be tricky. You can always send us a template or photos.</p>
          <div className={styles.ctaButtons}>
            <Link href="/contact" className="btn btn-accent btn-lg">Contact Support</Link>
            {/* <a href="/Measuring_Template_Guide.pdf" download className="btn btn-ghost btn-lg">Download Template Guide</a> */}
          </div>
        </div>
      </section>
    </>
  );
}
