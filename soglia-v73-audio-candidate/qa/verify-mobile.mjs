import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';

const source=fs.readFileSync('dist/soglia-mobile.js','utf8');
const desktop=fs.readFileSync('dist/index.html','utf8');
const mobile=fs.readFileSync('dist/mobile.html','utf8');
const inline=s=>[...s.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)[1];
const expected=inline(desktop)
  .replace('const directEntry = window.ISOSiteVisit.hasEnteredSoglia();','const directEntry = true; // Mobile has its own headline; prepare only the shared eraser.')
  .replace("source.searchParams.set('build', '20261009-city-case');","source.searchParams.set('build', '20261012-mobile2');")
  .replace("frame.contentDocument.documentElement.style.setProperty('--frame-side', '1vw');",'window.ISOSogliaMobile.configureFrame(child);')
  .replace('for (let index = 0; index < 16; index++)','for (let index = 0; index < 20; index++)')
  .replace('const exact = meterValues[columnIndex] * 16;','const exact = meterValues[columnIndex] * 20;');
assert.equal(inline(mobile),expected,'The mobile player must retain the approved audio and meter engine');
const mobileFiles=new Set(['dist/mobile.html','dist/soglia-mobile-layout.css','dist/soglia-mobile.js','MOBILE-TRIAL-2026-10-12.md','qa/verify-mobile.mjs']);
for(const name of execFileSync('git',['ls-files'],{encoding:'utf8'}).trim().split('\n')){
  if(mobileFiles.has(name))continue;
  const current=fs.readFileSync(name);
  const previous=execFileSync('git',['show','HEAD:'+name],{maxBuffer:64*1024*1024});
  assert.ok(current.equals(previous),'Existing source changed: '+name);
}

const settle=()=>new Promise(resolve=>setImmediate(resolve));
async function checkController({entered=false,reduced=false}={}){
  const listeners={};const childListeners={};const animations=[];const locations=[];
  const doc={activeElement:null};
  function element(){
    const classes=new Set();
    return {style:{},attributes:{},handlers:{},inert:false,textContent:'',children:[],
      classList:{toggle(key,on){on?classes.add(key):classes.delete(key);},contains:key=>classes.has(key)},
      setAttribute(key,value){this.attributes[key]=value;},
      addEventListener(key,fn){this.handlers[key]=fn;},
      focus(){doc.activeElement=this;},
      replaceChildren(...nodes){this.children=nodes;},
      getBoundingClientRect(){return {left:20,right:40,top:100,bottom:135};},
      animate(keyframes,options){let finish;const animation={keyframes,options,finished:new Promise(resolve=>finish=resolve),cancel(){this.cancelled=true;},finish(){finish();}};animations.push(animation);return animation;},
      getAnimations:()=>animations
    };
  }
  const nodes=Object.fromEntries(['mobileToggle','mobileLogo','mobileMenu','mobileHeadline','soglia','mobileContent','meterHit'].map(id=>[id,element()]));
  nodes.mobileMenu.inert=true;
  const links=['film','fragment','blog','about'].map(target=>Object.assign(element(),{dataset:{target},href:'https://example.invalid/'+target}));
  nodes.mobileMenu.querySelectorAll=()=>links;
  const lines=['NEL SUONO','NASCONO RELAZIONI,','IMMAGINI, SPAZI,','STORIE','CHE CREANO FORME.'].map(text=>Object.assign(element(),{textContent:text}));
  nodes.mobileHeadline.querySelectorAll=()=>lines;
  const child={document:{head:{appendChild(style){assert.ok(style.textContent.includes('.photo-module'));}},createElement:()=>element()},addEventListener:(key,fn)=>childListeners[key]=fn,dispatchEvent:()=>true};
  nodes.soglia.contentWindow=child;
  doc.documentElement=element();doc.body=element();
  doc.getElementById=id=>nodes[id];doc.createElement=()=>element();
  doc.addEventListener=(key,fn)=>listeners[key]=fn;
  doc.fonts={ready:Promise.resolve()};
  const win={innerWidth:390,innerHeight:740,matchMedia:()=>({matches:reduced}),ISOSiteVisit:{hasEnteredSoglia:()=>entered},addEventListener:(key,fn)=>listeners[key]=fn,dispatchEvent:()=>true,location:{assign:url=>locations.push(url)}};
  vm.runInNewContext(source,{window:win,document:doc,performance:{timeOrigin:10000,now:()=>0},CustomEvent:class{constructor(type,options){this.type=type;Object.assign(this,options);}},Promise,Math});
  assert.equal(nodes.soglia.inert,true,'Assets must be ready before touch is enabled');
  win.ISOSogliaMobile.configureFrame(child);
  childListeners['iso:soglia-entered']();
  assert.equal(win.ISOSogliaMobile.ready,reduced,'The entry fade must finish before touch is enabled');
  await settle();
  if(!reduced){
    assert.ok(animations.length>50,'Every non-space letter must enter');
    assert.ok(animations.every(a=>a.keyframes.every(f=>Object.keys(f).every(k=>k==='opacity'))),'Headline letters must only fade in place');
    assert.equal(nodes.soglia.inert,true);
    animations.forEach(a=>a.finish());await settle();
  }else assert.equal(animations.length,0,'Reduced motion must keep the phrase still');
  assert.equal(win.ISOSogliaMobile.ready,true);assert.equal(nodes.soglia.inert,false);
  assert.equal(doc.body.classList.contains('mobile-media-ready'),true);
  for(let i=0;i<12;i++)nodes.mobileToggle.handlers.click();
  assert.equal(win.ISOSogliaMobile.menuOpen,false,'Rapid reversals must finish closed');
  nodes.mobileToggle.handlers.click();
  assert.equal(nodes.mobileToggle.attributes['aria-expanded'],'true');
  assert.equal(nodes.mobileMenu.inert,false);assert.equal(nodes.mobileContent.inert,true);
  assert.equal(doc.activeElement,links[0]);
  doc.activeElement=nodes.meterHit;
  let prevented=false;listeners.keydown({key:'Tab',shiftKey:false,preventDefault(){prevented=true;}});
  assert.equal(prevented,true);assert.equal(doc.activeElement,nodes.mobileLogo);
  listeners.keydown({key:'Escape',preventDefault(){}});
  assert.equal(win.ISOSogliaMobile.menuOpen,false);assert.equal(nodes.mobileMenu.inert,true);
  assert.equal(nodes.mobileContent.inert,false);assert.equal(doc.activeElement,nodes.mobileToggle);
  const animationCount=animations.length;
  nodes.mobileToggle.handlers.click();listeners.pageshow({persisted:true});
  assert.equal(animations.length,animationCount,'History restoration must not repeat the letter entrance');
  assert.equal(win.ISOSogliaMobile.menuOpen,false,'History return must close the modal menu');
  assert.equal(nodes.mobileHeadline.style.visibility,'visible');
}
await checkController();await checkController({entered:true});await checkController({reduced:true});

