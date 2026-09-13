# rdr2-interactive-map

Werbefreie, login-freie interaktive Karte im Stil von [rdr2map.com](https://rdr2map.com/) — Fan-/Lernprojekt mit Next.js.

**Kein offizielles Rockstar-Produkt.** In-Game-Kartentiles und Original-Assets sind urheberrechtlich geschützt. Dieser Code liefert ein Gerüst plus Demo-Marker; echte Tiles musst du selbst (legal) bereitstellen.

## Repo

https://github.com/patreiCH72/rdr2-interactive-map

## Lokal anlegen (auf deinem Rechner)

```bash
mkdir -p /home/masterp/Projekte
cd /home/masterp/Projekte
git clone https://github.com/patreiCH72/rdr2-interactive-map.git
cd rdr2-interactive-map
```

Danach Grok Build im Projektordner starten und den Prompt aus [`GROK_BUILD_PROMPT.md`](./GROK_BUILD_PROMPT.md) einfügen.

## Geplante Features

- Leaflet-Karte (Zoom, Pan, Default/Detailed)
- Filter-Sidebar nach Kategorien (Collectibles, Pickups, Interiors)
- Suche
- Distanzmessung und optionaler Sniping-Radius
- Progress Tracker nur in localStorage (kein Login)
- Eigene Pins, Export/Import JSON
- Keine Werbung, kein Tracking
