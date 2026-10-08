import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read=file=>fs.readFileSync('dist/'+file,'utf8');
const inner=read('soglia-frozen.html');
const outer=read('index.html');
const preparation=inner.slice(inner.indexOf('let prepared=null;'),inner.indexOf("window.addEventListener('resize',()=>{if(imgs.length)size()});"));
const direct=inner.slice(inner.indexOf('// ---------- First visit / direct return'),inner.indexOf('// ---------- End first visit / direct return'));
const resume=inner.slice(inner.indexOf('window.__resumeSogliaThreshold=()=>'),inner.indexOf('const arm=e=>'));
const parentSource=outer.match(/const directEntry = [^;]+;/)[0]+outer.slice(outer.indexOf('function loadFrozenSoglia()'),outer.indexOf('function setMeterMuted(value)'));
const defer=()=>{let resolve;const promise=new Promise(yes=>resolve=yes);return {promise,resolve};};
const settle=async()=>{for(let n=0;n<4;n++)await new Promise(resolve=>setImmediate(resolve));};
const storage=map=>({getItem:key=>map.get(key)||null,setItem:(key,value)=>map.set(key,value)});
const classes=()=>{const set=new Set(['bridge-pre']);return {remove:key=>set.delete(key),contains:key=>set.has(key)};};

function visit(map){
  const imageGate=defer(),audioGate=defer(),fontGate=defer();
  const charElements=Array.from({length:21},()=>({style:{opacity:'0',transform:'translateY(7px)'}}));
  const bridge={style:{}},stage={style:{}},layer={innerHTML:''};
  const body={classList:classes()};
  const fonts=[];fonts.ready=fontGate.promise;
  const childDocument={body,fonts,documentElement:{style:{setProperty(){}}},addEventListener(){},
    querySelectorAll:()=>charElements,getElementById:id=>id==='motionBridge'?bridge:layer};
  const childEvents=new Map(),parentEvents=new Map(),frameEvents=new Map();
  const counts={intro:0,border:0,cursor:0,images:0,audio:0,entered:0,restore:0};
  const config={layers:[1,2,3].map(n=>({image:'image-'+n}))};
  const child={location:{href:'https://test.invalid/soglia-frozen.html'},
    ISOCartolina:{load:async()=>config},
    ISOExperienceLoader:{image(){counts.images++;return imageGate.promise;}},
    __prepareSogliaIntro(){},__startSogliaIntro(){counts.intro++;},
    __resetEraseCursorForThreshold(){counts.cursor++;},
    addEventListener(type,listener){childEvents.set(type,listener);},
    dispatchEvent(event){if(event.type==='iso:soglia-entered')counts.entered++;childEvents.get(event.type)?.(event);}
  };
  const childContext=vm.createContext({window:child,document:childDocument,stage,PHOTO_SRC:[],imgs:[],
    setCartolinaBorder(){},setOpticalFlipAxes(){},size(){},snake(){},
    requestAnimationFrame(){counts.border++;},CustomEvent:class{constructor(type,options){Object.assign(this,{type,...options});}},
    dispersionStarted:false,armed:true,phase:0,animating:false,initialMotionIntroDone:false,initialMotionIntroStarted:false,slowMenuStarted:false,
    advance(){throw new Error('A direct entry must not advance the intro');}
  });
  vm.runInContext(preparation+direct+resume,childContext);
  const frame={dataset:{source:'soglia-frozen.html'},contentWindow:child,contentDocument:childDocument,
    addEventListener:(type,listener)=>frameEvents.set(type,listener),removeEventListener:type=>frameEvents.delete(type)};
  const window={sessionStorage:storage(map),ISOCartolina:{load:async()=>config},
    location:{href:'https://test.invalid/',search:''},addEventListener:(type,listener)=>parentEvents.set(type,listener)};
  const context=vm.createContext({window,document:{fonts:{ready:Promise.resolve()}},frame,URL,performance:{now:()=>0},
    loader:{retry(){},preparing(){},ready(){},fail(error){throw error;}},experienceReady:false,preparationPromise:null,
    record(){},ensureAudioStarted(){},receiveMenuFade(){},
    loadCartolinaAudio(){counts.audio++;return audioGate.promise;},setTimeout:()=>1,clearTimeout(){}});
  vm.runInContext(read('site-visit.js'),context);
  vm.runInContext(parentSource,context);
  const preparing=vm.runInContext('prepareExperience()',context);
  return {window,child,childContext,context,body,bridge,stage,charElements,counts,preparing,
    async load(){await frameEvents.get('load')();await settle();},
    async releaseFonts(){fontGate.resolve();await settle();},
    async releaseImages(){imageGate.resolve({width:420,height:240});await settle();},
    async releaseAudio(){audioGate.resolve();await preparing;await settle();},
    finishIntro(){vm.runInContext('finishSogliaThreshold()',childContext);},
    async back(){parentEvents.get('pageshow')({persisted:true});await settle();}
  };
}

