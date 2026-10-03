import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { createHash, webcrypto } from 'node:crypto';

const root = process.argv[2] || 'dist';
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const outer = read('index.html').match(/<script>([\s\S]*?)<\/script>/)[1];
const inner = read('soglia-frozen.html');
const preparation = inner.slice(inner.indexOf('let prepared=null;'), inner.indexOf("window.addEventListener('resize',()=>{if(imgs.length)size()});") + "window.addEventListener('resize',()=>{if(imgs.length)size()});".length);
const base = 'https://pub-db4922fd516c4a87b423232b0ddef047.r2.dev/cartoline/soglia-prova/v1/';
const defer = () => { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; };
const settle = async () => { for (let n = 0; n < 4; n++) await new Promise(resolve => setImmediate(resolve)); };
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const classes = () => ({ add() {}, remove() {}, toggle() {} });

function harness({ corrupt = null, failManifest = false, redirect = false, layerCount = 3, audioOrigin = 'cloudflare', audioEngine = 'pcm' } = {}) {
  const requests = [], streams = new Map(), images = [], decodes = [], sources = [], gains = [];
  const nativeMedia=[];
  const readyFonts = defer();
  const data = new Map();
  const ids=Array.from({length:layerCount},(_,index)=>['river','endless-ascent','sciola'][index]||'layer-'+(index+1));
  const layers = ids.map((id, index) => {
    const image = `images/0${index + 1}.jpg`, audio = `audio/${id}.mp3`;
    const imageBytes = Uint8Array.from([1, 2, 3, index]);
    const audioBytes = Uint8Array.from([4, 5, 6, index]);
    data.set(base + image, imageBytes);
    data.set((audioOrigin === 'locale' ? 'https://test.invalid/cartoline/soglia-prova/v1/' : base) + audio, audioBytes);
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
    cancelAndHoldAtTime() { throw new Error('Unexpected fade hold'); }
    cancelScheduledValues(time) { this.calls.push(['cancel', time]); }
    setValueAtTime(value, time) { this.calls.push(['set', value, time]); }
    linearRampToValueAtTime(value, time) { this.value = value; this.calls.push(['ramp', value, time]); }
  }
  class Node {
    constructor() { this.gain = new Param(); }
    connect() {}
    getFloatTimeDomainData(samples) { samples.fill(0); }
    start(time, offset) { this.started = time; this.offset = offset; this.starts = (this.starts || 0) + 1; }
  }
  class Decoder {
    constructor(channels,length,sampleRate) { assert.equal(sampleRate,48000); }
    async decodeAudioData(bytes) { assert.equal(bytes.byteLength,4); const pending=defer(); decodes.push(pending); await pending.promise; return new PCM(); }
  }
  class NativeAudio {
    constructor(){this.listeners=new Map();this.readyState=0;this.paused=true;this.duration=4;this.currentTime=0;this.plays=0;nativeMedia.push(this);}
    addEventListener(key,fn){if(!this.listeners.has(key))this.listeners.set(key,new Set());this.listeners.get(key).add(fn);}
    removeEventListener(key,fn){this.listeners.get(key)?.delete(fn);}
    emit(key){this.listeners.get(key)?.forEach(fn=>fn());}
    load(){assert.match(this.src,/^blob:/);this.readyState=4;queueMicrotask(()=>this.emit('canplaythrough'));}
    async play(){this.plays++;this.paused=false;}
    removeAttribute(){}
  }
  class AudioContext {
    constructor() { this.state = 'suspended'; this.currentTime = 10; this.destination = new Node(); AudioContext.last = this; }
    createGain() { const node = new Node(); gains.push(node); return node; }
    createChannelSplitter() { return new Node(); }
    createAnalyser() { return new Node(); }
    createBuffer() { throw new Error('A second full PCM buffer must not be allocated'); }
    createBufferSource() { const source = new Node(); sources.push(source); return source; }
    createMediaElementSource(media){const source=new Node();source.media=media;sources.push(source);return source;}
    async decodeAudioData() { throw new Error('Playback context must never decode'); }
    async resume() { this.state = 'running'; }
  }
  const events = new Map(), innerEvents = {}, meterEvents = {}, retryEvents = {};
  function element() { return { classList: classes(), style: {}, hidden: false, disabled: false, children: [], setAttribute() {}, removeAttribute() {}, appendChild(child) { this.children.push(child); } }; }
  const frame = { ...element(), inert: false, dataset: { source: 'soglia-frozen.html' }, addEventListener(key, listener) { events.set(listener, key); }, removeEventListener(key, listener) { events.delete(listener); } };
  const elements = Object.fromEntries(['meter', 'meterHit', 'meterZone', 'loadingGate', 'loadingLabel', 'loadingProgress', 'loadingBar', 'loadingRetry'].map(id => [id, element()]));
  elements.soglia = frame;
  elements.meterHit.disabled = false;
  elements.meterHit.addEventListener = (key, fn) => { meterEvents[key] = fn; };
  elements.loadingRetry.addEventListener = (key, fn) => { retryEvents[key] = fn; };
  const document = { body: { dataset: {} }, fonts: { ready: Promise.resolve() }, getElementById: id => elements[id], createElement: element };
  const search = '?cartolina=soglia-prova' + (audioOrigin === 'locale' ? '&audio_origine=locale' : '') + (audioEngine === 'html' ? '&audio_motore=html' : '');
  const window = { AudioContext, OfflineAudioContext:Decoder, Audio:NativeAudio, location: { href: 'https://test.invalid/' + search, search } };
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
      const childDocument = { body: { inert: false }, fonts, documentElement: { style: { setProperty() {} } }, addEventListener: (key, fn) => { innerEvents[key] = fn; } };
      const child = { parent: window, location: { href: redirect ? source+'#redirected' : source, search: window.location.search }, addEventListener() {}, __prepareSogliaIntro() { geometry++; }, __startSogliaIntro() { intros++; }, __eraseDebug: { visiblePhotoRatios: [0, 0, 0] } };
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
    window, elements, frame, requests, streams, images, decodes, sources, gains, nativeMedia, readyFonts, releaseDownload, innerEvents, meterEvents, retryEvents,
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
  assert.equal(test.intros, 1, 'intro remains visible and active during preparation');
  assert.equal(test.elements.meterHit.disabled, false);
  assert.equal(test.frame.inert, false);
  assert.equal(test.frame.contentDocument.body.inert,false);
  assert.equal(test.sources.length, 0);
}

// The public UI contains no loading screen, percentage, spinner or retry panel.
assert.ok(!/loadingGate|loadingBar|loadingProgress|loadingRetry|loading-gate|<progress/.test(read('index.html')));
const slow = harness({redirect:true});
await settle();
assert.equal(slow.window.ISOAudioMeter.audioState,'not-created','preparation must not open the audio device');
slow.readyFonts.resolve();await settle();
assertClosed(slow);
assert.equal(slow.requests.length,7);
const gesture=slow.innerEvents.pointerdown();
await settle();
assert.equal(slow.window.ISOAudioMeter.audioState,'running','first intro gesture unlocks playback immediately');
assert.equal(slow.sources.length,0);
await slow.releaseDownloads();
assert.equal(slow.decodes.length,1,'offline decoders run sequentially');
assertClosed(slow);
slow.images.slice(0,2).forEach(image=>image.decoded.resolve());
for(let n=0;n<3;n++){assert.equal(slow.decodes.length,n+1);slow.decodes[n].resolve();await settle();}
await gesture;
assert.equal(slow.window.ISOAudioMeter.loading.completed,5);
assert.equal(slow.window.ISOAudioMeter.experienceReady,false);
assert.equal(slow.intros,1);
assert.equal(slow.sources.length,3);
assert.ok(slow.gains.slice(4).every(gain=>gain.gain.value===0),'loops stay silent behind the untouched photo cover');
slow.images[2].decoded.resolve();await settle();
assert.equal(slow.window.ISOAudioMeter.experienceReady,true);
assert.equal(slow.frame.inert,false);
assert.equal(slow.intros,1,'preparation must not restart the visible intro');
assert.equal(slow.layouts,1);
assert.equal(slow.geometry,1);
slow.offline();
for(let loop=0;loop<10;loop++){
 slow.frame.contentWindow.__eraseDebug.visiblePhotoRatios=[.2,.3,.5];slow.draw(100+loop*100);
 slow.meterEvents.click({stopPropagation(){}});await slow.innerEvents.pointerdown();
}
assert.equal(slow.requests.length,7);
assert.ok(slow.sources.every(source=>source.starts===1&&source.offset===1&&source.loopStart===1&&source.loopEnd===4));
console.log('Silent preparation: intro visible during slow audio/image preparation; offline decoding without opening hardware; first gesture unlocks playback; redirect URL accepted; no intro restart or network during ten interaction cycles.');

const local=harness({audioOrigin:'locale'});
await settle();await local.releaseDownloads();await local.releasePreparation();
assert.equal(local.window.ISOAudioMeter.experienceReady,true);
assert.equal(local.window.ISOAudioMeter.audioOrigin,'locale');
assert.equal(slow.window.ISOAudioMeter.audioOrigin,'cloudflare');
assert.deepEqual(local.requests.filter(url=>url.includes('/images/')),slow.requests.filter(url=>url.includes('/images/')));
const cloudAudio=slow.requests.filter(url=>url.includes('/audio/'));
const localAudio=local.requests.filter(url=>url.includes('/audio/'));
assert.equal(localAudio.length,3);
cloudAudio.forEach((url,index)=>assert.equal(localAudio[index],url.replace('https://pub-db4922fd516c4a87b423232b0ddef047.r2.dev','https://test.invalid')));
assert.equal(local.requests[0],slow.requests[0],'both trials must use the identical Cloudflare manifest');
await local.innerEvents.pointerdown();
local.offline();local.frame.contentWindow.__eraseDebug.visiblePhotoRatios=[.5,.25,.25];local.draw(100);
assert.equal(local.sources.length,3);assert.ok(local.sources.every(source=>source.starts===1&&source.offset===1&&source.loopStart===1&&source.loopEnd===4));
assert.deepEqual(Array.from(local.window.ISOAudioMeter.capture().tracks,track=>track.targetVolume),[.5,.25,.25]);
assert.equal(local.window.ISOAudioMeter.capture().audio.playbackStats,null,'unavailable browser diagnostics must remain optional');
assert.equal(local.requests.length,7,'the origin comparison must not add playback-time requests');
console.log('Audio-origin A/B: same manifest, hashes, images, offline decoder, fades and loop sources; only the three audio URL origins differ. Neither mode fetches while erasing.');

for(const layerCount of [3,5]){
 const native=harness({audioEngine:'html',layerCount});
 await settle();await native.releaseDownloads();await native.releasePreparation();
 assert.equal(native.window.ISOAudioMeter.experienceReady,true);
 assert.equal(native.window.ISOAudioMeter.audioState,'not-created');
 assert.equal(native.window.ISOAudioMeter.audioEngine,'html');
 assert.equal(native.decodes.length,0,'the historical player comparison must not use PCM decoding');
 assert.equal(native.nativeMedia.length,layerCount);
 assert.ok(native.nativeMedia.every(media=>media.paused&&media.readyState===4&&media.loop&&media.preload==='auto'));
 assert.deepEqual(native.requests.filter(url=>url.includes('/audio/')).slice(0,3),cloudAudio);
 await Promise.all([native.innerEvents.pointerdown(),native.innerEvents.pointerdown()]);
 assert.equal(native.sources.length,layerCount);
 assert.ok(native.nativeMedia.every(media=>media.plays===1));
 native.offline();
 native.frame.contentWindow.__eraseDebug.visiblePhotoRatios=Array(layerCount).fill(1/layerCount);
 native.draw(100);native.meterEvents.click({stopPropagation(){}});await native.innerEvents.pointerdown();
 assert.equal(native.sources.length,layerCount);assert.ok(native.nativeMedia.every(media=>media.plays===1));
 assert.ok(Array.from(native.window.ISOAudioMeter.tracks).every(track=>track.loop&&track.playing&&track.readyState===4&&track.loopCrossfadeSeconds===0));
 native.nativeMedia[0].emit('waiting');
 assert.equal(native.window.ISOAudioMeter.diagnostics.at(-1).kind,'audio-native-waiting');
 assert.equal(native.requests.length,1+2*layerCount);
}
console.log('Historical HTML player: three/five fully prepared Blob MP3s, no PCM decoder or playback-time network, one start per track under concurrent gestures, same gains and mute; native waiting events recorded. This comparison deliberately uses the original raw loop seam.');

const corruptURL=base+'audio/endless-ascent.mp3';
const damaged=harness({corrupt:corruptURL});
await settle();await damaged.releaseDownloads();await damaged.releasePreparation();
assertClosed(damaged);
assert.equal(damaged.window.ISOAudioMeter.loading.status,'error');
assert.match(damaged.window.ISOAudioMeter.error,/incompleta/);
assert.equal(damaged.decodes.length,0);
const retry=damaged.window.__retrySogliaAssets();await settle();
assert.equal(damaged.frameCount,1,'media retry must not reload the visible page');
assert.deepEqual(Array.from(damaged.streams.keys()),[corruptURL]);
await damaged.releaseDownloads();await damaged.releasePreparation();await retry;
assert.equal(damaged.window.ISOAudioMeter.experienceReady,true);
assert.equal(damaged.requests.length,8);
assert.equal(damaged.intros,1);
assert.equal(damaged.window.ISOAudioMeter.error,null);
console.log('Integrity/recovery: truncated audio rejected before decoding; retry recovers only that asset while retaining the intro and already loaded images.');

const manifestFailure=harness({failManifest:true});
await settle();manifestFailure.readyFonts.resolve();await settle();
assertClosed(manifestFailure);
assert.equal(manifestFailure.window.ISOAudioMeter.loading.status,'error');
const manifestRetry=manifestFailure.window.__retrySogliaAssets();
await settle();await manifestFailure.releaseDownloads();await manifestFailure.releasePreparation();await manifestRetry;
assert.equal(manifestFailure.window.ISOAudioMeter.experienceReady,true);
assert.equal(manifestFailure.requests.filter(url=>url.endsWith('manifest.json')).length,2);
assert.equal(manifestFailure.intros,1);
console.log('Manifest failure: does not hide or freeze the intro; configuration retry remains possible.');

// Execute the actual bridge advance/resume functions with delayed media.
const bridge=read('soglia-frozen.html');
const advance=bridge.slice(bridge.indexOf('function advance(){'),bridge.indexOf('const arm=e=>'));
const thresholdWindow={__frozenSogliaReady:false};let dispersion=0;
const threshold=vm.createContext({window:thresholdWindow,initialMotionIntroDone:true,animating:false,armed:true,dispersionStarted:false,phase:2,disperseToThreshold(){dispersion++},prepareNextSentence(){},animate(){}});
vm.runInContext(advance,threshold);vm.runInContext('advance()',threshold);
assert.equal(dispersion,0);assert.equal(thresholdWindow.__pendingSogliaThreshold,true);
thresholdWindow.__frozenSogliaReady=true;thresholdWindow.__resumeSogliaThreshold();
assert.equal(dispersion,1);
console.log('Manual reveal: pending entry is resumed only after media preparation; erasing is never interrupted by a loader.');

const five=harness({layerCount:5});
await settle();await five.releaseDownloads();await five.releasePreparation();
assert.equal(five.window.ISOAudioMeter.experienceReady,true);
await five.innerEvents.pointerdown();
assert.equal(five.sources.length,5);assert.equal(five.requests.length,11);
five.offline();await five.innerEvents.pointerdown();
assert.ok(five.sources.every(source=>source.starts===1));
console.log('Five layers: all ten assets prepared, five loops started once, no additional network requests.');

// Reproduce the original 50% deadlock condition without waiting 45 seconds.
const originalFrame=fs.readFileSync(new URL('./fixtures/frame-v18-before-performance.js',import.meta.url),'utf8');
let imagePreparations=0,originalLoaded;
const oldFrame={dataset:{source:'soglia-frozen.html'},contentDocument:{documentElement:{style:{setProperty(){}}},addEventListener(){}},contentWindow:{location:{href:''},__prepareFrozenSoglia:async()=>{imagePreparations++},__startSogliaExperience(){}},addEventListener(key,cb){originalLoaded=cb},removeEventListener(){}};
Object.defineProperty(oldFrame,'src',{set(source){oldFrame.contentWindow.location.href=source+'#redirected'}});
const previousContext=vm.createContext({frame:oldFrame,window:{location:{href:'https://test.invalid/',search:''}},URL,setTimeout:()=>1,clearTimeout(){},ensureAudioStarted(){}});
vm.runInContext(originalFrame+';globalThis.waiting=loadFrozenSoglia();',previousContext);
let resolved=false;previousContext.waiting.then(()=>{resolved=true});
await originalLoaded();await settle();
assert.equal(imagePreparations,0);assert.equal(resolved,false);
console.log('Previous deadlock reproduced: a normalized/redirected frame URL is ignored, leaving all three images unrequested while the three audio resources can finish (50%). The new handshake uses actual page readiness.');
