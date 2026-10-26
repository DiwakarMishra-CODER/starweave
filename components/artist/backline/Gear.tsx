// What makes an instrument look played, not shown: the strap that holds it
// on an unseen player (woven camo, like Karly Hartzman's), and the pick that
// strums it. Drawn in the instrument's own units, inside its SVG.

/** The camo weave, as a paint for the strap: put inside the SVG's <defs>. */
export function Camo({ id }: { id: string }) {
  return (
    <pattern id={id} width="64" height="64" patternUnits="userSpaceOnUse">
      <rect width="64" height="64" fill="#5f5b3e" />
      <ellipse cx="14" cy="12" rx="13" ry="8" fill="#3e3b27" transform="rotate(25 14 12)" />
      <ellipse cx="46" cy="22" rx="10" ry="6" fill="#857a50" transform="rotate(-20 46 22)" />
      <ellipse cx="30" cy="44" rx="14" ry="7" fill="#2c2a1d" transform="rotate(10 30 44)" />
      <ellipse cx="56" cy="54" rx="9" ry="6" fill="#6f6a45" />
      <ellipse cx="6" cy="50" rx="7" ry="5" fill="#857a50" />
    </pattern>
  );
}

/** A strap, from the instrument's strap buttons up to the player's shoulder
 *  and round their back: each a path, drawn under the body. */
export function Strap({ paths, camo }: { paths: string[]; camo: string }) {
  return (
    <g fill="none" strokeLinecap="butt">
      {paths.map(d => (
        <g key={d}>
          <path d={d} stroke="#1f1d15" strokeWidth="30" />
          <path d={d} stroke={`url(#${camo})`} strokeWidth="26" />
        </g>
      ))}
    </g>
  );
}

/** A pick, its point down, in the player's hand: hidden until the music
 *  starts, then strumming (components/artist/backline/Room moves it). */
export function Pick({ color, pickRef }: { color: string; pickRef: (el: SVGGElement | null) => void }) {
  return (
    <g ref={pickRef} className="bline__pick">
      <path
        d="M0 18C-11 9 -15 -4 -13 -11C-11 -18 11 -18 13 -11C15 -4 11 9 0 18Z"
        fill={color}
        stroke="#1c1724"
        strokeOpacity="0.6"
        strokeWidth="1.5"
      />
      <path d="M-7 -9C-3 -12 3 -12 7 -9" fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}