const session=new Map();
const first=visit(session);await first.load();
assert.equal(first.window.ISOSiteVisit.hasEnteredSoglia(),false);
await first.releaseFonts();assert.equal(first.counts.intro,1);
assert(first.body.classList.contains('bridge-pre'));
await first.releaseImages();await first.releaseAudio();
assert.equal(first.window.ISOSiteVisit.hasEnteredSoglia(),false,'Preparation alone must not count as visiting the eraser');
assert(first.body.classList.contains('bridge-pre'),'First visit must retain the complete approved introduction');
first.finishIntro();
assert.equal(first.window.ISOSiteVisit.hasEnteredSoglia(),true);
assert.equal(first.counts.entered,1);
assert(!first.body.classList.contains('bridge-pre'));

// New page instance on the same origin represents both an internal return and
// a reload: the old parent/iframe globals are gone, but the tab's session remains.
const returned=visit(session);await returned.load();await returned.releaseFonts();
assert.equal(returned.counts.intro,0);
assert.equal(returned.stage.style.display,'none');
assert(returned.body.classList.contains('bridge-pre'));
assert(returned.charElements.every(char=>char.style.opacity==='0'));
await returned.releaseImages();
assert(returned.body.classList.contains('bridge-pre'),'Images alone must not enable the eraser while audio prepares');
await returned.releaseAudio();
assert(!returned.body.classList.contains('bridge-pre'));
assert.equal(returned.bridge.style.display,'none');
assert(returned.charElements.every(char=>char.style.opacity==='1'&&char.style.transform==='translateY(0)'));
assert.equal(returned.counts.intro,0);
assert.equal(returned.counts.entered,1);
assert.equal(returned.counts.border,1);
assert.equal(vm.runInContext('phase',returned.childContext),7);
assert.equal(vm.runInContext('armed',returned.childContext),false);
returned.child.__requestSogliaDirectEntry();
assert.equal(returned.counts.entered,1,'Duplicate preparation/return callbacks must not duplicate activation');
assert.equal(returned.counts.border,1);

// A history-cache return reuses the actual prepared child and clears an old
// departure fade, without new image/audio preparation or another introduction.
returned.child.__restoreSogliaMenu=()=>{returned.counts.restore++;returned.charElements.forEach(char=>char.style.opacity='1');};
returned.charElements.forEach(char=>char.style.opacity='0');
await returned.back();
assert.equal(returned.counts.restore,1);
assert(returned.charElements.every(char=>char.style.opacity==='1'));
assert.equal(returned.counts.images,3);assert.equal(returned.counts.audio,1);
assert.equal(returned.counts.intro,0);assert.equal(returned.counts.border,1);

const fresh=visit(new Map());await fresh.load();await fresh.releaseFonts();
assert.equal(fresh.counts.intro,1,'A fresh visit must still show the original intro');
await fresh.releaseImages();await fresh.releaseAudio();
const blocked={};Object.defineProperty(blocked,'sessionStorage',{get(){throw new Error('Storage blocked');}});
vm.runInNewContext(read('site-visit.js'),{window:blocked});
assert.equal(blocked.ISOSiteVisit.hasEnteredSoglia(),false);
blocked.ISOSiteVisit.markSogliaEntered();assert.equal(blocked.ISOSiteVisit.hasEnteredSoglia(),true);
console.log('PASS: original first visit, internal return/reload, full media gate, direct visible menu, idempotent entry, history-cache return, fresh visit and blocked storage fallback');
