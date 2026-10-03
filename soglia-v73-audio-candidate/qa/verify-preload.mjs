import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { createHash, webcrypto } from 'node:crypto';

const root = process.argv[2] || 'dist';
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const outer = read('index.html').match(/<script>([\s\S]*?)<\/script>/)[1];
const inner = read('soglia-frozen.html');
const preparation = inner.slice(inner.indexOf('document.body.inert=true;'), inner.indexOf("window.addEventListener('resize',()=>{if(imgs.length)size()});") + "window.addEventListener('resize',()=>{if(imgs.length)size()});".length);
const base = 'https://pub-db4922fd516c4a87b423232b0ddef047.r2.dev/cartoline/soglia-prova/v1/';
const defer = () => { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; };
const settle = async () => { for (let n = 0; n < 4; n++) await new Promise(resolve => setImmediate(resolve)); };
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const classes = () => ({ add() {}, remove() {}, toggle() {} });

function harness({ corrupt = null, failManifest = false } = {}) {
  const requests = [], streams = new Map(), images = [], decodes = [], sources = [], gains = [];
  const readyFonts = defer();
  const data = new Map();
  const layers = ['river', 'endless-ascent', 'sciola'].map((id, index) => {
    const image = `images/0${index + 1}.jpg`, audio = `audio/${id}.mp3`;
    const imageBytes = Uint8Array.from([1, 2, 3, index]);
    const audioBytes = Uint8Array.from([4, 5, 6, index]);
    data.set(base + image, imageBytes); data.set(base + audio, audioBytes);
    return { id, image, audio, imageSHA256: hash(imageBytes), audioSHA256: hash(audioBytes) };
  });
  const manifest = { schemaVersion: 1, fadeSeconds: 1, loopCrossfadeSeconds: 1, layers };
  let manifestFailed = false, corrupted = false, offline = false;
  async function fetch(url) {
    if (offline) throw new Error('No network permitted after readiness');
    requests.push(url);
    if (url.endsWith('manifest.json')) {
      if (failManifest && !manifestFailed) { manifestFailed = true; return new Response('', { status: 503 }); }
      return new Response(JSON.stringify(manifest));
    }
    let bytes = data.get(url);
    assert.ok(bytes, `Unexpected resource: ${url}`);
    if (url === corrupt && !corrupted) { corrupted = true; bytes = bytes.subarray(0, 2); }
    const response = new Response(new ReadableStream({ start(controller) { streams.set(url, { controller, bytes }); } }), { headers: { 'content-length': String(bytes.length) } });
    return response;
  }
  function releaseDownload(url, partial = false) {
    const stream = streams.get(url);
    assert.ok(stream, `No pending request: ${url}`);
    if (partial) {
      stream.controller.enqueue(stream.bytes.subarray(0, 1));
      stream.bytes = stream.bytes.subarray(1);
    } else {
      stream.controller.enqueue(stream.bytes);
      stream.controller.close();
      streams.delete(url);
    }
  }
  class Image {
    constructor() { this.width = 420; this.height = 240; this.decoded = defer(); images.push(this); }
    set src(value) { this.source = value; queueMicrotask(() => this.onload()); }
    decode() { return this.decoded.promise; }
  }
  class PCM {
    constructor() { this.numberOfChannels = 2; this.sampleRate = 100; this.length = 400; this.duration = 4; this.channels = [new Float32Array(400), new Float32Array(400)]; }
    getChannelData(channel) { return this.channels[channel]; }
  }
  class Param {
    constructor() { this.value = 1; this.calls = []; }
    cancelAndHoldAtTime(time) { this.calls.push(['hold', time]); }
    linearRampToValueAtTime(value, time) { this.value = value; this.calls.push(['ramp', value, time]); }
  }
  class Node {
    constructor() { this.gain = new Param(); }
    connect() {}
    getFloatTimeDomainData(samples) { samples.fill(0); }
    start(time, offset) { this.started = time; this.offset = offset; this.starts = (this.starts || 0) + 1; }
  }
  class AudioContext {
    constructor() { this.state = 'suspended'; this.currentTime = 10; this.destination = new Node(); AudioContext.last = this; }
    createGain() { const node = new Node(); gains.push(node); return node; }
    createChannelSplitter() { return new Node(); }
    createAnalyser() { return new Node(); }
    createBuffer() { throw new Error('A second full PCM buffer must not be allocated'); }
    createBufferSource() { const source = new Node(); sources.push(source); return source; }
    async decodeAudioData(bytes) { assert.equal(bytes.byteLength, 4); const pending = defer(); decodes.push(pending); await pending.promise; return new PCM(); }
    async resume() { this.state = 'running'; }
  }
  const events = new Map(), innerEvents = {}, meterEvents = {}, retryEvents = {};
  function element() { return { classList: classes(), style: {}, hidden: false, disabled: false, children: [], setAttribute() {}, removeAttribute() {}, appendChild(child) { this.children.push(child); } }; }
  const frame = { ...element(), inert: true, dataset: { source: 'soglia-frozen.html' }, addEventListener(key, listener) { events.set(listener, key); }, removeEventListener(key, listener) { events.delete(listener); } };
  const elements = Object.fromEntries(['meter', 'meterHit', 'meterZone', 'loadingGate', 'loadingLabel', 'loadingProgress', 'loadingBar', 'loadingRetry'].map(id => [id, element()]));
  elements.soglia = frame;
  elements.meterHit.disabled = true;
  elements.meterHit.addEventListener = (key, fn) => { meterEvents[key] = fn; };
  elements.loadingRetry.addEventListener = (key, fn) => { retryEvents[key] = fn; };
  const document = { body: { dataset: {} }, fonts: { ready: Promise.resolve() }, getElementById: id => elements[id], createElement: element };
  const window = { AudioContext, location: { href: 'https://test.invalid/?cartolina=soglia-prova', search: '?cartolina=soglia-prova' } };
  window.parent = window;
  let draw = null, intros = 0, layouts = 0, geometry = 0, frameCount = 0;
  const globals = { console: { warn() {} }, fetch, crypto: webcrypto, AbortController, Image, Blob, URL, URLSearchParams, TextDecoder, Uint8Array, Float32Array, Promise, Math, Number, Array, performance: { now: () => 0 }, setTimeout, clearTimeout, requestAnimationFrame: cb => { draw = cb; }, MutationObserver: class { observe() {} } };
  const context = vm.createContext({ ...globals, window, document });
  Object.defineProperty(frame, 'src', {
    get() { return this.source; },
    set(source) {
      this.source = source; frameCount++;
      const fonts = [];
      fonts.ready = readyFonts.promise;
      const childDocument = { body: { inert: true }, fonts, documentElement: { style: { setProperty() {} } }, addEventListener: (key, fn) => { innerEvents[key] = fn; } };
      const child = { parent: window, location: { href: source, search: window.location.search }, addEventListener() {}, __prepareSogliaIntro() { geometry++; }, __startSogliaIntro() { intros++; }, __eraseDebug: { visiblePhotoRatios: [0, 0, 0] } };
      const childContext = vm.createContext({ ...globals, window: child, document: childDocument, PHOTO_SRC: [], imgs: [], setOpticalFlipAxes() {}, size() { layouts++; }, snake() {}, requestAnimationFrame() {} });
      vm.runInContext(read('experience-loader.js'), childContext);
      vm.runInContext(read('cartolina-config.js'), childContext);
      assert.equal(child.ISOExperienceLoader, window.ISOExperienceLoader, 'frame must share the parent resource cache');
      assert.equal(child.ISOCartolina, window.ISOCartolina, 'frame must share the manifest');
      vm.runInContext(preparation, childContext);
      frame.contentWindow = child;
      frame.contentDocument = childDocument;
      queueMicrotask(() => { for (const [listener, key] of events) if (key === 'load') listener(); });
    }
  });
  for (const file of ['experience-loader.js', 'cartolina-config.js', 'loop-audio.js', 'iso-meter-response.js']) vm.runInContext(read(file), context);
  vm.runInContext(outer, context);
  return {
    window, elements, frame, requests, streams, images, decodes, sources, gains, readyFonts, releaseDownload, innerEvents, meterEvents, retryEvents,
    get intros() { return intros; }, get layouts() { return layouts; }, get geometry() { return geometry; }, get frameCount() { return frameCount; },
    async releaseDownloads() { for (const url of Array.from(streams.keys())) releaseDownload(url); await new Promise(resolve => setTimeout(resolve, 10)); await settle(); },
    async releasePreparation() {
      images.forEach(image => image.decoded.resolve()); readyFonts.resolve();
      for (let n = 0; n < 12; n++) { decodes.forEach(decode => decode.resolve()); await settle(); }
    },
    draw(time) { draw(time); }, offline() { offline = true; }
  };
}

