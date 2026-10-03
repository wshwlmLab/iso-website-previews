import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';

const root=process.argv[2]||'dist';
const html=fs.readFileSync(path.join(root,'soglia-frozen.html'),'utf8');
const baseline=fs.readFileSync(new URL('./fixtures/eraser-v73-before-performance.js',import.meta.url),'utf8');
const updated=html.slice(html.indexOf('const moduleEl=document.getElementById'),html.indexOf('let prepared=null;'));

function engine(source,layers=3){
  let sineCalls=0,rectReads=0;
  const photo={left:18,top:18,width:394,height:394},module={left:0,top:0,width:430,height:430};
  const classes=()=>({add(){},remove(){},contains(){return false}});
  const drawing=()=>({drawImage(){},putImageData(){},createImageData(w,h){return{data:new Uint8ClampedArray(w*h*4)}},getImageData(x,y,w,h){return this.createImageData(w,h)}});
  const elements={};
  for(const id of ['module','viewport','whiteCover','img1','img2','img3','stone'])elements[id]={style:{},classList:classes(),getContext:drawing,getBoundingClientRect(){rectReads++;return id==='viewport'?photo:module},setPointerCapture(){},releasePointerCapture(){}};
  const math=Object.create(Math);math.sin=value=>{sineCalls++;return Math.sin(value)};
  const context=vm.createContext({document:{getElementById:id=>elements[id],body:{classList:classes()},createElement:()=>({getContext:drawing})},window:{addEventListener(){}},Math:math,Uint8Array,Uint32Array,Float32Array,Uint8ClampedArray,Array,Infinity,requestAnimationFrame:()=>1,cancelAnimationFrame(){}});
  vm.runInContext(source,context);
  vm.runInContext(`imgs=Array.from({length:${layers}},()=>({width:394,height:394}));size();drawing=true;`,context);
  return {
    context,elements,
    execute(code){return vm.runInContext(code,context)},
    frame(points){context.points=points;const before=performance.now();vm.runInContext('pendingPointerPoints=points;flushPointerQueue()',context);return performance.now()-before},
    get sines(){return sineCalls},get rectReads(){return rectReads},
    state(){return JSON.parse(JSON.stringify(vm.runInContext('({white:Array.from(whiteAlive),steps:Array.from(photoStep),photos:Array.from(photoState),counts:Array.from(visiblePhotoCounts),active:activeStep,remaining:whiteRemaining,current:currentTargetReached,cooldowns:Array.from(lastAdvance)})',context)))}
  };
}

for(const layers of [3,5]){
  const before=engine(baseline,layers),after=engine(updated,layers);
  let random=17;
  function next(){random=(random*1664525+1013904223)>>>0;return random/4294967296}
  const frames=[];
  for(let row=0;row<430;row+=22)frames.push([{x:0,y:row},{x:429,y:row},{x:0,y:row+11}]);
  for(let n=0;n<40;n++)frames.push(Array.from({length:8},()=>({x:next()*600-80,y:next()*600-80})));
  for(let frame=0;frame<frames.length;frame++){
    before.frame(frames[frame]);after.frame(frames[frame]);
    const a=before.state(),b=after.state();
    for(const key of Object.keys(a))assert.deepEqual(b[key],a[key],`${layers} layers, frame ${frame}, ${key}`);
  }
  console.log(`Eraser equivalence: ${layers} layers; white, all photo cells, counters, guard decisions, stage and cooldowns identical after ${frames.length} curved/fast/outside frames.`);
}

const before=engine(baseline),after=engine(updated);
const timesBefore=[],timesAfter=[];
const fast=Array.from({length:8},(_,index)=>({x:index%2*429,y:index%2*429}));
for(let n=0;n<16;n++){
  before.execute('size();drawing=true');after.execute('size();drawing=true');
  timesBefore.push(before.frame(fast));timesAfter.push(after.frame(fast));
}
const mean=values=>values.reduce((sum,n)=>sum+n,0)/values.length;
const ratio=after.sines/before.sines;
assert.ok(ratio<.5,'distant cells should avoid most sine calculations');
const pointer={clientX:220,clientY:220,buttons:1,pointerType:'mouse',pointerId:1};
before.elements.module.onpointerdown(pointer);after.elements.module.onpointerdown(pointer);
const oldReads=before.rectReads,newReads=after.rectReads;
const coalesced={...pointer,getCoalescedEvents:()=>Array.from({length:100},(_,n)=>({...pointer,clientX:100+n,clientY:100+n}))};
before.elements.module.onpointermove(coalesced);after.elements.module.onpointermove(coalesced);
assert.equal(before.rectReads-oldReads,100);
assert.equal(after.rectReads-newReads,0,'pointer samples must not force layout reads');
const result={scenario:'eight fast samples in a 430px module (Node VM; not browser frame timing)',before_mean_ms:mean(timesBefore),after_mean_ms:mean(timesAfter),before_sines:before.sines,after_sines:after.sines,sine_reduction_percent:(1-ratio)*100,geometry_reads_per_100_samples:{before:100,after:0}};
console.log(JSON.stringify(result));

// Verify exact square-path positions, including samples around every corner.
let geometryReads=0,writes=0;
const side=95.6,length=side*4;
const pointAt=distance=>{
  geometryReads++;
  const s=((distance%length)+length)%length;
  if(s<side)return{x:2.2+s,y:2.2};
  if(s<side*2)return{x:97.8,y:2.2+s-side};
  if(s<side*3)return{x:97.8-(s-side*2),y:97.8};
  return{x:2.2,y:97.8-(s-side*3)};
};
const context=vm.createContext({document:{getElementById:id=>id==='snakePath'?{getTotalLength:()=>length,getPointAtLength:pointAt}:{appendChild(){},replaceChildren(){}},createElementNS:()=>({setAttribute(){writes++}})},Math,Float64Array,Array,requestAnimationFrame(){}});
const snakeSource=html.slice(html.indexOf("const path=document.getElementById('snakePath')"),html.indexOf('// ---------- erase system'));
vm.runInContext(snakeSource,context);
context.cartolina=JSON.parse(fs.readFileSync(path.join(root,'cartoline/soglia-prova/v1/manifest.json'),'utf8'));
vm.runInContext('setCartolinaBorder(cartolina)',context);
assert.equal(vm.runInContext('glyphs.map(letter=>letter.textContent).join("")',context),'CARTOLINA 1 · ACQUA · PIETRA · RIPETIZIONE · CIELO · '.repeat(6));
assert.ok(vm.runInContext('gap',context)>=length/340,'the longer phrase must not compress the approved letter spacing');
context.cartolina={borderLabel:'Cartolina 2',borderWords:['vento','tracce','notte']};
vm.runInContext('setCartolinaBorder(cartolina)',context);
assert.match(vm.runInContext('glyphs.map(letter=>letter.textContent).join("")',context),/^CARTOLINA 2 · VENTO · TRACCE · NOTTE · /);
for(let n=0;n<1000;n++){
  const s=n/1000*length,expected=pointAt(s);
  context.distance=s;
  const actual=vm.runInContext('snakePoint(distance,snakeP);Array.from(snakeP)',context);
  assert.ok(Math.abs(actual[0]-expected.x)<1e-9&&Math.abs(actual[1]-expected.y)<1e-9);
}
const reads=geometryReads,initialWrites=writes;
vm.runInContext('snake(123456)',context);
assert.equal(geometryReads,reads,'no SVG geometry reads during a frame');
assert.equal(writes-initialWrites,vm.runInContext('glyphs.length',context));
console.log('Border: approved square positions exact; zero SVG geometry queries during a frame; one transform per letter instead of three attribute writes.');
