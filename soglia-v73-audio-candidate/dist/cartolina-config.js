(() => {
  const origin = 'https://pub-db4922fd516c4a87b423232b0ddef047.r2.dev';
  const parameters = new URLSearchParams(window.location.search);
  const id = parameters.get('cartolina') || 'soglia-prova';
  const version = parameters.get('versione') || 'v1';
  const valid = /^[a-z0-9-]{1,64}$/.test(id) && /^v[0-9]+$/.test(version);
  const manifestURL = `${origin}/cartoline/${id}/${version}/manifest.json`;
  window.ISOCartolinaReady = (async () => {
    if (!valid) throw new Error('Cartolina non valida');
    const response = await fetch(manifestURL, { mode: 'cors', credentials: 'omit' });
    if (!response.ok) throw new Error(`Cartolina: HTTP ${response.status}`);
    const manifest = await response.json();
    if (manifest.schemaVersion !== 1 || !Array.isArray(manifest.layers) || !manifest.layers.length) {
      throw new Error('Manifest cartolina non valido');
    }
    const layers = manifest.layers.map(layer => {
      const image = new URL(layer.image, manifestURL);
      const audio = new URL(layer.audio, manifestURL);
      if (image.origin !== origin || audio.origin !== origin) throw new Error('Sorgente cartolina non valida');
      return { ...layer, image: image.href, audio: audio.href };
    });
    const timing = (value, fallback) => Number.isFinite(value) && value >= 0 && value <= 10 ? value : fallback;
    return {
      ...manifest, layers, manifestURL,
      fadeSeconds: timing(manifest.fadeSeconds, 1),
      loopCrossfadeSeconds: timing(manifest.loopCrossfadeSeconds, 1)
    };
  })();
  // Keep the failure observable without an unhandled rejection before either
  // page has attached its own error handler.
  window.ISOCartolinaReady.catch(error => { window.__cartolinaLoadError = error.message; });
})();
