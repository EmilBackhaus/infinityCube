/* logic.js - Spielablauf und Physik */
(function (WS) {
  'use strict';
  const { VIEW_W, VIEW_H, GROUND_Y, THEME_SCORE, WINGS_SCORE, CFG } = WS;
  const { clamp, getScore, saveBest, notify } = WS;
  const { game, player, clouds, CHEAT_CODES, cheatKeys, cheatSeq } = WS;
  const {
    ensureAudio, playJump, playCoin, playPower, playDoubleJump,
    playFlap, playShield, playLand, playFall, playHit,
  } = WS;

function startGame() {
  game.state = 'playing';
  game.reason = 'hit';
  game.theme = 'day';
  game.wings = false;
  game.invincible = false;
  game.speed = CFG.startSpeed;
  game.distance = 0;
  game.gold = 0;
  game.newBest = false;
  game.obstacles.length = 0;
  game.pits.length = 0;
  game.coins.length = 0;
  game.birds.length = 0;
  game.particles.length = 0;
  game.spawnIn = 1.15;
  game.birdIn = 1.2;
  game.shake = 0;
  game.flash = 0;
  game.overDelay = 0;
  game.toastText = '';
  game.toastTime = 0;
  WS.jumpBuffer = 0;
  cheatKeys.clear();
  cheatSeq.length = 0;

  player.y = GROUND_Y;
  player.vy = 0;
  player.onGround = true;
  player.angle = 0;
  player.coyote = 0;
  player.squash = 1;
  player.face = 1 + Math.floor(Math.random() * 6);
  player.doubleJump = false;
  player.doubleJumped = false;
  player.wingFlap = 0;

  ensureAudio();
}

function doJump() {
  player.vy = CFG.jumpVelocity;
    // currentDieColor removed = randomColor();
  player.onGround = false;
  player.coyote = 0;
  player.squash = 1.14;
  WS.jumpBuffer = 0;

  burst(CFG.playerX, GROUND_Y - 4, 8, ['#e9fff2', '#c4ecd4', '#ffffff'], 40, 160, 800, Math.PI, -Math.PI / 2);
  playJump();
}

function doDoubleJump() {
  player.doubleJump = false;
  player.doubleJumped = true;
  player.vy = CFG.doubleJumpVelocity;
  player.onGround = false;
  player.coyote = 0;
  player.squash = 1.2;
  WS.jumpBuffer = 0;

  burst(
    CFG.playerX,
    player.y - CFG.playerSize * 0.5,
    18,
    ['#a8f6ff', '#7fd4ff', '#e9fdff', '#c9b6ff'],
    70,
    300,
    180
  );
  playDoubleJump();
}

function doFlap() {
  player.vy = CFG.flapVelocity;
  player.onGround = false;
  player.coyote = 0;
  player.squash = 0.9;
  player.wingFlap = 1;
  WS.jumpBuffer = 0;

  burst(
    CFG.playerX - 16,
    player.y - CFG.playerSize * 0.55,
    7,
    ['#ffffff', '#c9f7ff', '#9fe4ff'],
    30,
    150,
    120,
    Math.PI,
    Math.PI / 2
  );
  playFlap();
}

// Ab 10.000 Punkten: Flügel freischalten und die Vögel loslassen.
function unlockWings() {
  game.wings = true;
  game.flash = 0.85;
  game.shake = 8;
  game.birdIn = 1.1;
  player.wingFlap = 1;
  player.vy = Math.min(player.vy, -430);
  player.onGround = false;
  notify('Flügel! Klick zum Fliegen');
  burst(
    CFG.playerX,
    player.y - CFG.playerSize * 0.5,
    30,
    ['#ffffff', '#b8f6ff', '#7fd4ff', '#c9b6ff'],
    80,
    360,
    160
  );
  playPower();
}

// W-A-S-D-Cheat: macht den Rest des Laufs unverwundbar.
function activateInvincibility() {
  if (game.invincible) return;
  game.invincible = true;
  game.flash = Math.max(game.flash, 0.65);
  game.shake = Math.max(game.shake, 6);
  notify('Unverwundbar!');
  burst(
    CFG.playerX,
    player.y - CFG.playerSize * 0.5,
    32,
    ['#ffe066', '#fff8c9', '#9ff0ff', '#ffffff'],
    70,
    330,
    120
  );
  playShield();
}

function noteCheatDown(code) {
  if (!CHEAT_CODES.includes(code)) return;
  cheatKeys.add(code);

  if (game.state !== 'playing' && game.state !== 'falling') return;

  const now = performance.now();
  cheatSeq.push({ code, t: now });
  while (cheatSeq.length > 0 && now - cheatSeq[0].t > CFG.cheatWindow) {
    cheatSeq.shift();
  }

  const recent = cheatSeq.slice(-4);
  const sequenceOk =
    recent.length === 4 && recent.every((entry, i) => entry.code === CHEAT_CODES[i]);
  const holdOk = CHEAT_CODES.every((c) => cheatKeys.has(c));

  if (sequenceOk || holdOk) {
    cheatSeq.length = 0;
    activateInvincibility();
  }
}

function noteCheatUp(code) {
  cheatKeys.delete(code);
}

function cutJump() {
  // Kurz getippt = kleiner Hüpfer, gehalten = voller Sprung.
  // Der Doppelsprung wird nie gekürzt, sonst wäre das breite Loch nicht fair.
  // Mit Flügeln gibt es keinen gehaltenen Sprung mehr.
  if (game.wings) return;
  if (game.state === 'playing' && !player.doubleJumped && player.vy < -450) {
    player.vy = -450;
  }
}

function onLand() {
  player.squash = 0.78;
  player.face = 1 + Math.floor(Math.random() * 6);
  player.doubleJump = false;
  player.doubleJumped = false;
  burst(CFG.playerX, GROUND_Y - 2, 7, ['#e9fff2', '#c4ecd4', '#ffffff'], 30, 150, 800, Math.PI, -Math.PI / 2);
  playLand();
}

function collectCoin(coin) {
  coin.taken = true;

  // Spezialmünze: gibt einen zusätzlichen Sprung in der Luft
  if (coin.kind === 'double') {
    player.doubleJump = true;
    player.doubleJumped = false;
    burst(
      coin.x,
      coin.y,
      24,
      ['#9ff0ff', '#7fb6ff', '#e6f9ff', '#c9b6ff'],
      80,
      330,
      220
    );
    notify('Doppelsprung bereit!');
    playPower();
    return;
  }

  game.gold += 1;
  burst(coin.x, coin.y, 12, ['#ffe066', '#ffd23f', '#fff8c9'], 60, 260, 500);
  playCoin();
}

function die(reason = 'hit') {
  // Der W-A-S-D-Schutz hält für den Rest des Laufs.
  if (game.invincible) return;

  game.state = 'over';
  game.reason = reason;
  game.overDelay = 0.55;

  if (reason === 'fell') {
    game.shake = 7;
    game.flash = 0;
    player.squash = 1;
    playFall();
  } else {
    game.shake = 18;
    game.flash = 0.9;
    player.squash = 0.72;
    burst(
      CFG.playerX,
      player.y - CFG.playerSize * 0.5,
      28,
      ['#ffd166', '#ff8a5c', '#ffe9a3', '#ff6b6b'],
      90,
      430,
      1000
    );
    playHit();
  }

  const score = getScore();
  if (!game.newBest && score > game.best) {
    game.newBest = true;
    game.best = score;
    saveBest(score);
  }
}

function onAction() {
  ensureAudio();

  if (game.state === 'ready') {
    startGame();
    return;
  }
  if (game.state === 'over') {
    if (game.overDelay <= 0) startGame();
    return;
  }

  // Mit Flügeln ist jeder Klick ein Aufwärtsimpuls – auch im Sturz.
  if (game.wings && (game.state === 'playing' || game.state === 'falling')) {
    doFlap();
    if (game.state === 'falling') {
      game.state = 'playing';
      game.reason = 'hit';
    }
    return;
  }

  if (game.state !== 'playing') return;

  // In der Luft mit Spezialmünze: sofort der zweite Sprung
  if (!player.onGround && player.coyote <= 0 && player.doubleJump) {
    doDoubleJump();
    return;
  }

  WS.jumpBuffer = CFG.jumpBuffer;
}

/* ---------- 7. Update ---------- */

function update(dt) {
  game.time += dt;
  updateClouds(dt);
  updateParticles(dt);

  if (game.state === 'playing') {
    game.speed = Math.min(CFG.maxSpeed, game.speed + CFG.speedGain * dt);
    const dx = game.speed * dt;
    game.distance += dx;
    game.scroll += dx;

    updatePlayer(dt);

    // Ab 10.000 Punkten bekommt der Würfel Flügel
    if (game.state === 'playing' && !game.wings && getScore() >= WINGS_SCORE) {
      unlockWings();
    }

    if (game.state === 'playing') {
      updateSpawner(dt);
      updateBirdSpawner(dt);

      for (const o of game.obstacles) o.x -= dx;
      for (const p of game.pits) p.x -= dx;
      for (const c of game.coins) c.x -= dx;
      updateBirds(dt, dx);

      game.obstacles = game.obstacles.filter((o) => o.x + o.w > -90);
      game.pits = game.pits.filter((p) => p.x + p.w > -80);
      game.coins = game.coins.filter((c) => !c.taken && c.x > -60);
      game.birds = game.birds.filter((b) => b.x + b.w > -80);

      checkCollisions();

      // Rekord schon während des Laufs sichern
      if (!game.newBest && game.best > 0 && getScore() > game.best) {
        game.newBest = true;
        game.best = getScore();
        saveBest(game.best);
        notify('Neuer Rekord!');
      }

      // Ab 5000 Punkten wechselt die Welt in den Neon-Modus
      if (game.theme === 'day' && getScore() >= THEME_SCORE) {
        game.theme = 'night';
        game.flash = 0.9;
        game.shake = 8;
        notify('Neon-Modus!');
        playPower();
      }
    }
  } else if (game.state === 'falling') {
    updateFalling(dt);
  } else if (game.state === 'over') {
    game.overDelay = Math.max(0, game.overDelay - dt);
  }

  if (game.shake > 0) game.shake = Math.max(0, game.shake - dt * 26);
  if (game.flash > 0) game.flash = Math.max(0, game.flash - dt * 2.4);
  if (game.toastTime > 0) game.toastTime = Math.max(0, game.toastTime - dt);
}

function updatePlayer(dt) {
  player.wingFlap = Math.max(0, player.wingFlap - dt * 3.4);

  // Mit Flügeln ersetzt jeder Klick den Sprung: Aufwärtsimpuls,
  // dazwischen zieht die Schwerkraft den Würfel wieder nach unten.
  if (game.wings) {
    WS.jumpBuffer = 0;
    player.coyote = 0;
    player.vy = Math.min(player.vy + CFG.wingGravity * dt, CFG.wingMaxFall);
    player.y += player.vy * dt;

    // Decke: nicht aus dem Bild fliegen
    if (player.y < CFG.skyTop) {
      player.y = CFG.skyTop;
      if (player.vy < 0) player.vy = 0;
    }

    if (player.y >= GROUND_Y) {
      if (groundUnderPlayer()) {
        const landed = !player.onGround;
        player.y = GROUND_Y;
        player.vy = 0;
        player.onGround = true;
        if (landed) onLand();
      } else {
        // Loch im Boden: ein Klick kann den Sturz wieder abfangen
        player.y = GROUND_Y;
        player.onGround = false;
        player.vy = Math.max(player.vy, 120);
        game.state = 'falling';
        return;
      }
    } else {
      player.onGround = false;
    }

    const tilt = clamp(player.vy / 1400, -0.4, 0.42);
    player.angle += (tilt - player.angle) * Math.min(1, dt * 6);
    player.squash += (1 - player.squash) * Math.min(1, dt * 16);
    return;
  }

  // Sprungpuffer: Taste darf kurz vor der Landung gedrückt werden
  if (WS.jumpBuffer > 0) {
    WS.jumpBuffer -= dt;
    if (player.onGround || player.coyote > 0) doJump();
  }

  player.coyote = Math.max(0, player.coyote - dt);

  player.vy += CFG.gravity * dt;
  player.y += player.vy * dt;

  if (player.y >= GROUND_Y) {
    if (groundUnderPlayer()) {
      const landed = !player.onGround;
      player.y = GROUND_Y;
      player.vy = 0;
      player.onGround = true;
      player.coyote = CFG.coyote;
      if (landed) onLand();
    } else {
      // Loch im Boden: der Würfel fällt weiter
      player.onGround = false;
      player.coyote = 0;
      player.doubleJump = false;
      WS.jumpBuffer = 0;
      player.vy = Math.max(player.vy, 240);
      game.state = 'falling';
      return;
    }
  } else {
    player.onGround = false;
  }

  // Rollen am Boden, zusätzliche Drehung in der Luft
  if (player.onGround) {
    player.angle += (game.speed / (CFG.playerSize * 0.5)) * dt * 0.42;
  } else {
    player.angle += 3.2 * dt;
  }

  // Weiches Zurückfedern der Stauchung
  player.squash += (1 - player.squash) * Math.min(1, dt * 16);
}

function updateFalling(dt) {
  player.vy += CFG.gravity * dt;
  player.y += player.vy * dt;
  player.angle += 4.5 * dt;
  player.squash += (1 - player.squash) * Math.min(1, dt * 16);

  if (player.y - CFG.playerSize > VIEW_H + 40) {
    if (game.invincible) {
      // Schutz aktiv: statt Game Over wieder nach oben setzen
      player.y = GROUND_Y - 150;
      player.vy = -480;
      player.onGround = false;
      game.state = 'playing';
      game.reason = 'hit';
      burst(
        CFG.playerX,
        player.y - CFG.playerSize * 0.5,
        20,
        ['#ffe066', '#fff8c9', '#9ff0ff', '#ffffff'],
        70,
        260,
        220
      );
      return;
    }
    die('fell');
  }
}

// Steht der Würfel über festem Grund? (breite Füße, damit die Kante fair bleibt)
function groundUnderPlayer() {
  // Unverwundbar: der Cheat lässt den Würfel auch über Löchern laufen.
  if (game.invincible) return true;
  const footHalf = 10;
  const left = CFG.playerX - footHalf;
  const right = CFG.playerX + footHalf;
  for (const pit of game.pits) {
    if (right > pit.x && left < pit.x + pit.w) return false;
  }
  return true;
}

function updateSpawner(dt) {
  game.spawnIn -= dt;
  if (game.spawnIn > 0) return;

  let extraGap = 0;
  if (Math.random() < 0.34) {
    extraGap = spawnPit();
  } else {
    spawnObstacle();
  }
  game.spawnIn = 0.95 + Math.random() * 0.8 + extraGap;
}

function spawnPit() {
  const jumpDistance = 0.648 * game.speed;

  // Manche Löcher sind absichtlich breiter als ein einfacher Sprung
  if (Math.random() < 0.3) {
    return spawnWidePit(jumpDistance);
  }

  // Breite so wählen, dass das Loch immer überspringbar bleibt
  const w = Math.min(150, Math.max(70, jumpDistance * (0.18 + Math.random() * 0.12)));
  const pit = { x: VIEW_W + 80, w, wide: false };
  game.pits.push(pit);

  // Belohnung fürs Drüberspringen
  if (Math.random() < 0.8) {
    game.coins.push({
      x: pit.x + pit.w / 2,
      y: GROUND_Y - (138 + Math.random() * 16),
      r: 11,
      phase: Math.random() * Math.PI * 2,
      taken: false,
    });
  }
  return 0;
}

function spawnWidePit(jumpDistance) {
  // 112–126 % der einfachen Sprungweite: allein nicht zu schaffen,
  // mit Doppelsprung aber bequem.
  const w = jumpDistance * (1.12 + Math.random() * 0.14);
  const pit = { x: VIEW_W + 80, w, wide: true };
  game.pits.push(pit);

  // Spezialmünze über dem Loch: einsammeln schaltet den Doppelsprung frei.
  // Sie liegt im vorderen Drittel, damit sie beim natürlichen Sprungbogen
  // eingesammelt wird und danach noch genug Höhe für den zweiten Sprung bleibt.
  game.coins.push({
    x: pit.x + jumpDistance * 0.3,
    y: GROUND_Y - 140,
    r: 16,
    phase: Math.random() * Math.PI * 2,
    kind: 'double',
    taken: false,
  });

  // Etwas mehr Luft zum nächsten Hindernis
  return (w / game.speed) * 0.75;
}

function spawnObstacle() {
  const h = 32 + Math.random() * 40; // 32 … 72 px hoch
  const obstacle = {
    x: VIEW_W + 80,
    w: h,
    h,
    face: 1 + Math.floor(Math.random() * 6),
    tone: Math.random(),
  };
  game.obstacles.push(obstacle);

  // Meistens schwebt ein Goldpunkt über dem Hindernis
  if (Math.random() < 0.72) {
    game.coins.push({
      x: obstacle.x + obstacle.w / 2,
      y: GROUND_Y - (138 + Math.random() * 16),
      r: 11,
      phase: Math.random() * Math.PI * 2,
      taken: false,
    });
  }
}

/* ---------- 7b. Vögel im Himmel ---------- */

function randomBirdY() {
  return 100 + Math.random() * (GROUND_Y - 216);
}

function spawnBird(baseY, extraX = 0) {
  const w = 32 + Math.random() * 14;
  const h = 20 + Math.random() * 8;
  const y = baseY == null ? randomBirdY() : baseY;

  game.birds.push({
    x: VIEW_W + 50 + extraX,
    y,
    baseY: y,
    w,
    h,
    r: h * 0.46,
    vx: 40 + Math.random() * 90, // fliegt dem Würfel zusätzlich entgegen
    amp: 6 + Math.random() * 12, // sanftes Auf und Ab
    freq: 1.2 + Math.random() * 1.6,
    flapSpeed: 9 + Math.random() * 5,
    phase: Math.random() * Math.PI * 2,
    t: Math.random() * 2,
  });
}

function updateBirdSpawner(dt) {
  if (!game.wings) return;

  game.birdIn -= dt;
  if (game.birdIn > 0) return;

  const baseY = randomBirdY();
  spawnBird(baseY);

  // Manchmal kommt ein kleiner Schwarm: der zweite Vogel fliegt versetzt.
  if (Math.random() < 0.3) {
    const y2 = clamp(baseY + (Math.random() < 0.5 ? -62 : 62), 100, GROUND_Y - 116);
    spawnBird(y2, 60 + Math.random() * 40);
  }

  game.birdIn =
    CFG.birdIntervalMin + Math.random() * (CFG.birdIntervalMax - CFG.birdIntervalMin);
}

function updateBirds(dt, dx) {
  for (const b of game.birds) {
    b.t += dt;
    b.x -= dx + b.vx * dt;
    b.y = b.baseY + Math.sin(b.t * b.freq + b.phase) * b.amp;
  }
}

function checkCollisions() {
  const px1 = CFG.playerX - CFG.playerSize / 2 + 8;
  const px2 = CFG.playerX + CFG.playerSize / 2 - 8;
  const py1 = player.y - CFG.playerSize + 6;
  const py2 = player.y - 4;

  for (const o of game.obstacles) {
    const ox1 = o.x + 4;
    const ox2 = o.x + o.w - 4;
    const oy1 = GROUND_Y - o.h + 3;
    if (px2 > ox1 && px1 < ox2 && py2 > oy1 && py1 < GROUND_Y) {
      die();
      return;
    }
  }

  // Vögel: bei aktivem Schutz platzen sie einfach, sonst ist der Lauf vorbei.
  for (let i = game.birds.length - 1; i >= 0; i--) {
    const b = game.birds[i];
    const bx = b.x + b.w / 2;
    const by = b.y + b.h / 2;
    const nx = clamp(bx, px1, px2);
    const ny = clamp(by, py1, py2);
    const ddx = bx - nx;
    const ddy = by - ny;

    if (ddx * ddx + ddy * ddy >= b.r * b.r) continue;

    if (game.invincible) {
      game.birds.splice(i, 1);
      burst(bx, by, 14, ['#ffe066', '#fff8c9', '#9ff0ff', '#ffffff'], 50, 230, 120);
      continue;
    }

    die();
    return;
  }

  for (const c of game.coins) {
    if (c.taken) continue;
    const nx = clamp(c.x, px1, px2);
    const ny = clamp(c.y, py1, py2);
    const dx = c.x - nx;
    const dy = c.y - ny;

    if (c.kind === 'double') {
      // Spezialmünze ist vertikal großzügiger: frühe und späte Sprünge
      // sollen nicht sofort bestraft werden.
      const rx = c.r + 2;
      const ry = c.r + 14;
      if ((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) < 1) {
        collectCoin(c);
      }
    } else if (dx * dx + dy * dy < (c.r + 2) * (c.r + 2)) {
      collectCoin(c);
    }
  }
}

/* ---------- 8. Partikel ---------- */

function burst(x, y, count, colors, vmin, vmax, gravity, spread = Math.PI * 2, dir = 0) {
  for (let i = 0; i < count; i++) {
    const angle = dir + (Math.random() - 0.5) * spread;
    const speed = vmin + Math.random() * (vmax - vmin);
    const life = 0.35 + Math.random() * 0.5;
    game.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life,
      max: life,
      size: 2 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      grav: gravity,
    });
  }
}

function updateParticles(dt) {
  for (let i = game.particles.length - 1; i >= 0; i--) {
    const p = game.particles[i];
    p.vy += p.grav * dt;
    p.vx *= 1 - 1.8 * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    if (p.life <= 0) game.particles.splice(i, 1);
  }
}

function updateClouds(dt) {
  const drift = (20 + game.speed * 0.06) * dt;
  for (const c of clouds) {
    c.x -= drift * (0.7 + c.s * 0.3);
    if (c.x < -110) {
      c.x = VIEW_W + 110;
      c.y = 40 + Math.random() * 150;
      c.s = 0.6 + Math.random() * 0.9;
      c.a = 0.55 + Math.random() * 0.35;
    }
  }
}

Object.assign(WS, {
  startGame, doJump, doDoubleJump, doFlap, unlockWings, activateInvincibility,
  cutJump, onLand, collectCoin, die, onAction, noteCheatDown, noteCheatUp,
  update, updatePlayer, updateFalling,
  groundUnderPlayer, updateSpawner, spawnPit, spawnWidePit, spawnObstacle,
  randomBirdY, spawnBird, updateBirdSpawner, updateBirds, checkCollisions,
  burst, updateParticles, updateClouds,
});
})(window.WS = window.WS || {});