function assertClosed(test) {
  assert.equal(test.window.ISOAudioMeter.experienceReady, false);
  assert.equal(test.elements.loadingGate.hidden, false);
  assert.equal(test.elements.meterHit.disabled, true);
  assert.equal(test.frame.inert, true);
  assert.equal(test.intros, 0);
  assert.equal(test.sources.length, 0);
}

const slow = harness();
await settle();
assertClosed(slow);
assert.equal(slow.requests.length, 7, 'one manifest, three images and three audio requests');
assert.equal(slow.window.ISOAudioMeter.loading.percent, 0);
slow.meterEvents.click({ stopPropagation() {} });
await slow.innerEvents.pointerdown();
assertClosed(slow);
assert.equal(slow.window.ISOAudioMeter.paused, false);
assert.equal(slow.window.ISOAudioMeter.audioState, 'suspended');
slow.releaseDownload(base + 'audio/river.mp3', true);
await settle();
assert.ok(slow.window.ISOAudioMeter.loading.percent > 0);
assertClosed(slow);
await slow.releaseDownloads();
assert.equal(slow.decodes.length, 1, 'PCM decoders must run sequentially');
assertClosed(slow);
slow.readyFonts.resolve();
slow.images.slice(0, 2).forEach(image => image.decoded.resolve());
for (let n = 0; n < 3; n++) {
  assert.equal(slow.decodes.length, n + 1);
  slow.decodes[n].resolve();
  await settle();
}
assert.equal(slow.window.ISOAudioMeter.loading.completed, 5);
assertClosed(slow);
assert.ok(slow.window.ISOAudioMeter.loading.percent < 100);
slow.images[2].decoded.resolve();
await settle();
assert.equal(slow.window.ISOAudioMeter.experienceReady, true);
assert.equal(slow.window.ISOAudioMeter.loading.percent, 100);
assert.equal(slow.elements.loadingGate.hidden, true);
assert.equal(slow.elements.meterHit.disabled, false);
assert.equal(slow.frame.inert, false);
assert.equal(slow.frame.contentDocument.body.inert, false);
assert.equal(slow.intros, 1);
assert.equal(slow.layouts, 1);
assert.equal(slow.geometry, 1);
assert.equal(slow.sources.length, 0, 'ready must still wait for the first audio gesture');
slow.offline();
await slow.innerEvents.pointerdown();
assert.equal(slow.sources.length, 3);
assert.ok(slow.sources.every(source => source.started === 10.025 && source.offset === 1 && source.loopStart === 1 && source.loopEnd === 4));
for (let loop = 0; loop < 10; loop++) {
  slow.frame.contentWindow.__eraseDebug.visiblePhotoRatios = [.2, .3, .5];
  slow.draw(100 + loop * 100);
  slow.meterEvents.click({ stopPropagation() {} });
  await slow.innerEvents.pointerdown();
}
assert.equal(slow.requests.length, 7, 'no network requests during erasing, mute or repeat loops');
assert.ok(slow.sources.every(source => source.starts === 1));
console.log('Preload: progress reflects bytes/preparation; early gestures blocked; final image decoding gates the intro; audio prepared once; ten interaction cycles need no network.');

