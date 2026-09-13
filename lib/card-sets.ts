import type { Location } from "./types";

const NAME_RE = /^(.+?) #(\d{2}) — (.+)$/;

export type ParsedCard = {
  set: string;
  number: number;
  title: string;
};

export type CardSet = {
  name: string;
  locations: Location[];
};

export function parseCardName(name: string): ParsedCard | null {
  const m = name.match(NAME_RE);
  if (!m) return null;
  return { set: m[1], number: Number(m[2]), title: m[3] };
}

export function cardSetOf(loc: Location): string | null {
  return parseCardName(loc.name)?.set ?? null;
}

export function groupCardSets(locations: Location[]): CardSet[] {
  const map = new Map<string, Location[]>();
  const order: string[] = [];
  for (const loc of locations) {
    const parsed = parseCardName(loc.name);
    const set = parsed?.set ?? "Andere";
    let list = map.get(set);
    if (!list) {
      list = [];
      map.set(set, list);
      order.push(set);
    }
    list.push(loc);
  }
  for (const list of map.values()) {
    list.sort((a, b) => {
      const na = parseCardName(a.name)?.number ?? 99;
      const nb = parseCardName(b.name)?.number ?? 99;
      return na - nb;
    });
  }
  return order.map((name) => ({ name, locations: map.get(name) ?? [] }));
}
