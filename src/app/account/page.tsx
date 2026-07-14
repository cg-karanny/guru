import type { Metadata } from 'next';
import AccountPageClient from './AccountPageClient';

export const metadata: Metadata = {
  title: 'My Account',
  description: 'Login or register to manage your Cushion Guru account and orders.',
};

export default function AccountPage() {
  return <AccountPageClient />;
}
