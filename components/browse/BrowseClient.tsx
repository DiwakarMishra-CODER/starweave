'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Genre, Scene } from '@/data/types';
import FilterDropdown, { type FilterOption } from '@/components/browse/FilterDropdown';
import SortDropdown, { type SortOption } from '@/components/browse/SortDropdown';
import LineupFace, { type FaceState } from '@/components/browse/LineupFace';
import { useGraphData } from '@/components/graph/GraphDataProvider';
import { REALM_ORDER, arrange, billFor, realmName, type Arrangement, type Lineup, type Section } from '@/lib/browse-lineup';
import { REALM_COLORS } from '@/lib/colors';
import { sizedImageUrl } from '@/lib/image-url';
import { SONG_MS, player } from '@/lib/player';
import { toTrack } from '@/lib/player-library';
import { compareNames } from '@/lib/sort';

// /browse: every artist on the map as one festival bill told in faces
// (lib/browse-lineup). The billing is how many artists on the map name them
// as an influence.
//
// Pointing at anyone (or focusing them) brings their family to you: the
// strip pinned at the top shows the faces of who shaped them and who they
// shaped, wherever on the page you are. Clicking anyone opens their own
// bill: the whole poster rearranges around them, the faces flying into
// place -- who shaped them across the top, them large in the middle, who
// they shaped below, everyone else folded small underneath -- until "Back to
// the full bill" or Esc. (Lighting faces up in place was tried first and
// dropped: on a page this long the family was mostly off screen.)
//
// Search, genre, scene and era dim what doesn't match rather than removing
// it; "Show" gives A-Z and by-year lists; "Surprise me" opens a random
// artist's bill and plays them. The opening: the bill prints top-down
// (~1s, every visit, ended by any click, key or scroll; none under reduced
// motion).

type DropdownKey = 'genre' | 'scene' | 'era' | 'sort';
type FilterKind = 'genre' | 'scene' | 'era';
type Stage = 'off' | 'print' | 'on';
interface Peek { i: number; pinned: boolean }

const ARRANGEMENTS: SortOption[] = [
  { id: 'poster', label: 'Most influential' },
  { id: 'az', label: 'A – Z' },
  { id: 'year', label: 'By year' },
];

const PRINT_MS = 1300;
const SURPRISE_ID = 'browse:surprise';
const PEEK_LINGER_MS = 320; // long enough to move from a face up to the strip
const PEEK_BY_MAX = 8;
const PEEK_SHAPED_MAX = 14;
const FLY_MS = 560;
const FLY_EASE = 'cubic-bezier(0.2, 0.8, 0.25, 1)';

const ERA_BUCKETS = [
  { id: '1960s', label: '1960s', test: (y: number) => y < 1970 },
  { id: '1970s', label: '1970s', test: (y: number) => y >= 1970 && y < 1980 },
  { id: '1980s', label: '1980s', test: (y: number) => y >= 1980 && y < 1990 },
  { id: '1990s', label: '1990s', test: (y: number) => y >= 1990 && y < 2000 },
  { id: '2000s', label: '2000s', test: (y: number) => y >= 2000 && y < 2010 },
  { id: '2010s+', label: '2010s+', test: (y: number) => y >= 2010 },
];
const eraIdOf = (year: number | null) =>
  year == null ? 'unknown' : ERA_BUCKETS.find(b => b.test(year))?.id ?? 'unknown';

const KIND_LABELS: Record<FilterKind, string> = { genre: 'Genre', scene: 'Scene', era: 'Era' };

