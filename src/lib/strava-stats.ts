import type { BeyondStat } from "./beyond";

/** Pure helpers for the Strava totals (kept free of server-only imports so they can be tested). */
export const RIDE_TYPES = ["Ride", "VirtualRide", "GravelRide", "MountainBikeRide"];
export const RUN_TYPES = ["Run", "TrailRun", "VirtualRun"];

export type Totals = { rides: number; rideKm: number; runs: number; runKm: number };
export type Activity = { sport_type?: string; type?: string; distance?: number };

/** Pure: count rides/runs and sum their distance (metres -> km). */
export function aggregateActivities(activities: Activity[]): Totals {
  const t: Totals = { rides: 0, rideKm: 0, runs: 0, runKm: 0 };
  for (const a of activities) {
    const type = a.sport_type ?? a.type ?? "";
    const km = (a.distance ?? 0) / 1000;
    if (RIDE_TYPES.includes(type)) {
      t.rides += 1;
      t.rideKm += km;
    } else if (RUN_TYPES.includes(type)) {
      t.runs += 1;
      t.runKm += km;
    }
  }
  return t;
}

const nf = (n: number) => Math.round(n).toLocaleString("en-US");
export const totalsToStats = (t: Totals): BeyondStat[] => [
  { value: nf(t.rides), label: "rides logged" },
  { value: nf(t.rideKm), label: "km ridden" },
  { value: nf(t.runs), label: "runs logged" },
  { value: nf(t.runKm), label: "km run" },
];

