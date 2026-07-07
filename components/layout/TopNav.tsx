'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ChromaTitle from '@/components/ui/ChromaTitle';

const NAV_LINKS = [
  { href: '/', label: 'Graph' },
  { href: '/browse', label: 'Browse' },
  { href: '/genre/shoegaze', label: 'Genres' },
  { href: '/scene/american-underground', label: 'Scenes' },
];

export default function TopNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <nav className="topnav" aria-label="Main navigation">
      <Link href="/" className="topnav__wordmark" aria-label="Starweave home">
        <ChromaTitle text="Starweave" size="sm" />
      </Link>

      <ul className="topnav__links" role="list">
        {NAV_LINKS.map(link => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={`topnav__link${isActive(link.href) ? ' topnav__link--active' : ''}`}
              aria-current={isActive(link.href) ? 'page' : undefined}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      <button
        className="topnav__hamburger"
        onClick={() => setMenuOpen(v => !v)}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
      >
        <span />
        <span />
        <span />
      </button>

      {menuOpen && (
        <ul className="topnav__mobile-menu" role="list">
          {NAV_LINKS.map(link => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={isActive(link.href) ? 'active' : ''}
                onClick={() => setMenuOpen(false)}
                aria-current={isActive(link.href) ? 'page' : undefined}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
