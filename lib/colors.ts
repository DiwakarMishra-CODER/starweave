import type { Layer } from '@/data/types';

export const LAYER_COLORS: Record<Layer, string> = {
  root: '#E8C87A',
  'post-punk': '#8891F2',
  'shoegaze-dreampop': '#F2A8C4',
  'indie-alt': '#5FD0C0',
  outside: '#EDEBF5',
};

export const LAYER_GLOW: Record<Layer, string> = {
  root: 'rgba(232, 200, 122, 0.7)',
  'post-punk': 'rgba(136, 145, 242, 0.7)',
  'shoegaze-dreampop': 'rgba(242, 168, 196, 0.7)',
  'indie-alt': 'rgba(95, 208, 192, 0.7)',
  outside: 'rgba(237, 235, 245, 0.7)',
};

export const LAYER_LABELS: Record<Layer, string> = {
  root: 'Roots',
  'post-punk': 'Post-punk / Goth',
  'shoegaze-dreampop': 'Shoegaze / Dream-pop',
  'indie-alt': 'Indie / Alt-rock',
  outside: 'Outside influences',
};

export const BG_COLOR = '#0E0B1A';
export const TEXT_COLOR = '#EDEAF7';
export const TEXT_MUTED = '#9B96B8';
export const EDGE_VERIFIED = 'rgba(237, 234, 247, 0.28)';
export const EDGE_SUGGESTED = 'rgba(155, 150, 184, 0.13)';
export const EDGE_PATH = '#F2A8C4';
export const EDGE_HOVER = 'rgba(242, 168, 196, 0.65)';

export const LAYERS: Layer[] = ['root', 'post-punk', 'shoegaze-dreampop', 'indie-alt', 'outside'];
