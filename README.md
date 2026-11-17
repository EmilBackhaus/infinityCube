# Würfel-Sprung

Ein kleiner Endless-Side-Scroller im Browser: Ein Würfel rollt über den Boden,
du hüpfst über dunkle Würfel-Hindernisse und über Löcher im Boden und sammelst
goldene Punkte. Fällst du in ein Loch, geht es von vorne los. Richtig breite
Löcher schaffst du nur mit einem Doppelsprung. Ab 10.000 Punkten bekommt der
Würfel Flügel und muss im Himmel den Vögeln ausweichen.

Reines HTML/CSS/JavaScript – keine Bibliotheken, keine Assets, kein Build.

## Starten

`index.html` einfach im Browser öffnen (Doppelklick reicht).

Alternativ über einen kleinen lokalen Server:

```bash
cd ersteidee
python3 -m http.server 8000
# danach http://localhost:8000 öffnen
```

## Steuerung

| Eingabe               | Aktion                                            |
| --------------------- | ------------------------------------------------- |
| `Leertaste`, `↑`, `W` | Springen (halten = höher)                         |
| Klick / Tippen        | Springen · ab 10.000 Punkten: Flügelschlag        |
| nochmal in der Luft   | Doppelsprung (nur mit Spezialmünze)               |
| `W` `A` `S` `D`       | Cheat: unverwundbar für den Rest des Laufs        |
| `M`                   | Ton an/aus                                        |

Auf dem Handy springt der Würfel bei jedem Tippen auf die Spielfläche;
zweimal tippen löst den Doppelsprung aus. Mit Flügeln ist jeder Klick ein
Aufwärtsimpuls. Ohne Klick zieht die Schwerkraft den Würfel wieder nach unten.

Der W-A-S-D-Cheat zählt sowohl als Reihenfolge (innerhalb von 2,2 Sekunden) als
auch wenn alle vier Tasten gleichzeitig gehalten werden.

## Spielprinzip

- Der Hintergrund scrollt immer schneller – von 330 bis 670 Pixel/Sekunde.
- Hindernisse sind dunkle Würfel mit 32–72 Pixel Kantenlänge.
- Normale Löcher im Boden sind 70–150 Pixel breit und werden mit dem Tempo
  größer, bleiben aber immer deutlich schmaler als ein Sprung.
- Etwa jedes dritte Loch ist ein **breites Loch**: Es ist 112–126 % der
  einfachen Sprungweite breit und damit allein nicht zu schaffen.
- Über jedem breiten Loch schwebt eine **Spezialmünze (2×)**. Wer sie im
  Sprung einsammelt, bekommt einen Doppelsprung: Der Würfel bekommt einen
  blauen Leuchtring und darf einmal in der Luft nachspringen.
- Fällt der Würfel in ein Loch, ist die Runde vorbei – der nächste Versuch
  startet wieder bei null Punkten.
- Punkte = gelaufene Strecke (1 Punkt pro 10 Pixel) + 10 Punkte pro Goldpunkt.
  Die Spezialmünze zählt nicht als Gold, sondern nur als Doppelsprung.
- Ab **5.000 Punkten** wechselt die Welt in den **Neon-Modus**: dunkler
  Sternenhimmel mit Mond, violette Hügel und ein leuchtender Boden. Der Würfel
  bekommt eine cyanfarbene Neon-Optik, Hindernisse leuchten magenta.
- Ab **10.000 Punkten** bekommt der Würfel **Flügel**: Jeder Klick oder Tipp
  gibt einen Aufwärtsimpuls. Klickst du nicht, fällt er wieder; ein weiterer
  Klick fängt ihn erneut ab.
- Im Himmel fliegen dann überall **Vögel** von rechts heran. Sie pendeln leicht
  auf und ab – weiche ihnen aus, sonst ist der Lauf vorbei.
