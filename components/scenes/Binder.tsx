import Link from 'next/link';
import { sizedImageUrl } from '@/lib/image-url';
import type { LightboxScene } from '@/lib/scenes-lightbox';

// The log, as the photo editor's binder: one glassine sleeve per scene, in
// date order, holding a strip of film with a frame for each of its bands
// (dark film, sprocket holes, as on the lightbox above; cut after its last
// frame), the scene's name in grease pencil on the sleeve's label, its city
// and years typed under it, and who was there in small type below. Pointing
// at a sleeve slides it half out; it opens the scene. (The frames were
// negatives once -- inverted, orange -- and read as eerie, not crafted.)

export default function Binder({ scenes }: { scenes: LightboxScene[] }) {
  return (
    <section className="binder" aria-labelledby="binder-title">
      <h2 id="binder-title" className="binder__title">The log</h2>
      <div className="binder__page">
        <span className="binder__rings" aria-hidden><i /><i /><i /></span>
        <ol className="binder__sleeves">
          {scenes.map(s => (
            <li key={s.id} className="binder__item">
              <Link href={`/scene/${s.id}`} className="binder__sleeve" style={{ '--ink': s.ink, '--color': s.color } as React.CSSProperties}>
                <span className="binder__label">
                  <span className="binder__name">{s.name}</span>
                  <span className="binder__where">{s.city} &middot; {s.era}</span>
                </span>
                <span className="binder__strip" aria-hidden>
                  {s.members.map(m => (
                    <span key={m.id} className="binder__frame">
                      {m.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={sizedImageUrl(m.imageUrl, 120)} alt="" loading="lazy" />
                      )}
                    </span>
                  ))}
                </span>
              </Link>
              <p className="binder__who">{s.members.map(m => m.name).join(' · ')}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
