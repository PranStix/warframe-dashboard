// src/lib/fetchWorldState.ts
const WFS_API = "https://api.warframestat.us/pc";

export interface Alert {
  id: string;
  mission: {
    reward: {
      items?: string[];
      count?: number;
      credits?: number;
      // other fields...
    };
    node: string;
    faction: string;
    levelOverride?: string;
  };
  expiry: string;
}

export interface Fissure {
  id: string;
  node: string;
  tier: string; // e.g., "Lith", "Meso", "Neo", "Axi"
  enemy: string;
  missionType: string;
  expiry: string;
}

export interface BaroItem {
  item: string;
  ducats: number;
  credits: number;
}

export interface Baro {
  id: string;
  location: string;
  inventory: BaroItem[];
  startString: string;
  endString: string;
  active: boolean;
}

export interface WorldState {
  alerts: Alert[];
  fissures: Fissure[];
  voidTrader: Baro;
}

export async function fetchWorldState(): Promise<WorldState> {
  const res = await fetch(`${WFS_API}/?language=en`, {
    next: { revalidate: 60 }, // ISR: refresh every 60s
  });
  if (!res.ok) throw new Error("Failed to fetch world state");
  return res.json();
}
