export interface Theme {
  bg:     string;
  surf:   string;
  card:   string;
  text:   string;
  sub:    string;
  bdr:    string;
  dim:    string;
  red:    string;
  accent: string;
  yellow: string;
}

export const LIGHT: Theme = {
  bg:     '#F7C52E',   // vivid yellow — hero background
  surf:   '#F7C52E',   // same yellow for header/nav backing
  card:   '#FFFFFF',   // white floating cards
  text:   '#1A1A2E',   // deep navy
  sub:    '#6B7280',   // medium gray
  bdr:    '#E5E7EB',   // subtle border
  dim:    '#F3F4F6',   // progress track / empty state
  red:    '#EF4444',
  accent: '#7B61FF',   // purple — CTAs and active states
  yellow: '#F7C52E',
};

export const DARK: Theme = {
  bg:     '#13131F',   // deep navy
  surf:   '#1C1C2E',   // slightly lighter navy
  card:   '#252538',   // elevated card surface
  text:   '#FFFFFF',
  sub:    '#9CA3AF',
  bdr:    '#374151',
  dim:    '#2D2D42',
  red:    '#F87171',
  accent: '#9B87FF',   // lighter purple for dark mode
  yellow: '#F7C52E',
};
