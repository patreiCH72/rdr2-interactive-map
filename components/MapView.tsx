"use client";

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import L from "leaflet";
import {
  Circle,
  ImageOverlay,
  MapContainer,
  Marker,
  Polyline,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { categoryById } from "@/data/categories";
import { mapLabels } from "@/data/labels";
import { useMapState } from "@/context/MapProvider";
import { clusterLocations } from "@/lib/cluster";
import {
  CLUSTER_BELOW_ZOOM,
  MAP_BOUNDS,
  MAP_HEIGHT,
  MAP_WIDTH,
  MAX_ZOOM,
  METERS_PER_UNIT,
  MIN_ZOOM,
  SNIPE_RING_COUNT,
  SNIPE_RING_METERS,
  distanceMeters,
  formatMeters,
  metersToMapUnits,
  toLatLng,
} from "@/lib/map-scale";
import { clusterHtml, pinSvg } from "@/lib/pins";
import type { Location } from "@/lib/types";

const expandedBounds: [[number, number], [number, number]] = [
  [-200, -200],
  [MAP_HEIGHT + 200, MAP_WIDTH + 200],
];

function pinIcon(color: string, found: boolean) {
  return L.divIcon({
    className: "rdr-pin",
    html: pinSvg(color, found),
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -32],
  });
}

