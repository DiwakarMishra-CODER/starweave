// Drawn transport icons for the site's player (rather than typed symbols,
// which render differently on every device and look cheap). 24×24, filled
// with the current colour.

type IconProps = { className?: string };

const Svg = ({ className, children }: IconProps & { children: React.ReactNode }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false">
    {children}
  </svg>
);

export const PlayIcon = (p: IconProps) => <Svg {...p}><path d="M8 5.5v13l11-6.5z" /></Svg>;
export const PauseIcon = (p: IconProps) => <Svg {...p}><path d="M7 5h3.6v14H7zM13.4 5H17v14h-3.6z" /></Svg>;
export const PrevIcon = (p: IconProps) => <Svg {...p}><path d="M6 6h2.4v12H6zM19 6v12l-9-6z" /></Svg>;
export const NextIcon = (p: IconProps) => <Svg {...p}><path d="M15.6 6H18v12h-2.4zM5 6l9 6-9 6z" /></Svg>;
export const StopIcon = (p: IconProps) => <Svg {...p}><path d="M6.5 6.5h11v11h-11z" /></Svg>;
export const BackIcon = (p: IconProps) => (
  <svg className={p.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden focusable="false">
    <path d="M15 5l-7 7 7 7" />
  </svg>
);
export const FoldIcon = (p: IconProps) => (
  <svg className={p.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden focusable="false">
    <path d="M6 9l6 6 6-6" />
  </svg>
);
