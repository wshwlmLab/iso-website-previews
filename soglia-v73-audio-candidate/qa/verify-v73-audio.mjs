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
  const end=inner.indexOf('Promise.all(PHOTO_SRC.map(load))',begin);
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
  const gains=[];
  class Param {
    constructor(){this.value=1;this.calls=[];}
    setTargetAtTime(value,time,smooth){this.value=value;this.calls.push(['target',value,time,smooth]);}
    cancelAndHoldAtTime(time){this.calls.push(['hold',time]);}
    linearRampToValueAtTime(value,time){this.value=value;this.calls.push(['ramp',value,time]);}
  }
  class Node {
    constructor(){this.gain=new Param();this.connections=[];}
    connect(node){this.connections.push(node);}
    getFloatTimeDomainData(buffer){buffer.fill(0);}
  }
  class AudioContext {
    constructor(){this.state='suspended';this.currentTime=10;this.destination=new Node();}
    createGain(){const g=new Node();gains.push(g);return g;}
    createChannelSplitter(){return new Node();}
    createAnalyser(){return new Node();}
    createMediaElementSource(){return new Node();}
    resume(){this.state='running';return Promise.resolve();}
  }
  const audios=Array.from({length:3},(_,i)=>({dataset:{photoIndex:String(i)},loop:true,paused:true,currentTime:0,readyState:4,playCalls:0,play(){this.paused=false;this.playCalls++;return Promise.resolve()},getAttribute:()=>['audio/river.mp3','audio/endless-ascent.mp3','audio/sciola.mp3'][i]}));
  const frameEvents={},meterEvents={},innerEvents={};
  const docElement={style:{setProperty(){}}};
  const innerDocument={documentElement:docElement,addEventListener:(key,cb)=>innerEvents[key]=cb,querySelectorAll:()=>[]};
  const ratios=[0,0,0];
  const frame={dataset:{source:'soglia-frozen.html'},contentDocument:innerDocument,contentWindow:{__eraseDebug:{visiblePhotoRatios:ratios}},addEventListener:(key,cb)=>frameEvents[key]=cb};
  const meterHit={classList:classList(),setAttribute(){},addEventListener:(key,cb)=>meterEvents[key]=cb};
  const meter={classList:classList()};
  const meterZone={appendChild(){}};
  const document={body:{},getElementById:id=>({soglia:frame,meter,meterHit,meterZone})[id],querySelectorAll:()=>audios,createElement:()=>({className:'',children:[],style:{},appendChild(child){this.children.push(child)}})};
  const window={AudioContext};
  let draw;
  const context=vm.createContext({window,document,console,performance:{now:()=>0},requestAnimationFrame:cb=>{draw=cb},MutationObserver:class{observe(){}},Promise,Float32Array,Float64Array,WeakMap,Math,Array,Number});
  const script=outer.match(/<script>([\s\S]*?)<\/script>/)[1];
  vm.runInContext(script,context);
  assert.equal(frame.src,'soglia-frozen.html');
  assert.equal(gains[1].gain.value,1);
  assert.deepEqual(audios.map(x=>x.playCalls),[0,0,0]);
  frameEvents.load();
  await innerEvents.pointerdown();
  assert.equal(window.ISOAudioMeter.audioState,'running');
  assert.deepEqual(audios.map(x=>x.playCalls),[1,1,1]);
  for(const target of [[.4,0,0],[.65,.25,.1],[.15,.2,.65],[.9,.07,.03],[0,0,0]]){
    ratios.splice(0,3,...target);
    draw((verifyAudio.tick=(verifyAudio.tick||0)+100));
    assert.deepEqual(Array.from(window.ISOAudioMeter.tracks,t=>t.targetVolume),target);
    assert.deepEqual(Array.from(window.ISOAudioMeter.tracks,t=>t.gain),target);
  }
  audios.forEach((a,i)=>a.currentTime=50+i);
  meterEvents.click({stopPropagation(){}});
  assert.deepEqual(gains[2].gain.calls.at(-1),['ramp',0,11]);
  assert.ok(audios.every(a=>!a.paused&&a.loop));
  meterEvents.click({stopPropagation(){}});
  assert.deepEqual(gains[2].gain.calls.at(-1),['ramp',1,11]);
  assert.deepEqual(audios.map(a=>a.currentTime),[50,51,52]);
  assert.deepEqual(audios.map(a=>a.playCalls),[1,1,1]);
  console.log('Audio graph: all 3 loops unlocked together; gains match visible fractions; mute/unmute ramp 1 second; no pause or rewind.');
}

verifyEraser(3);
verifyEraser(5);
await verifyAudio();
