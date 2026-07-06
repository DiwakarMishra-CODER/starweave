import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ArtistCard from '@/components/artist/ArtistCard';
import type { Artist } from '@/data/types';

const genreNames = {
  shoegaze: 'Shoegaze',
  'dream-pop': 'Dream pop',
  'alt-rock': 'Alternative rock',
};

const baseArtist: Artist = {
  id: 'my-bloody-valentine',
  name: 'My Bloody Valentine',
  layer: 'shoegaze-dreampop',
  genres: ['shoegaze', 'dream-pop'],
  scope: ['shoegaze-dreampop-v1'],
  country: 'IE',
  activeFrom: 1983,
  influenceScore: 9,
};

describe('ArtistCard', () => {
  it('renders the artist name', () => {
    render(<ArtistCard artist={baseArtist} genreNames={genreNames} />);
    expect(screen.getByText('My Bloody Valentine')).toBeInTheDocument();
  });

  it('renders genre labels (up to 2)', () => {
    render(<ArtistCard artist={baseArtist} genreNames={genreNames} />);
    expect(screen.getByText(/Shoegaze/)).toBeInTheDocument();
  });

  it('renders influence score when > 0', () => {
    render(<ArtistCard artist={baseArtist} genreNames={genreNames} />);
    expect(screen.getByText(/9 influences/)).toBeInTheDocument();
  });

  it('omits influence score when zero', () => {
    const noScore: Artist = { ...baseArtist, influenceScore: 0 };
    render(<ArtistCard artist={noScore} genreNames={genreNames} />);
    expect(screen.queryByText(/influence/)).toBeNull();
  });

  it('links to the correct artist page', () => {
    render(<ArtistCard artist={baseArtist} genreNames={genreNames} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/artist/my-bloody-valentine');
  });

  it('renders with an artist that has no spotifyId (no crash)', () => {
    const noSpotify: Artist = { ...baseArtist, spotifyId: null };
    expect(() => render(<ArtistCard artist={noSpotify} genreNames={genreNames} />)).not.toThrow();
  });
});
