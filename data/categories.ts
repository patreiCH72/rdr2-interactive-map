import type { CategoryId } from "@/lib/types";

export type CategoryDef = {
  id: CategoryId;
  name: string;
  color: string;
  group: "collectibles" | "pickups" | "interiors" | "custom";
};

export const categories: CategoryDef[] = [
  { id: "bounty-poster", name: "Bounty Poster", color: "#8B4513", group: "collectibles" },
  { id: "cigarette-card", name: "Cigarette Card", color: "#C4A35A", group: "collectibles" },
  { id: "dinosaur-bone", name: "Dinosaur Bone", color: "#A89070", group: "collectibles" },
  { id: "dreamcatcher", name: "Dreamcatcher", color: "#6B8E6B", group: "collectibles" },
  { id: "exotic", name: "Exotic", color: "#2E8B57", group: "collectibles" },
  { id: "grave", name: "Grave", color: "#5A5A5A", group: "collectibles" },
  { id: "hunting-request", name: "Hunting Request", color: "#A0522D", group: "collectibles" },
  { id: "item-request", name: "Item Request", color: "#CD853F", group: "collectibles" },
  { id: "legendary-animal", name: "Legendary Animal", color: "#B22222", group: "collectibles" },
  { id: "legendary-fish", name: "Legendary Fish", color: "#1E6B8A", group: "collectibles" },
  { id: "plant", name: "Plant", color: "#3D7A4A", group: "collectibles" },
  { id: "point-of-interest", name: "Point of Interest", color: "#DAA520", group: "collectibles" },
  { id: "robbery", name: "Robbery", color: "#5C1A1A", group: "collectibles" },
  { id: "rock-carving", name: "Rock Carving", color: "#7A6A53", group: "collectibles" },
  { id: "shack", name: "Shack", color: "#6B4F3A", group: "collectibles" },
  { id: "treasure", name: "Treasure", color: "#C9A227", group: "collectibles" },
  { id: "item", name: "Item", color: "#708090", group: "pickups" },
  { id: "loot", name: "Loot", color: "#B8860B", group: "pickups" },
  { id: "weapon", name: "Weapon", color: "#4B4B4B", group: "pickups" },
  { id: "wild-horse", name: "Wild Horse", color: "#8B6914", group: "pickups" },
  { id: "interior", name: "Interior", color: "#5C4033", group: "interiors" },
  { id: "custom", name: "Custom", color: "#5B7C99", group: "custom" },
];

export const categoryById: Record<CategoryId, CategoryDef> = Object.fromEntries(
  categories.map((c) => [c.id, c]),
) as Record<CategoryId, CategoryDef>;

export const filterGroups = [
  {
    id: "collectibles",
    label: "Collectibles",
    ids: categories.filter((c) => c.group === "collectibles").map((c) => c.id),
  },
  {
    id: "pickups",
    label: "Pickups",
    ids: categories.filter((c) => c.group === "pickups").map((c) => c.id),
  },
] as const;

export const defaultEnabled: Record<string, boolean> = Object.fromEntries(
  categories
    .filter((c) => c.group === "collectibles" || c.group === "pickups")
    .map((c) => [c.id, true]),
);
