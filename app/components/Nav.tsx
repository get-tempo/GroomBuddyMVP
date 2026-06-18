'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Demo switcher: lets people try both interfaces and tell us which they prefer.
const TABS = [
  { href: '/guided', label: 'Guided' },
  { href: '/quick', label: 'Quick' },
];

export function Nav() {
  const path = usePathname();
  return (
    <header className="topbar">
      <Link href="/" className="brand">
        <span className="dot" /> Grooming Buddy
      </Link>
      <nav className="tabs">
        {TABS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={`tab${path === t.href ? ' active' : ''}`}
          >
            {t.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
