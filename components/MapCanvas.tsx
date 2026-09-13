"use client";

import dynamic from "next/dynamic";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#c4a574] font-display text-sm tracking-wide text-ink/70">
      Karte wird geladen…
    </div>
  ),
});

export function MapCanvas() {
  return <MapView />;
}
