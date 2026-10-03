(() => {
  // Bake the head/tail overlap once. Web Audio then repeats the finished PCM
  // buffer without a timer, a new request or a decoder restart at the seam.
  function makeSeamlessLoop(context, original, seconds = 1) {
    const overlap = Math.min(Math.round(seconds * original.sampleRate), Math.floor(original.length / 4));
    if (overlap < 2) return { buffer: original, crossfadeSeconds: 0 };
    const length = original.length - overlap;
    const bodyLength = length - overlap;
    const buffer = context.createBuffer(original.numberOfChannels, length, original.sampleRate);
    const weights = new Float32Array(overlap);
    for (let sample = 0; sample < overlap; sample++) {
      weights[sample] = .5 - .5 * Math.cos(Math.PI * sample / (overlap - 1));
    }
    for (let channel = 0; channel < original.numberOfChannels; channel++) {
      const input = original.getChannelData(channel);
      const output = buffer.getChannelData(channel);
      output.set(input.subarray(overlap, original.length - overlap));
      for (let sample = 0; sample < overlap; sample++) {
        const weight = weights[sample];
        output[bodyLength + sample] = input[length + sample] * (1 - weight) + input[sample] * weight;
      }
    }
    return { buffer, crossfadeSeconds: overlap / original.sampleRate };
  }

  async function load(context, url, crossfadeSeconds) {
    const response = await fetch(url, { mode: 'cors', credentials: 'omit' });
    if (!response.ok) throw new Error(`Audio cartolina: HTTP ${response.status}`);
    const original = await context.decodeAudioData(await response.arrayBuffer());
    return { url, ...makeSeamlessLoop(context, original, crossfadeSeconds) };
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

  window.ISOLoopAudio = { makeSeamlessLoop, load, fade };
})();
