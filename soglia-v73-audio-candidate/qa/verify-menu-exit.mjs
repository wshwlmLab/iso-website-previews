import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html=fs.readFileSync('dist/soglia-frozen.html','utf8');
const nav=html.match(/<nav class="menu">([\s\S]*?)<\/nav>/)[1];
const labels=[...nav.matchAll(/data-label="([^"]+)"/g)].map(match=>match[1]);
const source=html.slice(html.indexOf('// Menu words: exact temporary hover state.'),html.indexOf('// Corner identity words:'));
const shuffle=html.slice(html.indexOf('function shuffle('),html.indexOf('function intro('));
const settle=()=>new Promise(resolve=>setImmediate(resolve));
const near=(actual,expected,message)=>assert.ok(Math.abs(actual-expected)<1e-9,message||`${actual} != ${expected}`);
const classes=(...initial)=>{
  const values=new Set(initial);
  return {contains:key=>values.has(key),add:(...keys)=>keys.forEach(key=>values.add(key)),remove:(...keys)=>keys.forEach(key=>values.delete(key))};
};

function setup({claimed=true,bridgePre=false}={}){
  const motions=[],requests=[],audio=[],timers=[],hashes=[];
  const timeline={currentTime:100};
  function element(id,kind,opacity='1'){
    return {id,kind,style:{opacity},classList:classes(),handlers:{},
      animate(keyframes,options){
        let resolve,reject,settled=false;
        const motion={element:this,keyframes,options,startTime:null,
          finished:new Promise((yes,no)=>{resolve=yes;reject=no}),
          finish(){
            timeline.currentTime=Math.max(timeline.currentTime,this.startTime+(options.delay||0)+options.duration);
            settled=true;resolve();
          },
          cancel(){if(!settled){settled=true;reject(new Error('Cancelled'));}}
        };
        motions.push(motion);return motion;
      },
      addEventListener(name,handler){this.handlers[name]=handler;}
    };
  }
  const postcard=element('postcard','postcard');
  const words=labels.map(label=>{
    const chars=Array.from(label,(_letter,index)=>element(label+':'+index,'char'));
    const dot=element(label+':dot','dot','.7');
    return {...element(label,'word'),dataset:{label},chars,dot,
      querySelectorAll(){return chars;},querySelector(){return dot;}
    };
  });
  const chars=words.flatMap(word=>word.chars);
  const body={classList:classes(...(bridgePre?['bridge-pre']:[]))};
  const context=vm.createContext({words,Math,Promise,
    document:{body,timeline,getElementById:()=>postcard},
    performance:{timeOrigin:100000},
    getComputedStyle:element=>({opacity:element.style.opacity}),
    window:{dispatchEvent(event){
      if(event.type==='iso:menu-fade')audio.push(event);
      else{
        requests.push({event,opacityAtRequest:chars.map(char=>char.style.opacity),postcardOpacity:postcard.style.opacity,dotOpacity:words.map(word=>word.dot.style.opacity)});
        if(claimed)event.preventDefault();
      }
      return !event.defaultPrevented;
    }},
    CustomEvent:class{
      constructor(type,{detail,cancelable}){Object.assign(this,{type,detail,cancelable,defaultPrevented:false});}
      preventDefault(){if(this.cancelable)this.defaultPrevented=true;}
    },
    history:{replaceState(_state,_unused,hash){hashes.push(hash);}},
    setTimeout(callback,delay){timers.push({callback,delay});}
  });
  vm.runInContext(shuffle+source,context);
  return {words,chars,motions,requests,audio,timers,hashes,context,postcard,body,timeline};
}

