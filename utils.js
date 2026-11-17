/* utils.js - Helfer */
(function (WS) {
  'use strict';
  const { BEST_KEY } = WS;

function clamp(v, min, max) {
  return v < min ? min : v > max ? max : v;
}

function fmt(n) {
  return Math.round(n).toLocaleString('de-DE');
}

function roundRect(c, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  c.beginPath();
  c.moveTo(x + rr, y);
  c.arcTo(x + w, y, x + w, y + h, rr);
  c.arcTo(x + w, y + h, x, y + h, rr);
  c.arcTo(x, y + h, x, y, rr);
  c.arcTo(x, y, x + w, y, rr);
  c.closePath();
}

function getScore() {
  return Math.floor(WS.game.distance / 10) + WS.game.gold * 10;
}

function loadBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch (err) {
    return 0;
  }
}

function saveBest(value) {
  try {
    localStorage.setItem(BEST_KEY, String(Math.round(value)));
  } catch (err) {
    /* localStorage ist z. B. im Privatmodus manchmal gesperrt */
  }
}

function notify(text) {
  WS.game.toastText = text;
  WS.game.toastTime = 1.5;
}

Object.assign(WS, { clamp, fmt, roundRect, getScore, loadBest, saveBest, notify });
})(window.WS = window.WS || {});
