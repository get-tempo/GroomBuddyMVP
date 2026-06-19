import type { Metadata, Viewport } from 'next';
import { Fredoka, Nunito } from 'next/font/google';
import './globals.css';
import { Nav } from './components/Nav';

// Fredoka = rounded, friendly, playful headings (the "doggy/fun" feel).
const display = Fredoka({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
});

// Nunito = warm, soft, very readable body text for one-handed reading at the table.
const body = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
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
  themeColor: '#FFF7EE',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      {/* suppressHydrationWarning: browser extensions (Grammarly, etc.) inject
          attributes into <body> before hydration; this silences that false mismatch. */}
      <body suppressHydrationWarning>
        <div className="app">
          <Nav />
          <div className="view">{children}</div>
        </div>
      </body>
    </html>
  );
}
