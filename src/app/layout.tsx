import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { SiteProvider } from '@/context/SiteContext';
import CookieConsent from '@/components/CookieConsent/CookieConsent';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700', '800', '900']
});

const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
  weight: ['300', '400', '500', '600', '700']
});

import { prisma } from '@/lib/prisma';

export const metadata: Metadata = {
  title: {
    default: 'Cushion Guru – Custom Cushions, Factory Direct',
    template: '%s | Cushion Guru',
  },
  description:
    'Cushion Guru crafts premium custom cushions for indoor, outdoor, RV, boat, and pet use. Factory-direct pricing with Sunbrella fabrics. Free worldwide shipping.',
  keywords: [
    'custom cushions', 'outdoor cushions', 'sunbrella cushions', 'rv cushions',
    'boat cushions', 'pet beds', 'indoor cushions', 'cushion covers',
  ],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    siteName: 'Cushion Guru',
    locale: 'en_US',
  },
};

import HreflangTags from '@/components/HreflangTags';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let siteName = '';
  let logoUrl = '';
  let siteTagline = '';
  const initialMediaCache: Record<string, string> = {};

  try {
    const settings = await prisma.setting.findMany();
    const map: Record<string, string> = {};
    settings.forEach(s => { map[s.key] = s.value; });

    siteName = map.siteName || '';
    logoUrl = map.logoUrl || map.siteLogo || '';
    siteTagline = map.siteTagline || '';

    const allMedia = await prisma.media.findMany();
    allMedia.forEach(m => {
      if (m.key && m.url) initialMediaCache[m.key] = m.url;
    });
  } catch (error) {
    console.error('Failed to load settings/media in layout:', error);
  }

  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        <HreflangTags />
        <Script id="google-tag-manager" strategy="lazyOnload">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-5M8HXHP3');
          `}
        </Script>
        <Script id="meta-pixel" strategy="lazyOnload">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '2121819478608185');
            fbq('track', 'PageView');
          `}
        </Script>
      </head>
      <body>
        <noscript>
          <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-5M8HXHP3"
            height="0" width="0" style={{ display: 'none', visibility: 'hidden' }}></iframe>
        </noscript>
        <noscript>
          <img height="1" width="1" style={{ display: 'none' }} alt=""
            src="https://www.facebook.com/tr?id=2121819478608185&ev=PageView&noscript=1"
          />
        </noscript>
        <AuthProvider initialMediaCache={initialMediaCache}>
          <SiteProvider initialSettings={{ siteName, logoUrl, siteTagline, initialized: true }}>
            <CartProvider>
              <a href="#main-content" className="skip-link">Skip to content</a>
              <Navbar />
              <main id="main-content">{children}</main>
              <Footer />
              <CookieConsent />
            </CartProvider>
          </SiteProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
