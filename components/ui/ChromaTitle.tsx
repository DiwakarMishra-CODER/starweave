interface Props {
  text: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function ChromaTitle({ text, size = 'md', className }: Props) {
  return (
    <span
      className={`chroma-title chroma-title--${size}${className ? ` ${className}` : ''}`}
      aria-label={text}
    >
      {text}
    </span>
  );
}