const fontWait = harness();
await settle(); await fontWait.releaseDownloads();
fontWait.images.forEach(image => image.decoded.resolve());
for (let n = 0; n < 3; n++) { fontWait.decodes[n].resolve(); await settle(); }
assert.equal(fontWait.window.ISOAudioMeter.loading.completed, 6);
assertClosed(fontWait);
assert.equal(fontWait.window.ISOAudioMeter.loading.percent, 99, '100% is reserved for the complete experience');
fontWait.readyFonts.resolve(); await settle();
assert.equal(fontWait.window.ISOAudioMeter.experienceReady, true);
console.log('Fonts/layout: all six files alone cannot open the gate; font readiness and canvas/intro preparation are also required.');

const corruptURL = base + 'audio/endless-ascent.mp3';
const damaged = harness({ corrupt: corruptURL });
await settle(); await damaged.releaseDownloads(); await damaged.releasePreparation();
assertClosed(damaged);
assert.equal(damaged.window.ISOAudioMeter.loading.status, 'error');
assert.match(damaged.window.ISOAudioMeter.error, /incompleta/);
assert.equal(damaged.elements.loadingRetry.hidden, false);
assert.equal(damaged.decodes.length, 0, 'truncated data must be rejected before audio decoding');
const retry = damaged.retryEvents.click();
await settle();
assert.equal(damaged.frameCount, 2);
assert.deepEqual(Array.from(damaged.streams.keys()), [corruptURL], 'retry downloads only the missing/corrupt asset');
await damaged.releaseDownloads(); await damaged.releasePreparation(); await retry;
assert.equal(damaged.window.ISOAudioMeter.experienceReady, true);
assert.equal(damaged.requests.length, 8);
assert.equal(damaged.intros, 1);
assert.equal(damaged.window.ISOAudioMeter.error, null);
console.log('Failure/retry: truncated HTTP-200 audio fails SHA-256, holds the experience, and retries only that file without replaying the intro.');

const manifestFailure = harness({ failManifest: true });
await settle(); assertClosed(manifestFailure);
assert.equal(manifestFailure.window.ISOAudioMeter.loading.status, 'error');
assert.equal(manifestFailure.requests.length, 1);
const manifestRetry = manifestFailure.retryEvents.click();
await settle(); await manifestFailure.releaseDownloads(); await manifestFailure.releasePreparation(); await manifestRetry;
assert.equal(manifestFailure.window.ISOAudioMeter.experienceReady, true);
assert.equal(manifestFailure.requests.filter(url => url.endsWith('manifest.json')).length, 2);
assert.equal(manifestFailure.window.ISOAudioMeter.error, null);
console.log('Manifest: initial network failure is recoverable; no permanent rejected configuration promise.');
