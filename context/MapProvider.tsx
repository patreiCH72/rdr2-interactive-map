"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";
import { defaultEnabled } from "@/data/categories";
import locationsData from "@/data/locations.json";
import {
  buildExport,
  loadCustom,
  loadFound,
  parseImport,
  saveCustom,
  saveFound,
} from "@/lib/storage";
import { cardSetOf } from "@/lib/card-sets";
import type {
  CustomLocation,
  Location,
  MapStyle,
  Tool,
} from "@/lib/types";

const demoLocations = locationsData as Location[];

export type MapState = {
  enabled: Record<string, boolean>;
  interiors: boolean;
  search: string;
  found: string[];
  custom: CustomLocation[];
  tool: Tool;
  mapStyle: MapStyle;
  selectedId: string | null;
  isolatedId: string | null;
  focusId: string | null;
  focusNonce: number;
  cursor: { x: number; y: number } | null;
  zoom: number;
  pendingCustom: { name: string; notes: string } | null;
  measurePoints: { x: number; y: number }[];
  snipeCenter: { x: number; y: number } | null;
  leftOpen: boolean;
  rightOpen: boolean;
  collapsed: Record<string, boolean>;
  enabledSets: Record<string, boolean>;
  ready: boolean;
};

type Action =
  | { type: "hydrate"; found: string[]; custom: CustomLocation[] }
  | { type: "toggle-cat"; id: string }
  | { type: "show-all" }
  | { type: "hide-all" }
  | { type: "toggle-interiors" }
  | { type: "set-search"; q: string }
  | { type: "toggle-found"; id: string }
  | { type: "set-tool"; tool: Tool }
  | { type: "set-style"; style: MapStyle }
  | { type: "select"; id: string | null }
  | { type: "isolate"; id: string | null }
  | { type: "focus"; id: string }
  | { type: "cursor"; pt: { x: number; y: number } | null }
  | { type: "zoom"; z: number }
  | { type: "pending-custom"; payload: { name: string; notes: string } | null }
  | { type: "place-custom"; pt: { x: number; y: number } }
  | { type: "delete-custom"; id: string }
  | { type: "add-measure"; pt: { x: number; y: number } }
  | { type: "clear-measure" }
  | { type: "snipe"; pt: { x: number; y: number } | null }
  | { type: "import"; found: string[]; custom: CustomLocation[] }
  | { type: "reset-progress" }
  | { type: "toggle-left" }
  | { type: "toggle-right" }
  | { type: "set-left"; open: boolean }
  | { type: "close-overlays" }
  | { type: "toggle-group"; id: string }
  | { type: "toggle-set"; name: string };

const initialState: MapState = {
  enabled: { ...defaultEnabled },
  interiors: false,
  search: "",
  found: [],
  custom: [],
  tool: "pan",
  mapStyle: "default",
  selectedId: null,
  isolatedId: null,
  focusId: null,
  focusNonce: 0,
  cursor: null,
  zoom: 0,
  pendingCustom: null,
  measurePoints: [],
  snipeCenter: null,
  leftOpen: false,
  rightOpen: false,
  collapsed: {},
  enabledSets: {},
  ready: false,
};

