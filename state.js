/* state.js - Spielzustand */
(function (WS) {
  'use strict';
  const { VIEW_W, GROUND_Y, CFG } = WS;
  const { loadBest } = WS;

const game = {
  state: 'ready', // 'ready' | 'playing' | 'falling' | 'over'
  reason: 'hit', // 'hit' | 'fell' – für die Game-Over-Ansicht
  theme: 'day', // 'day' | 'night' – ab THEME_SCORE
  wings: false, // ab WINGS_SCORE: Klick = Aufwärtsimpuls
  invincible: false, // per W-A-S-D-Cheat für den Rest des Laufs
  time: 0,
  speed: CFG.startSpeed,
  distance: 0,
  gold: 0,
  best: loadBest(),
  newBest: false,
  obstacles: [],
  pits: [],
  coins: [],
  birds: [],
  particles: [],
  spawnIn: 1.15,
  birdIn: 1.2,
  scroll: 0,
  shake: 0,
  flash: 0,
  overDelay: 0,
  toastText: '',
  toastTime: 0,
};

const player = {
  y: GROUND_Y,
  vy: 0,
  onGround: true,
  angle: 0,
  face: 5,
  coyote: 0,
  squash: 1,
  doubleJump: false,
  doubleJumped: false,
  wingFlap: 0,
};

const CHEAT_CODES = ['KeyW', 'KeyA', 'KeyS', 'KeyD'];
const cheatKeys = new Set();
const cheatSeq = [];

const clouds = [];
for (let i = 0; i < 6; i++) {
  clouds.push({
    x: Math.random() * (VIEW_W + 160) - 80,
    y: 40 + Math.random() * 150,
    s: 0.6 + Math.random() * 0.9,
    a: 0.55 + Math.random() * 0.35,
  });
}

Object.assign(WS, { game, player, clouds, CHEAT_CODES, cheatKeys, cheatSeq });
WS.jumpBuffer = 0;
WS.lastTime = performance.now();
WS.accumulator = 0;
})(window.WS = window.WS || {});
