import type { Metadata, Viewport } from 'next';
import { Space_Grotesk } from 'next/font/google';
import './globals.css';
import { Nav } from './components/Nav';

const display = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'Grooming Buddy',
  description: 'Your grooming coach when the instructor cannot be there.',
};

// Phone-first: used one-handed at the grooming table.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0E1116',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={display.variable}>
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
