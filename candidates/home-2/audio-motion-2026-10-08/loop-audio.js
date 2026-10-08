(() => {
  function createDecoder() {
    const Decoder = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    if (!Decoder) throw new Error('Decodifica audio non disponibile');
    return new Decoder(2, 1, 48000);
  }
  // Bake the head/tail overlap once. Web Audio then repeats the finished PCM
  // buffer without a timer, a new request or a decoder restart at the seam.
  function makeSeamlessLoop(context, original, seconds = 1) {
    const overlap = Math.min(Math.round(seconds * original.sampleRate), Math.floor(original.length / 4));
    if (overlap < 2) return { buffer: original, crossfadeSeconds: 0, loopStart: 0, loopEnd: original.duration };
    const tail = original.length - overlap;
    const weights = new Float32Array(overlap);
    for (let sample = 0; sample < overlap; sample++) {
      weights[sample] = .5 - .5 * Math.cos(Math.PI * sample / (overlap - 1));
    }
    for (let channel = 0; channel < original.numberOfChannels; channel++) {
      const samples = original.getChannelData(channel);
      for (let sample = 0; sample < overlap; sample++) {
        const weight = weights[sample];
        samples[tail + sample] = samples[tail + sample] * (1 - weight) + samples[sample] * weight;
      }
    }
    // Reuse the decoded PCM instead of allocating another full-length copy.
    // Playback starts at loopStart; the blended tail joins the next head sample.
    return { buffer: original, crossfadeSeconds: overlap / original.sampleRate, loopStart: overlap / original.sampleRate, loopEnd: original.duration };
  }

  function load(context, url, crossfadeSeconds, sha256) {
    const loader = window.ISOExperienceLoader;
    return loader.prepare(`audio:${url}`, async () => {
      // decodeAudioData may detach its input; retain the downloaded bytes for retry.
      const data = await loader.bytes(url, sha256);
      const original = await context.decodeAudioData(data.slice(0));
      return { url, ...makeSeamlessLoop(context, original, crossfadeSeconds) };
    });
  }

  function loadHTML(url, sha256) {
    return window.ISOExperienceLoader.prepare(`audio:${url}`, async () => {
      const data = await window.ISOExperienceLoader.bytes(url, sha256);
      const objectURL = URL.createObjectURL(new Blob([data], { type: 'audio/mpeg' }));
      const media = new window.Audio();
      media.preload = 'auto';
      media.loop = true;
      try {
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => finish(new Error('Preparazione audio in attesa')), 45000);
          function finish(error) {
            clearTimeout(timeout);
            media.removeEventListener('canplaythrough', ready);
            media.removeEventListener('error', failed);
            if (error) reject(error); else resolve();
          }
          function ready() { if (media.readyState === 4) finish(); }
          function failed() { finish(new Error('Audio non disponibile')); }
          media.addEventListener('canplaythrough', ready);
          media.addEventListener('error', failed);
          media.src = objectURL;
          media.load();
          ready();
        });
        return { url, media, objectURL, crossfadeSeconds: 0, loopStart: 0, loopEnd: media.duration };
      } catch (error) {
        media.removeAttribute('src');
        media.load();
        URL.revokeObjectURL(objectURL);
        throw error;
      }
    });
  }

  const ramps = new WeakMap();
  function fade(context, parameter, target, seconds = 1) {
    const now = context.currentTime;
    const previous = ramps.get(parameter);
    // Re-anchor each interruption at the exact value of our own linear ramp.
    // Do not depend on the AudioParam.value getter or successive hold events.
    const fraction = previous && previous.end > previous.start
      ? Math.max(0, Math.min(1, (now - previous.start) / (previous.end - previous.start))) : 1;
    const current = previous ? previous.from + (previous.to - previous.from) * fraction : parameter.value;
    const duration = Math.max(0, seconds);
    parameter.cancelScheduledValues(now);
    parameter.setValueAtTime(current, now);
    if (duration > 0) parameter.linearRampToValueAtTime(target, now + duration);
    else parameter.setValueAtTime(target, now);
    ramps.set(parameter, { from: current, to: target, start: now, end: now + duration });
  }

  window.ISOLoopAudio = { createDecoder, makeSeamlessLoop, load, loadHTML, fade };
})();
