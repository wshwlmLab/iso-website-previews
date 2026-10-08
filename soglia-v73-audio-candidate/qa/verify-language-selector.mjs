import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const moduleSource=fs.readFileSync('dist/site-language.js','utf8');
const inner=fs.readFileSync('dist/soglia-frozen.html','utf8');
const shuffle=inner.slice(inner.indexOf('function shuffle('),inner.indexOf('function intro('));
const binding=shuffle+inner.slice(inner.indexOf('// ---------- Frame language selector'),inner.indexOf('// ---------- baseline menu'));
const stored=new Map();
function createView({parent,blocked=false}={}){
  const listeners=new Map(),events=[];
  const style=()=>({setProperty(key,value){this[key]=value;}});
  const city={textContent:'ROME, ITALY',children:[],replaceChildren(...children){this.children=children;}};
  const button={style:style(),attributes:{},handlers:{},querySelector:()=>city,setAttribute(key,value){this.attributes[key]=value;},addEventListener(type,handler){this.handlers[type]=handler;}};
  const label={textContent:''};
  const clock={textContent:'20:00',style:{left:'unchanged'}};
  const year={textContent:'2026',style:{left:'unchanged'}};
  const document={documentElement:{lang:'it'},createElement:()=>({style:style()}),getElementById:id=>({languageSwitch:button,languageTarget:label,clock,year})[id]};
  const window={addEventListener(type,listener){if(!listeners.has(type))listeners.set(type,[]);listeners.get(type).push(listener);},dispatchEvent(event){events.push(event);}};
  window.parent=parent||window;
  Object.defineProperty(window,'localStorage',{get(){if(blocked)throw new Error('Storage unavailable');return {getItem:key=>stored.get(key),setItem:(key,value)=>stored.set(key,value)};}});
  const context=vm.createContext({window,document,CustomEvent:class{constructor(type,options){Object.assign(this,{type,...options});}}});
  vm.runInContext(moduleSource,context);
  return {window,document,context,button,label,clock,year,events,emit(type,event){listeners.get(type)?.forEach(listener=>listener(event));}};
}

const parent=createView();
const frame=createView({parent:parent.window});
vm.runInContext(binding,frame.context);
assert.equal(frame.window.ISOSiteLanguage,parent.window.ISOSiteLanguage,'The frame and page must share one choice');
assert.equal(parent.window.ISOSiteLanguage.getLanguage(),'it');
assert.equal(frame.label.textContent,'ENGLISH');
assert.equal(frame.button.attributes['aria-label'],'Passa alla versione inglese');
let stopped=0;
frame.button.handlers.click({stopPropagation(){stopped++;}});
assert.equal(stopped,1);
assert.equal(parent.window.ISOSiteLanguage.getLanguage(),'en');
assert.equal(frame.document.documentElement.lang,'en');
assert.equal(parent.document.documentElement.lang,'en');
assert.equal(frame.label.textContent,'ITALIANO');
assert.equal(frame.button.attributes['aria-label'],'Switch to Italian');
assert.equal(stored.get('iso.language'),'en');
assert.equal(parent.events.length,1);
assert.equal(parent.events[0].type,'iso:language-change');
assert.equal(parent.events[0].detail.language,'en');
assert.equal(frame.clock.textContent,'20:00');assert.equal(frame.year.textContent,'2026');
assert.deepEqual(frame.clock.style,{left:'unchanged'});assert.deepEqual(frame.year.style,{left:'unchanged'});

const reload=createView();
assert.equal(reload.window.ISOSiteLanguage.getLanguage(),'en','A new page must remember the chosen language');
assert.equal(reload.document.documentElement.lang,'en');
for(const code of ['Enter','Space']){
  let stopped=false;
  frame.button.handlers.keydown({code,stopPropagation(){stopped=true;},preventDefault(){throw new Error('Native button activation must remain available');}});
  assert(stopped,'Language keyboard activation must not advance the intro');
}
frame.button.handlers.click({stopPropagation(){}});
assert.equal(frame.label.textContent,'ENGLISH');
assert.equal(parent.window.ISOSiteLanguage.getLanguage(),'it');
assert.equal(parent.events.length,2);
parent.window.ISOSiteLanguage.setLanguage('it');parent.window.ISOSiteLanguage.setLanguage('fr');
assert.equal(parent.events.length,2,'An unchanged/unsupported choice must not repeat the change event');

frame.emit('pagehide',{persisted:true});
parent.window.ISOSiteLanguage.setLanguage('en');
assert.equal(frame.label.textContent,'ITALIANO','History cache must retain the connection to shared language');
frame.emit('pagehide',{persisted:false});
parent.window.ISOSiteLanguage.setLanguage('it');
assert.equal(frame.label.textContent,'ITALIANO','A discarded view must unsubscribe its old controls');
assert.equal(frame.document.documentElement.lang,'en');

const restricted=createView({blocked:true});
assert.equal(restricted.window.ISOSiteLanguage.getLanguage(),'it');
restricted.window.ISOSiteLanguage.toggleLanguage();
assert.equal(restricted.window.ISOSiteLanguage.getLanguage(),'en');
assert.equal(restricted.document.documentElement.lang,'en');
console.log('PASS: default Italian, shared parent/frame choice, English/Italian labels, remembered choice, unchanged clock/year nodes, keyboard isolation, history-cache retention, unsubscribe and blocked-storage fallback');
