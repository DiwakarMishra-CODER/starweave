import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { Fraunces, Inter, IBM_Plex_Mono } from 'next/font/google';
import TopNav from '@/components/layout/TopNav';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Starweave — indie influence graph',
  description:
    'An interactive force-directed graph tracing the influence lineage of shoegaze and dream-pop, rooted at the Velvet Underground.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${ibmPlexMono.variable}`}
      // The pre-paint script below may set data-story before React hydrates.
      suppressHydrationWarning
    >
      <body>
        {/* Runs before first paint, once per page load. `/` is prerendered
            with the home story in it, but a link to a selection on the map
            (/?artist=, ?genre=, ?scene=) should open on the map, and only the
            browser can see the query string. Hides the story until React
            takes over (lib/story-store.ts decides the same thing there). */}
        <script
          dangerouslySetInnerHTML={{
            __html: "if(location.pathname==='/'&&/[?&](artist|genre|scene)=/.test(location.search))document.documentElement.dataset.story='off'",
          }}
        />
        <TopNav />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
