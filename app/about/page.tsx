import Link from 'next/link';
import type { Metadata } from 'next';
import { LAYER_COLORS } from '@/lib/colors';
import ArtistBackground from '@/components/artist/ArtistBackground';

export const metadata: Metadata = {
  title: 'About — Starweave',
};

// Roots gold — the page's own identity color (hero, title glow, atmosphere
// tint). Individual sections below layer in their own accent from the same
// palette via --section-accent, echoing how the graph itself uses layer
// colors, rather than one flat tint for the whole page.
const ABOUT_COLOR = LAYER_COLORS.root;

const LEGEND = [
  { label: 'Roots', color: LAYER_COLORS.root },
  { label: 'Post-punk', color: LAYER_COLORS['post-punk'] },
  { label: 'Shoegaze / Dream-pop', color: LAYER_COLORS['shoegaze-dreampop'] },
  { label: 'Indie / Alt-rock', color: LAYER_COLORS['indie-alt'] },
  { label: 'Outside influences', color: LAYER_COLORS.outside },
];

// A reading page, not the graph — same shell as the genre/scene pages, but
// an editorial arrival: a real hero, a live (unhurried) nebula behind it,
// and per-section accents from the graph's own layer palette instead of one
// flat tint and a uniform column.
export default function AboutPage() {
  return (
    <div
      className="about-overlay"
      style={{ '--genre-color': ABOUT_COLOR, '--layer-color': ABOUT_COLOR } as React.CSSProperties}
    >
      <ArtistBackground layerColor={ABOUT_COLOR} boost={0.9} />
      <div className="artist-bg-scrim" aria-hidden />

      <article className="genre-page">
        <header className="genre-page__header about-page__hero">
          <p className="genre-page__super">About</p>
          <h1 className="genre-page__title">Starweave</h1>
        </header>

        <section
          className="genre-page__section"
          style={{ '--section-accent': LAYER_COLORS.root } as React.CSSProperties}
        >
          <p className="about-page__eyebrow">The idea</p>
          <h2>What it is</h2>
          <p>
            Starweave is an interactive map of influence in indie music — a way to see not just
            what an artist sounds like, but where they came from and what they led to. Every node
            is an artist; every line is a thread of influence, running from the people who shaped
            a sound to the people who carried it forward.
          </p>
        </section>

        <section
          className="genre-page__section about-page__section--emphasis"
          style={{ '--section-accent': LAYER_COLORS['post-punk'] } as React.CSSProperties}
        >
          <p className="about-page__eyebrow">The approach</p>
          <h2>Why influence, not genre</h2>
          <p>
            Most music sites organize by genre tags or popularity. Starweave organizes by
            lineage — the actual connective tissue between artists. No sound appears from
            nowhere: the Velvet Underground&apos;s drones run through Joy Division and the Jesus
            and Mary Chain, into shoegaze, into the bands making records today. Genre tells you
            what something sounds like. Influence tells you the story of how it got here. That
            story is the thing Starweave tries to make visible.
          </p>
        </section>

        <section
          className="genre-page__section"
          style={{ '--section-accent': LAYER_COLORS['indie-alt'] } as React.CSSProperties}
        >
          <p className="about-page__eyebrow">How it works</p>
          <h2>How to read it</h2>

          <p className="about-page__statement">
            Nodes are artists; lines are influence, pointing from influencer to influenced.
          </p>

          <div className="about-page__legend">
            {LEGEND.map(({ label, color }) => (
              <div key={label} className="about-page__legend-item">
                <span
                  className="about-page__legend-swatch"
                  style={{ '--swatch-color': color } as React.CSSProperties}
                />
                <span className="about-page__legend-label">{label}</span>
              </div>
            ))}
          </div>
          <p className="about-page__caption">
            Colours group artists into layers — roots, post-punk, shoegaze / dream-pop,
            indie / alt-rock, and outside influences.
          </p>

          <p className="about-page__statement">
            Node size reflects how far an artist&apos;s influence reaches.
          </p>

          <div className="about-page__views">
            <Link href="/" className="about-page__view-card">
              <span className="about-page__view-label">Graph</span>
              <span className="about-page__view-desc">lets you explore freely</span>
            </Link>
            <Link href="/genre/shoegaze" className="about-page__view-card">
              <span className="about-page__view-label">Genres</span>
              <span className="about-page__view-desc">organize by sound</span>
            </Link>
            <Link href="/scene/american-underground" className="about-page__view-card">
              <span className="about-page__view-label">Scenes</span>
              <span className="about-page__view-desc">
                capture a specific time, place, and community
              </span>
            </Link>
          </div>

          <p>
            Right now Starweave maps one connected world — the guitar-indie lineage rooted in the
            Velvet Underground — with more to come.
          </p>
        </section>

        <section
          className="genre-page__section about-page__personal"
          style={{ '--section-accent': LAYER_COLORS['shoegaze-dreampop'] } as React.CSSProperties}
        >
          <p className="about-page__eyebrow">The maker</p>
          <h2>Diwakar Mishra</h2>
          <p>
            I&apos;m Diwakar Mishra. Music influence has fascinated me ever since I got into indie
            music and started falling down its endless branches of genres. Put on Alvvays and you
            can hear Cocteau Twins, My Bloody Valentine, The Smiths, Pavement, and Camera Obscura
            all at once. That&apos;s the thing I find beautiful: you can hear the lineage.
          </p>
          <p>
            And the lineage tells strange, wonderful stories. Cocteau Twins took the gloomy,
            atmospheric sound of gothic rock and post-punk and flipped it — kept all that density
            and reverb but pointed it the opposite way, toward something heavenly, dreamy, and
            otherworldly. They turned darkness into bliss, and in doing so invented dream pop —
            the most beautiful genre there is. You can trace a band making records now, like
            Geese, all the way back to the Velvet Underground in 1965. Starweave is my attempt to
            draw those lines — to make the hidden family tree of indie music something you can
            actually see and follow.
          </p>
          <p>
            It&apos;s built with Next.js, TypeScript, and react-force-graph, with a static data
            layer and an enrichment pipeline that pulls artist images, audio previews, and album
            art from open music sources. The influence graph, the layout, and the connections are
            all hand-curated.
          </p>
          <a
            href="https://github.com/DiwakarMishra-CODER/starweave"
            target="_blank"
            rel="noopener noreferrer"
            className="about-page__github-link"
          >
            View the source on GitHub
            <span className="about-page__github-link__arrow" aria-hidden>→</span>
          </a>
        </section>
      </article>
    </div>
  );
}
