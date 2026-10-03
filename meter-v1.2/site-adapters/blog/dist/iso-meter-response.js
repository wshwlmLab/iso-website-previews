/* ISO Official Meter v1.2 — shared response and mute envelope, 2026-10-03.
 * Visual response remains 20% faster than v1. Mute: 0.5s; unmute: 1s.
 * RMS calibration, sources and segment styling remain page-owned.
 * Canonical source: wshwlmLab/iso-website-previews/shared/iso-meter-response.js.
 */
(() => {
  'use strict';
  const reactivity = 1.2;
  const attackPerMs = .032 * reactivity;
  const releasePerMs = .0075 * reactivity;
  const muteFadeSeconds = .5, unmuteFadeSeconds = 1;
  const ramps = new WeakMap();
  const clamp = value => Math.max(0, Math.min(1, value));
  function at(ramp, now) {
    const fraction = ramp.end > ramp.start ? clamp((now - ramp.start) / (ramp.end - ramp.start)) : 1;
    return ramp.from + (ramp.to - ramp.from) * fraction;
  }
  function fadeMuted(context, parameter, muted) {
    const target = muted ? 0 : 1, now = context.currentTime;
    const previous = ramps.get(parameter);
    if (previous?.to === target) return;
    const current = previous ? at(previous, now) : parameter.value;
    const seconds = muted ? muteFadeSeconds : unmuteFadeSeconds;
    parameter.cancelScheduledValues(now);
    parameter.setValueAtTime(current, now);
    parameter.linearRampToValueAtTime(target, now + seconds);
    ramps.set(parameter, { from: current, to: target, start: now, end: now + seconds });
  }
  // Iframe players expose a volume API instead of a Web Audio gain. The
  // adapter samples the same envelope without changing playback or position.
  function createVolumeFader(write, options = {}) {
    const clock = options.clock || (() => performance.now() / 1000);
    const schedule = options.schedule || requestAnimationFrame;
    const initial = clamp(options.initial ?? 1);
    let ramp = { from: initial, to: initial, start: clock(), end: clock() };
    let framePending = false, disposed = false;
    function queueFrame() {
      if (framePending || disposed) return;
      framePending = true;
      schedule(tick);
    }
    function tick() {
      framePending = false;
      if (disposed) return;
      const now = clock();
      write(at(ramp, now));
      if (now < ramp.end) queueFrame();
    }
    return {
      get value() { return at(ramp, clock()); },
      setMuted(muted) {
        if (disposed) return;
        const target = muted ? 0 : 1;
        if (ramp.to === target) return;
        const now = clock(), current = at(ramp, now);
        ramp = { from: current, to: target, start: now, end: now + (muted ? muteFadeSeconds : unmuteFadeSeconds) };
        write(current);
        queueFrame();
      },
      resetMuted(muted) {
        if (disposed) return;
        const value = muted ? 0 : 1, now = clock();
        ramp = { from: value, to: value, start: now, end: now };
        write(value);
      },
      dispose() { disposed = true; }
    };
  }
  window.ISOMeterResponse = Object.freeze({
    version: '1.2',
    reactivity,
    attackPerMs,
    releasePerMs,
    muteFadeSeconds,
    unmuteFadeSeconds,
    fadeMuted,
    createVolumeFader,
    advance(current, target, elapsedMs) {
      const dt = Math.max(0, Math.min(40, elapsedMs));
      const rate = target > current ? attackPerMs : releasePerMs;
      return current + (target - current) * (1 - Math.exp(-rate * dt));
    }
  });
})();