function reducer(state: MapState, action: Action): MapState {
  switch (action.type) {
    case "hydrate":
      return { ...state, found: action.found, custom: action.custom, ready: true };
    case "toggle-cat":
      return {
        ...state,
        isolatedId: null,
        enabled: { ...state.enabled, [action.id]: !state.enabled[action.id] },
      };
    case "show-all":
      return {
        ...state,
        isolatedId: null,
        enabled: { ...defaultEnabled },
        enabledSets: {},
      };
    case "hide-all":
      return {
        ...state,
        isolatedId: null,
        enabled: Object.fromEntries(Object.keys(defaultEnabled).map((k) => [k, false])),
      };
    case "toggle-set":
      return {
        ...state,
        isolatedId: null,
        enabledSets: {
          ...state.enabledSets,
          [action.name]: state.enabledSets[action.name] === false,
        },
      };
    case "toggle-interiors":
      return { ...state, interiors: !state.interiors, isolatedId: null };
    case "set-search":
      return { ...state, search: action.q };
    case "toggle-found": {
      const has = state.found.includes(action.id);
      return {
        ...state,
        found: has ? state.found.filter((id) => id !== action.id) : [...state.found, action.id],
      };
    }
    case "set-tool": {
      const next: MapState = { ...state, tool: action.tool };
      if (action.tool === "measure" && state.tool === "measure") {
        next.measurePoints = [];
      }
      if (action.tool === "snipe" && state.tool === "snipe") {
        next.snipeCenter = null;
      }
      if (action.tool !== "place-custom") {
        next.pendingCustom = null;
      }
      return next;
    }
    case "set-style":
      return { ...state, mapStyle: action.style };
    case "select":
      return { ...state, selectedId: action.id };
    case "isolate":
      return { ...state, isolatedId: action.id, selectedId: action.id };
    case "focus":
      return {
        ...state,
        selectedId: action.id,
        focusId: action.id,
        focusNonce: state.focusNonce + 1,
        leftOpen: false,
      };
    case "cursor":
      return { ...state, cursor: action.pt };
    case "zoom":
      return { ...state, zoom: action.z };
    case "pending-custom":
      return {
        ...state,
        pendingCustom: action.payload,
        tool: action.payload ? "place-custom" : "pan",
      };
    case "place-custom": {
      if (!state.pendingCustom) return state;
      const pin: CustomLocation = {
        id: `custom-${Date.now()}`,
        name: state.pendingCustom.name.trim() || "Eigener Pin",
        category: "custom",
        x: action.pt.x,
        y: action.pt.y,
        description: state.pendingCustom.notes.trim() || undefined,
        notes: state.pendingCustom.notes.trim() || undefined,
        region: "Custom",
      };
      return {
        ...state,
        custom: [...state.custom, pin],
        pendingCustom: null,
        tool: "pan",
        selectedId: pin.id,
        focusId: pin.id,
        focusNonce: state.focusNonce + 1,
      };
    }
    case "delete-custom":
      return {
        ...state,
        custom: state.custom.filter((c) => c.id !== action.id),
        found: state.found.filter((id) => id !== action.id),
        selectedId: state.selectedId === action.id ? null : state.selectedId,
        isolatedId: state.isolatedId === action.id ? null : state.isolatedId,
      };
    case "add-measure":
      return { ...state, measurePoints: [...state.measurePoints, action.pt] };
    case "clear-measure":
      return { ...state, measurePoints: [] };
    case "snipe":
      return { ...state, snipeCenter: action.pt };
    case "import":
      return { ...state, found: action.found, custom: action.custom };
    case "reset-progress":
      return { ...state, found: [] };
    case "toggle-left":
      return { ...state, leftOpen: !state.leftOpen, rightOpen: false };
    case "toggle-right":
      return { ...state, rightOpen: !state.rightOpen, leftOpen: false };
    case "set-left":
      return { ...state, leftOpen: action.open, rightOpen: action.open ? false : state.rightOpen };
    case "close-overlays":
      return {
        ...state,
        leftOpen: false,
        rightOpen: false,
        selectedId: null,
        pendingCustom: state.tool === "place-custom" ? null : state.pendingCustom,
        tool: state.tool === "place-custom" ? "pan" : state.tool,
        measurePoints: state.tool === "measure" ? [] : state.measurePoints,
        snipeCenter: state.tool === "snipe" ? null : state.snipeCenter,
      };
    case "toggle-group":
      return {
        ...state,
        collapsed: { ...state.collapsed, [action.id]: !state.collapsed[action.id] },
      };
    default:
      return state;
  }
}

type Ctx = {
  state: MapState;
  dispatch: Dispatch<Action>;
  demoLocations: Location[];
  allLocations: Location[];
  visibleLocations: Location[];
  foundSet: Set<string>;
};

const MapStateContext = createContext<Ctx | null>(null);

function matchesSearch(loc: Location, q: string): boolean {
  if (!q) return true;
  const hay = `${loc.name} ${loc.category} ${loc.region ?? ""} ${loc.description ?? ""}`.toLowerCase();
  return hay.includes(q);
}

export function MapProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    dispatch({ type: "hydrate", found: loadFound(), custom: loadCustom() });
  }, []);

  useEffect(() => {
    if (!state.ready) return;
    saveFound(state.found);
  }, [state.found, state.ready]);

  useEffect(() => {
    if (!state.ready) return;
    saveCustom(state.custom);
  }, [state.custom, state.ready]);

  const allLocations = useMemo(
    () => [...demoLocations, ...state.custom],
    [state.custom],
  );

  const foundSet = useMemo(() => new Set(state.found), [state.found]);

  const visibleLocations = useMemo(() => {
    const q = state.search.trim().toLowerCase();
    return allLocations.filter((loc) => {
      if (state.isolatedId) return loc.id === state.isolatedId;
      if (loc.category === "interior") {
        if (!state.interiors) return false;
      } else if (loc.category === "custom") {
        // always show custom pins unless searching excludes them
      } else if (!state.enabled[loc.category]) {
        return false;
      }
      if (loc.category === "cigarette-card") {
        const set = cardSetOf(loc);
        if (set && state.enabledSets[set] === false) return false;
      }
      return matchesSearch(loc, q);
    });
  }, [
    allLocations,
    state.enabled,
    state.enabledSets,
    state.interiors,
    state.search,
    state.isolatedId,
  ]);

  const value = useMemo(
    () => ({
      state,
      dispatch,
      demoLocations,
      allLocations,
      visibleLocations,
      foundSet,
    }),
    [state, allLocations, visibleLocations, foundSet],
  );

  return <MapStateContext.Provider value={value}>{children}</MapStateContext.Provider>;
}

export function useMapState(): Ctx {
  const ctx = useContext(MapStateContext);
  if (!ctx) throw new Error("useMapState must be used within MapProvider");
  return ctx;
}

export function useExportProgress() {
  const { state } = useMapState();
  return useCallback(() => {
    const payload = buildExport(state.found, state.custom);
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rdr2map-progress.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [state.found, state.custom]);
}

export function useImportProgress() {
  const { dispatch } = useMapState();
  return useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        const text = typeof reader.result === "string" ? reader.result : "";
        const parsed = parseImport(text);
        if (!parsed) {
          window.alert("Ungültige JSON-Datei.");
          return;
        }
        dispatch({ type: "import", found: parsed.found, custom: parsed.custom });
      };
      reader.readAsText(file);
    },
    [dispatch],
  );
}
