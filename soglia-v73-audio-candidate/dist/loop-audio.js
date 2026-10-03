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

  function fade(context, parameter, target, seconds = 1) {
    const now = context.currentTime;
    const current = parameter.value;
    if (typeof parameter.cancelAndHoldAtTime === 'function') parameter.cancelAndHoldAtTime(now);
    else {
      parameter.cancelScheduledValues(now);
      parameter.setValueAtTime(current, now);
    }
    parameter.linearRampToValueAtTime(target, now + seconds);
  }

  window.ISOLoopAudio = { createDecoder, makeSeamlessLoop, load, fade };
})();
