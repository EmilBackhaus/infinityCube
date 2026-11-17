/* render.js - Zeichnen */
(function (WS) {
  'use strict';
  const { VIEW_W, VIEW_H, GROUND_Y, CFG, FONT } = WS;
  const { ctx, canvas, view, game, player, clouds } = WS;
  const { clamp, fmt, roundRect, getScore, drawDie } = WS;

function drawSky() {
  const night = game.theme === 'night';
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  if (night) {
    sky.addColorStop(0, '#05081c');
    sky.addColorStop(0.45, '#1b1142');
    sky.addColorStop(0.8, '#4b1856');
    sky.addColorStop(1, '#7d2360');
  } else {
    sky.addColorStop(0, '#4fb3f6');
    sky.addColorStop(0.55, '#93d8ff');
    sky.addColorStop(1, '#e2f4ff');
  }
  ctx.fillStyle = sky;
  ctx.fillRect(-40, -40, VIEW_W + 80, GROUND_Y + 80);

  if (night) drawSkyStars();
}

function drawSkyStars() {
  ctx.save();
  for (let i = 0; i < 72; i++) {
    const x = ((i * 137.5 + 31) % (VIEW_W + 20)) - 10;
    const y = 18 + ((i * 73) % (GROUND_Y - 130));
    const twinkle = 0.5 + 0.5 * Math.sin(game.time * 1.7 + i * 0.9);
    const big = i % 9 === 0;
    ctx.globalAlpha = 0.25 + 0.55 * twinkle;
    ctx.fillStyle = i % 7 === 0 ? '#ffd6f4' : '#e9f6ff';
    ctx.fillRect(x, y, big ? 2.5 : 1.5, big ? 2.5 : 1.5);
  }
  ctx.restore();
}

function drawSun() {
  const x = 774;
  const y = 112;
  const night = game.theme === 'night';

  const glow = ctx.createRadialGradient(x, y, 20, x, y, 150);
  if (night) {
    glow.addColorStop(0, 'rgba(180, 235, 255, 0.55)');
    glow.addColorStop(0.35, 'rgba(150, 120, 255, 0.26)');
    glow.addColorStop(1, 'rgba(120, 80, 240, 0)');
  } else {
    glow.addColorStop(0, 'rgba(255, 236, 160, 0.9)');
    glow.addColorStop(0.35, 'rgba(255, 226, 130, 0.32)');
    glow.addColorStop(1, 'rgba(255, 226, 130, 0)');
  }
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, 150, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = night ? '#e6f4ff' : '#ffe9a3';
  ctx.beginPath();
  ctx.arc(x, y, 46, 0, Math.PI * 2);
  ctx.fill();

  if (night) {
    // Krater statt Sonnenreflex
    ctx.fillStyle = 'rgba(150, 170, 220, 0.45)';
    ctx.beginPath();
    ctx.arc(x - 13, y - 12, 10, 0, Math.PI * 2);
    ctx.arc(x + 16, y + 9, 7, 0, Math.PI * 2);
    ctx.arc(x + 2, y - 20, 5, 0, Math.PI * 2);
    ctx.arc(x - 4, y + 18, 6, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.beginPath();
    ctx.arc(x - 13, y - 13, 16, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawClouds() {
  const night = game.theme === 'night';
  for (const c of clouds) {
    ctx.save();
    ctx.globalAlpha = c.a * (night ? 0.32 : 1);
    ctx.fillStyle = night ? '#b8a6ff' : '#ffffff';
    ctx.beginPath();
    ctx.arc(c.x, c.y, 22 * c.s, 0, Math.PI * 2);
    ctx.arc(c.x + 27 * c.s, c.y + 5 * c.s, 17 * c.s, 0, Math.PI * 2);
    ctx.arc(c.x - 27 * c.s, c.y + 7 * c.s, 15 * c.s, 0, Math.PI * 2);
    ctx.arc(c.x + 5 * c.s, c.y - 13 * c.s, 17 * c.s, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawHills() {
  const night = game.theme === 'night';
  drawHillLayer(game.scroll * 0.1, 436, 46, 260, night ? '#241a44' : '#a9ddc2');
  drawHillLayer(game.scroll * 0.22, 464, 32, 158, night ? '#140f2e' : '#84cda2');
}

function drawHillLayer(offset, base, amp, wave, color) {
  ctx.beginPath();
  ctx.moveTo(-40, VIEW_H);
  for (let x = -40; x <= VIEW_W + 40; x += 10) {
    const y =
      base -
      Math.sin((x + offset) / wave) * amp -
      Math.sin((x + offset) / (wave * 0.41) + 1.7) * amp * 0.45;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(VIEW_W + 40, VIEW_H);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function drawGround() {
  const night = game.theme === 'night';
  const dirt = ctx.createLinearGradient(0, GROUND_Y, 0, VIEW_H);

  if (night) {
    dirt.addColorStop(0, '#241844');
    dirt.addColorStop(1, '#0a0718');
  } else {
    dirt.addColorStop(0, '#7a5433');
    dirt.addColorStop(1, '#472f1f');
  }
  ctx.fillStyle = dirt;
  ctx.fillRect(-40, GROUND_Y, VIEW_W + 80, VIEW_H - GROUND_Y + 40);

  // Grasnarbe / Neonkante
  ctx.fillStyle = night ? '#2b4fa0' : '#5cbb78';
  ctx.fillRect(-40, GROUND_Y - 6, VIEW_W + 80, 18);
  ctx.fillStyle = night ? '#17305f' : '#3f9359';
  ctx.fillRect(-40, GROUND_Y + 12, VIEW_W + 80, 4);

  // Grasbüschel am Rand (nachts leuchten sie cyan)
  const period = 34;
  const off = game.scroll % period;
  ctx.fillStyle = night ? '#6ff6ff' : '#6fd08a';
  for (let x = -period; x < VIEW_W + period; x += period) {
    const px = x - off;
    ctx.fillRect(px, GROUND_Y - 11, 3, 11);
    ctx.fillRect(px + 10, GROUND_Y - 7, 2, 7);
  }

  // Steinchen im Boden
  ctx.fillStyle = night ? 'rgba(255, 130, 220, 0.18)' : 'rgba(255, 255, 255, 0.07)';
  const span = VIEW_W + 220;
  for (let i = 0; i < 46; i++) {
    const x = (((i * 173 + 40 - game.scroll * 0.9) % span) + span) % span - 110;
    const y = GROUND_Y + 28 + ((i * 37) % (VIEW_H - GROUND_Y - 40));
    const r = 1.5 + ((i * 7) % 5);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Kante zwischen Gras und Luft
  ctx.strokeStyle = night ? 'rgba(140, 246, 255, 0.7)' : 'rgba(255, 255, 255, 0.28)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-40, GROUND_Y - 6);
  ctx.lineTo(VIEW_W + 40, GROUND_Y - 6);
  ctx.stroke();
}

/* ---------- 10. Zeichnen: Löcher ---------- */

function drawPits() {
  const night = game.theme === 'night';
  for (const pit of game.pits) {
    const x = pit.x;
    const w = pit.w;
    const top = GROUND_Y - 11;

    // Dunkler Schacht, nach unten etwas breiter
    const shaft = ctx.createLinearGradient(0, top, 0, VIEW_H);
    if (night) {
      shaft.addColorStop(0, '#160a2c');
      shaft.addColorStop(0.35, '#0b0418');
      shaft.addColorStop(1, '#020106');
    } else {
      shaft.addColorStop(0, '#241809');
      shaft.addColorStop(0.35, '#140e08');
      shaft.addColorStop(1, '#060409');
    }
    ctx.fillStyle = shaft;
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x + w, top);
    ctx.lineTo(x + w + 14, VIEW_H);
    ctx.lineTo(x - 14, VIEW_H);
    ctx.closePath();
    ctx.fill();

    // Erdwände an den Seiten
    const wall = ctx.createLinearGradient(0, top, 0, GROUND_Y + 74);
    if (night) {
      wall.addColorStop(0, '#43266b');
      wall.addColorStop(0.55, '#261544');
      wall.addColorStop(1, 'rgba(28, 12, 52, 0)');
    } else {
      wall.addColorStop(0, '#6b4a2c');
      wall.addColorStop(0.55, '#4a3220');
      wall.addColorStop(1, 'rgba(50, 34, 20, 0)');
    }
    ctx.fillStyle = wall;
    ctx.fillRect(x, top, 7, 85);
    ctx.fillRect(x + w - 7, top, 7, 85);

    // Helle Schnittkante
    ctx.fillStyle = night ? 'rgba(140, 246, 255, 0.35)' : 'rgba(255, 255, 255, 0.16)';
    ctx.fillRect(x - 2, top, 2, 13);
    ctx.fillRect(x + w, top, 2, 13);

    // Oberkante abdunkeln
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(x, top, w, 4);
  }
}

function drawObstacles() {
  const night = game.theme === 'night';
  for (const o of game.obstacles) {
    const size = o.w;
    const top = GROUND_Y - o.h;

    ctx.fillStyle = night ? 'rgba(255, 70, 180, 0.16)' : 'rgba(20, 40, 25, 0.18)';
    ctx.beginPath();
    ctx.ellipse(o.x + size / 2, GROUND_Y + 5, size * 0.58, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(o.x + size / 2, top + size / 2);
    if (night) {
      drawDie(size, o.face, 0, {
        fill: o.tone > 0.5 ? '#3a0f3f' : '#290b3b',
        stroke: '#ff5fb0',
        pip: '#ffd0ea',
        glow: 'rgba(255, 70, 180, 0.9)',
      });
    } else {
      drawDie(size, o.face, 0, {
        fill: o.tone > 0.5 ? '#303a5c' : '#2a3350',
        stroke: '#151c30',
        pip: '#93a7d8',
      });
    }
    ctx.restore();
  }
}

function drawGoldIcon(x, y, r) {
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.15, x, y, r);
  g.addColorStop(0, '#fff8c9');
  g.addColorStop(0.55, '#ffd23f');
  g.addColorStop(1, '#e79b00');

  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(140, 80, 0, 0.55)';
  ctx.lineWidth = Math.max(1.5, r * 0.16);
  ctx.stroke();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.beginPath();
  ctx.arc(x - r * 0.32, y - r * 0.36, r * 0.24, 0, Math.PI * 2);
  ctx.fill();
}

function drawPowerCoin(c) {
  const y = c.y + Math.sin(game.time * 3 + c.phase) * 4;
  const x = c.x;
  const r = c.r;
  const pulse = 0.5 + 0.5 * Math.sin(game.time * 6 + c.phase);

  // Leuchten
  const glow = ctx.createRadialGradient(x, y, r * 0.3, x, y, r * 2.8);
  glow.addColorStop(0, `rgba(150, 240, 255, ${0.42 + 0.22 * pulse})`);
  glow.addColorStop(0.55, 'rgba(130, 190, 255, 0.22)');
  glow.addColorStop(1, 'rgba(120, 180, 255, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, r * 2.8, 0, Math.PI * 2);
  ctx.fill();

  // Pulsierender Ring
  ctx.strokeStyle = `rgba(170, 245, 255, ${0.3 + 0.35 * pulse})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, r * (1.6 + 0.18 * pulse), 0, Math.PI * 2);
  ctx.stroke();

  // Rautenförmige Münze
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.sin(game.time * 1.6 + c.phase) * 0.32);

  const body = ctx.createLinearGradient(0, -r * 1.2, 0, r * 1.2);
  body.addColorStop(0, '#c9fbff');
  body.addColorStop(0.45, '#6fd0ff');
  body.addColorStop(1, '#6f7cff');
  ctx.fillStyle = body;
  ctx.strokeStyle = 'rgba(12, 44, 82, 0.65)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -r * 1.25);
  ctx.lineTo(r, 0);
  ctx.lineTo(0, r * 1.25);
  ctx.lineTo(-r, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Glanzstreifen
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.28, -r * 0.45, r * 0.2, r * 0.33, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // "2×" in der Mitte
  ctx.fillStyle = '#0d2b4c';
  ctx.font = FONT(900, Math.round(r * 0.95));
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('2×', x, y + 1);
  ctx.textBaseline = 'alphabetic';
}

function drawCoins() {
  for (const c of game.coins) {
    if (c.taken) continue;
    if (c.kind === 'double') {
      drawPowerCoin(c);
      continue;
    }
    const y = c.y + Math.sin(game.time * 3 + c.phase) * 3;
    const r = c.r * (1 + Math.sin(game.time * 5 + c.phase) * 0.06);
    drawGoldIcon(c.x, y, r);
  }
}

function drawBirds() {
  const night = game.theme === 'night';

  for (const b of game.birds) {
    const cx = b.x + b.w / 2;
    const cy = b.y + b.h / 2;
    const flap = Math.sin(game.time * b.flapSpeed + b.phase);
    const body = night ? '#7a64d8' : '#33425f';
    const wing = night ? '#b8a6ff' : '#4a5f85';
    const belly = night ? '#d9c8ff' : '#8fa6c9';

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(Math.sin(b.t * 1.5 + b.phase) * 0.08);

    // Schwanz
    ctx.fillStyle = wing;
    ctx.beginPath();
    ctx.moveTo(b.w * 0.18, -1);
    ctx.lineTo(b.w * 0.56, -b.h * 0.26);
    ctx.lineTo(b.w * 0.5, b.h * 0.2);
    ctx.closePath();
    ctx.fill();

    // Schlagender Flügel
    ctx.save();
    ctx.translate(0, -b.h * 0.05);
    ctx.rotate(-0.25 - flap * 0.55);
    ctx.fillStyle = wing;
    ctx.beginPath();
    ctx.moveTo(-b.w * 0.18, 0);
    ctx.quadraticCurveTo(-b.w * 0.05, -b.h * 0.9, b.w * 0.34, -b.h * 0.55);
    ctx.quadraticCurveTo(b.w * 0.12, -b.h * 0.1, b.w * 0.14, b.h * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Körper und Bauch
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.ellipse(0, 0, b.w * 0.3, b.h * 0.4, -0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = belly;
    ctx.beginPath();
    ctx.ellipse(-b.w * 0.02, b.h * 0.14, b.w * 0.2, b.h * 0.2, -0.1, 0, Math.PI * 2);
    ctx.fill();

    // Kopf, Auge, Schnabel (der Vogel fliegt nach links)
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.arc(-b.w * 0.3, -b.h * 0.16, b.h * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = night ? '#0b1230' : '#ffffff';
    ctx.beginPath();
    ctx.arc(-b.w * 0.36, -b.h * 0.2, Math.max(1.4, b.h * 0.08), 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = night ? '#ffd166' : '#f2a93b';
    ctx.beginPath();
    ctx.moveTo(-b.w * 0.58, -b.h * 0.14);
    ctx.lineTo(-b.w * 0.38, -b.h * 0.28);
    ctx.lineTo(-b.w * 0.38, -b.h * 0.04);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}

function drawPlayer() {
  const heightAbove = GROUND_Y - player.y;
  const near = clamp(1 - heightAbove / 240, 0.35, 1);
  const night = game.theme === 'night';

  // Über einem Loch gibt es keinen Schatten
  if (WS.groundUnderPlayer()) {
    ctx.save();
    ctx.globalAlpha = (night ? 0.34 : 0.22) * near;
    ctx.fillStyle = night ? '#05010f' : '#12301c';
    ctx.beginPath();
    ctx.ellipse(CFG.playerX, GROUND_Y + 4, CFG.playerSize * 0.55 * near, 7 * near, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const bob = game.state === 'ready' ? Math.sin(game.time * 3) * 3 : 0;
  const cy = player.y - CFG.playerSize / 2 - 3 + bob;

  // Leuchtender Ring, solange der Doppelsprung bereitliegt
  if (player.doubleJump) {
    const pulse = 0.5 + 0.5 * Math.sin(game.time * 8);
    ctx.save();
    ctx.strokeStyle = `rgba(130, 235, 255, ${0.4 + 0.3 * pulse})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(CFG.playerX, cy, CFG.playerSize * (0.72 + 0.07 * pulse), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Goldene Schutzaura für den W-A-S-D-Cheat
  if (game.invincible) {
    const pulse = 0.5 + 0.5 * Math.sin(game.time * 6);
    ctx.save();
    ctx.strokeStyle = `rgba(255, 214, 90, ${0.45 + 0.35 * pulse})`;
    ctx.shadowColor = 'rgba(255, 210, 80, 0.8)';
    ctx.shadowBlur = 16;
    ctx.lineWidth = 3.5;
    ctx.setLineDash([11, 7]);
    ctx.lineDashOffset = -game.time * 34;
    ctx.beginPath();
    ctx.arc(CFG.playerX, cy, CFG.playerSize * (0.86 + 0.05 * pulse), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  ctx.save();
  ctx.translate(CFG.playerX, cy);
  ctx.scale(1 / Math.sqrt(player.squash), player.squash);

  // Flügel liegen hinter dem Würfel
  if (game.wings) {
    const beat = Math.sin(game.time * (6 + player.wingFlap * 18)) * (0.3 + player.wingFlap * 0.55);

    for (const dir of [-1, 1]) {
      ctx.save();
      ctx.scale(dir, 1);
      ctx.rotate(-0.2 + beat * 0.45);
      ctx.beginPath();
      ctx.moveTo(CFG.playerSize * 0.18, -CFG.playerSize * 0.15);
      ctx.quadraticCurveTo(
        CFG.playerSize * 0.65,
        -CFG.playerSize * 0.9,
        CFG.playerSize * 1.02,
        -CFG.playerSize * 0.2
      );
      ctx.quadraticCurveTo(
        CFG.playerSize * 0.72,
        -CFG.playerSize * 0.05,
        CFG.playerSize * 0.5,
        CFG.playerSize * 0.13
      );
      ctx.quadraticCurveTo(
        CFG.playerSize * 0.35,
        CFG.playerSize * 0.2,
        CFG.playerSize * 0.18,
        CFG.playerSize * 0.1
      );
      ctx.closePath();
      ctx.fillStyle = night ? 'rgba(140, 245, 255, 0.92)' : 'rgba(255, 255, 255, 0.96)';
      ctx.strokeStyle = night ? '#6ff6ff' : 'rgba(120, 170, 210, 0.9)';
      ctx.lineWidth = 2;
      if (night) {
        ctx.shadowColor = 'rgba(90, 240, 255, 0.85)';
        ctx.shadowBlur = 10;
      }
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }

  if (night) {
    const body = ctx.createLinearGradient(0, -CFG.playerSize / 2, 0, CFG.playerSize / 2);
    body.addColorStop(0, '#3c5bd6');
    body.addColorStop(1, '#0b1230');
    drawDie(CFG.playerSize, player.face, player.angle, {
      fill: body,
      stroke: '#6ff6ff',
      pip: '#d9fbff',
      glow: 'rgba(90, 240, 255, 0.85)',
    });
  } else {
    drawDie(CFG.playerSize, player.face, player.angle, {});
  }
  ctx.restore();
}

function drawParticles() {
  for (const p of game.particles) {
    const a = clamp(p.life / p.max, 0, 1);
    ctx.globalAlpha = Math.min(1, a * 1.6);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * (0.4 + 0.6 * a), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/* ---------- 12. Zeichnen: HUD & Overlays ---------- */

function panel(x, y, w, h) {
  ctx.save();
  ctx.shadowColor = 'rgba(18, 38, 66, 0.18)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.62)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.lineWidth = 1.5;
  roundRect(ctx, x, y, w, h, 17);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawHud() {
  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  // Punkte
  panel(22, 18, 190, 70);
  ctx.fillStyle = '#54688a';
  ctx.font = FONT(700, 12);
  ctx.fillText('PUNKTE', 40, 42);
  ctx.fillStyle = '#152238';
  ctx.font = FONT(800, 30);
  ctx.fillText(fmt(getScore()), 40, 72);

  // Gold
  panel(220, 18, 118, 70);
  drawGoldIcon(247, 53, 12);
  ctx.fillStyle = '#152238';
  ctx.font = FONT(800, 26);
  ctx.textAlign = 'right';
  ctx.fillText(String(game.gold), 321, 63);

  // Rekord
  panel(768, 18, 170, 70);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#54688a';
  ctx.font = FONT(700, 12);
  ctx.fillText('REKORD', 786, 42);
  ctx.fillStyle = '#152238';
  ctx.font = FONT(800, 28);
  ctx.fillText(fmt(game.best), 786, 72);

  // Status: Flügel und/oder Unverwundbarkeit
  if (game.wings || game.invincible) {
    const badgeW = 210;
    panel(VIEW_W / 2 - badgeW / 2, 18, badgeW, 70);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#54688a';
    ctx.font = FONT(700, 12);
    ctx.fillText(game.invincible ? 'UNVERWUNDBAR' : 'FLÜGEL', VIEW_W / 2, 42);

    ctx.fillStyle = game.invincible ? '#9a6b00' : '#1b6a8a';
    ctx.font = FONT(800, 17);
    let value = 'KLICK = AUFWÄRTS';
    if (game.invincible) value = game.wings ? 'FLIEGEN + SCHUTZ' : 'SCHUTZ AKTIV';
    ctx.fillText(value, VIEW_W / 2, 68);
  }

  ctx.restore();
}

function drawFlash() {
  ctx.save();
  ctx.globalAlpha = clamp(game.flash * 0.55, 0, 0.55);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.restore();
}

function drawVignette() {
  const g = ctx.createRadialGradient(
    VIEW_W / 2,
    VIEW_H / 2,
    VIEW_H * 0.35,
    VIEW_W / 2,
    VIEW_H / 2,
    VIEW_H * 0.95
  );
  g.addColorStop(0, 'rgba(10, 20, 40, 0)');
  g.addColorStop(1, 'rgba(10, 20, 40, 0.26)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
}

function drawReady() {
  ctx.save();
  ctx.fillStyle = 'rgba(8, 20, 40, 0.32)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.textAlign = 'center';

  ctx.font = FONT(900, 78);
  ctx.fillStyle = 'rgba(6, 16, 34, 0.45)';
  ctx.fillText('WÜRFEL-SPRUNG', VIEW_W / 2 + 5, 205);
  ctx.fillStyle = '#ffffff';
  ctx.fillText('WÜRFEL-SPRUNG', VIEW_W / 2, 200);

  ctx.font = FONT(600, 22);
  ctx.fillStyle = '#dbeeff';
  ctx.fillText('Hüpfe über Blöcke und Löcher und sammle Gold!', VIEW_W / 2, 246);

  ctx.font = FONT(600, 17);
  ctx.fillStyle = 'rgba(219, 238, 255, 0.82)';
  ctx.fillText('Breite Löcher schaffst du nur mit dem Doppelsprung:', VIEW_W / 2, 278);
  ctx.fillStyle = '#a8ecff';
  ctx.fillText('Spezialmünze über dem Loch holen, dann in der Luft nochmal springen.', VIEW_W / 2, 302);
  ctx.fillStyle = 'rgba(219, 238, 255, 0.72)';
  ctx.fillText('Goldene Punkte im Sprung geben Extrapunkte.', VIEW_W / 2, 326);

  if (game.best > 0) {
    ctx.font = FONT(700, 18);
    ctx.fillStyle = '#ffe28a';
    ctx.fillText(`Rekord: ${fmt(game.best)} Punkte`, VIEW_W / 2, 358);
  }

  const pulse = 0.5 + 0.5 * Math.sin(game.time * 4);
  ctx.globalAlpha = 0.82 + 0.18 * pulse;
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, VIEW_W / 2 - 196, 386, 392, 64, 32);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#16233d';
  ctx.font = FONT(700, 21);
  ctx.fillText('Leertaste / Klick / Tippen', VIEW_W / 2, 426);

  ctx.restore();
}

function drawGameOver() {
  ctx.save();
  ctx.fillStyle = 'rgba(6, 12, 26, 0.55)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  const x = 250;
  const y = 108;
  const w = 460;
  const h = 336;

  ctx.fillStyle = 'rgba(16, 26, 48, 0.93)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, w, h, 26);
  ctx.fill();
  ctx.stroke();

  ctx.textAlign = 'center';
  const fell = game.reason === 'fell';
  ctx.fillStyle = game.newBest ? '#ffd166' : fell ? '#ffb4a2' : '#ffffff';
  ctx.font = FONT(900, fell ? 38 : 46);
  ctx.fillText(fell ? 'RUNTERGEFALLEN' : 'GAME OVER', VIEW_W / 2, y + 68);

  ctx.fillStyle = 'rgba(214, 232, 255, 0.7)';
  ctx.font = FONT(700, 13);
  ctx.fillText('PUNKTE', VIEW_W / 2, y + 112);

  ctx.fillStyle = '#ffffff';
  ctx.font = FONT(900, 62);
  ctx.fillText(fmt(getScore()), VIEW_W / 2, y + 174);

  ctx.fillStyle = 'rgba(214, 232, 255, 0.82)';
  ctx.font = FONT(600, 18);
  ctx.fillText(`Rekord: ${fmt(game.best)}   ·   Gold: ${game.gold}`, VIEW_W / 2, y + 214);

  if (game.newBest) {
    ctx.fillStyle = '#ffd166';
    ctx.font = FONT(800, 20);
    ctx.fillText('Neuer Rekord!', VIEW_W / 2, y + 248);
  }

  if (game.overDelay <= 0) {
    const pulse = 0.55 + 0.45 * Math.sin(game.time * 4);
    ctx.globalAlpha = pulse;
    ctx.fillStyle = '#ffffff';
    ctx.font = FONT(700, 19);
    ctx.fillText('Leertaste / Tippen für neuen Versuch', VIEW_W / 2, y + 296);
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

function drawToast() {
  if (game.toastTime <= 0) return;
  const alpha = Math.min(1, game.toastTime * 1.6);
  const h = 42;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = FONT(700, 16);
  const w = Math.max(150, ctx.measureText(game.toastText).width + 46);
  ctx.fillStyle = 'rgba(12, 22, 42, 0.78)';
  roundRect(ctx, VIEW_W / 2 - w / 2, 500, w, h, 21);
  ctx.fill();
  ctx.fillStyle = '#eaf3ff';
  ctx.textAlign = 'center';
  ctx.fillText(game.toastText, VIEW_W / 2, 527);
  ctx.restore();
}

/* ---------- 13. Gesamtbild ---------- */

function render() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(view.scale, 0, 0, view.scale, view.ox, view.oy);

  ctx.save();
  if (game.shake > 0.1) {
    ctx.translate((Math.random() * 2 - 1) * game.shake, (Math.random() * 2 - 1) * game.shake * 0.7);
  }
  drawSky();
  drawSun();
  drawClouds();
  drawHills();
  drawGround();
  drawPits();
  drawObstacles();
  drawCoins();
  drawBirds();
  drawPlayer();
  drawParticles();
  ctx.restore();

  if (game.flash > 0) drawFlash();
  drawVignette();
  drawHud();

  if (game.state === 'ready') drawReady();
  else if (game.state === 'over') drawGameOver();

  drawToast();
}

Object.assign(WS, {
  drawSky, drawSkyStars, drawSun, drawClouds, drawHills, drawHillLayer, drawGround,
  drawPits, drawGoldIcon, drawPowerCoin, drawCoins, drawBirds, drawPlayer,
  drawParticles, panel, drawHud, drawFlash, drawVignette, drawReady, drawGameOver,
  drawToast, render,
});
})(window.WS = window.WS || {});
