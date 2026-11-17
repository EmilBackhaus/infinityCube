/* constants.js - Konfiguration */
(function (WS) {
  'use strict';


const VIEW_W = 960;
const VIEW_H = 540;
const GROUND_Y = 452;
const STEP = 1 / 120; // feste Physik-Schrittweite
const THEME_SCORE = 5000; // ab hier wird die Welt neon
const WINGS_SCORE = 10000; // ab hier bekommt der Würfel Flügel

const CFG = {
  gravity: 2500,
  jumpVelocity: -810, // Sprunghöhe ≈ 131 px
  doubleJumpVelocity: -790, // zweiter Sprung aus der Luft
  playerX: 210,
  playerSize: 46,
  startSpeed: 330,
  maxSpeed: 670,
  speedGain: 9, // px/s pro Sekunde
  jumpBuffer: 0.13, // Sprung wird kurz "vorgemerkt"
  coyote: 0.10, // Gnadenfrist am Boden
  wingGravity: 1450, // mit Flügeln fällt der Würfel langsamer
  flapVelocity: -540, // Aufwärtsimpuls pro Klick
  wingMaxFall: 720, // maximale Fallgeschwindigkeit mit Flügeln
  skyTop: 126, // höchste Unterkante des Würfels im Flug
  birdIntervalMin: 1.05, // Pause zwischen Vögeln
  birdIntervalMax: 2.15,
  cheatWindow: 2200, // W-A-S-D muss in dieser Zeit gedrückt werden
};

const FONT = (weight, size) =>
  `${weight} ${size}px system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;

const BEST_KEY = 'wuerfel-sprung.rekord';

// Punkte-Augen eines Würfels (Raster -1 / 0 / 1)
const PIP_MAP = [
  [],
  [[0, 0]],
  [[-1, -1], [1, 1]],
  [[-1, -1], [0, 0], [1, 1]],
  [[-1, -1], [1, -1], [-1, 1], [1, 1]],
  [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]],
  [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]],
];

Object.assign(WS, {
  VIEW_W, VIEW_H, GROUND_Y, STEP, THEME_SCORE, WINGS_SCORE,
  CFG, FONT, BEST_KEY, PIP_MAP,
});
})(window.WS = window.WS || {});
