'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useSite } from '@/context/SiteContext';
import styles from './Navbar.module.css';

const SHOP_ITEMS = [
  { href: '/shop/indoor', label: 'Custom Indoor Cushions', icon: '' },
  { href: '/shop/outdoor', label: 'Custom Outdoor Cushions', icon: '' },
  { href: '/shop/rv', label: 'Custom RV Cushions', icon: '' },
  { href: '/shop/boat', label: 'Custom Boat Cushions', icon: '' },
  { href: '/shop/pet-bed', label: 'Custom Pet Bed', icon: '' },
  { href: '/products', label: 'Products', icon: '' },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { count } = useCart();
  const { user, logout } = useAuth();
  const { siteName, logoUrl, initialized } = useSite();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileShop, setMobileShop] = useState(false); // separate from desktop shopOpen
  const [desktopShop, setDesktopShop] = useState(false);

  const desktopShopRef = useRef<HTMLLIElement>(null);

  /* ── Scroll ── */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  /* ── Resize → close mobile ── */
  useEffect(() => {
    const fn = () => { if (window.innerWidth > 1024) closeAll(); };
    window.addEventListener('resize', fn, { passive: true });
    return () => window.removeEventListener('resize', fn);
  }, []);

  /* ── Route change → close everything ── */
  useEffect(() => { closeAll(); }, [pathname]); // eslint-disable-line

  /* ── Desktop shop dropdown: close on outside click ── */
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (desktopShopRef.current && !desktopShopRef.current.contains(e.target as Node)) {
        setDesktopShop(false);
      }
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  function closeAll() {
    setMobileOpen(false);
    setMobileShop(false);
    setDesktopShop(false);
  }

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* ══ Navbar header ══ */}
      <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
        <div className={`container ${styles.inner}`}>

          {/* Brand */}
          <Link href="/" className={styles.brand} onClick={closeAll} aria-label="Home">
            {!initialized
              ? <span style={{ display: 'inline-block', width: 100, height: 24 }} />
              : <>
                {logoUrl
                  ? <div style={{ position: 'relative', height: 36, width: 140 }}><Image src={logoUrl} alt={siteName || 'Logo'} fill style={{ objectFit: 'contain', objectPosition: 'left center' }} priority sizes="140px" /></div>
                  : <span className={styles.brandIcon}>🛋️</span>}
                {siteName && <span className={styles.brandName}>{siteName}</span>}
              </>}
          </Link>

          {/* Desktop navigation */}
          <nav className={styles.desktopNav} aria-label="Main navigation">
            <ul className={styles.navList}>
              <li>
                <Link href="/" className={`${styles.navLink} ${isActive('/') ? styles.active : ''}`}>Home</Link>
              </li>

              {/* Desktop shop dropdown */}
              <li
                className={styles.hasDropdown}
                ref={desktopShopRef}
                onMouseEnter={() => setDesktopShop(true)}
                onMouseLeave={() => setDesktopShop(false)}
              >
                <button
                  className={`${styles.navLink} ${styles.dropdownTrigger} ${pathname.startsWith('/shop') || pathname === '/products' ? styles.active : ''}`}
                  onClick={(e) => {
                    if (window.innerWidth <= 1024) {
                      e.preventDefault();
                      setDesktopShop(v => !v);
                    }
                  }}
                  aria-expanded={desktopShop}
                >
                  Shop
                  <svg className={`${styles.chevron} ${desktopShop ? styles.rotated : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {desktopShop && (
                  <div className={styles.dropdown} role="menu">
                    {SHOP_ITEMS.map(item => (
                      <Link key={item.href} href={item.href} className={styles.dropdownItem} role="menuitem">
                        <span className={styles.dropdownIcon}>{item.icon}</span>
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </li>

              <li>
                <Link href="/contact" className={`${styles.navLink} ${isActive('/contact') ? styles.active : ''}`}>Contact Us</Link>
              </li>
              <li>
                <Link href="/account" className={`${styles.navLink} ${isActive('/account') ? styles.active : ''}`}>My Account</Link>
              </li>
              <li>
                <Link href="/sunbrella-fabric" className={styles.navLink}>
                  <span className={styles.sunbrellaBadge}>Sunbrella®</span>
                </Link>
              </li>
            </ul>
          </nav>

          {/* Right-side icons */}
          <div className={styles.actions}>
            <Link href="/cart" className={styles.cartBtn} aria-label={`Cart, ${count} items`}>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {count > 0 && <span className={styles.cartBadge}>{count}</span>}
            </Link>

            <Link
              href={user ? (user.role === 'ADMIN' ? '/admin' : '/account/dashboard') : '/account'}
              className={styles.iconBtn}
              aria-label="Account"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Link>

            {/* Hamburger */}
            <button
              className={`${styles.hamburger} ${mobileOpen ? styles.open : ''}`}
              onClick={() => setMobileOpen(v => !v)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      {/*
        ══ Mobile drawer ══
        Single wrapper covers the below-header area.
        - Backdrop  → absolute, inset 0 inside wrapper, z-index 0
        - Nav panel → absolute, same top, z-index 1  (clearly above backdrop)
        No fighting between different fixed elements' stacking contexts.
      */}
      {mobileOpen && (
        <div className={styles.mobileWrapper}>
          {/* Backdrop — clicking outside nav closes the menu */}
          <div className={styles.mobileBackdrop} onClick={closeAll} aria-hidden="true" />

          {/* Nav panel — z-index 1 puts it above backdrop (z-index 0) */}
          <nav className={styles.mobileNav} aria-label="Mobile navigation">
            <ul>
              <li>
                <Link href="/" className={styles.mobileLink} onClick={closeAll}>Home</Link>
              </li>

              <li>
                <button
                  className={styles.mobileLinkBtn}
                  onClick={() => setMobileShop(v => !v)}
                >
                  Shop
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points={mobileShop ? '18 15 12 9 6 15' : '6 9 12 15 18 9'} />
                  </svg>
                </button>

                {mobileShop && (
                  <ul className={styles.mobileSubNav}>
                    {SHOP_ITEMS.map(item => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={styles.mobileSubLink}
                          onClick={closeAll}
                        >
                          {item.icon} {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>

              <li>
                <Link href="/contact" className={styles.mobileLink} onClick={closeAll}>Contact Us</Link>
              </li>
              <li>
                <Link href="/account" className={styles.mobileLink} onClick={closeAll}>My Account</Link>
              </li>
              <li>
                <Link href="/sunbrella-fabric" className={styles.mobileLink} onClick={closeAll}>
                  Sunbrella®
                </Link>
              </li>
              {user && (
                <li>
                  <button
                    className={styles.mobileLink}
                    style={{ textAlign: 'left', width: '100%', color: 'var(--error)', background: 'transparent', border: 'none', padding: '1rem', cursor: 'pointer' }}
                    onClick={() => {
                      closeAll();
                      logout();
                      router.push('/');
                    }}
                  >
                    Sign Out
                  </button>
                </li>
              )}
            </ul>
          </nav>
        </div>
      )}
    </>
  );
}
