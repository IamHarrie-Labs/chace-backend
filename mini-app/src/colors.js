// Chace — dual theme tokens
// Each export is a function of isDark so every component
// simply calls C(isDark) and destructures what it needs.
export const LIGHT = {
    bg: '#F8F0E3', // warm cream
    surf: '#EFE4D0', // parchment — header / nav
    card: '#E8D9C0', // tan — cards
    text: '#1E0E04', // espresso — primary text
    sub: '#7A5235', // warm brown — labels
    bdr: '#C9AA82', // tan border
    dim: '#D8C4A5', // progress track
    red: '#A62B1F',
    accent: '#8B4B1A', // saddle brown — CTAs
};
export const DARK = {
    bg: '#150C07', // espresso
    surf: '#261510', // dark chocolate
    card: '#372018', // warm dark brown
    text: '#F2E0CC', // warm cream
    sub: '#A07858', // warm tan
    bdr: '#4D2E1C', // border brown
    dim: '#3D2415', // track
    red: '#C0392B',
    accent: '#C68642', // copper
};
