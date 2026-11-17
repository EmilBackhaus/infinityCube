/* input.js - Eingabe */
(function (WS) {
  'use strict';
  const { canvas, CFG, CHEAT_CODES, cheatKeys, cheatSeq } = WS;
  const { onAction, cutJump, noteCheatDown, noteCheatUp, toggleMute } = WS;

function initInput() {
window.addEventListener('keydown', (event) => {
  if (event.repeat) {
    if (event.code === 'Space' || event.code === 'ArrowUp') event.preventDefault();
    return;
  }

  // W-A-S-D-Cheat: Reihenfolge oder alle vier gleichzeitig
  if (CHEAT_CODES.includes(event.code)) {
    noteCheatDown(event.code);
  }

  switch (event.code) {
    case 'Space':
    case 'ArrowUp':
    case 'KeyW':
      event.preventDefault();
      onAction();
      break;
    case 'KeyM':
      toggleMute();
      break;
    default:
      break;
  }
});

window.addEventListener('keyup', (event) => {
  noteCheatUp(event.code);
  if (event.code === 'Space' || event.code === 'ArrowUp' || event.code === 'KeyW') {
    cutJump();
  }
});

canvas.addEventListener('pointerdown', (event) => {
  event.preventDefault();
  onAction();
});
canvas.addEventListener('contextmenu', (event) => event.preventDefault());

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    WS.lastTime = performance.now();
    WS.accumulator = 0;
  }
});
}

WS.initInput = initInput;
})(window.WS = window.WS || {});
