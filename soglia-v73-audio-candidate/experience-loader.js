(() => {
  // One cache for the whole experience, including same-origin child frames.
  try {
    if (window.parent !== window && window.parent.ISOExperienceLoader) {
      window.ISOExperienceLoader = window.parent.ISOExperienceLoader;
      return;
    }
  } catch (_) {}

  const resources = new Map();
  const downloads = new Map();
  const failedURLs = new Set();
  const listeners = new Set();
  let status = 'loading';
  let phase = 'manifest';
  let error = null;

  function snapshot() {
    let completed = 0, progress = 0;
    for (const resource of resources.values()) {
      if (resource.state === 'ready') {
        completed++;
        progress++;
      } else {
        const download = downloads.get(resource.url);
        if (download && download.total > 0) progress += .9 * Math.min(1, download.loaded / download.total);
        else if (download && download.bytes) progress += .9;
      }
    }
    const total = resources.size;
    const percent = status === 'ready' ? 100 : Math.min(99, total ? Math.floor(progress / total * 100) : 0);
    const assets = Array.from(resources.values(), resource => {
      const download = downloads.get(resource.url);
      return { key: resource.key, url: resource.url, state: resource.state, bytes: download?.loaded || 0, expectedBytes: download?.total || 0, error: resource.error || null };
    });
    return { status, phase, error, total, completed, percent, assets };
  }

  function publish() {
    if (!listeners.size) return;
    const state = snapshot();
    listeners.forEach(listener => listener(state));
  }

  function expect(items) {
    items.forEach(item => {
      if (!resources.has(item.key)) resources.set(item.key, { ...item, state: 'pending', promise: null });
    });
    phase = 'media';
    publish();
  }

  async function bytes(url, sha256) {
    let download = downloads.get(url);
    if (!download) {
      download = { loaded: 0, total: 0, bytes: null, promise: null };
      downloads.set(url, download);
      download.promise = (async () => {
        const controller = new AbortController();
        let timeout;
        const armTimeout = () => {
          clearTimeout(timeout);
          timeout = setTimeout(() => controller.abort(), 45000);
        };
        armTimeout();
        try {
          const response = await fetch(url, { mode: 'cors', credentials: 'omit', cache: failedURLs.has(url) ? 'reload' : 'default', signal: controller.signal });
          if (!response.ok) throw new Error(`Risorsa: HTTP ${response.status}`);
          download.total = Number(response.headers.get('content-length')) || 0;
          if (response.body && response.body.getReader) {
            const reader = response.body.getReader();
            const chunks = [];
            for (;;) {
              const { done, value } = await reader.read();
              if (done) break;
              chunks.push(value);
              download.loaded += value.byteLength;
              armTimeout();
              publish();
            }
            const joined = new Uint8Array(download.loaded);
            let offset = 0;
            chunks.forEach(chunk => { joined.set(chunk, offset); offset += chunk.byteLength; });
            download.bytes = joined.buffer;
          } else {
            download.bytes = await response.arrayBuffer();
            download.loaded = download.bytes.byteLength;
          }
          if (!download.bytes.byteLength) throw new Error('Risorsa vuota');
          if (!response.headers.get('content-encoding') && download.total && download.loaded !== download.total) {
            throw new Error('Risorsa incompleta o non valida');
          }
          if (sha256) {
            const digest = await crypto.subtle.digest('SHA-256', download.bytes);
            const actual = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
            if (actual !== sha256.toLowerCase()) throw new Error('Risorsa incompleta o non valida');
          }
          failedURLs.delete(url);
          publish();
          return download.bytes;
        } catch (cause) {
          if (downloads.get(url) === download) downloads.delete(url);
          failedURLs.add(url);
          resources.forEach(resource => { if (resource.url === url) { resource.error = cause.message; resource.state = 'failed'; } });
          throw cause.name === 'AbortError' ? new Error('Caricamento in attesa da troppo tempo') : cause;
        } finally {
          clearTimeout(timeout);
        }
      })();
    }
    return download.promise;
  }

  function prepare(key, operation) {
    const resource = resources.get(key);
    if (!resource) return Promise.reject(new Error('Risorsa non dichiarata'));
    if (resource.promise) return resource.promise;
    resource.state = 'preparing';
    resource.error = null;
    resource.promise = Promise.resolve().then(operation).then(value => {
      resource.state = 'ready';
      publish();
      return value;
    }).catch(cause => {
      resource.state = 'failed';
      resource.error = cause.message;
      resource.promise = null;
      // A corrupt/undecodable response must be downloaded again on retry.
      downloads.delete(resource.url);
      failedURLs.add(resource.url);
      publish();
      throw cause;
    });
    return resource.promise;
  }

  function image(url, sha256) {
    return prepare(`image:${url}`, async () => {
      const data = await bytes(url, sha256);
      const objectURL = URL.createObjectURL(new Blob([data]));
      try {
        const image = new Image();
        const loaded = new Promise((resolve, reject) => {
          image.onload = resolve;
          image.onerror = () => reject(new Error('Immagine non disponibile'));
        });
        image.src = objectURL;
        await loaded;
        if (image.decode) await image.decode();
        return image;
      } finally {
        URL.revokeObjectURL(objectURL);
      }
    });
  }

  async function json(url) {
    try {
      return JSON.parse(new TextDecoder().decode(await bytes(url)));
    } catch (cause) {
      downloads.delete(url);
      throw cause;
    }
  }

  window.ISOExperienceLoader = {
    expect, bytes, prepare, image, json, snapshot,
    invalidate(url) { downloads.delete(url); failedURLs.add(url); },
    subscribe(listener) { listeners.add(listener); listener(snapshot()); return () => listeners.delete(listener); },
    preparing() { phase = 'preparation'; publish(); },
    retry() { status = 'loading'; error = null; publish(); },
    fail(cause) { status = 'error'; error = cause.message; publish(); },
    ready() {
      if (!resources.size || Array.from(resources.values()).some(resource => resource.state !== 'ready')) {
        throw new Error('Esperienza non ancora pronta');
      }
      status = 'ready'; phase = 'ready'; error = null; publish();
    }
  };
})();
