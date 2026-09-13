"use client";

import { useRef, useState } from "react";
import { categories } from "@/data/categories";
import {
  useExportProgress,
  useImportProgress,
  useMapState,
} from "@/context/MapProvider";
import { groupCardSets } from "@/lib/card-sets";

function Bar({ value, max }: { value: number; max: number }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className="h-1.5 overflow-hidden rounded-sm bg-ink/70">
      <div className="h-full bg-gold transition-all" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function RightSidebar() {
  const { state, dispatch, demoLocations } = useMapState();
  const exportProgress = useExportProgress();
  const importProgress = useImportProgress();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");

  const demoFound = demoLocations.filter((l) => state.found.includes(l.id)).length;
  const cardSets = groupCardSets(demoLocations.filter((l) => l.category === "cigarette-card"));
  const completeSets = cardSets.filter(
    (s) => s.locations.length > 0 && s.locations.every((l) => state.found.includes(l.id)),
  ).length;

  function placePin() {
    dispatch({
      type: "pending-custom",
      payload: { name: name.trim() || "Eigener Pin", notes: notes.trim() },
    });
  }

  return (
    <aside
      className={`fixed inset-y-0 right-0 z-40 flex w-[20rem] max-w-[88vw] flex-col border-l border-gold/30 bg-leather text-paper shadow-2xl transition-transform duration-200 lg:static lg:z-10 lg:max-w-none lg:translate-x-0 ${
        state.rightOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between border-b border-gold/25 px-4 py-4">
        <div>
          <h2 className="font-display text-sm tracking-wide text-gold">Progress Tracker</h2>
          <p className="text-[11px] text-paper-dim">Nur lokal — kein Login</p>
        </div>
        <button
          type="button"
          className="rounded border border-gold/20 px-2 py-1 text-xs lg:hidden"
          onClick={() => dispatch({ type: "toggle-right" })}
        >
          Schliessen
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        <div className="mb-4">
          <div className="mb-1 flex items-baseline justify-between text-sm">
            <span>Gesamt</span>
            <span className="font-mono text-gold">
              {demoFound}/{demoLocations.length}
            </span>
          </div>
          <Bar value={demoFound} max={demoLocations.length} />
        </div>

        {cardSets.length > 0 && (
          <p className="mb-2 text-[11px] text-paper-dim">
            Sets vollständig:{" "}
            <span className="font-mono text-gold">
              {completeSets}/{cardSets.length}
            </span>
          </p>
        )}

        {cardSets.length > 0 && (
          <ul className="space-y-2">
            {cardSets.map((set) => {
              const total = set.locations.length;
              const got = set.locations.filter((l) => state.found.includes(l.id)).length;
              const complete = got === total && total > 0;
              const open = !!state.collapsed[`progress:${set.name}`];
              return (
                <li key={set.name}>
                  <button
                    type="button"
                    className="mb-0.5 flex w-full items-center gap-2 text-left text-[12px]"
                    onClick={() =>
                      dispatch({ type: "toggle-group", id: `progress:${set.name}` })
                    }
                    aria-expanded={open}
                  >
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${complete ? "bg-gold" : "bg-paper-dim"}`}
                    />
                    <span className={`min-w-0 flex-1 truncate ${complete ? "text-gold" : ""}`}>
                      {set.name}
                    </span>
                    {complete && <span className="text-gold">✓</span>}
                    <span className={`font-mono text-[11px] ${complete ? "text-gold" : "text-paper-dim"}`}>
                      {got}/{total}
                    </span>
                  </button>
                  <Bar value={got} max={total} />
                  {open && (
                    <ul className="mt-1 space-y-0.5 pl-4">
                      {set.locations.map((loc) => {
                        const found = state.found.includes(loc.id);
                        const title = loc.name.replace(/^.+? #\d{2} — /, "");
                        return (
                          <li key={loc.id}>
                            <button
                              type="button"
                              className={`block w-full truncate text-left text-[11px] hover:text-gold ${
                                found ? "text-paper-dim line-through" : "text-paper"
                              }`}
                              onClick={() => dispatch({ type: "focus", id: loc.id })}
                            >
                              {title}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        <ul className={`${cardSets.length > 0 ? "mt-4" : ""} space-y-2`}>
          {categories
            .filter((c) => c.id !== "cigarette-card")
            .filter((c) => c.group === "collectibles" || c.group === "pickups" || c.group === "interiors")
            .map((cat) => {
              const items = demoLocations.filter((l) => l.category === cat.id);
              const total = items.length;
              if (total === 0) return null;
              const got = items.filter((l) => state.found.includes(l.id)).length;
              const complete = got === total;
              const open = !!state.collapsed[`progress-cat:${cat.id}`];
              return (
                <li key={cat.id}>
                  <button
                    type="button"
                    className="mb-0.5 flex w-full items-center gap-2 text-left text-[12px]"
                    onClick={() =>
                      dispatch({ type: "toggle-group", id: `progress-cat:${cat.id}` })
                    }
                    aria-expanded={open}
                  >
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ background: complete ? "#c9a227" : cat.color }}
                    />
                    <span className={`min-w-0 flex-1 truncate ${complete ? "text-gold" : ""}`}>
                      {cat.name}
                    </span>
                    {complete && <span className="text-gold">✓</span>}
                    <span className={`font-mono text-[11px] ${complete ? "text-gold" : "text-paper-dim"}`}>
                      {got}/{total}
                    </span>
                  </button>
                  <Bar value={got} max={total} />
                  {open && (
                    <ul className="mt-1 space-y-0.5 pl-4">
                      {items
                        .slice()
                        .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
                        .map((loc) => {
                          const found = state.found.includes(loc.id);
                          return (
                            <li key={loc.id}>
                              <button
                                type="button"
                                className={`block w-full truncate text-left text-[11px] hover:text-gold ${
                                  found ? "text-paper-dim line-through" : "text-paper"
                                }`}
                                onClick={() => dispatch({ type: "focus", id: loc.id })}
                              >
                                {loc.name}
                              </button>
                            </li>
                          );
                        })}
                    </ul>
                  )}
                </li>
              );
            })}
        </ul>

        <section className="mt-6 border-t border-gold/20 pt-4">
          <h3 className="font-display text-xs uppercase tracking-[0.18em] text-gold">
            Eigener Pin
          </h3>
          <form
            className="mt-2 space-y-2"
            onSubmit={(e) => {
              e.preventDefault();
              placePin();
            }}
          >
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="w-full rounded-sm border border-gold/30 bg-ink/60 px-3 py-2 text-sm outline-none focus:border-gold"
            />
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notiz"
              rows={3}
              className="w-full resize-y rounded-sm border border-gold/30 bg-ink/60 px-3 py-2 text-sm outline-none focus:border-gold"
            />
            <p className="text-[11px] text-paper-dim">Kategorie: Custom</p>
            <button
              type="submit"
              className="w-full rounded-sm border border-gold bg-gold/20 py-2 text-xs font-semibold uppercase tracking-wide text-gold hover:bg-gold/30"
            >
              Auf Karte setzen
            </button>
            {state.tool === "place-custom" && (
              <p className="text-center text-[12px] text-gold">
                Klicke auf die Karte, um den Pin zu platzieren.
              </p>
            )}
          </form>

          {state.custom.length > 0 && (
            <ul className="mt-3 space-y-1">
              {state.custom.map((pin) => (
                <li
                  key={pin.id}
                  className="flex items-center gap-2 rounded-sm bg-ink/40 px-2 py-1 text-[12px]"
                >
                  <button
                    type="button"
                    className="flex-1 truncate text-left hover:text-gold"
                    onClick={() => dispatch({ type: "focus", id: pin.id })}
                  >
                    {pin.name}
                  </button>
                  <button
                    type="button"
                    className="text-paper-dim hover:text-red-300"
                    onClick={() => dispatch({ type: "delete-custom", id: pin.id })}
                    aria-label={`${pin.name} löschen`}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="space-y-2 border-t border-gold/25 px-4 py-3">
        <div className="flex gap-2">
          <button
            type="button"
            className="flex-1 rounded-sm border border-gold/35 py-2 text-[11px] font-semibold uppercase tracking-wide hover:bg-gold/15"
            onClick={exportProgress}
          >
            Export JSON
          </button>
          <button
            type="button"
            className="flex-1 rounded-sm border border-gold/35 py-2 text-[11px] font-semibold uppercase tracking-wide hover:bg-gold/15"
            onClick={() => fileRef.current?.click()}
          >
            Import JSON
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) importProgress(file);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          className="w-full rounded-sm border border-red-900/60 py-2 text-[11px] font-semibold uppercase tracking-wide text-red-200/80 hover:bg-red-950/40"
          onClick={() => {
            if (window.confirm("Fortschritt (gefunden) zurücksetzen? Eigene Pins bleiben.")) {
              dispatch({ type: "reset-progress" });
            }
          }}
        >
          Reset Progress
        </button>
      </div>
    </aside>
  );
}
