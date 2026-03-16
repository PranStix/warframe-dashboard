// src/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { fetchWorldState } from "@/lib/fetchWorldState";
import { fetchMarketPrices } from "@/lib/fetchMarketPrices";
import { WATCHLIST_ITEMS } from "@/lib/constants";

type PriceData = Record<string, { avg_price: number; min_price: number }>;

export default function Dashboard() {
  const [worldState, setWorldState] = useState<Awaited<
    ReturnType<typeof fetchWorldState>
  > | null>(null);
  const [prices, setPrices] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ws, pr] = await Promise.all([
        fetchWorldState(),
        fetchMarketPrices(WATCHLIST_ITEMS),
      ]);
      setWorldState(ws);
      setPrices(pr);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load data. Check console.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60_000); // refresh every 60s
    return () => clearInterval(interval);
  }, []);

  if (loading && !worldState)
    return <div className="p-6">Loading Warframe data...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">My Warframe Dashboard</h1>

      {/* Fissures */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Void Fissures</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {worldState?.fissures.map((f) => (
            <div key={f.id} className="bg-gray-800 p-3 rounded">
              <div className="font-mono">{f.node}</div>
              <div className="text-sm text-blue-300">
                {f.tier} • {f.missionType}
              </div>
              <div className="text-xs text-gray-400">
                Ends in: {timeUntil(f.expiry)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Alerts (filtered for valuable rewards) */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Alerts</h2>
        <div className="space-y-2">
          {worldState?.alerts
            .filter((alert) =>
              alert.mission.reward.items?.some((item) =>
                WATCHLIST_ITEMS.some((w) => item.includes(w.split(" ")[0])),
              ),
            )
            .map((alert) => (
              <div key={alert.id} className="bg-gray-800 p-3 rounded">
                <div>
                  {alert.mission.node} ({alert.mission.faction})
                </div>
                <div className="text-yellow-300">
                  Reward: {alert.mission.reward.items?.join(", ") || "Credits"}
                </div>
                <div className="text-xs text-gray-400">
                  Ends in: {timeUntil(alert.expiry)}
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* Baro */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          Baro Ki&apos;Teer:{" "}
          {worldState?.voidTrader.active ? "ON RELAY!" : "Not here"}
        </h2>
        {worldState?.voidTrader.active ? (
          <div>
            <p className="mb-2">📍 {worldState.voidTrader.location}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {worldState.voidTrader.inventory.slice(0, 4).map((item, i) => (
                <div key={i} className="bg-gray-800 p-2 rounded text-sm">
                  {item.item} — {item.ducats} Ducats +{" "}
                  {item.credits.toLocaleString()} Cr
                </div>
              ))}
            </div>
            <p className="text-xs mt-2 text-gray-400">
              Departs in: {timeUntil(worldState.voidTrader.endString)}
            </p>
          </div>
        ) : (
          <p>Next arrival: {worldState?.voidTrader.startString || "Unknown"}</p>
        )}
      </section>

      {/* Market Prices */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Watchlist Prices</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {WATCHLIST_ITEMS.map((item) => {
            const price = prices?.[item];
            return (
              <div key={item} className="bg-gray-800 p-3 rounded">
                <div className="font-medium">{item}</div>
                {price ? (
                  <div className="text-green-400">
                    {price.min_price}p (avg: {price.avg_price}p)
                  </div>
                ) : (
                  <div className="text-gray-500 italic">Not traded</div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

// Helper: Convert ISO string to "Xm Ys" remaining
function timeUntil(isoString: string): string {
  const diff = new Date(isoString).getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const mins = Math.floor(diff / 60_000);
  const secs = Math.floor((diff % 60_000) / 1000);
  return `${mins}m ${secs}s`;
}
