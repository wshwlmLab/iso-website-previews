import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import path from 'node:path';

const root = process.argv[2] || 'soglia-v73/dist';
const inner = fs.readFileSync(path.join(root, 'soglia-frozen.html'), 'utf8');
const outer = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const classList = () => ({add(){},remove(){},contains(){return false},toggle(){}});

function verifyEraser(layers) {
  const photoRect = {left:60,top:60,width:420,height:240};
  const moduleRect = {left:0,top:0,width:540,height:360};
  const elements = {};
  function canvasContext() {
    return {drawImage(){},putImageData(){},getImageData(x,y,w,h){return this.createImageData(w,h)},createImageData(w,h){return {data:new Uint8ClampedArray(w*h*4)}}};
  }
  for(const id of ['module','viewport','whiteCover','img1','img2','img3','stone']) {
    const context=canvasContext();
    elements[id]={style:{},classList:classList(),getBoundingClientRect:()=>id==='viewport'?photoRect:moduleRect,getContext:()=>context,setPointerCapture(){},releasePointerCapture(){}};
  }
  const document={getElementById:id=>elements[id],body:{classList:classList()},createElement:()=>({getContext:()=>canvasContext()})};
  const window={addEventListener(){}};
  const context=vm.createContext({document,window,Uint8Array,Uint32Array,Float32Array,Uint8ClampedArray,Math,Infinity,Array,requestAnimationFrame:()=>1,cancelAnimationFrame(){}});
  const begin=inner.indexOf('const moduleEl=document.getElementById');
  const end=inner.indexOf('let prepared=null;',begin);
  vm.runInContext(inner.slice(begin,end),context);
  vm.runInContext(`imgs=Array.from({length:${layers}},()=>({width:420,height:240}));size();`,context);
  const debug=window.__eraseDebug;
  function checkCounts() {
    const {MW,VW,VH,OFFX,OFFY}=debug.dimensions;
    const white=vm.runInContext('whiteAlive',context);
    const actual=Array(layers).fill(0);
    for(let y=0;y<VH;y++)for(let x=0;x<VW;x++)if(!white[(y+OFFY)*MW+x+OFFX])actual[debug.photoState[y*VW+x]-1]++;
    assert.deepEqual(Array.from(debug.visiblePhotoCounts),actual);
    assert.ok(actual.reduce((a,b)=>a+b,0)<=VW*VH);
    Array.from(debug.visiblePhotoRatios).forEach((ratio,i)=>assert.equal(ratio,actual[i]/(VW*VH)));
  }
  let samples=0;
  function raster(x0,y0,x1,y1,spacing) {
    const event=(x,y)=>({clientX:x,clientY:y,buttons:1,pointerType:'mouse',pointerId:1});
    elements.module.onpointerdown(event(x0,y0));
    vm.runInContext('flushPointerQueue()',context);
    let reverse=false;
    for(let y=y0;y<=y1;y+=spacing){
      for(const x of reverse?[x1,x0]:[x0,x1]){
        elements.module.onpointermove(event(x,y));
        vm.runInContext('flushPointerQueue()',context);
        samples++;
      }
      reverse=!reverse;
    }
    elements.module.onpointerup(event(reverse?x1:x0,y1));
    checkCounts();
  }
  checkCounts();
  raster(0,0,539,359,25);
  assert.ok(debug.whiteErasedRatio>=.995);
  for(let pass=0;pass<45 && debug.activeStep<layers*3+1;pass++)raster(60,60,479,299,18);
  assert.ok(debug.activeStep>=layers*3+1,`loop stalled: ${layers} layers, step ${debug.activeStep}`);
  assert.ok(debug.loopCount>=3);
  vm.runInContext('size()',context);
  assert.deepEqual(Array.from(debug.visiblePhotoCounts),Array(layers).fill(0));
  console.log(`Eraser: ${layers} layers, at least 3 complete loops, ${samples} fast pointer samples; pixel counts exact, reset silent.`);
}

