/* ISO Official Meter v1.1 — shared response, 2026-10-03.
 * Only the visual attack/release changes: both are 20% faster than v1.
 * Audio gain, RMS calibration, segment styling and mute remain page-owned.
 * Canonical source: wshwlmLab/iso-website-previews/shared/iso-meter-response.js.
 */
(() => {
  'use strict';
  const reactivity = 1.2;
  const attackPerMs = .032 * reactivity;
  const releasePerMs = .0075 * reactivity;
  window.ISOMeterResponse = Object.freeze({
    version: '1.1',
    reactivity,
    attackPerMs,
    releasePerMs,
    advance(current, target, elapsedMs) {
      const dt = Math.max(0, Math.min(40, elapsedMs));
      const rate = target > current ? attackPerMs : releasePerMs;
      return current + (target - current) * (1 - Math.exp(-rate * dt));
    }
  });
})();
