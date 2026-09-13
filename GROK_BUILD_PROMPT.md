# Grok Build Prompt — Interaktive RDR2-Karte (werbefrei, ohne Login)

Kopiere den Block unten 1:1 in Grok Build. Projektordner lokal: `/home/masterp/Projekte/rdr2-interactive-map`.
Repo: https://github.com/patreiCH72/rdr2-interactive-map

---

## Prompt

Baue eine **lokale, werbefreie, login-freie** interaktive Karten-Webapp im Stil von rdr2map.com (Red Dead Redemption 2 World Map). Kein Clone der Original-Assets von Rockstar oder rdr2map.com. Fan-Projekt / Lernprojekt. Next.js (App Router) + TypeScript + Tailwind CSS + Leaflet (react-leaflet). Kein Backend, kein Account, keine Cookies-Banner, keine Werbung, keine Analytics.

### Ziel
Desktop-first Karte mit linker Filter-Sidebar, zentraler Karte, rechter Progress-Sidebar. Look: altes Papier / Sepia / Western (Beige, Braun, dunkle Tinte). Schrift: eine serifenlose UI-Font + eine Display-Font im Western-/Wanted-Poster-Stil (Google Fonts, z. B. Cinzel + Source Sans 3).

### Karte
- Leaflet, CRS.Simple oder ein angepasstes Overlay auf einem hochaufgelösten Fan-/Platzhalter-Kartenbild.
- Lege `public/map/` an. Verwende **zuerst ein einzelnes high-res Placeholder-Bild** (generiertes Sepia-Western-Terrain mit Regionen New Hanover, Lemoyne, West Elizabeth, Ambarino, New Austin, Flüsse wie Lannahechee, Städte Valentine / Rhodes / Saint Denis / Blackwater / Strawberry als Labels). Dokumentiere im README, dass echte In-Game-Tiles urheberrechtlich geschützt sind und der User eigene Tiles (z. B. selbst fotografierte/gescannte Community-Tiles, falls lizenziert) unter `public/map/tiles/{z}/{x}/{y}.png` legen kann.
- Zoom, Pan, Min/Max-Zoom, Dark/Light-unabhängig (immer Sepia).
- Umschalter **Default / Detailed** unten rechts (zwei Overlay-Stile oder zwei Tile-Sets).
- Tools unten rechts: Hand (Pan), Stift ( Distanzmessung polyline + Meter-Anzeige), Plus/Minus Zoom.
- Distanz-Tool: Klicks setzen Punkte, Linie mit Distanz in Meter (fiktive Massstabskonstante, konfigurierbar in `lib/map-scale.ts`).
- Optionales **Sniping-Radius-Tool**: Kreis um einen Punkt, konzentrische Ringe alle 50 m (Massstab wie oben).
- Koordinaten-Anzeige (x/y der Karte) in einer Statusleiste.

### Marker & Daten
Struktur:
```
data/locations.json   // alle POIs
data/categories.ts    // Kategorien, Farben, Icons, Gruppen
```

Kategorien (mindestens, mit Zählern in der Sidebar):

**Collectibles**
- Bounty Poster
- Cigarette Card
- Dinosaur Bone
- Dreamcatcher
- Exotic
- Grave
- Hunting Request
- Item Request
- Legendary Animal
- Legendary Fish
- Plant
- Point of Interest
- Robbery
- Rock Carving
- Shack
- Treasure

**Pickups**
- Item
- Loot
- Weapon
- Wild Horse

Zusätzlich: Interiors (separater Toggle).

Jede Location:
```ts
{
  id: string
  name: string
  category: string
  x: number
  y: number
  region?: string
  description?: string
  tips?: string
}
```

Seed-Daten: **ca. 80–120 Beispiel-Marker** verteilt über die Karte (keine vollständige 1:1-Datenbank des Spiels; klar als Demo-Datensatz kennzeichnen). Icons als einfache SVG-Pins in Kategorie-Farben (nicht die Original-rdr2map-Sprites kopieren).

### Linke Sidebar
- Titel: «Red Dead Redemption 2 — Interactive Map» (kein offizielles Logo kopieren, eigenes Kompass-Icon als SVG).
- Buttons: Show All / Hide All / Interiors
- Suchfeld (Name, Kategorie, Region)
- Gruppierte Checkbox-Liste mit Icon, Name, Anzahl
- Collapse der Gruppen
- Responsive: auf Mobile als Drawer

### Rechte Sidebar — Progress Tracker (lokal)
- **Kein Login, kein Register.**
- Fortschritt nur in `localStorage` (`rdr2map.progress.v1`).
- Checkbox «gefunden» pro Marker; Klick auf Marker öffnet Popup mit Beschreibung + Toggle Found.
- Gefundene Marker: ausgegraut / Haken-Icon.
- Fortschrittsbalken pro Kategorie und gesamt.
- Custom Locations: Formular «Eigener Pin» (Name, Kategorie «Custom», Notiz) — ebenfalls localStorage.
- Buttons: Export JSON / Import JSON / Reset Progress.
- Keine Werbung, keine PRO-Upsells.

### Popup
Name, Kategorie-Badge, Region, Kurztext, Found-Toggle, optional Link «Im Filter isolieren».

### Qualität
- App Router, Client Components nur wo nötig (`"use client"` für Map).
- dynamischer Import von Leaflet (`ssr: false`), damit Next.js nicht crasht.
- Keyboard: Esc schliesst Drawer/Popup, `/` fokussiert Suche.
- Performance: Marker-Clustering ab Zoom < 3 (Leaflet.markercluster oder eigene einfache Cluster).
- `README.md` auf Deutsch (CH): Setup, `npm install && npm run dev`, Hinweis Urheberrecht, wie man eigene Tiles und eigene `locations.json` einspielt.
- `.gitignore` Standard Next.js.
- Keine Tracking-Scripts, keine externen Font-CDNs wenn vermeidbar (oder nur Google Fonts).
- ESLint clean.

### Erstes Deliverable
1. Lauffähiges `npm run dev`
2. Karte sichtbar mit Placeholder-Terrain
3. Filter funktionieren
4. Suche funktioniert
5. Progress in localStorage überlebt Reload
6. Distanz-Tool funktioniert
7. Custom Pins funktionieren
8. README + kurzes `LICENSE` (MIT für Code; Daten/Tiles nicht von Rockstar)

Starte mit dem Gerüst, dann Daten, dann Tools. Keine Platzhalter-«TODO later»-Seiten — die App soll sofort nutzbar sein.
