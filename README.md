# Tidaluna Prettier

Ein eigenständiges Plugin für die **Plugins-Seite in den Luna Settings**.

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

Der Build erzeugt `dist/tidaluna-prettier.mjs` und `dist/tidaluna-prettier.json` mit einem Inhalts-Hash. Beide Dateien werden für die direkte Installation mit eingecheckt. Der bestehende Smart-Shuffle-Store verteilt zusätzlich eine Kopie: TidaLuna unterstützt dort nur relative Pluginpfade. Bei Updates beide Dateien auch in dessen `dist/` aktualisieren.

## Kompatibilität und Prüfung

Die Integration orientiert sich an [TidaLunas PluginsTab](https://github.com/Inrixia/TidaLuna/tree/12b5dd7ce7c1512eb7a9418041bb1e5b0c0627da/plugins/ui/src/SettingsPage/PluginsTab) und dem dortigen `LunaPlugin`-Lebenszyklus. Sie ergänzt die bestehende DOM-Struktur, ohne React-Komponenten oder TidaLuna-Dateien auszutauschen. Eine spätere Änderung der TidaLuna-HTML-Struktur kann eine Anpassung der Selektoren erfordern. Andere Einstellungs-Tabs und der Plugin Store werden nicht umgestaltet.

Automatische DOM-Tests prüfen Klappen, Suche, Statusfilter, Tabwechsel, Erhalt der Eingabefelder und vollständiges Aufräumen. Ein Test in einer laufenden TIDAL-Instanz steht noch aus.
