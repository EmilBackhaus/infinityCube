/* die.js - Würfel zeichnen */
(function (WS) {
  'use strict';
  const { ctx, PIP_MAP, roundRect } = WS;

function drawPips(cx, cy, size, face, color, angle = 0) {
  const pips = PIP_MAP[face] || PIP_MAP[1];
  const step = size * 0.235;
  const radius = Math.max(1.6, size * 0.075);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.fillStyle = color;
  for (const [gx, gy] of pips) {
    ctx.beginPath();
    ctx.arc(gx * step, gy * step, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawDie(size, face, angle, opts = {}) {
  const half = size / 2;
  const radius = size * 0.24;

  ctx.save();
  ctx.rotate(angle);

  if (opts.shadow !== false) {
    ctx.shadowColor = 'rgba(12, 22, 40, 0.28)';
    ctx.shadowBlur = size * 0.3;
    ctx.shadowOffsetY = size * 0.12;
  }

  ctx.fillStyle = opts.fill || '#f8fbff';
  roundRect(ctx, -half, -half, size, size, radius);
  ctx.fill();

  // Neon-Modus: Rand und Augen leuchten
  ctx.shadowColor = opts.glow || 'transparent';
  ctx.shadowBlur = opts.glow ? size * 0.45 : 0;
  ctx.shadowOffsetY = 0;

  ctx.strokeStyle = opts.stroke || '#222b45';
  ctx.lineWidth = Math.max(2, size * 0.07);
  roundRect(ctx, -half, -half, size, size, radius);
  ctx.stroke();

  drawPips(0, 0, size, face, opts.pip || '#222b45');
  ctx.restore();
}

Object.assign(WS, { drawPips, drawDie });
})(window.WS = window.WS || {});
