import type { Metadata } from 'next';
import ContactPageClient from './ContactPageClient';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Cushion Guru. Our friendly team is here to help with all your custom cushion needs.',
};

export default function ContactPage() {
  return <ContactPageClient />;
}