- Mit der Tastenkombination **W-A-S-D** (Reihenfolge oder alle vier gleichzeitig)
  wird der Würfel für den Rest des Laufs **unverwundbar**. Hindernisse und
  Vögel können ihm dann nichts mehr tun, und er läuft auch über Löcher hinweg.
  Ein Neustart setzt den Schutz zurück.
- Goldpunkte schweben häufig über Hindernissen und normalen Löchern:
  Drüberspringen lohnt sich.
- Der Rekord wird lokal im Browser gespeichert (`localStorage`).

## Technische Ideen dahinter

- **Feste Zeitschritte**: Die Physik rechnet in Schritten von 1/120 Sekunde.
  Dadurch springt der Würfel auf jedem Bildschirm gleich weit.
- **Sprungpuffer**: Wird 0,13 s vor der Landung schon gesprungen, wird der
  Sprung beim Aufkommen automatisch ausgeführt.
- **Coyote-Time**: 0,1 s nach dem Verlassen des Bodens gilt ein Sprung noch.
- **Variable Sprunghöhe**: Taste früh loslassen ergibt einen kleinen Hüpfer.
  Der Doppelsprung wird dabei nie gekürzt, damit breite Löcher fair bleiben.
- **Doppelsprung**: Die Spezialmünze liegt im vorderen Drittel des breiten
  Lochs, genau im natürlichen Sprungbogen. Beim Einsammeln leuchtet ein Ring
  um den Würfel; ein weiterer Sprung in der Luft verbraucht ihn wieder.
- **Kollisionsboxen** sind bewusst etwas kleiner als die Grafik, damit es sich
  fair anfühlt.
- **Bodenkontakt**: Der Würfel steht nur auf festem Grund. Ein schmaler Fuß-
  Bereich wird gegen die Löcher geprüft, die Kante bleibt dadurch fair.
- **Sturz-Zustand**: Fällt der Würfel, scrollt die Welt kurz nicht mehr weiter,
  der Würfel fällt sichtbar ins Loch und danach erscheint „Runtergefallen“.
- **Flügel-Physik**: Statt des Sprungpuffers gibt jeder Klick sofort einen
  Aufwärtsimpuls (`flapVelocity`). Zwischen den Klicks wirkt eine schwächere
  Schwerkraft als am Boden, und eine Decke verhindert, dass der Würfel oben aus
  dem Bild fliegt. Im Sturz kann ein Klick den Würfel wieder auffangen.
- **Vögel**: Sie spawnen am rechten Rand in zufälliger Höhe, fliegen mit dem
  Welt-Scroll plus eigener Geschwindigkeit nach links und pendeln sanft auf und
  ab. Die Kollisionsfläche ist ein kleiner Kreis um den Vogel.
- **Unverwundbarkeit**: `die()` steigt bei aktivem Schutz sofort aus. Vögel
  platzen beim Kontakt, Hindernisse werden ignoriert und Löcher gelten als
  fester Grund. Fällt der Würfel trotzdem einmal tief, wird er wieder nach oben
  gesetzt statt Game Over.
- **Sound** wird komplett per WebAudio erzeugt (kleine Sinus-/Dreieck-Töne).

## Dateien

`index.html` lädt die Skripte als **klassische Skripte** in dieser Reihenfolge
(wichtig wegen der Abhängigkeiten):

```html
<script src="constants.js"></script>
<script src="utils.js"></script>
<script src="canvas.js"></script>
<script src="state.js"></script>
<script src="audio.js"></script>
<script src="die.js"></script>
<script src="render.js"></script>
<script src="logic.js"></script>
<script src="input.js"></script>
<script src="main.js"></script>
```

Bitte nicht auf `<script type="module">` umstellen: Module werden bei `file://`
durch CORS blockiert. Die Module kommunizieren über den globalen Namespace
`window.WS` (`window.WS = window.WS || {}`), funktionieren aber dadurch weiterhin
direkt per Doppelklick auf `index.html`.

