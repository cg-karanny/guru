'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from '@/app/admin/admin.module.css';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/orders', label: 'Orders', icon: '📦' },
  { href: '/admin/products', label: 'Products', icon: '🛍️' },
  { href: '/admin/subscribers', label: 'Subscribers', icon: '📧' },
  { href: '/admin/messages', label: 'Messages', icon: '✉️' },
  { href: '/admin/fabrics', label: 'Fabrics', icon: '🧵' },
  { href: '/admin/hero', label: 'Hero Images', icon: '🖼️' },
  { href: '/admin/blogs', label: 'Blogs', icon: '📝' },
  { href: '/admin/users', label: 'Users Data', icon: '👥' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
];

export default function AdminSidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth <= 1024);
    fn();
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  const visibleItems = isMobile ? NAV_ITEMS.slice(0, 4) : NAV_ITEMS;
  const moreItems = isMobile ? NAV_ITEMS.slice(4) : [];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <span>🛋️</span>
        <div><strong>Cushion Guru</strong></div>
      </div>

      <nav className={styles.sideNav}>
        {visibleItems.map(item => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
              onClick={() => setMoreOpen(false)}
            >
              <span>{item.icon}</span>{item.label}
            </Link>
          );
        })}

        {isMobile && (
          <>
            <button
              className={`${styles.navItem} ${moreOpen ? styles.navItemActive : ''}`}
              onClick={() => setMoreOpen(!moreOpen)}
              style={{ border: 'none', cursor: 'pointer' }}
            >
              <span>•••</span>More
            </button>
          </>
        )}
      </nav>

      {/* The More Menu Dropdown on Mobile */}
      {isMobile && moreOpen && (
        <div className={styles.mobileMoreMenu}>
          <div className={styles.mobileMoreOverlay} onClick={() => setMoreOpen(false)} />
          <div className={styles.mobileMoreContent}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', padding: '1rem' }}>
              {moreItems.map(item => {
                const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`${styles.moreMenuItem} ${isActive ? styles.moreMenuItemActive : ''}`}
                    onClick={() => setMoreOpen(false)}
                  >
                    <span>{item.icon}</span>{item.label}
                  </Link>
                );
              })}

              <button
                onClick={() => { logout(); router.push('/'); }}
                className={styles.moreMenuItem}
                style={{ border: 'none', cursor: 'pointer', background: 'transparent' }}
              >
                <span>🚪</span>Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Footer */}
      {!isMobile && (
        <div className={styles.sidebarFooter}>
          <div className={styles.adminUser}>
            <div className={styles.avatar}>{user?.name?.[0] ?? 'A'}</div>
            <div><strong>{user?.name ?? 'Admin'}</strong><span>{user?.email}</span></div>
          </div>
          <button
            onClick={() => { logout(); router.push('/'); }}
            className="btn btn-outline btn-sm"
            style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)', flexShrink: 0 }}
          >
            Sign Out
          </button>
        </div>
      )}
    </aside>
  );
}
