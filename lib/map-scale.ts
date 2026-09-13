/**
 * Fiktiver Massstab für die Fan-Stitch-Karte (9000×7004).
 * 1 Karten-Einheit entspricht METERS_PER_UNIT Metern in der Spielwelt.
 * Quelle: https://www.reddit.com/r/reddeadredemption2/comments/zwwcz6/
 */
export const METERS_PER_UNIT = 4;

/** Pixelgrösse von public/map/detailed.jpg (Default ist halb so breit, gleiche Bounds). */
export const MAP_WIDTH = 9000;
export const MAP_HEIGHT = 7004;

/** Leaflet CRS.Simple: [y, x] mit y=0 im Süden (unten) und x=0 im Westen. */
export const MAP_BOUNDS: [[number, number], [number, number]] = [
  [0, 0],
  [MAP_HEIGHT, MAP_WIDTH],
];

export const MIN_ZOOM = -3.25;
export const MAX_ZOOM = 1.25;
/** Cluster, solange Zoom kleiner als dieser Wert ist. */
export const CLUSTER_BELOW_ZOOM = 0;

export const SNIPE_RING_METERS = 50;
export const SNIPE_RING_COUNT = 6;

export function toLatLng(x: number, y: number): [number, number] {
  return [y, x];
}

export function distanceMeters(
  points: { x: number; y: number }[],
): number {
  let d = 0;
  for (let i = 1; i < points.length; i++) {
    d += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  }
  return d * METERS_PER_UNIT;
}

export function formatMeters(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(2)} km`;
  }
  return `${Math.round(meters)} m`;
}

export function metersToMapUnits(meters: number): number {
  return meters / METERS_PER_UNIT;
}
