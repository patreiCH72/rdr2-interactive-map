import type { CustomLocation, ProgressExport } from "./types";

export const PROGRESS_KEY = "rdr2map.progress.v1";
export const CUSTOM_KEY = "rdr2map.custom.v1";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadFound(): string[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string");
  } catch {
    return [];
  }
}

export function saveFound(found: string[]): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(found));
}

export function loadCustom(): CustomLocation[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(CUSTOM_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isCustomLocation);
  } catch {
    return [];
  }
}

export function saveCustom(custom: CustomLocation[]): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(CUSTOM_KEY, JSON.stringify(custom));
}

export function isCustomLocation(value: unknown): value is CustomLocation {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.name === "string" &&
    v.category === "custom" &&
    typeof v.x === "number" &&
    typeof v.y === "number"
  );
}

export function buildExport(found: string[], custom: CustomLocation[]): ProgressExport {
  return { version: 1, found, custom };
}

export function parseImport(raw: string): ProgressExport | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const p = parsed as Record<string, unknown>;
    const found = Array.isArray(p.found)
      ? p.found.filter((id): id is string => typeof id === "string")
      : [];
    const custom = Array.isArray(p.custom) ? p.custom.filter(isCustomLocation) : [];
    return { version: 1, found, custom };
  } catch {
    return null;
  }
}
