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
    render(<ArtistCard artist={baseArtist} genreNames={genreNames} roots={3} descendants={9} />);
    expect(screen.getByText('My Bloody Valentine')).toBeInTheDocument();
  });

  it('renders genre labels (up to 2)', () => {
    render(<ArtistCard artist={baseArtist} genreNames={genreNames} roots={3} descendants={9} />);
    expect(screen.getByText(/Shoegaze/)).toBeInTheDocument();
  });

  // The card used to print artist.influenceScore as "N influences", which is
  // in-degree — the opposite of what that phrase means. It said the Velvet
  // Underground, which cites nobody, had 56 influences.
  it('names each direction, descendants first', () => {
    render(<ArtistCard artist={baseArtist} genreNames={genreNames} roots={3} descendants={9} />);
    expect(screen.getByText('9 descendants · 3 roots')).toBeInTheDocument();
  });

  it('drops a zero side rather than printing it', () => {
    render(<ArtistCard artist={baseArtist} genreNames={genreNames} roots={10} descendants={0} />);
    expect(screen.getByText('10 roots')).toBeInTheDocument();
    expect(screen.queryByText(/descendant/)).toBeNull();
  });

  // A third of the graph (96 artists, Alvvays among them) has in-degree 0 and
  // used to render no count at all despite having stated influences.
  it('still shows a count for an artist nobody cites yet', () => {
    render(<ArtistCard artist={{ ...baseArtist, influenceScore: 0 }} genreNames={genreNames} roots={10} descendants={0} />);
    expect(screen.getByText('10 roots')).toBeInTheDocument();
  });

  it('uses singular forms for one', () => {
    render(<ArtistCard artist={baseArtist} genreNames={genreNames} roots={1} descendants={1} />);
    expect(screen.getByText('1 descendant · 1 root')).toBeInTheDocument();
  });

  it('prints nothing when an artist has no edges at all', () => {
    // Shouldn't occur — the project's no-orphans rule means every artist has
    // at least one edge — but the component must not render a bare separator.
    render(<ArtistCard artist={baseArtist} genreNames={genreNames} roots={0} descendants={0} />);
    expect(screen.queryByText(/root|descendant/)).toBeNull();
  });

  it('links to the correct artist page', () => {
    render(<ArtistCard artist={baseArtist} genreNames={genreNames} roots={3} descendants={9} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/artist/my-bloody-valentine');
  });

  it('renders with an artist that has no spotifyId (no crash)', () => {
    const noSpotify: Artist = { ...baseArtist, spotifyId: null };
    expect(() => render(<ArtistCard artist={noSpotify} genreNames={genreNames} roots={3} descendants={9} />)).not.toThrow();
  });
});
