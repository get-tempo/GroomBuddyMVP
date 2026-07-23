import Link from 'next/link';

// Shared building blocks for the marketing pages (/welcome, /diy).
// Sticker design system from globals.css. Server components, no client JS.

export const INK = 'var(--ink)';
export const BORDER = `2.5px solid ${INK}`;
export const HARD = `3px 3px 0 ${INK}`;
export const HARD2 = `2px 2px 0 ${INK}`;
export const FFD = 'var(--font-display)';

export function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ display: 'inline-block', background: '#fff', border: BORDER, borderRadius: 999, padding: '6px 14px', fontFamily: FFD, fontWeight: 800, fontSize: 14, boxShadow: HARD2, whiteSpace: 'nowrap' }}>
      {children}
    </span>
  );
}

export function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', border: BORDER, borderRadius: 18, padding: '18px 20px', boxShadow: HARD, flex: '1 1 240px', minWidth: 240 }}>
      <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 17, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 14.5, fontWeight: 600, lineHeight: 1.55, color: 'var(--muted-1)' }}>{children}</div>
    </div>
  );
}

export function CTA({ href, children, tone }: { href: string; children: React.ReactNode; tone?: 'plain' }) {
  return (
    <Link
      href={href}
      style={{
        display: 'inline-block', background: tone === 'plain' ? '#fff' : 'var(--primary)', color: INK,
        border: BORDER, borderRadius: 999, padding: '13px 26px', fontFamily: FFD, fontWeight: 800,
        fontSize: 16, textDecoration: 'none', boxShadow: HARD,
      }}
    >
      {children}
    </Link>
  );
}

export function Footer({ crossLink }: { crossLink?: { href: string; label: string } }) {
  return (
    <footer style={{ padding: '26px 22px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: 'var(--muted-2)' }}>
      Grooming Buddy · early access
      {crossLink && (
        <>
          {' · '}
          <Link href={crossLink.href} style={{ color: 'var(--muted-1)' }}>{crossLink.label}</Link>
        </>
      )}
      {' · '}
      <a href="mailto:andrew+julian@get-tempo.com" style={{ color: 'var(--muted-1)' }}>contact</a>
    </footer>
  );
}
