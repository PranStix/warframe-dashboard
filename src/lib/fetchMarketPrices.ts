// src/lib/fetchMarketPrices.ts
import { WatchlistItem } from "./constants";

const WFM_API = "https://api.warframe.market/v2";

interface MarketItem {
  name: string;
  avg_price: number;
  min_price: number;
}

export async function fetchMarketPrices(
  items: WatchlistItem[],
): Promise<Record<string, MarketItem>> {
  const results: Record<string, MarketItem> = {};

  // Warframe.Market requires URL-safe item names
  const fetchPromises = items.map(async (itemName) => {
    const safeName = itemName
      .toLowerCase()
      .replace(/ /g, "_")
      .replace(/'/g, "");
    try {
      const res = await fetch(`${WFM_API}/items/${safeName}`, {
        headers: { Accept: "application/json" },
        next: { revalidate: 300 }, // cache for 5 mins
      });

      if (!res.ok) return;

      const data = await res.json();
      const stats = data.payload.item?.sell_stats?.[0]; // top order
      if (stats) {
        results[itemName] = {
          name: itemName,
          avg_price: Math.round(stats.avg),
          min_price: stats.min,
        };
      }
    } catch (err) {
      console.warn(`Failed to fetch price for ${itemName}`, err);
    }
  });

  await Promise.all(fetchPromises);
  return results;
}
