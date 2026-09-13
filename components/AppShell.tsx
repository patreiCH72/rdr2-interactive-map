"use client";

import { useEffect } from "react";
import { MapProvider, useMapState } from "@/context/MapProvider";
import { CompassIcon } from "./CompassIcon";
import { LeftSidebar } from "./LeftSidebar";
import { MapCanvas } from "./MapCanvas";
import { RightSidebar } from "./RightSidebar";

function ShellInner() {
  const { state, dispatch } = useMapState();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if (e.key === "Escape") {
        if (typing) {
          target.blur();
          return;
        }
        dispatch({ type: "close-overlays" });
        return;
      }

      if (e.key === "/" && !typing) {
        e.preventDefault();
        if (window.matchMedia("(max-width: 1023px)").matches) {
          dispatch({ type: "set-left", open: true });
        }
        requestAnimationFrame(() => {
          document.getElementById("map-search")?.focus();
        });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch]);

  return (
    <div className="flex h-dvh flex-col bg-leather text-paper">
      <header className="relative z-50 flex items-center gap-2 border-b border-gold/30 px-3 py-2 lg:hidden">
        <button
          type="button"
          className="rounded-sm border border-gold/30 px-2 py-1 text-xs"
          onClick={() => dispatch({ type: "toggle-left" })}
          aria-label="Filter"
        >
          Filter
        </button>
        <CompassIcon className="h-7 w-7" />
        <span className="font-display text-sm tracking-wide text-gold">RDR2 Map</span>
        <button
          type="button"
          className="ml-auto rounded-sm border border-gold/30 px-2 py-1 text-xs"
          onClick={() => dispatch({ type: "toggle-right" })}
          aria-label="Fortschritt"
        >
          Progress
        </button>
      </header>

      <div className="flex min-h-0 flex-1">
        <LeftSidebar />
        <main className="relative z-0 isolate min-w-0 flex-1 overflow-hidden">
          <MapCanvas />
          {(state.leftOpen || state.rightOpen) && (
            <button
              type="button"
              className="absolute inset-0 z-30 bg-black/40 lg:hidden"
              aria-label="Overlay schliessen"
              onClick={() => dispatch({ type: "close-overlays" })}
            />
          )}
        </main>
        <RightSidebar />
      </div>
    </div>
  );
}

export function AppShell() {
  return (
    <MapProvider>
      <ShellInner />
    </MapProvider>
  );
}
