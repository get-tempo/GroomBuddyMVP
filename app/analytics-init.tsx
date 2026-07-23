'use client';

// Mount-once PostHog init for the marketing pages (the app initializes it
// itself in BuddyApp). Without this, /welcome and /diy pageviews are invisible.
import { useEffect } from 'react';
import { initAnalytics } from '@/lib/analytics';

export default function AnalyticsInit() {
  useEffect(() => { initAnalytics(); }, []);
  return null;
}
