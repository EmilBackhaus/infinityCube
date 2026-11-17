/* main.js - Start und Spielschleife */
(function (WS) {
  'use strict';
  const { STEP, update, render, initInput } = WS;

  function frame(now) {
    const dt = Math.min((now - WS.lastTime) / 1000, 0.06);
    WS.lastTime = now;

    WS.accumulator += dt;
    let guard = 0;
    while (WS.accumulator >= STEP && guard < 12) {
      update(STEP);
      WS.accumulator -= STEP;
      guard += 1;
    }
    if (guard === 12) WS.accumulator = 0;

    render();
    requestAnimationFrame(frame);
  }

  function start() {
    WS.lastTime = performance.now();
    WS.accumulator = 0;
    initInput();
    requestAnimationFrame(frame);
  }

  WS.start = start;
  start();
})(window.WS = window.WS || {});
