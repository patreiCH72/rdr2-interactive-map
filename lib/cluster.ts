import { CLUSTER_BELOW_ZOOM } from "./map-scale";
import type { Location } from "./types";

export type ClusterItem =
  | { type: "marker"; location: Location }
  | {
      type: "cluster";
      id: string;
      x: number;
      y: number;
      count: number;
      locations: Location[];
    };

function cellSizeForZoom(zoom: number): number {
  if (zoom < -2) return 1400;
  if (zoom < -1) return 800;
  if (zoom < 0) return 400;
  return 220;
}

export function clusterLocations(
  locations: Location[],
  zoom: number,
): ClusterItem[] {
  if (zoom >= CLUSTER_BELOW_ZOOM) {
    return locations.map((location) => ({ type: "marker" as const, location }));
  }

  const cell = cellSizeForZoom(zoom);
  const buckets = new Map<string, Location[]>();

  for (const loc of locations) {
    const gx = Math.floor(loc.x / cell);
    const gy = Math.floor(loc.y / cell);
    const key = `${gx}:${gy}`;
    const list = buckets.get(key);
    if (list) list.push(loc);
    else buckets.set(key, [loc]);
  }

  const items: ClusterItem[] = [];
  for (const [key, group] of buckets) {
    if (group.length === 1) {
      items.push({ type: "marker", location: group[0] });
      continue;
    }
    const x = group.reduce((s, l) => s + l.x, 0) / group.length;
    const y = group.reduce((s, l) => s + l.y, 0) / group.length;
    items.push({
      type: "cluster",
      id: `cluster-${key}`,
      x,
      y,
      count: group.length,
      locations: group,
    });
  }
  return items;
}