async function checkSequence(label,claimed=true){
  const t=setup({claimed});
  const selected=t.words.find(word=>word.dataset.label===label);
  selected.handlers.pointerenter();
  assert(selected.classList.contains('is-hovered'));
  const clicked=selected.handlers.click();
  await settle();
  assert(!selected.classList.contains('is-hovered'),'Click immediately removes the upside-down hover state');
  assert(selected.classList.contains('is-clicked'));
  assert(t.body.classList.contains('menu-is-exiting'));
  assert.equal(selected.dot.style.opacity,'.7','The clicked dot stays visible even when hover is lost');
  const postcardFade=t.motions.find(motion=>motion.element===t.postcard);
  const others=t.motions.filter(motion=>motion.element.kind==='char');
  assert.equal(others.length,t.chars.length-selected.chars.length);
  assert(others.every(motion=>!selected.chars.includes(motion.element)));
  assert(others.every(motion=>motion.startTime===postcardFade.startTime));
  assert.equal(t.audio.length,1);
  assert.equal(t.audio[0].detail.level,0);
  near(t.audio[0].detail.deadline,100000+postcardFade.startTime+postcardFade.options.duration);
  assert.equal(t.requests.length,0);
  const untouched=t.words.find(word=>word!==selected);
  untouched.handlers.pointerenter();
  assert(!untouched.classList.contains('is-hovered'),'Hover cannot flip another word during departure');
  await untouched.handlers.click();
  assert.equal(t.motions.length,others.length+1);
  assert.equal(t.audio.length,1,'Repeated clicks must not reschedule the audio envelope');
  const slowOther=others[1];
  others.filter(motion=>motion!==slowOther).reverse().forEach(motion=>motion.finish());
  await settle();
  assert.equal(t.motions.length,others.length+1);
  assert.equal(t.requests.length,0);
  slowOther.finish();await settle();
  const last=t.motions.filter(motion=>selected.chars.includes(motion.element));
  const dotFade=t.motions.find(motion=>motion.element===selected.dot);
  assert.equal(last.length,selected.chars.length);
  assert(dotFade,'The dot starts fading only when the selected word exits');
  const otherEnd=Math.max(...others.map(motion=>motion.startTime+motion.options.delay+motion.options.duration));
  assert(last.every(motion=>Math.abs(motion.startTime-otherEnd)<1e-9));
  const finalEnd=Math.max(...last.map(motion=>motion.startTime+motion.options.delay+motion.options.duration));
  near(dotFade.startTime+dotFade.options.duration,finalEnd);
  near(postcardFade.startTime+postcardFade.options.duration,finalEnd);
  near(t.audio[0].detail.deadline,100000+finalEnd,'Audio and postcard finish at the final selected letter');
  const count=t.motions.length;
  await selected.handlers.click();assert.equal(t.motions.length,count);
  dotFade.finish();postcardFade.finish();
  last.slice(1).reverse().forEach(motion=>motion.finish());await settle();
  assert.equal(t.requests.length,0,'The destination must wait for the final selected letter');
  last[0].finish();await clicked;
  assert.equal(t.requests.length,1);
  assert.equal(t.requests[0].event.type,'iso:navigate-request');
  assert.equal(t.requests[0].event.detail.target,label.toLowerCase());
  assert(t.requests[0].opacityAtRequest.every(opacity=>opacity==='0'));
  assert.equal(t.requests[0].postcardOpacity,'0');
  assert.equal(selected.dot.style.opacity,'0');
  assert.equal(t.audio.at(-1).detail.level,0);
  assert.equal(t.audio.at(-1).detail.deadline,100000+t.timeline.currentTime);
  if(claimed){
    assert.equal(t.timers.length,0,'A claimed handoff must not redisplay the old page');
    assert.equal(t.hashes.length,0);
  }else{
    assert.equal(t.hashes[0],'#'+label.toLowerCase());
    assert.equal(t.timers.length,1);assert.equal(t.timers[0].delay,650);
    t.timers[0].callback();
    assert(t.chars.every(char=>char.style.opacity==='1'));
    assert.equal(t.postcard.style.opacity,'1');
    assert.equal(t.audio.at(-1).detail.level,1);
    assert.equal(t.audio.at(-1).detail.deadline,100000+t.timeline.currentTime+220);
    assert(!t.body.classList.contains('menu-is-exiting'));
    assert(!selected.classList.contains('is-clicked'));
    const again=selected.handlers.click();await settle();
    assert(t.motions.length>count,'The standalone reset must unlock further clicks');
    t.motions.findLast(motion=>motion.element.kind==='char').cancel();await again;
  }
}

for(const label of labels)await checkSequence(label);
await checkSequence('BLOG',false);
const intro=setup({bridgePre:true});await intro.words[0].handlers.click();
assert.equal(intro.motions.length,0);assert.equal(intro.requests.length,0);assert.equal(intro.audio.length,0);
const interrupted=setup();const pending=interrupted.words[0].handlers.click();
interrupted.motions.find(motion=>motion.element.kind==='char').cancel();await pending;
assert.equal(interrupted.requests.length,0);
assert(interrupted.chars.every(char=>char.style.opacity==='1'));
assert.equal(interrupted.postcard.style.opacity,'1');
assert.equal(interrupted.audio.at(-1).detail.level,1);
assert.equal(vm.runInContext('menuClickBusy',interrupted.context),false);
console.log('PASS: upright click, hover lock, four destinations, exact shared postcard/audio/last-letter deadline, selected dot fade, repeated clicks, handoff, reset, intro guard and cancellation');
