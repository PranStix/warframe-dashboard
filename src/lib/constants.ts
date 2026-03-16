export const WATCHLIST_ITEMS = [
  "Saryn Prime Blueprint",
  "Valkyr Prime Chassis",
  "Arcane Grace",
  "Forma Blueprint",
  "Exilus Weapon Adapter Blueprint",
] as const;

export type WatchlistItem = (typeof WATCHLIST_ITEMS)[number];
