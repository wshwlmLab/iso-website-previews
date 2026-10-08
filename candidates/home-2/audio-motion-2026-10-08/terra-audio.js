/* One audio clock for music, looping rock sound and terrain deformation. */
(() => {
  'use strict';
  function create({ reduced }) {
    const config = window.ISOTerraConfig, loader = window.ISOExperienceLoader;
    const response = window.ISOMeterResponse, loops = window.ISOLoopAudio;
    const decoder = loops.createDecoder();
    const levels = [0, 0];
    let prepared, context, origin = null, activation, master, rockTrim, motionProfile;
    let wantedMuted = false, sources = [], analysers = [], measurements = [];
    const diagnostics = { state: 'loading', error: null, rockPan: 0, musicChannels: null, rockChannels: null };
    loader.expect([config.rocks, config.music].map(asset => ({ key: `audio:${asset.url}`, url: asset.url })));
    const ready = Promise.all([config.rocks, config.music].map(asset => loops.load(decoder, asset.url, asset.crossfadeSeconds, asset.sha256)))
      .then(buffers => {
        if (buffers[0].buffer.numberOfChannels !== 1 || buffers[1].buffer.numberOfChannels !== 2) throw new Error('Canali audio non validi');
        prepared = buffers;
        diagnostics.rockChannels = 1; diagnostics.musicChannels = 2; diagnostics.state = 'ready';
      }).catch(error => { diagnostics.state = 'error'; diagnostics.error = error.message; throw error; });
    ready.catch(() => {});
    function seconds() { return origin === null ? 0 : Math.max(0, context.currentTime - origin); }
    function loopSource(asset, output, at) {
      const source = context.createBufferSource(); source.buffer = asset.buffer;
      source.loop = true; source.loopStart = asset.loopStart; source.loopEnd = asset.loopEnd;
      source.connect(output); source.start(at, 0); sources.push(source);
    }
    function build() {
      const bus = context.createGain(); bus.gain.value = config.outputLevel;
      master = context.createGain(); master.gain.value = 0;
      bus.connect(master); master.connect(context.destination);
      const musicGain = context.createGain(); musicGain.gain.value = config.musicLevel; musicGain.connect(bus);
      rockTrim = context.createGain(); rockTrim.gain.value = config.rockLevel;
      if (context.createStereoPanner) {
        const center = context.createStereoPanner(); center.pan.value = 0;
        rockTrim.connect(center); center.connect(bus);
      } else {
        // Equivalent centered mono fallback with equal power in L and R.
        const center = context.createGain(); center.gain.value = Math.SQRT1_2;
        const stereo = context.createChannelMerger(2);
        rockTrim.connect(center); center.connect(stereo, 0, 0); center.connect(stereo, 0, 1); stereo.connect(bus);
      }
      const rockEntrance = context.createGain(); rockEntrance.gain.value = 0;
      rockEntrance.connect(rockTrim);
      const motion = context.createGain(); motion.connect(rockEntrance);
      origin = context.currentTime + .025;
      rockEntrance.gain.setValueAtTime(0, origin);
      rockEntrance.gain.linearRampToValueAtTime(1, origin + config.rockFadeInSeconds);
      if (reduced) motion.gain.value = .65;
      else {
        // A looping, inaudible control buffer modulates gain continuously.
        // It survives background-tab timer throttling and uses the source clock.
        motion.gain.value = 0;
        const envelopeBuffer = context.createBuffer(1, Math.round(config.loopSeconds * context.sampleRate), context.sampleRate);
        const data = envelopeBuffer.getChannelData(0), count = motionProfile.length - 1;
        for (let i = 0; i < data.length; i++) {
          const position = i / data.length * count, index = Math.floor(position), fraction = position - index;
          data[i] = motionProfile[index] * (1 - fraction) + motionProfile[index + 1] * fraction;
        }
        const control = context.createBufferSource(); control.buffer = envelopeBuffer; control.loop = true;
        control.connect(motion.gain); control.start(origin); sources.push(control);
      }
      loopSource(prepared[0], motion, origin); loopSource(prepared[1], musicGain, origin);
      const splitter = context.createChannelSplitter(2); master.connect(splitter);
      analysers = [0, 1].map(channel => {
        const analyser = context.createAnalyser(); analyser.fftSize = 1024; analyser.smoothingTimeConstant = 0;
        splitter.connect(analyser, channel); return analyser;
      });
      measurements = analysers.map(analyser => new Float32Array(analyser.fftSize));
      response.fadeMuted(context, master.gain, wantedMuted);
      let previous = performance.now();
      function meter(now) {
        const elapsed = now - previous; previous = now;
        analysers.forEach((analyser, channel) => {
          const data = measurements[channel]; analyser.getFloatTimeDomainData(data);
          let sum = 0; for (const value of data) sum += value * value;
          const target = Math.min(1, Math.sqrt(sum / data.length) * 2.45);
          levels[channel] = response.advance(levels[channel], target, elapsed);
        });
        requestAnimationFrame(meter);
      }
      requestAnimationFrame(meter);
      diagnostics.state = 'playing';
    }
    function activate() {
      if (activation) return activation;
      if (!prepared || !motionProfile) return Promise.reject(new Error('Audio non ancora pronto'));
      // Device creation/resume stays in the actual click, never in preloading.
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      context = new AudioContext({ sampleRate: 48000, latencyHint: 'interactive' });
      activation = context.resume().then(() => { build(); }).catch(error => {
        diagnostics.state = 'error'; diagnostics.error = error.message; throw error;
      });
      return activation;
    }
    const adapter = {
      ready, levels, diagnostics, activate, seconds,
      setMotionProfile(profile) { if (origin === null) motionProfile = profile; },
      setMuted(muted) { wantedMuted = Boolean(muted); if (master) response.fadeMuted(context, master.gain, wantedMuted); },
      setRockLevel(value) {
        if (!Number.isFinite(value) || value < 0 || value > 2) throw new Error('Livello rocce non valido');
        if (rockTrim) rockTrim.gain.setTargetAtTime(value, context.currentTime, .05);
      }
    };
    window.ISOAudioMeter = adapter;
    window.ISOTerraAudioDiagnostics = diagnostics;
    return adapter;
  }
  window.ISOTerraAudio = Object.freeze({ create });
})();
