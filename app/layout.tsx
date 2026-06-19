import type { Metadata, Viewport } from 'next';
import { Baloo_2, Nunito } from 'next/font/google';
import './globals.css';

// Baloo 2 = rounded, chunky, friendly display font (titles, buttons, numbers).
const display = Baloo_2({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-display',
});

// Nunito = body / UI text.
const body = Nunito({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'Grooming Buddy',
  description: 'Your grooming coach when the instructor cannot be there.',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'Buddy', statusBarStyle: 'default' },
  icons: {
    icon: '/favicon-32.png',
    apple: '/apple-icon.png',
  },
};

// Phone-first: used one-handed at the grooming table.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#FFF8EE',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      {/* suppressHydrationWarning: browser extensions inject <body> attributes
          before hydration; this silences that false mismatch. */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
