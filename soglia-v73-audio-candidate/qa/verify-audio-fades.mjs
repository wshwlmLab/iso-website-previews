import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root=process.argv[2]||'dist';
const window={};
vm.runInNewContext(fs.readFileSync(path.join(root,'loop-audio.js'),'utf8'),{window});
const fade=window.ISOLoopAudio.fade;
const context={currentTime:10};
const near=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-10,`${actual} != ${expected}`);
class Param {
  constructor(value){this.value=value;this.calls=[];}
  cancelAndHoldAtTime(){throw new Error('No consecutive browser hold events');}
  cancelScheduledValues(time){this.calls.push(['cancel',time]);}
  setValueAtTime(value,time){this.calls.push(['set',value,time]);}
  linearRampToValueAtTime(value,time){this.calls.push(['ramp',value,time]);}
  get anchor(){return this.calls.filter(call=>call[0]==='set').at(-1);}
  get end(){return this.calls.filter(call=>call[0]==='ramp').at(-1);}
}

const gain=new Param(0);
fade(context,gain,1,1);
near(gain.anchor[1],0);near(gain.end[2],11);
// The getter deliberately remains 0: interruption must preserve the in-flight
// ramp, even with a stale browser getter. Reverse direction halfway through.
context.currentTime=10.5;fade(context,gain,0,1);
near(gain.anchor[1],.5);near(gain.end[2],11.5);
context.currentTime=10.75;fade(context,gain,1,1);
near(gain.anchor[1],.375);near(gain.end[2],11.75);
context.currentTime=12;fade(context,gain,0,1);
near(gain.anchor[1],1);near(gain.end[2],13);
context.currentTime=12.25;fade(context,gain,.2,0);
assert.deepEqual(gain.calls.at(-1),['set',.2,12.25]);
context.currentTime=12.5;fade(context,gain,1,1);near(gain.anchor[1],.2);

// Rapid updates at one audio-clock time cannot create a level jump. The latest
// requested ramp wins; it must retain its exact one-second endpoint.
context.currentTime=12.75;
for(let n=0;n<3000;n++){fade(context,gain,n%2,1);near(gain.anchor[1],.4);near(gain.end[2],13.75);}
const mute=new Param(1);fade(context,mute,0,1);near(mute.anchor[1],1);
context.currentTime=13.25;fade(context,mute,1,1);near(mute.anchor[1],.5);
near(mute.end[2],14.25);
console.log('Fade continuity: one-second endpoints, rapid reversals, completed ramps, zero duration, stale getters and 3,000 same-clock updates; mute and photo envelopes stay independent.');

const base=path.join(root,'cartoline/soglia-prova/v1');
const manifest=JSON.parse(fs.readFileSync(path.join(base,'manifest.json'),'utf8'));
for(const layer of manifest.layers){
 const actual=fs.readFileSync(path.join(base,layer.audio));
 const flat=fs.readFileSync(path.join(root,'audio',path.basename(layer.audio)));
 assert.equal(createHash('sha256').update(actual).digest('hex'),layer.audioSHA256);
 assert.deepEqual(actual,flat);
}
console.log('Origin comparison: all three local MP3 copies exactly match the hashes of the Cloudflare manifest, including the complete Endless Ascent file.');
