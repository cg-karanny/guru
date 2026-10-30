import type { Metadata } from 'next';
import { getManagedSeo } from '@/lib/pageContent';
import ContactPageClient from './ContactPageClient';

const defaultMetadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Cushion Guru. Our friendly team is here to help with all your custom cushion needs.',
};

export async function generateMetadata(): Promise<Metadata> {
  return getManagedSeo('store-contact', defaultMetadata);
}

export default function ContactPage() {
  return <ContactPageClient />;
}
