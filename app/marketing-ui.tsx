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

// iPhone chrome around the product-demo panels: dark bezel, Dynamic Island,
// status bar, home indicator. Content stays in the sticker design system.
export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ width: 336, maxWidth: '94vw', background: 'var(--ink)', borderRadius: 46, padding: 10, boxShadow: '7px 7px 0 rgba(43,33,26,0.35)', border: '2px solid #171009' }}>
      <div style={{ background: 'var(--cream)', borderRadius: 36, overflow: 'hidden', position: 'relative' }}>
        {/* status bar + dynamic island */}
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 22px 2px' }}>
          <span style={{ fontFamily: FFD, fontWeight: 800, fontSize: 13.5, letterSpacing: 0.2 }}>9:41</span>
          <div style={{ position: 'absolute', left: '50%', top: 9, transform: 'translateX(-50%)', width: 88, height: 24, background: 'var(--ink)', borderRadius: 999 }} />
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="16" height="11" viewBox="0 0 16 11"><rect x="0" y="7" width="2.6" height="4" rx="0.8" fill="var(--ink)" /><rect x="4.2" y="5" width="2.6" height="6" rx="0.8" fill="var(--ink)" /><rect x="8.4" y="2.7" width="2.6" height="8.3" rx="0.8" fill="var(--ink)" /><rect x="12.6" y="0.5" width="2.6" height="10.5" rx="0.8" fill="var(--ink)" /></svg>
            <svg width="15" height="11" viewBox="0 0 15 11"><path d="M7.5 9.8L5.2 7.4a3.4 3.4 0 014.6 0L7.5 9.8z" fill="var(--ink)" /><path d="M2.9 5a6.6 6.6 0 019.2 0" fill="none" stroke="var(--ink)" strokeWidth="1.7" strokeLinecap="round" /><path d="M0.8 2.7a9.8 9.8 0 0113.4 0" fill="none" stroke="var(--ink)" strokeWidth="1.7" strokeLinecap="round" /></svg>
            <svg width="21" height="11" viewBox="0 0 21 11"><rect x="0.7" y="0.7" width="16.5" height="9.6" rx="2.6" fill="none" stroke="var(--ink)" strokeWidth="1.3" /><rect x="2.4" y="2.4" width="10.5" height="6.2" rx="1.4" fill="var(--ink)" /><path d="M19 3.6v3.8a2 2 0 000-3.8z" fill="var(--ink)" /></svg>
          </span>
        </div>
        <div style={{ padding: '10px 14px 12px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {children}
        </div>
        {/* home indicator */}
        <div style={{ width: 112, height: 4.5, background: 'var(--ink)', borderRadius: 999, margin: '0 auto 7px', opacity: 0.9 }} />
      </div>
    </div>
  );
}

// Small inline stroke icons for the sticker cards (SVG, never emoji).
const stroke = { fill: 'none', stroke: 'var(--ink)', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
export const ICONS = {
  book: (
    <svg width="20" height="20" viewBox="0 0 24 24"><path {...stroke} d="M12 6C10 4.2 7 4 4 4.8V19c3-.8 6-.6 8 1 2-1.6 5-1.8 8-1V4.8C17 4 14 4.2 12 6z" /><path {...stroke} d="M12 6v14" /></svg>
  ),
  paw: (
    <svg width="20" height="20" viewBox="0 0 24 24"><circle {...stroke} cx="7" cy="8" r="1.9" /><circle {...stroke} cx="12" cy="6" r="1.9" /><circle {...stroke} cx="17" cy="8" r="1.9" /><path {...stroke} d="M12 11c-3 0-5.5 2.4-5.5 4.7 0 1.6 1.2 2.8 2.8 2.8 1 0 1.8-.4 2.7-.4s1.7.4 2.7.4c1.6 0 2.8-1.2 2.8-2.8C17.5 13.4 15 11 12 11z" /></svg>
  ),
  target: (
    <svg width="20" height="20" viewBox="0 0 24 24"><circle {...stroke} cx="12" cy="12" r="8" /><circle {...stroke} cx="12" cy="12" r="3.5" /><circle cx="12" cy="12" r="1.2" fill="var(--ink)" /></svg>
  ),
  sliders: (
    <svg width="20" height="20" viewBox="0 0 24 24"><path {...stroke} d="M4 7h16M4 12h16M4 17h16" /><circle {...stroke} cx="9" cy="7" r="2" fill="var(--cream)" /><circle {...stroke} cx="15" cy="12" r="2" fill="var(--cream)" /><circle {...stroke} cx="8" cy="17" r="2" fill="var(--cream)" /></svg>
  ),
  shield: (
    <svg width="20" height="20" viewBox="0 0 24 24"><path {...stroke} d="M12 3l7 2.8v5.4c0 4.8-3 7.9-7 9.8-4-1.9-7-5-7-9.8V5.8L12 3z" /><path {...stroke} d="M9 12l2 2 4-4.5" /></svg>
  ),
  person: (
    <svg width="20" height="20" viewBox="0 0 24 24"><circle {...stroke} cx="12" cy="7.5" r="3.5" /><path {...stroke} d="M5.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5" /></svg>
  ),
};

export function StickerCard({ icon, title, tint, tilt, children }: {
  icon: React.ReactNode; title: string; tint?: string; tilt?: number; children: React.ReactNode;
}) {
  return (
    <div
      className="gbSticker"
      style={{ '--tilt': `${tilt ?? 0}deg`, background: tint ?? '#fff', border: BORDER, borderRadius: 16, padding: '14px 16px', boxShadow: HARD, flex: '1 1 230px', minWidth: 220, maxWidth: 330 } as React.CSSProperties}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7 }}>
        <span style={{ flex: 'none', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', border: `2px solid var(--ink)`, borderRadius: 10, boxShadow: HARD2 }}>
          {icon}
        </span>
        <span style={{ fontFamily: FFD, fontWeight: 800, fontSize: 15.5, lineHeight: 1.15 }}>{title}</span>
      </div>
      <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--muted-1)', lineHeight: 1.5 }}>{children}</div>
    </div>
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
