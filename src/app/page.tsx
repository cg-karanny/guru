import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import HeroSlider from '@/components/HeroSlider/HeroSlider';
import FeatureBanner from '@/components/home/FeatureBanner';
import DesignPerformance from '@/components/home/DesignPerformance';
import WhyUpgrade from '@/components/home/WhyUpgrade';
import MarqueeStrip from '@/components/home/MarqueeStrip';
import DiscoverBanner from '@/components/home/DiscoverBanner';
import CustomizeSection from '@/components/home/CustomizeSection';
import ShopByCategory from '@/components/home/ShopByCategory';
import Testimonials from '@/components/home/Testimonials';
import VideoGallery from '@/components/home/VideoGallery';
import InspireBanner from '@/components/home/InspireBanner';
import PremiumSection from '@/components/home/PremiumSection';
import ReadyBanner from '@/components/home/ReadyBanner';
import Newsletter from '@/components/home/Newsletter';

export const metadata: Metadata = {
  title: 'Custom Cushions | Factory Direct Pricing & Free Shipping | Cushion Guru',
  description: 'Premium custom cushions for indoor, outdoor, RV, boat & pet use. Sunbrella® fabrics, factory-direct pricing, 3-week delivery, free worldwide shipping. Get perfect-fit cushions today.',
  keywords: 'custom cushions, outdoor cushions, sunbrella cushions, replacement cushions, made to order cushions, luxury cushion covers',
  robots: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
  authors: [{ name: 'Cushion Guru LLC' }],
  openGraph: {
    title: 'Custom Cushions - Factory Direct Pricing & Free Shipping',
    description: 'Premium custom cushions handcrafted to your exact specifications. Sunbrella fabrics, fast turnaround, 99% satisfaction rate. Shop indoor, outdoor, RV, boat & pet cushions.',
    images: ['https://cushionguru.com/og-image-home.jpg'],
    url: 'https://cushionguru.com/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Custom Cushions - Factory Direct Pricing',
    description: 'Premium custom cushions with Sunbrella fabrics. Free shipping worldwide. 3-week delivery. 99% customer satisfaction.',
  }
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Cushion Guru",
  "url": "https://cushionguru.com",
  "logo": "https://cushionguru.com/logo.webp",
  "description": "Premium custom cushions crafted with Sunbrella fabrics, factory-direct pricing, and free worldwide shipping",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "328 Stewart Avenue",
    "addressLocality": "Bethpage",
    "addressRegion": "NY",
    "postalCode": "11714",
    "addressCountry": "US"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Customer Service",
    "email": "contact@cushionguru.com"
  },
  "sameAs": [
    "https://www.facebook.com/people/Cushion-Guru/61554651403990/",
    "https://www.instagram.com/cushiongurullc/",
    "https://www.linkedin.com/company/cushion-guru/",
    "https://www.youtube.com/channel/UCcdDcKJ-uTH8lIIO6CgjXxA"
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "ratingCount": "150",
    "bestRating": "5",
    "worstRating": "1"
  }
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://cushionguru.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Shop",
      "item": "https://cushionguru.com/shop"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Custom Cushions",
      "item": "https://cushionguru.com/shop/custom-cushions"
    }
  ]
};

export default async function HomePage() {
  const items = await prisma.media.findMany({
    where: { key: { startsWith: 'home_slider_' } },
  });
  const initialBanners: Record<string, string> = {};
  items.forEach(item => {
    if (item.key && item.url) {
      initialBanners[item.key] = item.url;
    }
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <HeroSlider initialBanners={initialBanners} />
      <FeatureBanner />
      <DesignPerformance />
      <WhyUpgrade />
      <MarqueeStrip />
      <DiscoverBanner />
      <CustomizeSection />
      <ShopByCategory />
      <Testimonials />
      <VideoGallery />
      <InspireBanner />
      <PremiumSection />
      <ReadyBanner />
      <Newsletter />
    </>
  );
}
