import type { Metadata } from 'next';
import ShopPage from '@/components/ShopPage/ShopPage';

export const metadata: Metadata = {
  title: 'Custom Boat Cushions | Marine-Grade Sunbrella Fabrics | Cushion Guru',
  description: 'Marine-grade custom boat cushions built for saltwater & sun. Sunbrella fabrics, mold-resistant, easy to clean. Ships in 3-4 weeks. Customize online.',
};

export default function BoatPage() {
  return (
    <ShopPage
      badge="Marine Collection"
      heroTitle="Custom Boat Cushions | Marine-Grade Materials & Saltwater Protection"
      heroSubtitle="Crafted by Cushion Guru using authentic Sunbrella® marine-grade performance fabrics"
      introText="Cushion Guru designs and crafts custom marine cushions built to perform in demanding environments. From cockpit seating and sun pads to lounges and cabin interiors, each cushion is precisely tailored for fit, comfort, and long-term durability."
      sections={[
        { title: 'Marine Comfort, Crafted by Cushion Guru', text: 'At Cushion Guru, we design and craft Custom Boat Cushions built specifically for life on the water. Every cushion is made to precise measurements, ensuring a perfect fit for your boat\'s seating, lounges, and sun pads.', img: 'Marine boat cushions for captain chair replacement' },
        { title: 'Built for Harsh Marine Environments', text: 'Boating demands materials that can withstand sun, salt, and moisture. Cushion Guru Marine Boat Cushions are engineered to perform in challenging conditions without compromising comfort.', img: 'Custom boat cushions on a luxury motorboat deck', reverse: true },
        { title: 'Powered by Sunbrella® Marine Fabrics', text: 'For our Custom Boat Cushions, we use Sunbrella® marine-grade fabrics, trusted worldwide for boats and yachts. These fabrics are fade-resistant, water-repellent, and mold-resistant.', img: 'Sunbrella marine fabric swatches for boat cushions' },
        { title: 'Easy Care, Long-Lasting Beauty on the Water', text: 'Marine cushions should be easy to maintain. Cushion Guru Custom Boat Cushions are designed for effortless cleaning. Sunbrella® fabrics resist stains and odors and can be cleaned with simple soap and water.', img: 'Waterproof exterior boat cushions in Sunbrella marine fabric', reverse: true },
      ]}
      tagline="Custom-Tailored · Durable Marine Comfort · Performance Fabrics · Made for Life on the Water"
      customizeType="boat"
    />
  );
}