function toggleId(prev: Set<string>, id: string): Set<string> {
  const next = new Set(prev);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

// Names scale with their billing; never under 13px (the folded rest of a
// bill shows no names at all -- see CSS).
const nameSizeFor = (size: number) => (size >= 200 ? 28 : size >= 168 ? 22 : size >= 120 ? 17 : size >= 96 ? 15 : 13);

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

interface Props {
  lineup: Lineup;
  genres: Pick<Genre, 'id' | 'name'>[];
  scenes: Pick<Scene, 'id' | 'name' | 'memberIds'>[];
}

export default function BrowseClient({ lineup, genres, scenes }: Props) {
  const { artists } = lineup;
  const router = useRouter();
  const { data } = useGraphData();

  const [query, setQuery] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<Set<string>>(new Set());
  const [selectedScenes, setSelectedScenes] = useState<Set<string>>(new Set());
  const [selectedEras, setSelectedEras] = useState<Set<string>>(new Set());
  const [openDropdown, setOpenDropdown] = useState<DropdownKey | null>(null);
  const [how, setHow] = useState<Arrangement>('poster');
  const [peek, setPeek] = useState<Peek | null>(null);
  const [billOf, setBillOf] = useState<number | null>(null);
  const [stage, setStage] = useState<Stage>('off');
  const billRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const sections: Section[] = useMemo(
    () => (billOf !== null ? billFor(artists, billOf) : arrange(artists, how)),
    [artists, how, billOf],
  );
  const readingOrder = useMemo(() => sections.flatMap(s => s.items), [sections]);

  // ── Filters ──────────────────────────────────────────────────────────────
  const genreNames = useMemo(() => Object.fromEntries(genres.map(g => [g.id, g.name])), [genres]);
  const sceneNames = useMemo(() => Object.fromEntries(scenes.map(s => [s.id, s.name])), [scenes]);
  const genreOptions: FilterOption[] = useMemo(() => {
    const counts = new Map<string, number>();
    for (const a of artists) for (const g of a.genres) counts.set(g, (counts.get(g) ?? 0) + 1);
    return genres
      .map(g => ({ id: g.id, label: g.name, count: counts.get(g.id) ?? 0 }))
      .sort((a, b) => compareNames(a.label, b.label));
  }, [artists, genres]);
  const sceneOptions: FilterOption[] = useMemo(
    () => scenes.map(s => ({ id: s.id, label: s.name, count: s.memberIds.length })).sort((a, b) => compareNames(a.label, b.label)),
    [scenes],
  );
  const sceneMembership = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const s of scenes) for (const id of s.memberIds) {
      if (!map.has(id)) map.set(id, new Set());
      map.get(id)!.add(s.id);
    }
    return map;
  }, [scenes]);
  const eraOptions: FilterOption[] = useMemo(() => {
    const counts = new Map<string, number>();
    for (const a of artists) counts.set(eraIdOf(a.activeFrom), (counts.get(eraIdOf(a.activeFrom)) ?? 0) + 1);
    const unknown = counts.get('unknown') ?? 0;
    return [
      ...ERA_BUCKETS.map(b => ({ id: b.id, label: b.label, count: counts.get(b.id) ?? 0 })),
      ...(unknown > 0 ? [{ id: 'unknown', label: 'Unknown', count: unknown }] : []),
    ];
  }, [artists]);

  // What matches the search and filters, or null when nothing is set.
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q && !selectedGenres.size && !selectedScenes.size && !selectedEras.size) return null;
    const set = new Set<number>();
    artists.forEach((a, i) => {
      if (q && !a.name.toLowerCase().includes(q)) return;
      if (selectedGenres.size && !a.genres.some(g => selectedGenres.has(g))) return;
      if (selectedScenes.size) {
        const of = sceneMembership.get(a.id);
        if (!of || ![...selectedScenes].some(s => of.has(s))) return;
      }
      if (selectedEras.size && !selectedEras.has(eraIdOf(a.activeFrom))) return;
      set.add(i);
    });
    return set;
  }, [artists, query, selectedGenres, selectedScenes, selectedEras, sceneMembership]);
  const firstMatch = useMemo(() => (matches ? readingOrder.find(i => matches.has(i)) ?? null : null), [matches, readingOrder]);

  const activeFilters = useMemo(() => {
    const list: { kind: FilterKind; id: string; label: string }[] = [];
    for (const id of selectedGenres) list.push({ kind: 'genre', id, label: genreNames[id] ?? id });
    for (const id of selectedScenes) list.push({ kind: 'scene', id, label: sceneNames[id] ?? id });
    for (const id of selectedEras) list.push({ kind: 'era', id, label: eraOptions.find(o => o.id === id)?.label ?? id });
    return list;
  }, [selectedGenres, selectedScenes, selectedEras, genreNames, sceneNames, eraOptions]);

  const removeFilter = (kind: FilterKind, id: string) => {
    if (kind === 'genre') setSelectedGenres(prev => toggleId(prev, id));
    else if (kind === 'scene') setSelectedScenes(prev => toggleId(prev, id));
    else setSelectedEras(prev => toggleId(prev, id));
  };
  const clearAll = () => { setSelectedGenres(new Set()); setSelectedScenes(new Set()); setSelectedEras(new Set()); setQuery(''); };

  const showFace = useCallback((i: number, behavior: ScrollBehavior = 'smooth') => {
    billRef.current?.querySelector(`[data-face="${i}"]`)?.scrollIntoView({ block: 'center', behavior });
  }, []);

  // The first match comes into view as you type (after a short pause).
  useEffect(() => {
    if (firstMatch === null || !query.trim()) return;
    const t = setTimeout(() => showFace(firstMatch), 280);
    return () => clearTimeout(t);
  }, [firstMatch, query, showFace]);

  // ── Their own bill, with the faces flying to their new places ────────────
  // FLIP: note where every face is, change the bill, then start each face
  // from where it was and let it travel to where it now sits.
  const before = useRef<Map<string, DOMRect> | null>(null);
  const afterMove = useRef<(() => void) | null>(null);
  const reduced = useRef(false);
  useEffect(() => { reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches; }, []);

  const rearrange = useCallback((change: () => void, then: () => void) => {
    const rects = new Map<string, DOMRect>();
    billRef.current?.querySelectorAll<HTMLElement>('.lineup-face').forEach(el => rects.set(el.dataset.key!, el.getBoundingClientRect()));
    before.current = rects;
    afterMove.current = then;
    change();
  }, []);

  useLayoutEffect(() => {
    const was = before.current;
    const then = afterMove.current;
    before.current = null;
    afterMove.current = null;
    if (!was) return;
    then?.(); // scroll first, so the travel is measured from where things now are on screen
    if (reduced.current) return;
    const vh = window.innerHeight;
    billRef.current?.querySelectorAll<HTMLElement>('.lineup-face').forEach(el => {
      const a = was.get(el.dataset.key!);
      if (!a) return;
      const b = el.getBoundingClientRect();
      const onScreen = (r: DOMRect) => r.bottom > -100 && r.top < vh + 100;
      if (!onScreen(a) && !onScreen(b)) return;
      if (!onScreen(a) || Math.abs(a.top - b.top) > vh * 1.5) {
        // Coming from far away: rise into place rather than streak across.
        el.animate([{ opacity: 0, transform: 'translateY(24px) scale(0.92)' }, { opacity: 1, transform: 'none' }],
          { duration: FLY_MS, easing: FLY_EASE });
        return;
      }
      const dx = a.left - b.left, dy = a.top - b.top, s = a.width / b.width;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1 && Math.abs(s - 1) < 0.01) return;
      el.animate([
        { transformOrigin: 'top left', transform: `translate(${dx}px, ${dy}px) scale(${s})` },
        { transformOrigin: 'top left', transform: 'none' },
      ], { duration: FLY_MS, easing: FLY_EASE });
    });
  }, [sections]);

  const scrollToBill = useCallback(() => {
    const overlay = billRef.current?.closest('.browse-overlay');
    const top = topRef.current;
    if (overlay && top) overlay.scrollTop += top.getBoundingClientRect().top - 118; // clear of the pinned strip
  }, []);

  const openBill = useCallback((i: number) => {
    setPeek(null);
    rearrange(() => setBillOf(i), scrollToBill);
  }, [rearrange, scrollToBill]);

  const closeBill = useCallback(() => {
    const was = billOf;
    rearrange(() => setBillOf(null), () => { if (was !== null) showFace(was, 'auto'); });
  }, [billOf, rearrange, showFace]);

  // Esc: off the bill first, then the strip.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (billOf !== null) closeBill();
      else setPeek(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [billOf, closeBill]);

  // ── The strip: a face's family, brought to you ───────────────────────────
  const peekRef = useRef<Peek | null>(null);
  useEffect(() => { peekRef.current = peek; }, [peek]);
  const linger = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hold = () => { if (linger.current) clearTimeout(linger.current); };
  const letGo = useCallback(() => {
    if (linger.current) clearTimeout(linger.current);
    linger.current = setTimeout(() => setPeek(p => (p && !p.pinned ? null : p)), PEEK_LINGER_MS);
  }, []);
  const onPoint = useCallback((i: number) => {
    if (linger.current) clearTimeout(linger.current);
    if (peekRef.current?.pinned && peekRef.current.i !== i) return;
    setPeek(p => (p?.i === i ? p : { i, pinned: false }));
  }, []);
  const onLeave = useCallback(() => letGo(), [letGo]);
  const onActivate = useCallback((i: number, e: React.MouseEvent) => {
    // A new tab, a middle click or a modified click goes to the artist's page as usual.
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    const touch = (e.nativeEvent as PointerEvent).pointerType;
    if ((touch === 'touch' || touch === 'pen') && !(peekRef.current?.pinned && peekRef.current.i === i)) {
      // On a touch screen the first tap shows the family; a second opens the bill.
      setPeek({ i, pinned: true });
      return;
    }
    openBill(i);
  }, [openBill]);

  // A strip pinned by a tap stays until a tap lands somewhere else.
  useEffect(() => {
    if (!peek?.pinned) return;
    const away = (e: PointerEvent) => {
      if (!(e.target as HTMLElement).closest('.lineup-face, .lineup-caption')) setPeek(null);
    };
    window.addEventListener('pointerdown', away);
    return () => window.removeEventListener('pointerdown', away);
  }, [peek?.pinned]);

  const stateOf = (i: number, kind: Section['kind']): FaceState => {
    if (matches && !matches.has(i)) return 'dim';
    if (kind === 'star') return 'focus';
    if (kind === 'by') return 'by';
    if (kind === 'shaped') return 'shaped';
    if (kind === 'rest') return 'dim';
    return 'rest';
  };

  // ── Surprise me ──────────────────────────────────────────────────────────
  const surprise = () => {
    // Never a loud artist (the loud rule): a surprise isn't a choice.
    const loud = new Set(data?.artists.filter(a => a.loud).map(a => a.id));
    const pool = artists.map((_, i) => i).filter(i => artists[i].hasSong && !loud.has(artists[i].id) && i !== billOf && (!matches || matches.has(i)));
    if (!pool.length) return;
    const i = pool[Math.floor(Math.random() * pool.length)];
    openBill(i);
    const a = data?.artists.find(x => x.id === artists[i].id);
    if (a?.previewUrl) player.play({ id: SURPRISE_ID, title: 'Surprise me', stopMs: SONG_MS, tracks: [toTrack(a)] }, 0);
  };

  const playOne = (i: number) => {
    const a = data?.artists.find(x => x.id === artists[i].id);
    if (a?.previewUrl) player.play({ id: SURPRISE_ID, title: a.name, stopMs: SONG_MS, tracks: [toTrack(a)] }, 0);
  };

  // ── The opening ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reduced motion is only known here; the bill waits unprinted for it
      setStage('on');
      return;
    }
    setStage('print');
    const t = setTimeout(() => setStage('on'), PRINT_MS);
    const skip = () => setStage('on');
    const events = ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const;
    events.forEach(ev => window.addEventListener(ev, skip, { capture: true, passive: true, once: true }));
    return () => {
      clearTimeout(t);
      events.forEach(ev => window.removeEventListener(ev, skip, { capture: true }));
    };
  }, []);

  const peeked = peek ? artists[peek.i] : null;
  const star = billOf !== null ? artists[billOf] : null;
  const count = matches ? matches.size : artists.length;

  const mini = (j: number, ring: 'by' | 'shaped') => (
    <button
      key={`${ring}-${j}`}
      type="button"
      className="lineup-peek__face"
      data-ring={ring}
      title={artists[j].name}
      aria-label={`${artists[j].name}: see their family`}
      onClick={() => openBill(j)}
    >
      {artists[j].imageUrl
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={sizedImageUrl(artists[j].imageUrl!, 80)} alt="" draggable={false} />
        : <span>{artists[j].name.slice(0, 2)}</span>}
    </button>
  );
  const byNamed = (list: number[]) => [...list].sort((x, y) => artists[y].named - artists[x].named);

  return (
    <>
      <div className="lineup-controls">
        <input
          className="lineup-search"
          type="search"
          placeholder="Find an artist…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && firstMatch !== null) router.push(`/artist/${artists[firstMatch].id}`); }}
          aria-label="Find an artist"
        />
        <div className="lineup-controls__row" role="group" aria-label="Filters and arrangement">
          <FilterDropdown
            label="Genre"
            options={genreOptions}
            selected={selectedGenres}
            onToggle={id => setSelectedGenres(prev => toggleId(prev, id))}
            isOpen={openDropdown === 'genre'}
            onOpenChange={o => setOpenDropdown(o ? 'genre' : null)}
            searchable
          />
          <FilterDropdown
            label="Scene"
            options={sceneOptions}
            selected={selectedScenes}
            onToggle={id => setSelectedScenes(prev => toggleId(prev, id))}
            isOpen={openDropdown === 'scene'}
            onOpenChange={o => setOpenDropdown(o ? 'scene' : null)}
          />
          <FilterDropdown
            label="Era"
            options={eraOptions}
            selected={selectedEras}
            onToggle={id => setSelectedEras(prev => toggleId(prev, id))}
            isOpen={openDropdown === 'era'}
            onOpenChange={o => setOpenDropdown(o ? 'era' : null)}
          />
          <SortDropdown
            label="Show"
            options={ARRANGEMENTS}
            value={how}
            onChange={id => { const next = id as Arrangement; rearrange(() => { setBillOf(null); setHow(next); }, () => {}); }}
            isOpen={openDropdown === 'sort'}
            onOpenChange={o => setOpenDropdown(o ? 'sort' : null)}
          />
          <button type="button" className="lineup-surprise" onClick={surprise}>
            <span aria-hidden>&#10022;</span> Surprise me
          </button>
          <p className="lineup-count" aria-live="polite">
            {matches ? plural(count, 'match', 'matches') : `${count} artists`}
          </p>
        </div>
        {(activeFilters.length > 0 || query) && (
          <div className="lineup-chips">
            {activeFilters.map(f => (
              <span key={`${f.kind}-${f.id}`} className="lineup-chip">
                <span className="lineup-chip__kind">{KIND_LABELS[f.kind]}</span>
                {f.label}
                <button type="button" onClick={() => removeFilter(f.kind, f.id)} aria-label={`Remove ${KIND_LABELS[f.kind]} filter: ${f.label}`}>×</button>
              </span>
            ))}
            <button type="button" className="lineup-chips__clear" onClick={clearAll}>Clear all</button>
          </div>
        )}
      </div>

      {/* Pinned to the top: a face's family brought to you; on someone's own
          bill, the way back; at rest, the key. */}
      <div className="lineup-caption" onPointerEnter={hold} onPointerLeave={() => { if (!peek?.pinned) letGo(); }}>
        {peeked ? (
          <div className="lineup-peek" aria-live="polite">
            <span className="lineup-peek__who">
              <strong>{peeked.name}</strong>
              <span>{peeked.named ? `named by ${peeked.named}` : 'named by none yet'}</span>
            </span>
            <span className="lineup-peek__group">
              <em className="lineup-peek__label lineup-peek__label--by">Shaped by</em>
              {peeked.shapedBy.length
                ? byNamed(peeked.shapedBy).slice(0, PEEK_BY_MAX).map(j => mini(j, 'by'))
                : <span className="lineup-peek__none">nobody on the map</span>}
              {peeked.shapedBy.length > PEEK_BY_MAX && <span className="lineup-peek__more">+{peeked.shapedBy.length - PEEK_BY_MAX}</span>}
            </span>
            <span className="lineup-peek__group">
              <em className="lineup-peek__label lineup-peek__label--shaped">Shaped</em>
              {peeked.shaped.length
                ? byNamed(peeked.shaped).slice(0, PEEK_SHAPED_MAX).map(j => mini(j, 'shaped'))
                : <span className="lineup-peek__none">nobody yet</span>}
              {peeked.shaped.length > PEEK_SHAPED_MAX && <span className="lineup-peek__more">+{peeked.shaped.length - PEEK_SHAPED_MAX}</span>}
            </span>
            <span className="lineup-peek__actions">
              {billOf !== peek!.i && (
                <button type="button" className="lineup-peek__bill" onClick={() => openBill(peek!.i)}>See their family</button>
              )}
              <Link href={`/artist/${peeked.id}`} className="lineup-peek__open">Their page &rarr;</Link>
            </span>
          </div>
        ) : star ? (
          <div className="lineup-billbar">
            <button type="button" className="lineup-billbar__back" onClick={closeBill}>&larr; Back to everyone</button>
            <p>
              <strong>{star.name}&rsquo;s family:</strong>{' '}
              <span className="lineup-caption__blue">{plural(star.shapedBy.length, 'artist', 'artists')} who shaped them</span> above,{' '}
              <span className="lineup-caption__red">{plural(star.named, 'artist', 'artists')} they shaped</span> below.
            </p>
          </div>
        ) : (
          <>
            <p>
              <span>Bigger means named as an influence by more artists on the map.</span>{' '}
              <span>Point at anyone to see who shaped them and who they shaped; click to see their whole family.</span>
            </p>
            <p className="lineup-caption__key">
              {REALM_ORDER.map(r => (
                <span key={r} className="lineup-caption__realm">
                  <i style={{ background: REALM_COLORS[r] }} aria-hidden />{realmName(r)}
                </span>
              ))}
            </p>
          </>
        )}
      </div>

      <div ref={topRef} />
      <div ref={billRef} className="lineup" data-stage={stage} data-how={billOf !== null ? 'bill' : how}>
        {sections.map((sec, k) => (
          <section key={sec.id} className="lineup-tier" data-tier={sec.id} data-kind={sec.kind} aria-labelledby={`tier-${sec.id}`}>
            {sec.kind === 'star' ? (
              <h2 id={`tier-${sec.id}`} className="sr-only">{sec.heading}</h2>
            ) : (
              <h2 id={`tier-${sec.id}`} className="lineup-tier__heading" style={{ '--o': k } as React.CSSProperties}>
                {sec.heading}
              </h2>
            )}
            {sec.note && <p className="lineup-tier__note">{sec.note}</p>}
            {sec.items.length === 0 && sec.empty && <p className="lineup-tier__note">{sec.empty}</p>}
            <div className={sec.kind === 'star' ? 'lineup-star' : undefined}>
              <ul className="lineup-tier__faces">
                {sec.items.map(i => (
                  <LineupFace
                    key={i}
                    artist={artists[i]}
                    index={i}
                    size={sec.size}
                    nameSize={nameSizeFor(sec.size)}
                    state={stateOf(i, sec.kind)}
                    eager={k < 2}
                    order={how === 'poster' && billOf === null ? k : 0}
                    onPoint={onPoint}
                    onLeave={onLeave}
                    onActivate={onActivate}
                  />
                ))}
              </ul>
              {sec.kind === 'star' && star && (
                <div className="lineup-star__text">
                  <p className="lineup-star__counts">
                    <span className="lineup-caption__red">Named as an influence by {plural(star.named, 'artist', 'artists')}</span>
                    <span className="lineup-caption__blue">Names {plural(star.shapedBy.length, 'artist', 'artists')}</span>
                    {star.activeFrom && <span>Since {star.activeFrom} &middot; {realmName(star.realm)}</span>}
                  </p>
                  <p className="lineup-star__actions">
                    <Link href={`/artist/${star.id}`} className="lineup-star__open">Open their page &rarr;</Link>
                    {star.hasSong && (
                      <button type="button" className="lineup-star__play" onClick={() => playOne(billOf!)}>&#9654; Hear them</button>
                    )}
                    <button type="button" className="lineup-star__back" onClick={closeBill}>Back to everyone</button>
                  </p>
                </div>
              )}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}