// Exercise the unchanged engine with actual touch event conventions and
// phone-sized viewports, including rapid sweeps and several complete cycles.
const eraser=fs.readFileSync('dist/soglia-frozen.html','utf8');
for(const width of [284,354])for(const layers of [3,5]){
  const canvasContext=()=>({drawImage(){},putImageData(){},getImageData(x,y,w,h){return this.createImageData(w,h);},createImageData(w,h){return {data:new Uint8ClampedArray(w*h*4)};}});
  const noopList={add(){},remove(){},contains(){return false;},toggle(){}};
  const rect=id=>id==='viewport'?{left:18,top:18,width:width-36,height:width-36}:{left:0,top:0,width,height:width};
  const elements={};
  for(const id of ['module','viewport','whiteCover','img1','img2','img3','stone'])elements[id]={style:{},classList:noopList,getBoundingClientRect:()=>rect(id),getContext:()=>canvasContext(),setPointerCapture(){},releasePointerCapture(){}};
  const doc={getElementById:id=>elements[id],body:{classList:noopList},createElement:()=>({getContext:()=>canvasContext()})};
  const win={addEventListener(){}};
  const context=vm.createContext({document:doc,window:win,requestAnimationFrame:()=>1,cancelAnimationFrame(){},Uint8Array,Uint32Array,Float32Array,Uint8ClampedArray,Math,Infinity,Array});
  vm.runInContext(eraser.slice(eraser.indexOf('const moduleEl=document.getElementById'),eraser.indexOf('let prepared=null;')),context);
  vm.runInContext(`imgs=Array.from({length:${layers}},()=>({width:600,height:600}));size();`,context);
  const event=(x,y,buttons=1)=>({clientX:x,clientY:y,buttons,pointerId:7,pointerType:'touch'});
  function pass(){
    elements.module.onpointerdown(event(0,0));vm.runInContext('flushPointerQueue()',context);
    for(let y=0;y<width;y+=13){
      for(const x of y%26===0?[0,width-1]:[width-1,0]){
        elements.module.onpointermove(event(x,y));vm.runInContext('flushPointerQueue()',context);
      }
    }
    elements.module.onpointerup(event(0,width-1,0));
  }
  for(let i=0;i<65&&win.__eraseDebug.loopCount<3;i++)pass();
  assert.ok(win.__eraseDebug.loopCount>=3,`Touch loop stalled at ${width}px / ${layers} layers`);
  assert.ok(win.__eraseDebug.visiblePhotoRatios.reduce((a,b)=>a+b,0)<=1+1e-9);
  console.log(`Touch eraser: ${width}px, ${layers} layers, ${win.__eraseDebug.loopCount} full cycles.`);
}
console.log('PASS: isolated desktop, reused player/meter, media + letter gate, repeated menu toggles, focus, Escape, history return, reduced motion, and touch loops.');