async function verifyAudio() {
  const gains=[],sources=[];
  class Param {
    constructor(){this.value=1;this.calls=[];}
    cancelAndHoldAtTime(){throw new Error('The playback fade must not use consecutive hold events');}
    cancelScheduledValues(time){this.calls.push(['cancel',time]);}
    setValueAtTime(value,time){this.calls.push(['set',value,time]);}
    linearRampToValueAtTime(value,time){this.value=value;this.calls.push(['ramp',value,time]);}
  }
  class Node {
    constructor(){this.gain=new Param();this.connections=[];}
    connect(node){this.connections.push(node);}
    getFloatTimeDomainData(buffer){buffer.fill(0);}
    start(time,offset){this.offset=offset;this.started=time;this.startCalls=(this.startCalls||0)+1;}
  }
  class Buffer {
    constructor(channels,length,sampleRate){this.numberOfChannels=channels;this.length=length;this.sampleRate=sampleRate;this.duration=length/sampleRate;this.channels=Array.from({length:channels},()=>new Float32Array(length));}
    getChannelData(channel){return this.channels[channel];}
  }
  class AudioContext {
    constructor(){this.state='suspended';this.currentTime=10;this.destination=new Node();AudioContext.last=this;}
    createGain(){const gain=new Node();gains.push(gain);return gain;}
    createChannelSplitter(){return new Node();}
    createAnalyser(){return new Node();}
    createBuffer(channels,length,rate){return new Buffer(channels,length,rate);}
    createBufferSource(){const source=new Node();sources.push(source);return source;}
    decodeAudioData(){return Promise.resolve(new Buffer(2,400,100));}
    resume(){this.state='running';return Promise.resolve();}
  }
  const frameEvents={},meterEvents={},innerEvents={},childEvents={};
  const innerDocument={documentElement:{style:{setProperty(){}}},addEventListener:(key,cb)=>innerEvents[key]=cb,querySelectorAll:()=>[]};
  const ratios=[0,0,0];
  const frame={inert:true,dataset:{source:'soglia-frozen.html'},setAttribute(){},removeAttribute(){},contentDocument:innerDocument,contentWindow:{addEventListener:(key,cb)=>childEvents[key]=cb,location:{href:'https://test.invalid/soglia-frozen.html?cartolina=soglia-prova'},__showSogliaIntro:async()=>{},__prepareFrozenSoglia:async()=>{},__startSogliaExperience(){},__eraseDebug:{visiblePhotoRatios:ratios}},addEventListener:(key,cb)=>frameEvents[key]=cb,removeEventListener(){}};
  const meterHit={classList:classList(),setAttribute(){},addEventListener:(key,cb)=>meterEvents[key]=cb};
  const meter={classList:classList()};
  const loadingElements=Object.fromEntries(['loadingGate','loadingLabel','loadingProgress','loadingBar','loadingRetry'].map(id=>[id,{hidden:false,addEventListener(){}}]));
  const document={body:{dataset:{}},getElementById:id=>({soglia:frame,meter,meterHit,meterZone:{appendChild(){}},...loadingElements})[id],querySelectorAll:()=>[],createElement:()=>({className:'',children:[],style:{},appendChild(child){this.children.push(child)}})};
  const base='https://pub-db4922fd516c4a87b423232b0ddef047.r2.dev/cartoline/soglia-prova/v1/';
  const window={addEventListener(){},AudioContext,OfflineAudioContext:class{decodeAudioData(){return Promise.resolve(new Buffer(2,400,100))}},location:{search:'?cartolina=soglia-prova',href:'https://test.invalid/?cartolina=soglia-prova'},ISOCartolinaReady:Promise.resolve({manifestURL:base+'manifest.json',fadeSeconds:1,loopCrossfadeSeconds:1,layers:['river','endless-ascent','sciola'].map(id=>({audio:base+'audio/'+id+'.mp3'}))})};
  window.ISOCartolina={load:()=>window.ISOCartolinaReady};
  window.ISOExperienceLoader={bytes:async()=>new ArrayBuffer(8),prepare:(key,operation)=>operation(),snapshot:()=>({error:null}),subscribe(){},retry(){},preparing(){},ready(){},fail(error){throw error}};
  let draw;
  let visualNow=0;
  const timeOrigin=100000;
  const context=vm.createContext({window,document,console,fetch:async url=>({ok:true,arrayBuffer:async()=>new ArrayBuffer(8)}),performance:{now:()=>visualNow,timeOrigin},requestAnimationFrame:cb=>{draw=cb},MutationObserver:class{observe(){}},Promise,Float32Array,Math,Array,Number,URL,setTimeout,clearTimeout});
  vm.runInContext(fs.readFileSync(path.join(root,'iso-meter-response.js'),'utf8'),context);
  vm.runInContext(fs.readFileSync(path.join(root,'loop-audio.js'),'utf8'),context);
  vm.runInContext(fs.readFileSync(path.join(root,'site-visit.js'),'utf8'),context);
  const engineContext=new AudioContext();
  const original=new Buffer(2,400,100);
  original.channels.forEach((samples,channel)=>samples.forEach((_,i)=>samples[i]=i/500+channel/10));
  const inputs=original.channels.map(samples=>samples.slice());
  const seamless=window.ISOLoopAudio.makeSeamlessLoop(engineContext,original,1);
  assert.equal(seamless.crossfadeSeconds,1);
  assert.equal(seamless.buffer,original,'preparation must not allocate another full PCM buffer');
  assert.equal(seamless.buffer.length,400);
  assert.equal(seamless.loopStart,1);
  assert.equal(seamless.loopEnd,4);
  assert.equal(seamless.buffer.numberOfChannels,2);
  for(let channel=0;channel<2;channel++){
    const input=inputs[channel],output=seamless.buffer.getChannelData(channel);
    assert.equal(output[100],input[100]);
    assert.equal(output[299],input[299]);
    assert.equal(output[300],input[300]);
    assert.equal(output[399],input[99]);
    assert.ok(Math.abs(output[100]-output.at(-1))<.003,'loop seam must continue the head, not jump from the original tail');
    assert.ok(Math.abs(output[349]-(input[349]+input[49])/2)<.008,'middle of overlap must blend both ends');
  }
  const short=window.ISOLoopAudio.makeSeamlessLoop(engineContext,new Buffer(2,40,100),1);
  assert.equal(short.crossfadeSeconds,.1);
  vm.runInContext(outer.match(/<script>([\s\S]*?)<\/script>/)[1],context);
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(frame.src,'https://test.invalid/soglia-frozen.html?cartolina=soglia-prova&build=20261008-menu-sequence');
  await frameEvents.load();
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(window.ISOAudioMeter.experienceReady,true);
  const menuFade=(level,milliseconds)=>childEvents['iso:menu-fade']({detail:{level,deadline:timeOrigin+visualNow+milliseconds}});
  menuFade(0,2000);
  assert.equal(gains.length,0,'A menu fade must not create or unlock an audio context');
  assert.equal(window.ISOAudioMeter.experienceAudioLevel,0);
  menuFade(1,220);
  await innerEvents.pointerdown();
  assert.equal(window.ISOAudioMeter.audioState,'running');
  assert.equal(sources.length,3);
  assert.ok(sources.every(source=>source.loop && source.started===10.025 && source.offset===1 && source.loopStart===1 && source.loopEnd===4));
  assert.ok(gains.slice(4).every(gain=>gain.gain.value===0),'all sources must start silent before their entrance fade');
  AudioContext.last.currentTime=10.1;
  for(const target of [[.4,0,0],[.65,.25,.1],[.15,.2,.65],[.9,.07,.03],[0,0,0]]){
    ratios.splice(0,3,...target);
    draw((verifyAudio.tick=(verifyAudio.tick||0)+100));
    assert.deepEqual(Array.from(window.ISOAudioMeter.tracks,track=>track.targetVolume),target);
    target.forEach((value,i)=>assert.deepEqual(gains[i+4].gain.calls.at(-1),['ramp',value,11.1]));
  }
  meterEvents.click({stopPropagation(){}});
  assert.deepEqual(gains[2].gain.calls.at(-1),['ramp',0,10.6]);
  meterEvents.click({stopPropagation(){}});
  assert.deepEqual(gains[2].gain.calls.at(-1),['ramp',1,11.1]);
  await innerEvents.pointerdown();
  assert.equal(sources.length,3);
  assert.ok(sources.every(source=>source.startCalls===1 && source.loop));
  assert.ok(Array.from(window.ISOAudioMeter.tracks).every(track=>track.loopCrossfadeSeconds===1));
  assert.equal(window.ISOAudioMeter.error,null);
  console.log('Audio: 0.5-second meter mute, 1-second unmute and photo fades; loop seam crossfade continuous; all loops start once; mute never restarts them.');

  // Departure affects the common PCM/HTML bus, leaving meter mute and photo
  // reveal gains intact. Interrupted restoration starts at the exact ramp value.
  assert.equal(gains[0].connections[0],gains[1]);
  assert.equal(gains[1].connections[0],gains[2]);
  window.ISOAudioMeter.setMuted(true);
  const muteCalls=gains[2].gain.calls.length;
  const photoCalls=gains.slice(4).map(gain=>gain.gain.calls.length);
  menuFade(0,1750);
  assert.deepEqual(gains[1].gain.calls.at(-1),['ramp',0,11.85]);
  visualNow=875;AudioContext.last.currentTime=10.975;
  menuFade(1,220);
  assert.ok(Math.abs(gains[1].gain.calls.at(-2)[1]-.5)<1e-10,'Restoration must not jump from a partly completed fade');
  assert.deepEqual(gains[1].gain.calls.at(-1),['ramp',1,11.195]);
  visualNow=1200;AudioContext.last.currentTime=11.3;
  menuFade(0,2000);
  visualNow=3200;AudioContext.last.currentTime=13.3;
  menuFade(0,0);
  assert.deepEqual(gains[1].gain.calls.at(-1),['set',0,13.3]);
  menuFade(1,220);
  assert.deepEqual(gains[1].gain.calls.at(-1).slice(0,2),['ramp',1]);
  assert.ok(Math.abs(gains[1].gain.calls.at(-1)[2]-13.52)<1e-10);
  assert.equal(gains[2].gain.calls.length,muteCalls,'A page fade/reset must preserve the user mute envelope');
  assert.equal(window.ISOAudioMeter.paused,true);
  assert.deepEqual(gains.slice(4).map(gain=>gain.gain.calls.length),photoCalls);
  assert.equal(sources.length,3);
  assert(sources.every(source=>source.startCalls===1));
  console.log('Departure: shared visual deadline, independent audio envelope, seamless cancellation/reset, meter mute preserved, all three loop positions preserved.');
}

verifyEraser(3);
verifyEraser(5);
await verifyAudio();
