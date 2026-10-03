(() => {
  const origin = 'https://pub-db4922fd516c4a87b423232b0ddef047.r2.dev';
  const parameters = new URLSearchParams(window.location.search);
  const id = parameters.get('cartolina') || 'soglia-prova';
  const version = parameters.get('versione') || 'v1';
  // Diagnostic A/B: only the audio origin changes. Images, manifest, hashes,
  // decoding, loop preparation, eraser and gain scheduling stay identical.
  const audioOrigin = parameters.get('audio_origine') === 'locale' ? 'locale' : 'cloudflare';
  const localRoot = new URL('.', window.location.href);
  const valid = /^[a-z0-9-]{1,64}$/.test(id) && /^v[0-9]+$/.test(version);
  const manifestURL = `${origin}/cartoline/${id}/${version}/manifest.json`;
  try {
    if (window.parent !== window && window.parent.ISOCartolina?.manifestURL === manifestURL) {
      window.ISOCartolina = window.parent.ISOCartolina;
      window.ISOCartolinaReady = window.ISOCartolina.load();
      window.ISOCartolinaReady.catch(error => { window.__cartolinaLoadError = error.message; });
      return;
    }
  } catch (_) {}

  const loader = window.ISOExperienceLoader;
  let pending = null;
  async function readManifest() {
    if (!valid) throw new Error('Cartolina non valida');
    const manifest = await loader.json(manifestURL);
    if (manifest.schemaVersion !== 1 || !Array.isArray(manifest.layers) || !manifest.layers.length) {
      throw new Error('Manifest cartolina non valido');
    }
    const layers = manifest.layers.map(layer => {
      if (typeof layer.image !== 'string' || typeof layer.audio !== 'string') throw new Error('Layer cartolina non valido');
      const image = new URL(layer.image, manifestURL);
      const audio = new URL(layer.audio, manifestURL);
      if (image.origin !== origin || audio.origin !== origin) throw new Error('Sorgente cartolina non valida');
      return {
        ...layer, image: image.href,
        audio: audioOrigin === 'locale' ? new URL('.' + audio.pathname, localRoot).href : audio.href,
        audioCloudflare: audio.href
      };
    });
    loader.expect(layers.flatMap(layer => [
      { key: `image:${layer.image}`, url: layer.image },
      { key: `audio:${layer.audio}`, url: layer.audio }
    ]));
    const timing = (value, fallback) => Number.isFinite(value) && value >= 0 && value <= 10 ? value : fallback;
    return {
      ...manifest, layers, manifestURL, audioOrigin,
      fadeSeconds: timing(manifest.fadeSeconds, 1),
      loopCrossfadeSeconds: timing(manifest.loopCrossfadeSeconds, 1)
    };
  }
  function load() {
    if (!pending) pending = readManifest().then(config => {
      window.__cartolinaLoadError = null;
      return config;
    }).catch(error => { loader.invalidate(manifestURL); pending = null; throw error; });
    return pending;
  }
  window.ISOCartolina = { manifestURL, load };
  window.ISOCartolinaReady = load();
  // Keep the failure observable without an unhandled rejection before either
  // page has attached its own error handler.
  window.ISOCartolinaReady.catch(error => { window.__cartolinaLoadError = error.message; });
})();
