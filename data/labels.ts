export type MapLabel = {
  id: string;
  name: string;
  x: number;
  y: number;
  kind: "region" | "city" | "detail";
};

/**
 * Die Hintergrundkarte enthält bereits Regionen- und Städtenamen.
 * Nur Orte ohne Aufdruck, und nur im Detailed-Modus.
 */
export const mapLabels: MapLabel[] = [
  { id: "d-wapiti", name: "Wapiti", x: 5878, y: 5682, kind: "detail" },
  { id: "d-colter", name: "Colter", x: 4444, y: 6104, kind: "detail" },
  { id: "d-lake", name: "Lake Isabella", x: 4753, y: 5879, kind: "detail" },
];
