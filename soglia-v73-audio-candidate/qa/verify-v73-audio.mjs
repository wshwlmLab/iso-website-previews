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
  const end=inner.indexOf('window.ISOCartolinaReady.then(config=>',begin);
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
    cancelAndHoldAtTime(time){this.calls.push(['hold',time]);}
    linearRampToValueAtTime(value,time){this.value=value;this.calls.push(['ramp',value,time]);}
  }
  class Node {
    constructor(){this.gain=new Param();this.connections=[];}
    connect(node){this.connections.push(node);}
    getFloatTimeDomainData(buffer){buffer.fill(0);}
    start(time){this.started=time;this.startCalls=(this.startCalls||0)+1;}
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
  const frameEvents={},meterEvents={},innerEvents={};
  const innerDocument={documentElement:{style:{setProperty(){}}},addEventListener:(key,cb)=>innerEvents[key]=cb,querySelectorAll:()=>[]};
  const ratios=[0,0,0];
  const frame={dataset:{source:'soglia-frozen.html'},contentDocument:innerDocument,contentWindow:{__eraseDebug:{visiblePhotoRatios:ratios}},addEventListener:(key,cb)=>frameEvents[key]=cb};
  const meterHit={classList:classList(),setAttribute(){},addEventListener:(key,cb)=>meterEvents[key]=cb};
  const meter={classList:classList()};
  const document={body:{},getElementById:id=>({soglia:frame,meter,meterHit,meterZone:{appendChild(){}}})[id],querySelectorAll:()=>[],createElement:()=>({className:'',children:[],style:{},appendChild(child){this.children.push(child)}})};
  const base='https://pub-db4922fd516c4a87b423232b0ddef047.r2.dev/cartoline/soglia-prova/v1/';
  const window={AudioContext,location:{search:'?cartolina=soglia-prova'},ISOCartolinaReady:Promise.resolve({manifestURL:base+'manifest.json',fadeSeconds:1,loopCrossfadeSeconds:1,layers:['river','endless-ascent','sciola'].map(id=>({audio:base+'audio/'+id+'.mp3'}))})};
  let draw;
  const context=vm.createContext({window,document,console,fetch:async url=>({ok:true,arrayBuffer:async()=>new ArrayBuffer(8)}),performance:{now:()=>0},requestAnimationFrame:cb=>{draw=cb},MutationObserver:class{observe(){}},Promise,Float32Array,Math,Array,Number});
  vm.runInContext(fs.readFileSync(path.join(root,'loop-audio.js'),'utf8'),context);
  const engineContext=new AudioContext();
  const original=new Buffer(2,400,100);
  original.channels.forEach((samples,channel)=>samples.forEach((_,i)=>samples[i]=i/500+channel/10));
  const seamless=window.ISOLoopAudio.makeSeamlessLoop(engineContext,original,1);
  assert.equal(seamless.crossfadeSeconds,1);
  assert.equal(seamless.buffer.length,300);
  assert.equal(seamless.buffer.numberOfChannels,2);
  for(let channel=0;channel<2;channel++){
    const input=original.getChannelData(channel),output=seamless.buffer.getChannelData(channel);
    assert.equal(output[0],input[100]);
    assert.equal(output[199],input[299]);
    assert.equal(output[200],input[300]);
    assert.equal(output[299],input[99]);
    assert.ok(Math.abs(output[0]-output.at(-1))<.003,'loop seam must continue the head, not jump from the original tail');
    assert.ok(Math.abs(output[249]-(input[349]+input[49])/2)<.008,'middle of overlap must blend both ends');
  }
  const short=window.ISOLoopAudio.makeSeamlessLoop(engineContext,new Buffer(2,40,100),1);
  assert.equal(short.crossfadeSeconds,.1);
  vm.runInContext(outer.match(/<script>([\s\S]*?)<\/script>/)[1],context);
  assert.equal(frame.src,'soglia-frozen.html?cartolina=soglia-prova');
  frameEvents.load();
  await innerEvents.pointerdown();
  assert.equal(window.ISOAudioMeter.audioState,'running');
  assert.equal(sources.length,3);
  assert.ok(sources.every(source=>source.loop && source.started===10.025));
  assert.ok(gains.slice(4).every(gain=>gain.gain.value===0),'all sources must start silent before their entrance fade');
  AudioContext.last.currentTime=10.1;
  for(const target of [[.4,0,0],[.65,.25,.1],[.15,.2,.65],[.9,.07,.03],[0,0,0]]){
    ratios.splice(0,3,...target);
    draw((verifyAudio.tick=(verifyAudio.tick||0)+100));
    assert.deepEqual(Array.from(window.ISOAudioMeter.tracks,track=>track.targetVolume),target);
    target.forEach((value,i)=>assert.deepEqual(gains[i+4].gain.calls.at(-1),['ramp',value,11.1]));
  }
  meterEvents.click({stopPropagation(){}});
  assert.deepEqual(gains[2].gain.calls.at(-1),['ramp',0,11.1]);
  meterEvents.click({stopPropagation(){}});
  assert.deepEqual(gains[2].gain.calls.at(-1),['ramp',1,11.1]);
  await innerEvents.pointerdown();
  assert.equal(sources.length,3);
  assert.ok(sources.every(source=>source.startCalls===1 && source.loop));
  assert.ok(Array.from(window.ISOAudioMeter.tracks).every(track=>track.loopCrossfadeSeconds===1));
  assert.equal(window.ISOAudioMeter.error,null);
  console.log('Audio: 1-second fades; head/tail crossfade continues at the seam; all stereo loops start once together; mute and later gestures do not restart them.');
}

verifyEraser(3);
verifyEraser(5);
await verifyAudio();
