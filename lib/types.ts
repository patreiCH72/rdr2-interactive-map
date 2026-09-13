export type CategoryId =
  | "bounty-poster"
  | "cigarette-card"
  | "dinosaur-bone"
  | "dreamcatcher"
  | "exotic"
  | "grave"
  | "hunting-request"
  | "item-request"
  | "legendary-animal"
  | "legendary-fish"
  | "plant"
  | "point-of-interest"
  | "robbery"
  | "rock-carving"
  | "shack"
  | "treasure"
  | "item"
  | "loot"
  | "weapon"
  | "wild-horse"
  | "interior"
  | "custom";

export type Location = {
  id: string;
  name: string;
  category: CategoryId;
  x: number;
  y: number;
  region?: string;
  description?: string;
  tips?: string;
};

export type CustomLocation = Location & {
  category: "custom";
  notes?: string;
};

export type Tool = "pan" | "measure" | "snipe" | "place-custom";

export type MapStyle = "default" | "detailed";

export type ProgressExport = {
  version: 1;
  found: string[];
  custom: CustomLocation[];
};
