import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html=fs.readFileSync('dist/soglia-frozen.html','utf8');
const nav=html.match(/<nav class="menu">([\s\S]*?)<\/nav>/)[1];
const labels=[...nav.matchAll(/data-label="([^"]+)"/g)].map(match=>match[1]);
const source=html.slice(html.indexOf('// ---------- Soglia click exit:'),html.indexOf('// Corner identity words:'));
const shuffle=html.slice(html.indexOf('function shuffle('),html.indexOf('function intro('));
const settle=()=>new Promise(resolve=>setImmediate(resolve));

function setup({claimed=true,bridgePre=false}={}){
  const motions=[],requests=[],timers=[],hashes=[];
  const words=labels.map(label=>{
    const chars=Array.from(label,(letter,index)=>({
      id:label+':'+index,style:{opacity:'1'},
      animate(keyframes,options){
        let resolve,reject,settled=false;
        const motion={char:this,keyframes,options,
          finished:new Promise((yes,no)=>{resolve=yes;reject=no}),
          finish(){settled=true;resolve();},
          cancel(){if(!settled){settled=true;reject(new Error('Cancelled'));}}
        };
        motions.push(motion);return motion;
      }
    }));
    return {dataset:{label},chars,handlers:{},
      querySelectorAll(){return chars;},
      addEventListener(name,handler){this.handlers[name]=handler;}
    };
  });
  const chars=words.flatMap(word=>word.chars);
  const context=vm.createContext({words,Math,Promise,
    document:{body:{classList:{contains:()=>bridgePre}}},
    getComputedStyle:char=>({opacity:char.style.opacity}),
    window:{dispatchEvent(event){
      requests.push({event,opacityAtRequest:chars.map(char=>char.style.opacity)});
      if(claimed)event.preventDefault();
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
  return {words,chars,motions,requests,timers,hashes,context};
}

async function checkSequence(label,claimed=true){
  const t=setup({claimed});
  const selected=t.words.find(word=>word.dataset.label===label);
  const clicked=selected.handlers.click();
  await settle();
  const others=t.motions.slice();
  assert.equal(others.length,t.chars.length-selected.chars.length);
  assert(others.every(motion=>!selected.chars.includes(motion.char)));
  assert.equal(t.requests.length,0);
  // Further clicks during either phase cannot change the chosen destination.
  await t.words.find(word=>word!==selected).handlers.click();
  assert.equal(t.motions.length,others.length);
  // Complete the other letters out of order, leaving one slow animation.
  const slowOther=others[1];
  others.filter(motion=>motion!==slowOther).reverse().forEach(motion=>motion.finish());
  await settle();
  assert.equal(t.motions.length,others.length);
  assert.equal(t.requests.length,0);
  slowOther.finish();await settle();
  const last=t.motions.slice(others.length);
  assert.equal(last.length,selected.chars.length);
  assert(last.every(motion=>selected.chars.includes(motion.char)));
  await selected.handlers.click();
  assert.equal(t.motions.length,others.length+last.length);
  last.slice(1).reverse().forEach(motion=>motion.finish());await settle();
  assert.equal(t.requests.length,0,'The destination must wait for the final selected letter');
  last[0].finish();await clicked;
  assert.equal(t.requests.length,1);
  assert.equal(t.requests[0].event.type,'iso:navigate-request');
  assert.equal(t.requests[0].event.detail.target,label.toLowerCase());
  assert(t.requests[0].opacityAtRequest.every(opacity=>opacity==='0'));
  if(claimed){
    assert.equal(t.timers.length,0,'A claimed handoff must not redisplay the old page');
    assert.equal(t.hashes.length,0);
  }else{
    assert.equal(t.hashes[0],'#'+label.toLowerCase());
    assert.equal(t.timers.length,1);
    assert.equal(t.timers[0].delay,650);
    t.timers[0].callback();
    assert(t.chars.every(char=>char.style.opacity==='1'));
    const count=t.motions.length;
    const again=selected.handlers.click();await settle();
    assert(t.motions.length>count,'The standalone reset must unlock further clicks');
    t.motions.at(-1).cancel();await again;
  }
}

for(const label of labels)await checkSequence(label);
await checkSequence('BLOG',false);
const intro=setup({bridgePre:true});await intro.words[0].handlers.click();
assert.equal(intro.motions.length,0);assert.equal(intro.requests.length,0);
const interrupted=setup();const pending=interrupted.words[0].handlers.click();
interrupted.motions[0].cancel();await pending;
assert.equal(interrupted.requests.length,0);
assert(interrupted.chars.every(char=>char.style.opacity==='1'));
assert.equal(vm.runInContext('menuClickBusy',interrupted.context),false);
console.log('PASS: four destinations, slow completions, repeated clicks, claimed handoff, standalone reset, intro guard and cancellation');
