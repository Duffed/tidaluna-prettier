# Tidaluna Prettier

Version 1.3.1 ergänzt die interne Auflösung alter Duffed-Raw-Downloadadressen auf die aktuellen Store-Release-Dateien. Die gespeicherten Store- und Installationsadressen bleiben erhalten; dadurch kann ein veralteter Raw-CDN-Cache den Updateknopf nicht blockieren.

Version 1.3.0: Im Plugin Store gibt es **Duffed-Plugins aktualisieren**. Der Knopf prüft die installierten, aktivierten Duffed-Plugins an ihren bestehenden URLs und lädt geänderte Builds neu. Deaktivierte Plugins bleiben deaktiviert und werden übersprungen. Fehler werden angezeigt. Die Downloads der veränderlichen Duffed-Store-Adressen umgehen den HTTP-Cache; fremde Downloads bleiben unverändert.

Zum erstmaligen Übernehmen dieser Korrektur bei der bereits installierten Prettier-Karte **Reload plugin** nutzen und die Luna-Einstellungen erneut öffnen. Falls die alte Version im Speicher bleibt, TIDAL vollständig beenden und neu starten. Store-Adresse und Installation bleiben gleich. Die Aktualisierungsfunktion steht erst nach dem Laden von 1.3.0 zur Verfügung.

Version 1.2.0: Der Plugin Store hat eine eigene Suche nach Name, Entwickler und Beschreibung sowie Filter für alle, installierte und nicht installierte Plugins. Trefferzahlen beziehen sich auf geladene Angebote. Passende Store-Gruppen öffnen sich während der Suche automatisch; Zurücksetzen stellt den gespeicherten Klappzustand wieder her.

Ein eigenständiges Plugin für die **Luna Settings**: Plugins, Plugin Store, Themes, Settings und Supporters.

Version 1.1.0 ergänzt einen eigenen Scrollbereich mit reserviertem Platz für die Playerleiste, sodass die letzten Karten erreichbar bleiben. Alle Tabs erhalten ein einheitliches Karten-, Tab- und Eingabefeld-Design. Store-Gruppen sind einklappbar; Plugin-Angebote und Themes bekommen lesbare Namen und Entwicklerzeilen.

- Einklappbare Plugin-Karten; Klappzustand bleibt lokal gespeichert.
- Lesbare Namen: `@dev/plugin-name` wird zu **Plugin Name · Avatar · dev**.
- Entwickler-Avatar aus den Plugin-Metadaten; Initialen als Ersatz bei fehlendem oder nicht ladbarem Bild.
- Suche nach Pluginname, Entwickler und Beschreibung; Filter für alle, aktive, deaktivierte oder fehlerhafte Plugins.
- Alle sichtbaren Treffer auf einmal ein- oder ausklappen.
- Bestehende Einstellungen bleiben gemountet; die originalen Schalter und Aktionen sind in der geöffneten Karte erreichbar.
- Beim Deaktivieren werden UI-Ergänzungen und Listener entfernt.

## Aus dem bestehenden Store installieren

In **Luna Settings → Plugin Store** den bestehenden Duffed-Store aktualisieren und **Tidaluna Prettier** installieren. Der Store enthält Smart Shuffle und Prettier:

```text
https://github.com/Duffed/tidaluna-smart-shuffle/releases/download/latest/store.json
```

Alternativ unter **Install from URL** direkt installieren:

```text
https://raw.githubusercontent.com/Duffed/tidaluna-prettier/main/dist/tidaluna-prettier
```

Für diese Installation ist kein lokaler Server nötig.

## Lokal entwickeln

Node.js 22 oder neuer genügt zum Bauen und Bereitstellen; das Plugin selbst benötigt keine zusätzlichen Pakete.

```powershell
node scripts/serve.mjs
```

Dann in TIDAL **Luna Settings → Plugin Store → Install from URL** diese Adresse eintragen:

```text
http://127.0.0.1:5173/tidaluna-prettier
```

Plugin installieren/aktivieren und zum Tab **Plugins** wechseln. Für Erstinstallation und Updates muss der lokale Server laufen. TidaLuna speichert den geladenen Code zwischen. Der Server stellt ausschließlich die beiden Plugin-Dateien bereit und bindet nur an `127.0.0.1`.

Die erste Ansicht ist eingeklappt. Karte über den Kopf öffnen; darin befinden sich die bisherigen Plugin-Aktionen und Einstellungen. Hat man Einstellungen zuvor mit TidaLunas Zahnrad ausgeblendet, muss man sie dort wieder einblenden. Zum Entfernen zunächst die Karte **Tidaluna Prettier** öffnen und die ursprüngliche Deinstallationsfunktion verwenden.

## Build und Tests

```powershell
node scripts/build.mjs
pnpm install --ignore-scripts
node --test
```

Der Build erzeugt `dist/tidaluna-prettier.mjs` und `dist/tidaluna-prettier.json` mit einem Inhalts-Hash. Beide Dateien werden für die direkte Installation mit eingecheckt. Der bestehende Smart-Shuffle-Store übernimmt sie über seinen GitHub-Actions-Workflow automatisch: alle 15 Minuten geplant (GitHub kann Läufe verzögern), bei Store-Änderungen oder manuell über **Run workflow**. Manifest und Code kommen vom selben Quellcommit und werden per SHA-256 geprüft. Die bisherige Store-Adresse und die Plugin-Dateinamen bleiben stabil. Beide GitHub-Varianten (`releases/download/latest` und `releases/latest/download`) werden mit aktuellen Builds versorgt. `distribution/` enthält die Vorlagen für den Store-Workflow und dessen Synchronisationsskript.

## Kompatibilität und Prüfung

Die Integration orientiert sich an [TidaLunas SettingsPage](https://github.com/Inrixia/TidaLuna/tree/12b5dd7ce7c1512eb7a9418041bb1e5b0c0627da/plugins/ui/src/SettingsPage) und dem dortigen `LunaPlugin`-Lebenszyklus. Sie ergänzt die bestehende DOM-Struktur, ohne React-Komponenten oder TidaLuna-Dateien auszutauschen. Eine spätere Änderung der TidaLuna-HTML-Struktur kann eine Anpassung der Selektoren erfordern. Die Scrollhöhe passt sich an die Fensterhöhe an und reserviert 150 Pixel für den Player. Besonders hohe, durch andere Plugins veränderte Player können weiteren Abstand benötigen.

Automatische DOM-Tests prüfen Klappen, Suche, Statusfilter, Tabwechsel, Erhalt der Eingabefelder und vollständiges Aufräumen. Ein Test in einer laufenden TIDAL-Instanz steht noch aus.