function clusterIcon(count: number) {
  return L.divIcon({
    className: "rdr-cluster-wrap",
    html: clusterHtml(count),
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

function labelIcon(text: string, kind: string) {
  return L.divIcon({
    className: `map-label map-label-${kind}`,
    html: `<span>${text}</span>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

function MapBridge() {
  const map = useMap();
  const { state, dispatch } = useMapState();

  useEffect(() => {
    map.fitBounds(MAP_BOUNDS, { animate: false, padding: [12, 12] });
    dispatch({ type: "zoom", z: map.getZoom() });
  }, [map, dispatch]);

  useEffect(() => {
    function relayout() {
      window.scrollTo(0, 0);
      map.invalidateSize({ animate: false });
    }
    function delayed() {
      relayout();
      window.setTimeout(relayout, 280);
    }
    window.addEventListener("resize", delayed);
    window.addEventListener("orientationchange", delayed);
    window.visualViewport?.addEventListener("resize", delayed);
    return () => {
      window.removeEventListener("resize", delayed);
      window.removeEventListener("orientationchange", delayed);
      window.visualViewport?.removeEventListener("resize", delayed);
    };
  }, [map]);

  useEffect(() => {
    const el = map.getContainer();
    el.style.cursor = state.tool === "pan" ? "grab" : "crosshair";
  }, [map, state.tool]);

  useMapEvents({
    zoomend() {
      dispatch({ type: "zoom", z: map.getZoom() });
    },
    mousemove(e) {
      dispatch({ type: "cursor", pt: { x: e.latlng.lng, y: e.latlng.lat } });
    },
    click(e) {
      const pt = { x: e.latlng.lng, y: e.latlng.lat };
      if (state.tool === "measure") {
        dispatch({ type: "add-measure", pt });
        return;
      }
      if (state.tool === "snipe") {
        dispatch({ type: "snipe", pt });
        return;
      }
      if (state.tool === "place-custom") {
        dispatch({ type: "place-custom", pt });
        return;
      }
      dispatch({ type: "select", id: null });
    },
  });

  return null;
}

function FocusController() {
  const map = useMap();
  const { state, allLocations } = useMapState();

  useEffect(() => {
    if (!state.focusId) return;
    const loc = allLocations.find((l) => l.id === state.focusId);
    if (!loc) return;
    const targetZoom = Math.max(map.getZoom(), CLUSTER_BELOW_ZOOM);
    map.flyTo(toLatLng(loc.x, loc.y), targetZoom, { duration: 0.55 });
  }, [state.focusId, state.focusNonce, allLocations, map]);

  return null;
}

function PinMarker({ loc }: { loc: Location }) {
  const ref = useRef<L.Marker | null>(null);
  const { state, dispatch, foundSet } = useMapState();
  const cat = categoryById[loc.category];
  const found = foundSet.has(loc.id);
  const interactive = state.tool === "pan";
  const icon = useMemo(
    () => pinIcon(cat.color, found),
    [cat.color, found],
  );

  useEffect(() => {
    const marker = ref.current;
    if (!marker) return;
    if (state.selectedId === loc.id || state.focusId === loc.id) {
      marker.openPopup();
    }
  }, [state.selectedId, state.focusId, state.focusNonce, loc.id]);

  return (
    <Marker
      ref={ref}
      position={toLatLng(loc.x, loc.y)}
      icon={icon}
      interactive={interactive}
      zIndexOffset={found ? 0 : 200}
      eventHandlers={{
        click: () => dispatch({ type: "select", id: loc.id }),
      }}
    >
      <Popup className="rdr-popup" closeButton>
        <PopupBody loc={loc} />
      </Popup>
    </Marker>
  );
}

function PopupBody({ loc }: { loc: Location }) {
  const { dispatch, foundSet } = useMapState();
  const cat = categoryById[loc.category];
  const found = foundSet.has(loc.id);

  return (
    <div className="min-w-[14rem] text-ink">
      <div className="mb-1 font-display text-base leading-tight">{loc.name}</div>
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <span
          className="rounded-sm px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-paper"
          style={{ background: cat.color }}
        >
          {cat.name}
        </span>
        {loc.region && (
          <span className="text-[11px] text-ink/70">{loc.region}</span>
        )}
      </div>
      {loc.description && <p className="mb-2 text-[13px] leading-snug">{loc.description}</p>}
      {loc.tips && <p className="mb-2 text-[12px] italic text-ink/70">{loc.tips}</p>}
      <label className="flex items-center gap-2 text-[13px]">
        <input
          type="checkbox"
          checked={found}
          onChange={() => dispatch({ type: "toggle-found", id: loc.id })}
          className="accent-[#6b4f3a]"
        />
        Gefunden
      </label>
      <button
        type="button"
        className="mt-2 text-[12px] underline decoration-[#8b5a2b]"
        onClick={() => dispatch({ type: "isolate", id: loc.id })}
      >
        Im Filter isolieren
      </button>
      {loc.category === "custom" && (
        <button
          type="button"
          className="mt-1 block text-[12px] text-red-800 underline"
          onClick={() => dispatch({ type: "delete-custom", id: loc.id })}
        >
          Pin löschen
        </button>
      )}
    </div>
  );
}

function MarkerLayer() {
  const map = useMap();
  const { visibleLocations, state } = useMapState();
  const items = useMemo(
    () => clusterLocations(visibleLocations, state.zoom),
    [visibleLocations, state.zoom],
  );

  return (
    <>
      {items.map((item) => {
        if (item.type === "marker") {
          return <PinMarker key={item.location.id} loc={item.location} />;
        }
        return (
          <Marker
            key={item.id}
            position={toLatLng(item.x, item.y)}
            icon={clusterIcon(item.count)}
            eventHandlers={{
              click: () => {
                map.setView(
                  toLatLng(item.x, item.y),
                  Math.min(map.getZoom() + 1.25, MAX_ZOOM),
                );
              },
            }}
          />
        );
      })}
    </>
  );
}

function LabelLayer() {
  const { state } = useMapState();
  const labels = mapLabels.filter((l) => {
    if (l.kind === "detail") return state.mapStyle === "detailed";
    return true;
  });
  return (
    <>
      {labels.map((l) => (
        <Marker
          key={l.id}
          position={toLatLng(l.x, l.y)}
          icon={labelIcon(l.name, l.kind)}
          interactive={false}
          keyboard={false}
        />
      ))}
    </>
  );
}

function MeasureLayer() {
  const { state, dispatch } = useMapState();
  const latlngs = state.measurePoints.map((p) => toLatLng(p.x, p.y));
  const last = state.measurePoints[state.measurePoints.length - 1];
  const meters = distanceMeters(state.measurePoints);
  return (
    <>
      {state.measurePoints.length > 1 && (
        <Polyline
          positions={latlngs}
          pathOptions={{ color: "#6b2b1a", weight: 3, opacity: 0.9 }}
        />
      )}
      {state.measurePoints.map((p, i) => (
        <Circle
          key={`mp-${i}`}
          center={toLatLng(p.x, p.y)}
          radius={6}
          pathOptions={{ color: "#6b2b1a", fillColor: "#f4e6c3", fillOpacity: 1, weight: 2 }}
        />
      ))}
      {state.measurePoints.length > 1 && last && (
        <Marker
          position={toLatLng(last.x, last.y)}
          icon={L.divIcon({
            className: "measure-label",
            html: `<span>${formatMeters(meters)}</span>`,
            iconSize: [0, 0],
            iconAnchor: [-10, -10],
          })}
          interactive={false}
        />
      )}
      {state.tool === "measure" && (
        <MeasureHint
          text={`Klicke Punkte — Distanz ${state.measurePoints.length > 1 ? formatMeters(meters) : "0 m"}`}
          onClear={() => dispatch({ type: "clear-measure" })}
        />
      )}
    </>
  );
}

function SnipeLayer() {
  const { state } = useMapState();
  const c = state.snipeCenter;
  const rings = Array.from({ length: SNIPE_RING_COUNT }, (_, i) => (i + 1) * SNIPE_RING_METERS);
  return (
    <>
      {c &&
        rings.map((meters) => (
          <Circle
            key={meters}
            center={toLatLng(c.x, c.y)}
            radius={metersToMapUnits(meters)}
            pathOptions={{
              color: "#5c1a1a",
              weight: 1,
              fillColor: "#5c1a1a",
              fillOpacity: 0.03,
            }}
          />
        ))}
      {c && (
        <Marker
          position={toLatLng(c.x, c.y)}
          icon={L.divIcon({
            className: "snipe-label",
            html: `<span>${SNIPE_RING_METERS} m Ringe · Massstab ${METERS_PER_UNIT} m/Einh.</span>`,
            iconSize: [0, 0],
            iconAnchor: [0, -8],
          })}
          interactive={false}
        />
      )}
      {state.tool === "snipe" && !c && (
        <MeasureHint text="Klicke auf die Karte für 50-m-Ringe (Sniping)" />
      )}
    </>
  );
}

function MeasureHint({ text, onClear }: { text: string; onClear?: () => void }) {
  const map = useMap();
  return createPortal(
    <div className="pointer-events-auto absolute top-3 left-1/2 z-[1000] -translate-x-1/2 rounded-sm border border-[#6b2b1a]/40 bg-[#f3e6c8]/95 px-3 py-1 text-xs text-ink shadow">
      {text}
      {onClear && (
        <button type="button" className="ml-2 underline" onClick={onClear}>
          Löschen
        </button>
      )}
    </div>,
    map.getContainer(),
  );
}

function MapToolbar() {
  const map = useMap();
  const { state, dispatch } = useMapState();

  return createPortal(
    <div className="pointer-events-none absolute right-3 bottom-8 z-[1000] flex items-end gap-2">
      <div className="pointer-events-auto flex h-9 overflow-hidden rounded-sm border border-[#6b4f3a] bg-[#f3e6c8] text-xs font-semibold text-ink shadow-md">
        <button
          type="button"
          className={`px-3 ${state.mapStyle === "default" ? "bg-[#6b4f3a] text-[#f3e6c8]" : ""}`}
          onClick={() => dispatch({ type: "set-style", style: "default" })}
        >
          Default
        </button>
        <button
          type="button"
          className={`px-3 ${state.mapStyle === "detailed" ? "bg-[#6b4f3a] text-[#f3e6c8]" : ""}`}
          onClick={() => dispatch({ type: "set-style", style: "detailed" })}
        >
          Detailed
        </button>
      </div>
      <div className="pointer-events-auto flex flex-col overflow-hidden rounded-sm border border-[#6b4f3a] bg-[#f3e6c8] text-ink shadow-md">
        <ToolBtn
          active={state.tool === "pan"}
          label="Hand (Pan)"
          onClick={() => dispatch({ type: "set-tool", tool: "pan" })}
        >
          <HandIcon />
        </ToolBtn>
        <ToolBtn
          active={state.tool === "measure"}
          label="Distanz messen"
          onClick={() => dispatch({ type: "set-tool", tool: "measure" })}
        >
          <PencilIcon />
        </ToolBtn>
        <ToolBtn
          active={state.tool === "snipe"}
          label="Sniping-Radius"
          onClick={() => dispatch({ type: "set-tool", tool: "snipe" })}
        >
          <TargetIcon />
        </ToolBtn>
        <ToolBtn label="Hineinzoomen" onClick={() => map.zoomIn()}>
          <span className="text-lg leading-none">+</span>
        </ToolBtn>
        <ToolBtn label="Hinauszoomen" onClick={() => map.zoomOut()}>
          <span className="text-lg leading-none">−</span>
        </ToolBtn>
      </div>
    </div>,
    map.getContainer(),
  );
}

function ToolBtn({
  children,
  onClick,
  active,
  label,
}: {
  children: ReactNode;
  onClick: () => void;
  active?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`flex h-9 w-9 items-center justify-center border-b border-[#6b4f3a]/30 last:border-b-0 ${
        active ? "bg-[#6b4f3a] text-[#f3e6c8]" : "hover:bg-[#e4d3ae]"
      }`}
    >
      {children}
    </button>
  );
}

function HandIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M8 11V6.5a1.5 1.5 0 013 0V11M11 10.5V5.5a1.5 1.5 0 013 0V11M14 10.5V7a1.5 1.5 0 013 0v8.5c0 2.5-2 5.5-5.5 5.5S6 18 6 15.5V12" strokeLinecap="round" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 20l4.5-1.2L19 8.3 15.7 5 5.2 15.5 4 20z" strokeLinejoin="round" />
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    </svg>
  );
}

function StatusBar() {
  const map = useMap();
  const { state } = useMapState();
  const x = state.cursor ? state.cursor.x.toFixed(1) : "—";
  const y = state.cursor ? state.cursor.y.toFixed(1) : "—";
  return createPortal(
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1000] flex justify-between bg-[#1a140e]/85 px-3 py-1 font-mono text-[11px] text-[#cbb892]">
      <span>
        x {x} · y {y}
      </span>
      <span>
        Zoom {state.zoom.toFixed(2)} · {METERS_PER_UNIT} m/Einh.
      </span>
    </div>,
    map.getContainer(),
  );
}

export default function MapView() {
  const { state } = useMapState();
  const url = state.mapStyle === "detailed" ? "/map/detailed.jpg" : "/map/default.jpg";

  return (
    <MapContainer
      crs={L.CRS.Simple}
      bounds={MAP_BOUNDS}
      maxBounds={expandedBounds}
      maxBoundsViscosity={0.8}
      minZoom={MIN_ZOOM}
      maxZoom={MAX_ZOOM}
      zoomSnap={0.25}
      zoomDelta={0.5}
      attributionControl={false}
      zoomControl={false}
      className="h-full w-full"
      style={{ background: "#3a2c1c" }}
    >
      <ImageOverlay key={url} url={url} bounds={MAP_BOUNDS} />
      <MapBridge />
      <FocusController />
      <LabelLayer />
      <MarkerLayer />
      <MeasureLayer />
      <SnipeLayer />
      <MapToolbar />
      <StatusBar />
    </MapContainer>
  );
}