| Datei | Inhalt |
|-------|--------|
| `index.html` | Spielseite; lädt die Skripte in der richtigen Reihenfolge |
| `style.css` | Layout, Rahmen, Seitenhintergrund |
| `constants.js` | `VIEW_W`, `VIEW_H`, `GROUND_Y`, `STEP`, `CFG`, `FONT`, `BEST_KEY`, `PIP_MAP` |
| `utils.js` | `clamp`, `fmt`, `roundRect`, `getScore`, `loadBest`, `saveBest`, `notify` |
| `canvas.js` | Canvas, Context, `view`, `resize` / `initCanvas` |
| `state.js` | `game`, `player`, `clouds`, Cheat-Set, `jumpBuffer`, Timing |
| `audio.js` | WebAudio-Helfer und alle `play*`-Funktionen, `toggleMute` |
| `die.js` | `drawPips`, `drawDie` |
| `render.js` | Hintergrund, Hindernisse, Würfel, HUD, Overlays, `render()` |
| `logic.js` | Start/Neustart, Physik, Spawner, Kollisionen, `update()` |
| `input.js` | `initInput()` – Tastatur, Maus, Touch, Sichtbarkeit |
| `main.js` | `start()` und `requestAnimationFrame`-Schleife |

Neue Funktionen bitte in das passende Modul legen und am Ende über
`Object.assign(WS, { ... })` (oder `WS.name = ...`) exportieren.

## Schrauben zum Drehen

In `constants.js`:

```js
const CFG = {
  gravity: 2500,          // stärker = schwerer, tieferer Sprung
  jumpVelocity: -810,     // negativer = höherer Sprung
  doubleJumpVelocity: -790, // Höhe des zweiten Sprungs
  wingGravity: 1450,      // Schwerkraft mit Flügeln
  flapVelocity: -540,     // Aufwärtsimpuls pro Klick
  startSpeed: 330,        // Anfangstempo
  maxSpeed: 670,          // Endtempo
  speedGain: 9,           // Beschleunigung pro Sekunde
};
```

- Hindernisgröße: `spawnObstacle()` (`32 + Math.random() * 40`)
- Anteil der Löcher: `updateSpawner()` (`Math.random() < 0.34`)
- Normale Lochbreite: `spawnPit()` (`jumpDistance * (0.18 … 0.30)`, mind. 70 px, max. 150 px)
- Anteil breiter Löcher: `spawnPit()` (`Math.random() < 0.3` der Löcher)
- Breite Löcher: `spawnWidePit()` (`jumpDistance * (1.12 … 1.26)`)
- Spezialmünze: `spawnWidePit()` (`jumpDistance * 0.3` hinter der Lochkante, 140 px hoch)
- Abstand der Hindernisse: `updateSpawner()` (`0.95 + Math.random() * 0.8` Sekunden)
- Höhe der Goldpunkte: `GROUND_Y - (138 + Math.random() * 16)`
- Neon-Modus: `THEME_SCORE` (`5000`)
- Flügel: `WINGS_SCORE` (`10000`)
- Fluggefühl: `CFG.wingGravity`, `CFG.flapVelocity`, `CFG.wingMaxFall`, `CFG.skyTop`
- Vogel-Abstände: `CFG.birdIntervalMin` / `CFG.birdIntervalMax`
- Schwarm-Chance: `updateBirdSpawner()` (`Math.random() < 0.3`)
- Schwierigkeit der Vögel: `spawnBird()` (`vx`, `amp`, `freq`, Größe)
- WASD-Zeitfenster: `CFG.cheatWindow` (`2200` ms)

## Ideen für später

- Ein kurzer Dash
- Power-Ups (Zeitlupe, Magnet für Goldpunkte)
- Weitere Flug-Gegner wie Fledermäuse oder Wolken
- Bewegliche Plattformen über den Löchern
- Rekordliste mit Namen statt nur einem Bestwert
- Eigene Würfel-Augen als Grafik (Sprite statt gezeichneter Pips)
- Bildschirm-Buttons für Mobilgeräte
- Pilze als Trampoline
