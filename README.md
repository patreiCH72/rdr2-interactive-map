# rdr2-interactive-map

Werbefreie, login-freie interaktive Karte im Stil von [rdr2map.com](https://rdr2map.com/) — Fan-/Lernprojekt mit Next.js, TypeScript, Tailwind CSS und Leaflet.

**Kein offizielles Rockstar-Produkt.** Logos und Original-Sprites von Rockstar bzw. rdr2map.com sind nicht Teil dieses Repos. Der Code liefert ein Gerüst; aktuell sind **Cigarette Cards** (144, 12 Sets), **Dinosaur Bones** (30), **Rock Carvings** (10), **Points of Interest** (57) und **Dreamcatchers** (20) aus [rdr2map.com](https://rdr2map.com/) als Marker übernommen.

Repo: https://github.com/patreiCH72/rdr2-interactive-map

## Lokal starten

```bash
cd /home/masterp/Projekte/rdr2-interactive-map
npm install
npm run dev
```

Dann im Browser: [http://localhost:3000](http://localhost:3000)

Weitere Scripts:

```bash
npm run lint
npm run build
```

## Auf Vercel deployen

Die App braucht **kein Backend und keine Env-Vars**. Fortschritt bleibt im Browser (`localStorage`). Next.js wird von Vercel automatisch erkannt.

1. Änderungen committen und nach GitHub pushen (`main`).
2. Auf [vercel.com](https://vercel.com) das Repo `patreiCH72/rdr2-interactive-map` importieren.
3. Framework Preset: **Next.js**, Build Command `npm run build`, Output leer lassen.
4. Deploy.

Oder lokal:

```bash
npx vercel
```

Für Produktion: `npx vercel --prod`.

Kartenbilder unter `public/map/` (~10 MB) werden als statische Dateien ausgeliefert. Ein Hobby-Account reicht. Nach dem Deploy ist die Karte unter `https://<projekt>.vercel.app` erreichbar.

**Hinweis:** Die Hintergrundkarte ist urheberrechtlich bei Rockstar. Eine öffentliche URL ist ein Fan-Projekt, kein offizielles Produkt.

### PIN-Sperre

Ist die Env-Var `SITE_PIN` gesetzt, erscheint vor der Karte ein Unlock-Screen. Ohne diese Variable bleibt die App offen.

Lokal: `.env.local` (siehe `.env.example`). Auf Vercel: Project → Settings → Environment Variables → `SITE_PIN`.

## Bedienung

- Linke Sidebar: Filter (Show All / Hide All / Interiors), Suche, Kategorien mit Zählern
- Rechte Sidebar: Fortschritt, eigene Pins, Export / Import / Reset
- Karte: Zoom, Pan, Umschalter **Default / Detailed**
- Werkzeuge unten rechts: Hand (Pan), Stift (Distanz), Ziel (Sniping-Radius 50-m-Ringe), Plus/Minus
- Statusleiste: Kartenkoordinaten `x / y`
- Tastatur: `/` fokussiert die Suche, `Esc` schliesst Drawer/Popup und bricht das aktuelle Werkzeug ab
- Fortschritt liegt nur in `localStorage` unter `rdr2map.progress.v1` (Pins: `rdr2map.custom.v1`). Kein Login, keine Werbung, kein Tracking.

## Hintergrundkarte

Als Overlay liegt die High-Res-Fan-Stitch der In-Game-Karte von **u/Te_Quiero_Puta**:

https://www.reddit.com/r/reddeadredemption2/comments/zwwcz6/i_made_a_high_res_file_of_the_rdr2_map/

- `public/map/default.jpg` — 4500×3502, schneller Überblick
- `public/map/detailed.jpg` — 9000×7004, volle Auflösung (Umschalter **Detailed**)

Die Kartengrafik selbst ist urheberrechtlich bei **Rockstar Games / Take-Two**. Dieser Fan-Stitch ist ein von Hand zusammengesetzter Screenshot; für eine öffentliche Verbreitung der Bilder brauchst du eine eigene Rechtsgrundlage.

Optionale Raster-Tiles (falls du die Einzelbilder ersetzen willst):

```
public/map/tiles/{z}/{x}/{y}.png
```

Massstab und CRS: `lib/map-scale.ts` (`METERS_PER_UNIT`, `MAP_WIDTH` 9000, `MAP_HEIGHT` 7004).

## Locations

Marker: `data/locations.json` — **Cigarette Card** (144), **Dinosaur Bone** (30), **Rock Carving** (10), **Point of Interest** (57) und **Dreamcatcher** (20) von [rdr2map.com](https://rdr2map.com/). Koordinaten wurden von MapGenie-Lat/Lng auf unser Kartenbild (9000×7004) abgebildet.

Kategorien, Farben, Gruppen: `data/categories.ts`

Format pro Eintrag:

```json
{
  "id": "cc-707",
  "name": "Amazing Inventions #01 — Steam Locomotive",
  "category": "cigarette-card",
  "x": 6886.2,
  "y": 2722.8,
  "region": "Lemoyne",
  "description": "In a bird nest on the upper landing of the abandoned church…",
  "tips": "Full Set Completion Reward: …"
}
```

Koordinaten gelten für CRS.Simple: `x` nach Osten, `y` nach Norden, Ursprung unten links, passend zu `detailed.jpg` (9000×7004).

## Lizenz

Code: [MIT](./LICENSE). Die Hintergrundkarte ist kein MIT-Inhalt — siehe Abschnitt «Hintergrundkarte».
