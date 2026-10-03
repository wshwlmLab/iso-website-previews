const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const file=process.argv[2]||require('node:path').join(__dirname,'../dist/iso-meter-response.js');
const window={};vm.runInNewContext(fs.readFileSync(file,'utf8'),{window});
const profile=window.ISOMeterResponse;
assert.equal(profile.muteFadeSeconds,.5);assert.equal(profile.unmuteFadeSeconds,1);
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-12,`${a} != ${b}`);
class Param{
 constructor(){this.value=1;this.calls=[];}
 cancelScheduledValues(t){this.calls.push(['cancel',t]);}
 setValueAtTime(v,t){this.calls.push(['set',v,t]);}
 linearRampToValueAtTime(v,t){this.calls.push(['ramp',v,t]);}
}
const context={currentTime:10},gain=new Param();
profile.fadeMuted(context,gain,true);
assert.deepEqual(gain.calls.slice(-2),[['set',1,10],['ramp',0,10.5]]);
context.currentTime=10.25;profile.fadeMuted(context,gain,false);
assert.deepEqual(gain.calls.slice(-2),[['set',.5,10.25],['ramp',1,11.25]]);
const count=gain.calls.length;profile.fadeMuted(context,gain,false);
assert.equal(gain.calls.length,count,'repeated UI synchronization must not prolong a fade');
context.currentTime=10.75;profile.fadeMuted(context,gain,true);
assert.deepEqual(gain.calls.slice(-2),[['set',.75,10.75],['ramp',0,11.25]]);
context.currentTime=11.25;profile.fadeMuted(context,gain,false);
assert.deepEqual(gain.calls.slice(-2),[['set',0,11.25],['ramp',1,12.25]]);
let now=0;const frames=[],output=[];
const remote=profile.createVolumeFader(v=>output.push(v),{clock:()=>now,schedule:cb=>frames.push(cb)});
const tick=t=>{now=t;const queue=frames.splice(0);queue.forEach(cb=>cb());};
remote.setMuted(true);near(output.at(-1),1);
tick(.25);near(output.at(-1),.5);
remote.setMuted(false);near(output.at(-1),.5);
tick(.75);near(output.at(-1),.75);
remote.setMuted(true);near(output.at(-1),.75);
tick(1.25);near(output.at(-1),0);assert.equal(frames.length,0);
remote.setMuted(false);tick(2.25);near(output.at(-1),1);assert.equal(frames.length,0);
remote.setMuted(true);tick(20);near(output.at(-1),0);assert.equal(frames.length,0,'a delayed frame still completes on the clock');
remote.resetMuted(false);near(output.at(-1),1);
remote.setMuted(true);const written=output.length;remote.dispose();tick(21);assert.equal(output.length,written,'closing a player cancels pending volume writes');
console.log('PASS: common 0.5s mute / 1s unmute, continuous reversals, idempotent state, identical iframe envelope, delayed frames and disposal.');
