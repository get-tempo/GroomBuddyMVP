'use client';

import { useState } from 'react';
import { INK, BORDER, HARD, HARD2, FFD } from './marketing-ui';

// Pricing card with a yearly/monthly toggle, ported from askperi.ai's
// mechanism (per-card switch -> one class -> 250ms opacity crossfade on the
// stacked prices; knob slides via translateX). Styled to our sticker system.
//
// NOT mounted anywhere yet: real tiers don't exist until Stripe pricing is
// decided. When it is, drop <PriceCard/> into the pricing section:
//   <PriceCard name="Founding Member" monthly="$19/mo." yearly="$15/mo."
//     yearlyNote="Billed yearly ($180)" monthlyNote="Billed monthly"
//     features={[ '...', '...' ]} cta={{ href: '/', label: 'Start free' }} />

export function PriceCard({ name, monthly, yearly, monthlyNote, yearlyNote, features, cta }: {
  name: string; monthly: string; yearly: string; monthlyNote?: string; yearlyNote?: string;
  features: string[]; cta?: { href: string; label: string };
}) {
  const [showMonthly, setShowMonthly] = useState(false);
  const fade = (on: boolean): React.CSSProperties => ({
    gridArea: '1 / 1', transition: 'opacity 0.25s ease', opacity: on ? 1 : 0,
  });
  return (
    <div style={{ background: '#fff', border: BORDER, borderRadius: 26, padding: '22px 24px 24px', boxShadow: HARD, maxWidth: 340, flex: '1 1 280px', textAlign: 'center' }}>
      {/* billing toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 18 }}>
        <span style={{ fontFamily: FFD, fontWeight: 800, fontSize: 14, opacity: showMonthly ? 0.45 : 1, transition: 'opacity 0.25s ease' }}>Billed yearly</span>
        <button
          role="switch"
          aria-checked={showMonthly}
          aria-label="Switch to monthly billing"
          onClick={() => setShowMonthly(v => !v)}
          style={{ position: 'relative', width: 46, height: 26, borderRadius: 999, border: `2px solid ${INK}`, background: showMonthly ? 'var(--primary)' : 'var(--neutral-fill)', cursor: 'pointer', transition: 'background-color 0.25s ease', padding: 0 }}
        >
          <span style={{ position: 'absolute', top: 2, left: 2, width: 18, height: 18, borderRadius: '50%', background: '#fff', border: `2px solid ${INK}`, transition: 'transform 0.25s ease', transform: showMonthly ? 'translateX(20px)' : 'translateX(0)' }} />
        </button>
        <span style={{ fontFamily: FFD, fontWeight: 800, fontSize: 14, opacity: showMonthly ? 1 : 0.45, transition: 'opacity 0.25s ease' }}>Billed monthly</span>
      </div>

      <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 20 }}>{name}</div>

      {/* stacked crossfading prices */}
      <div style={{ display: 'grid', justifyItems: 'center', margin: '6px 0 4px' }}>
        <div style={fade(!showMonthly)}>
          <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 34, lineHeight: 1 }}>{yearly}</div>
          {yearlyNote && <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted-1)', marginTop: 4 }}>{yearlyNote}</div>}
        </div>
        <div style={fade(showMonthly)} aria-hidden={!showMonthly}>
          <div style={{ fontFamily: FFD, fontWeight: 800, fontSize: 34, lineHeight: 1 }}>{monthly}</div>
          {monthlyNote && <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted-1)', marginTop: 4 }}>{monthlyNote}</div>}
        </div>
      </div>

      <div style={{ borderTop: '2px dashed var(--dashed-border)', margin: '14px 0 4px' }} />
      {features.map(f => (
        <div key={f} style={{ fontSize: 14, fontWeight: 600, color: 'var(--muted-1)', padding: '7px 0', lineHeight: 1.45 }}>{f}</div>
      ))}

      {cta && (
        <a href={cta.href} style={{ display: 'inline-block', marginTop: 14, background: 'var(--primary)', color: INK, border: BORDER, borderRadius: 999, padding: '11px 22px', fontFamily: FFD, fontWeight: 800, fontSize: 15, textDecoration: 'none', boxShadow: HARD2 }}>
          {cta.label}
        </a>
      )}
    </div>
  );
}
