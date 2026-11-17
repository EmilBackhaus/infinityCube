/* canvas.js - Canvas und Ansicht */
(function (WS) {
  'use strict';
  const { VIEW_W, VIEW_H } = WS;

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const view = { scale: 1, ox: 0, oy: 0 };

function resize() {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.max(1, Math.round(rect.width * dpr));
  const h = Math.max(1, Math.round(rect.height * dpr));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  view.scale = Math.min(w / VIEW_W, h / VIEW_H);
  view.ox = (w - VIEW_W * view.scale) / 2;
  view.oy = (h - VIEW_H * view.scale) / 2;
}

if ('ResizeObserver' in window) {
  new ResizeObserver(resize).observe(canvas);
}
window.addEventListener('resize', resize);
resize();

Object.assign(WS, { canvas, ctx, view, resize });
WS.initCanvas = resize;
})(window.WS = window.WS || {});
