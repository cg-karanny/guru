import type { Metadata } from 'next';
import ShopPage from '@/components/ShopPage/ShopPage';

export const metadata: Metadata = {
  title: 'Custom RV Cushions | Durable Travel Seating Solutions | Cushion Guru',
  description: 'Custom RV cushions for motorhomes, travel trailers & campers. Durable, fade-resistant fabrics. Perfect fit guaranteed. Order your replacement cushions online.',
};

export default function RVPage() {
  return (
    <ShopPage
      badge="RV Collection"
      heroTitle="Custom RV Cushions | Durable Seating for Your Home on Wheels"
      heroSubtitle="Crafted by Cushion Guru using authentic Sunbrella® performance fabrics"
      introText="Cushion Guru designs and crafts custom RV cushions made for life on the road. From dinette seating and lounge areas to beds and driver seating, each cushion is precisely tailored to your RV's dimensions, comfort preferences, and daily use."
      sections={[
        { title: 'RV Comfort, Crafted by Cushion Guru', text: 'At Cushion Guru, we create Custom RV Cushions designed to make life on the road feel like home. Every cushion is made to fit your RV\'s seating, beds, lounges, and perfectly tailored RV Dinette Cushions.', img: 'Custom RV dinette cushions with Sunbrella fabric' },
        { title: 'Designed for Life on the Road', text: 'RV interiors see constant use, movement, and changing conditions. Our Custom RV Bench Cushions are built to handle daily wear, shifting temperatures, and compact spaces without losing comfort or shape.', img: 'RV camper interior with custom cushion replacement', reverse: true },
        { title: 'Performance Fabrics Powered by Sunbrella®', text: 'We use authentic Sunbrella® performance fabrics to give your RV interior worry-free durability. These fabrics resist stains, fading, and everyday spills while remaining soft and breathable.', img: 'Sunbrella fabric swatches for RV cushions' },
        { title: 'Easy Maintenance for Everyday Travel', text: 'RV living should be simple and stress-free. Cushion Guru Custom RV Cushions are designed for easy care, making cleanup quick and effortless. Sunbrella® fabrics clean easily with mild soap and water.', img: 'Clean and maintained RV bench cushion', reverse: true },
      ]}
      tagline="Custom-Tailored · Durable RV Comfort · Performance Fabrics · Made for Life on the Road"
      customizeType="rv"
    />
  );
}
