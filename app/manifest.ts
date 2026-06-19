import type { MetadataRoute } from 'next';

// PWA manifest: makes "Add to Home Screen" install Buddy like a real app
// (phone-first, used one-handed at the grooming table).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Grooming Buddy',
    short_name: 'Buddy',
    description: 'Your grooming coach when the instructor cannot be there.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fff7ee',
    theme_color: '#ff7a4d',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
