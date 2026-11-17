/* audio.js - Ton per WebAudio */
(function (WS) {
  'use strict';
  const { notify } = WS;

let audioCtx = null;
let muted = false;

function ensureAudio() {
  if (muted) return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!audioCtx) audioCtx = new AC();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function tone(opts) {
  const ac = ensureAudio();
  if (!ac) return;
  const { freq, to = freq, dur = 0.14, type = 'sine', vol = 0.05, delay = 0 } = opts;
  const t0 = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const gain = ac.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (to !== freq) osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t0 + dur);

  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.03);
}

function playJump() {
  tone({ freq: 380, to: 720, dur: 0.13, type: 'sine', vol: 0.05 });
}

function playCoin() {
  tone({ freq: 1046, dur: 0.07, type: 'triangle', vol: 0.045 });
  tone({ freq: 1568, dur: 0.13, type: 'triangle', vol: 0.04, delay: 0.06 });
}

function playPower() {
  tone({ freq: 620, to: 900, dur: 0.1, type: 'triangle', vol: 0.045 });
  tone({ freq: 900, to: 1300, dur: 0.16, type: 'triangle', vol: 0.04, delay: 0.08 });
  tone({ freq: 1300, dur: 0.2, type: 'sine', vol: 0.03, delay: 0.2 });
}

function playDoubleJump() {
  tone({ freq: 300, to: 760, dur: 0.16, type: 'sine', vol: 0.05 });
  tone({ freq: 640, to: 1100, dur: 0.12, type: 'triangle', vol: 0.03, delay: 0.03 });
}

function playFlap() {
  tone({ freq: 210, to: 470, dur: 0.1, type: 'sine', vol: 0.04 });
  tone({ freq: 520, to: 760, dur: 0.08, type: 'triangle', vol: 0.02, delay: 0.02 });
}

function playShield() {
  tone({ freq: 520, to: 1040, dur: 0.22, type: 'sine', vol: 0.05 });
  tone({ freq: 1040, to: 1560, dur: 0.28, type: 'triangle', vol: 0.035, delay: 0.12 });
  tone({ freq: 1560, dur: 0.3, type: 'sine', vol: 0.025, delay: 0.3 });
}

function playLand() {
  tone({ freq: 190, to: 120, dur: 0.06, type: 'sine', vol: 0.025 });
}

function playFall() {
  tone({ freq: 520, to: 90, dur: 0.55, type: 'sine', vol: 0.045 });
  tone({ freq: 260, to: 60, dur: 0.6, type: 'triangle', vol: 0.03, delay: 0.05 });
}

function playHit() {
  tone({ freq: 300, to: 70, dur: 0.42, type: 'sawtooth', vol: 0.06 });
  tone({ freq: 150, to: 60, dur: 0.5, type: 'square', vol: 0.03, delay: 0.03 });
}

function toggleMute() {
  muted = !muted;
  if (muted) {
    if (audioCtx) audioCtx.suspend();
  } else {
    ensureAudio();
  }
  notify(muted ? 'Ton aus' : 'Ton an');
}

Object.assign(WS, {
  ensureAudio, tone, playJump, playCoin, playPower, playDoubleJump,
  playFlap, playShield, playLand, playFall, playHit, toggleMute,
});
})(window.WS = window.WS || {});
