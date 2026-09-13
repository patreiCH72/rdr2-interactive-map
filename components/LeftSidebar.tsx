"use client";

import { filterGroups, categoryById } from "@/data/categories";
import { useMapState } from "@/context/MapProvider";
import { groupCardSets, parseCardName } from "@/lib/card-sets";
import { CompassIcon } from "./CompassIcon";
import type { CategoryId } from "@/lib/types";

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? "rotate-90" : ""}`}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M7 4l8 6-8 6V4z" />
    </svg>
  );
}

function CheckMark() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0 text-gold" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0l-3.5-3.5a1 1 0 011.4-1.4L8.5 12l6.8-6.7a1 1 0 011.4 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function LeftSidebar() {
  const { state, dispatch, demoLocations, allLocations, foundSet } = useMapState();
  const customCount = state.custom.length;
  const interiorCount = demoLocations.filter((l) => l.category === "interior").length;
  const cardSets = groupCardSets(demoLocations.filter((l) => l.category === "cigarette-card"));
  const completeSets = cardSets.filter(
    (s) => s.locations.every((l) => foundSet.has(l.id)) && s.locations.length > 0,
  ).length;

  const countFor = (id: CategoryId) =>
    allLocations.filter((l) => l.category === id).length;

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-[20rem] max-w-[88vw] flex-col border-r border-gold/30 bg-leather text-paper shadow-2xl transition-transform duration-200 lg:relative lg:z-20 lg:max-w-none lg:translate-x-0 ${
        state.leftOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-start gap-3 border-b border-gold/25 px-4 py-4">
        <CompassIcon className="mt-0.5 h-10 w-10 shrink-0" />
        <div>
          <h1 className="font-display text-[0.95rem] leading-tight tracking-wide text-gold">
            Red Dead Redemption 2
          </h1>
          <p className="font-display text-xs uppercase tracking-[0.18em] text-paper-dim">
            Interactive Map
          </p>
        </div>
        <button
          type="button"
          className="ml-auto rounded border border-gold/20 px-2 py-1 text-xs lg:hidden"
          onClick={() => dispatch({ type: "set-left", open: false })}
        >
          Schliessen
        </button>
      </div>

      <div className="flex gap-1.5 border-b border-gold/20 px-3 py-2">
        <button
          type="button"
          className="flex-1 rounded-sm border border-gold/35 bg-leather-2 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide hover:bg-gold/15"
          onClick={() => dispatch({ type: "show-all" })}
        >
          Show All
        </button>
        <button
          type="button"
          className="flex-1 rounded-sm border border-gold/35 bg-leather-2 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide hover:bg-gold/15"
          onClick={() => dispatch({ type: "hide-all" })}
        >
          Hide All
        </button>
        {interiorCount > 0 && (
          <button
            type="button"
            className={`flex-1 rounded-sm border px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide ${
              state.interiors
                ? "border-gold bg-gold/20 text-gold"
                : "border-gold/35 bg-leather-2 hover:bg-gold/15"
            }`}
            onClick={() => dispatch({ type: "toggle-interiors" })}
          >
            Interiors
            <span className="ml-1 opacity-70">{interiorCount}</span>
          </button>
        )}
      </div>

      <div className="border-b border-gold/20 px-3 py-2">
        <label htmlFor="map-search" className="sr-only">
          Suche
        </label>
        <input
          id="map-search"
          type="search"
          value={state.search}
          onChange={(e) => dispatch({ type: "set-search", q: e.target.value })}
          placeholder="Suche Name, Set, Region…"
          className="w-full rounded-sm border border-gold/30 bg-ink/60 px-3 py-2 text-sm text-paper outline-none placeholder:text-paper-dim/70 focus:border-gold"
        />
      </div>

      {state.isolatedId && (
        <div className="flex items-center justify-between gap-2 border-b border-gold/20 bg-gold/10 px-3 py-2 text-xs">
          <span>Filter isoliert auf 1 Marker</span>
          <button
            type="button"
            className="underline decoration-gold"
            onClick={() => dispatch({ type: "isolate", id: null })}
          >
            Aufheben
          </button>
        </div>
      )}

      <nav className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
        {filterGroups.map((group) => {
          const visibleIds = group.ids.filter((id) => countFor(id) > 0);
          if (visibleIds.length === 0) return null;
          const open = !state.collapsed[group.id];
          return (
            <section key={group.id} className="mb-2">
              <button
                type="button"
                className="flex w-full items-center gap-2 px-2 py-1.5 font-display text-[11px] uppercase tracking-[0.2em] text-gold"
                onClick={() => dispatch({ type: "toggle-group", id: group.id })}
                aria-expanded={open}
              >
                <Chevron open={open} />
                {group.label}
                {group.id === "collectibles" && cardSets.length > 0 && (
                  <span className="ml-auto font-mono text-[10px] tracking-normal text-paper-dim">
                    {completeSets}/{cardSets.length} Sets
                  </span>
                )}
              </button>
              {open && (
                <ul className="space-y-0.5">
                  {visibleIds.map((id) => {
                    const cat = categoryById[id];
                    const n = countFor(id);
                    if (n === 0) return null;
                    if (
                      id === "dinosaur-bone" ||
                      id === "rock-carving" ||
                      id === "point-of-interest" ||
                      id === "dreamcatcher"
                    ) {
                      const items = demoLocations
                        .filter((l) => l.category === id)
                        .slice()
                        .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
                      const listKey = `catlist:${id}`;
                      const listOpen = !!state.collapsed[listKey];
                      const got = items.filter((l) => foundSet.has(l.id)).length;
                      const complete = got === items.length && items.length > 0;
                      return (
                        <li key={id}>
                          <div
                            className={`flex items-center gap-1 rounded-sm px-2 py-1 ${
                              complete ? "bg-gold/10" : "hover:bg-gold/10"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={!!state.enabled[id]}
                              onChange={() => dispatch({ type: "toggle-cat", id })}
                              className="accent-gold"
                            />
                            <button
                              type="button"
                              className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
                              onClick={() => dispatch({ type: "toggle-group", id: listKey })}
                              aria-expanded={listOpen}
                            >
                              <Chevron open={listOpen} />
                              <span
                                className="h-2.5 w-2.5 shrink-0 rounded-full border border-ink"
                                style={{ background: cat.color }}
                              />
                              <span className={`min-w-0 flex-1 truncate text-[13px] ${complete ? "text-gold" : ""}`}>
                                {cat.name}
                              </span>
                              {complete && <CheckMark />}
                              <span
                                className={`font-mono text-[11px] ${complete ? "text-gold" : "text-paper-dim"}`}
                              >
                                {got}/{n}
                              </span>
                            </button>
                          </div>
                          {listOpen && (
                            <ul className="mb-1 ml-6 mt-0.5 space-y-0.5">
                              {items.map((loc) => {
                                const found = foundSet.has(loc.id);
                                return (
                                  <li key={loc.id} className="flex items-center gap-1.5">
                                    <input
                                      type="checkbox"
                                      checked={found}
                                      onChange={() => dispatch({ type: "toggle-found", id: loc.id })}
                                      className="accent-gold"
                                      aria-label={`${loc.name} gefunden`}
                                    />
                                    <button
                                      type="button"
                                      className={`min-w-0 flex-1 truncate text-left text-[12px] hover:text-gold ${
                                        found ? "text-paper-dim line-through" : ""
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
                    }
                    if (id === "cigarette-card") {
                      return (
                        <li key={id}>
                          <label className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1 hover:bg-gold/10">
                            <input
                              type="checkbox"
                              checked={!!state.enabled[id]}
                              onChange={() => dispatch({ type: "toggle-cat", id })}
                              className="accent-gold"
                            />
                            <span
                              className="h-2.5 w-2.5 shrink-0 rounded-full border border-ink"
                              style={{ background: cat.color }}
                            />
                            <span className="flex-1 text-[13px]">{cat.name}</span>
                            <span className="font-mono text-[11px] text-paper-dim">{n}</span>
                          </label>
                          <ul className="ml-2 mt-0.5 border-l border-gold/20 pl-1">
                            {cardSets.map((set) => {
                              const setKey = `set:${set.name}`;
                              const setOpen = !!state.collapsed[setKey];
                              const got = set.locations.filter((l) => foundSet.has(l.id)).length;
                              const total = set.locations.length;
                              const complete = got === total && total > 0;
                              const setOn = state.enabledSets[set.name] !== false;
                              return (
                                <li key={set.name} className="mb-0.5">
                                  <div
                                    className={`flex items-center gap-1 rounded-sm px-1.5 py-1 ${
                                      complete ? "bg-gold/10" : "hover:bg-gold/10"
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={setOn && !!state.enabled[id]}
                                      disabled={!state.enabled[id]}
                                      onChange={() => dispatch({ type: "toggle-set", name: set.name })}
                                      className="accent-gold"
                                      aria-label={`${set.name} auf der Karte`}
                                    />
                                    <button
                                      type="button"
                                      className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
                                      onClick={() => dispatch({ type: "toggle-group", id: setKey })}
                                      aria-expanded={setOpen}
                                    >
                                      <Chevron open={setOpen} />
                                      <span
                                        className={`min-w-0 flex-1 truncate text-[12px] ${
                                          complete ? "text-gold" : ""
                                        }`}
                                      >
                                        {set.name}
                                      </span>
                                      {complete && <CheckMark />}
                                      <span
                                        className={`font-mono text-[11px] ${
                                          complete ? "text-gold" : "text-paper-dim"
                                        }`}
                                      >
                                        {got}/{total}
                                      </span>
                                    </button>
                                  </div>
                                  {setOpen && (
                                    <ul className="mb-1 ml-5 mt-0.5 space-y-0.5">
                                      {set.locations.map((loc) => {
                                        const parsed = parseCardName(loc.name);
                                        const found = foundSet.has(loc.id);
                                        return (
                                          <li key={loc.id} className="flex items-center gap-1.5">
                                            <input
                                              type="checkbox"
                                              checked={found}
                                              onChange={() =>
                                                dispatch({ type: "toggle-found", id: loc.id })
                                              }
                                              className="accent-gold"
                                              aria-label={`${loc.name} gefunden`}
                                            />
                                            <button
                                              type="button"
                                              className={`min-w-0 flex-1 truncate text-left text-[12px] hover:text-gold ${
                                                found ? "text-paper-dim line-through" : ""
                                              }`}
                                              onClick={() => dispatch({ type: "focus", id: loc.id })}
                                            >
                                              <span className="font-mono text-[10px] text-paper-dim">
                                                #{parsed ? String(parsed.number).padStart(2, "0") : "—"}
                                              </span>{" "}
                                              {parsed?.title ?? loc.name}
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
                        </li>
                      );
                    }
                    return (
                      <li key={id}>
                        <label className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1 hover:bg-gold/10">
                          <input
                            type="checkbox"
                            checked={!!state.enabled[id]}
                            onChange={() => dispatch({ type: "toggle-cat", id })}
                            className="accent-gold"
                          />
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full border border-ink"
                            style={{ background: cat.color }}
                          />
                          <span className="flex-1 text-[13px]">{cat.name}</span>
                          <span className="font-mono text-[11px] text-paper-dim">{n}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}

        {customCount > 0 && (
          <section className="mb-2">
            <p className="flex items-center gap-2 px-2 py-1.5 font-display text-[11px] uppercase tracking-[0.2em] text-gold">
              Eigene
            </p>
            <p className="flex items-center gap-2 px-2 py-1 text-[13px]">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: categoryById.custom.color }}
              />
              Custom
              <span className="ml-auto font-mono text-[11px] text-paper-dim">{customCount}</span>
            </p>
          </section>
        )}
      </nav>

      <p className="border-t border-gold/20 px-3 py-2 text-[10px] leading-snug text-paper-dim">
        {demoLocations.length} Marker von rdr2map.com / MapGenie (Cigarette Cards, Dinosaur Bones, Rock Carvings, Points of Interest, Dreamcatchers).
        Kartenhintergrund: Fan-Stitch von u/Te_Quiero_Puta. Kartengrafik © Rockstar Games.
      </p>
    </aside>
  );
}
