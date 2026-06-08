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

/* ── Neo-brutalism light ── */
export const LIGHT: Theme = {
  bg:     '#FFFDE9',   // warm cream body
  surf:   '#F5F5E0',   // slightly deeper cream (input areas)
  card:   '#FFFFFF',   // white cards
  text:   '#111827',   // near-black
  sub:    '#6B7280',   // medium gray
  bdr:    '#0A0A18',   // hard black border — the brutalism
  dim:    '#E5E7EB',   // progress track / muted fills
  red:    '#EF4444',
  accent: '#0ECFB3',   // electric teal
  yellow: '#F5C842',   // warm amber yellow
};

/* ── Neo-brutalism dark ── */
export const DARK: Theme = {
  bg:     '#0A0A18',   // deep navy
  surf:   '#13131F',
  card:   '#1A1A2E',   // elevated card surface
  text:   '#F9FAFB',
  sub:    '#9CA3AF',
  bdr:    '#374151',
  dim:    '#2D2D42',
  red:    '#F87171',
  accent: '#0ECFB3',   // teal stays
  yellow: '#F5C842',
};
