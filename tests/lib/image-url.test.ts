import { describe, it, expect } from 'vitest';
import { sizedImageUrl, imageSrcSet } from '@/lib/image-url';

const DEEZER = 'https://cdn-images.dzcdn.net/images/artist/abc/250x250-000000-80-0-0.jpg';
const ITUNES = 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/c2/x.jpg/600x600bb.jpg';
const APPLE_ARTIST = 'https://is1-ssl.mzstatic.com/image/thumb/AMCArtistImages211/v4/8a/y.png/250x250cc.jpg';
const CAA = 'https://coverartarchive.org/release/1a53/38629786164-500.jpg';

describe('sizedImageUrl', () => {
  it('resizes a Deezer photo, capped at 1000', () => {
    expect(sizedImageUrl(DEEZER, 500)).toMatch(/\/500x500-000000-80-0-0\.jpg$/);
    expect(sizedImageUrl(DEEZER, 2000)).toMatch(/\/1000x1000-000000-80-0-0\.jpg$/);
  });

  it('resizes an iTunes cover and keeps an Apple crop mode', () => {
    expect(sizedImageUrl(ITUNES, 1200)).toMatch(/\/1200x1200bb\.jpg$/);
    expect(sizedImageUrl(APPLE_ARTIST, 1000)).toMatch(/\/1000x1000cc\.jpg$/);
  });

  it('routes a Cover Art Archive cover through the image optimiser at an allowed width', () => {
    expect(sizedImageUrl(CAA, 600)).toBe(
      `/_next/image?url=${encodeURIComponent(CAA)}&w=640&q=75`,
    );
    expect(sizedImageUrl(CAA, 1000)).toBe(
      `/_next/image?url=${encodeURIComponent(CAA.replace('-500.jpg', '-1200.jpg'))}&w=1080&q=75`,
    );
  });

  it('leaves an unknown host alone', () => {
    const other = 'https://example.com/photo.jpg';
    expect(sizedImageUrl(other, 1000)).toBe(other);
  });
});

describe('imageSrcSet', () => {
  it('lists each width once, dropping widths clamped to the same file', () => {
    expect(imageSrcSet(DEEZER, [250, 1000, 1200])).toBe(
      `${sizedImageUrl(DEEZER, 250)} 250w, ${sizedImageUrl(DEEZER, 1000)} 1000w`,
    );
  });

  it('is undefined for a host that cannot resize', () => {
    expect(imageSrcSet('https://example.com/photo.jpg')).toBeUndefined();
  });
});
