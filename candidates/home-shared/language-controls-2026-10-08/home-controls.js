/* Common activation and stereo meter for the Home installation previews. */
(() => {
  'use strict';
  const clamp = value => Math.max(0, Math.min(1, value));
  function audioProvider() {
    if (window.ISOAudioMeter) return window.ISOAudioMeter;
    if (window.parent !== window) {
      try { return window.parent.ISOAudioMeter || null; } catch { /* Independent origins. */ }
    }
    return null;
  }
  function create({ root, onReveal = () => {} }) {
    const prompt = root.querySelector('.audio-label');
    window.ISOLanguage?.bindHome(root);
    const language = root.querySelector('.home-language');
    // Every Home using this controller receives the official meter, even when
    // its installation markup omits the meter and mute button.
    let meter = root.querySelector('.meter');
    if (!meter) {
      meter = document.createElement('span'); meter.className = 'meter';
      meter.hidden = true; meter.setAttribute('aria-hidden', 'true'); prompt.after(meter);
    }
    let hit = root.querySelector('.meter-hit');
    if (!hit) {
      hit = document.createElement('button'); hit.className = 'meter-hit'; hit.type = 'button';
      hit.hidden = true; hit.setAttribute('aria-pressed', 'false');
      hit.setAttribute('aria-label', window.ISOLanguage?.text('mute') || 'Disattiva l’audio'); meter.after(hit);
    }
    let zone = meter.querySelector('.meter-zone');
    if (!zone) { zone = document.createElement('span'); zone.className = 'meter-zone'; meter.append(zone); }
    const unsubscribeLanguage = window.ISOLanguage?.subscribe(() => {
      hit.setAttribute('aria-label', window.ISOLanguage.text(hit.getAttribute('aria-pressed') === 'true' ? 'unmute' : 'mute'));
    });
    const columns = Array.from({ length: 2 }, () => {
      const column = document.createElement('span'); column.className = 'meter-col';
      const segments = Array.from({ length: 16 }, () => {
        const segment = document.createElement('i'); segment.className = 'meter-seg';
        column.append(segment); return segment;
      });
      zone.append(column); return segments;
    });
    let activated = false, revealed = false, muted = false, frame = null, timer = null;
    function draw() {
      // ISOAudioMeter supplies the common, already-smoothed stereo levels.
      // A missing source is silence, never random synthetic activity.
      const levels = audioProvider()?.levels;
      columns.forEach((segments, channel) => {
        const level = levels && Number.isFinite(levels[channel]) ? clamp(levels[channel]) : 0;
        const exact = (muted ? 0 : level) * 16;
        segments.forEach((segment, row) => {
          const distance = exact - row;
          const opacity = Math.min(.9, .16 + Math.max(0, distance) * .72);
          segment.style.background = distance <= .03 ? 'var(--meter-inactive)' : 'currentColor';
          segment.style.opacity = distance <= .03 || distance >= 1 ? '1' : String(opacity);
        });
      });
      frame = requestAnimationFrame(draw);
    }
    function reveal() {
      if (!activated || revealed) return;
      revealed = true; clearTimeout(timer);
      prompt.hidden = true; meter.hidden = false; hit.hidden = false;
      if (language) language.hidden = true;
      frame = requestAnimationFrame(draw);
      onReveal();
    }
    function activate() {
      if (activated || prompt.disabled) return;
      activated = true; prompt.disabled = true;
      // Any installed audio adapter is unlocked in the real user gesture.
      const provider = audioProvider();
      Promise.resolve(provider?.activate?.()).catch(console.error);
      provider?.setMuted?.(false);
      prompt.classList.add('is-leaving');
      language?.classList.add('is-leaving');
      timer = setTimeout(reveal, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 650);
    }
    prompt.addEventListener('click', event => { event.stopPropagation(); activate(); });
    prompt.addEventListener('animationend', event => { if (event.target === prompt) reveal(); });
    hit.addEventListener('click', event => {
      event.stopPropagation(); muted = !muted;
      audioProvider()?.setMuted?.(muted);
      meter.classList.toggle('paused', muted);
      hit.setAttribute('aria-pressed', String(muted));
      hit.setAttribute('aria-label', window.ISOLanguage ? window.ISOLanguage.text(muted ? 'unmute' : 'mute') : muted ? 'Riattiva l’audio' : 'Disattiva l’audio');
    });
    return {
      ready() { if (!activated) prompt.disabled = false; },
      activate,
      dispose() { clearTimeout(timer); cancelAnimationFrame(frame); unsubscribeLanguage?.(); }
    };
  }
  window.ISOHomeControls = Object.freeze({ create });
})();

