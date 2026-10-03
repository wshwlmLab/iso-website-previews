const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const root=require('node:path').resolve(__dirname,'..');
const read=name=>fs.readFileSync(root+'/dist/'+name,'utf8');
const track=JSON.parse(read('trailer-levels/psYBvyeNis0.json'));
const settle=()=>new Promise(resolve=>setTimeout(resolve,15));
const json=value=>JSON.parse(JSON.stringify(value));
class Element{
 constructor(){this.children=[];this.attributes={};this.dataset={};this.listeners={};this.style={};this.classList={add(){},remove(){},toggle(){}};}
 appendChild(child){this.children.push(child);child.parentElement=this;return child;}
 setAttribute(k,v){this.attributes[k]=v;} addEventListener(k,fn){this.listeners[k]=fn;} remove(){this.removed=true;}
 getContext(){return {};}
}
function environment(withAPI=true){
 const players=[],raf=[],volumeFrames=[],nodes=new Map(),body=new Element();let now=0;
 const document={body,head:new Element(),createElement:()=>new Element(),getElementById:id=>{if(!nodes.has(id))nodes.set(id,new Element());return nodes.get(id);},querySelectorAll:()=>[],addEventListener(){}};
 const context={document,console,Uint8Array,Float32Array,WeakMap,Map,Math,Number,Array,Intl,Date,Promise,setTimeout,clearTimeout,setInterval:fn=>{const t=setInterval(fn,100);t.unref();return t;},clearInterval,atob,performance:{now:()=>now},location:{origin:'https://candidate.example'},fetch:async()=>({ok:true,json:async()=>track}),MutationObserver:class{observe(){}},requestAnimationFrame:fn=>{(fn.name==='tick'?volumeFrames:raf).push(fn);return raf.length+volumeFrames.length;},addEventListener(){}};
 context.window=context;
 class Player{
  constructor(host,config){this.config=config;this.time=0;this.duration=track.duration;this.volume=100;this.silent=false;this.playing=false;this.destroyed=false;this.host=host;this.captionTrack={languageCode:'it'};this.captionLoaded=true;this.captionUnloads=0;this.throwCaptionOption=false;players.push(this);}
  ready(){this.config.events.onReady({target:this});}
  getOptions(){return this.captionLoaded?['captions']:[];}
  getOption(){return this.captionTrack;}
  setOption(module,option,value){if(this.throwCaptionOption)throw new Error('Option unavailable');this.captionTrack=value;}
  unloadModule(module){if(module==='captions'&&this.captionLoaded){this.captionLoaded=false;this.captionUnloads++;this.config.events.onApiChange({target:this});}}
  getIframe(){return this.host;} getDuration(){return this.duration;} getCurrentTime(){return this.time;} getPlaybackRate(){return 1;} getVideoLoadedFraction(){return .8;}
  setVolume(x){this.volume=x;} mute(){this.silent=true;} unMute(){this.silent=false;} seekTo(t){this.time=t;}
  playVideo(){this.playing=true;this.emit(1);} pauseVideo(){this.playing=false;this.emit(2);} stopVideo(){this.playing=false;}
  destroy(){this.destroyed=true;this.playing=false;} emit(data){this.config.events.onStateChange({target:this,data});}
 }
 const API={Player,PlayerState:{PLAYING:1,PAUSED:2,BUFFERING:3,ENDED:0}};
 if(withAPI)context.YT=API;
 vm.createContext(context);
 vm.runInContext(read('iso-meter-response.js'),context);
 vm.runInContext(read('works-youtube-levels.js'),context);
 vm.runInContext(read('works-youtube-media.js'),context);
 return {context,players,API,raf,nodes,setNow:x=>{now=x;volumeFrames.splice(0).forEach(fn=>fn(x));}};
}
(async()=>{
 const env=environment();const {context:c,players}=env;
 const source=new c.WorksYouTubeMedia(new Element(),'psYBvyeNis0',{title:'ACAB',audioLevelsUrl:'trailer-levels/psYBvyeNis0.json'});
 source.play();await settle();players[0].ready();
 assert.equal(players[0].config.playerVars.cc_load_policy,0);assert.equal(players[0].config.playerVars.hl,'it');
 assert.equal(players[0].captionLoaded,false);assert.equal(players[0].captionUnloads,1);
 players[0].captionLoaded=true;players[0].captionTrack={languageCode:'it'};players[0].throwCaptionOption=true;players[0].config.events.onApiChange({target:players[0]});assert.equal(players[0].captionLoaded,false,'Unloading works even when track selection is unsupported');assert.equal(players[0].captionUnloads,2,'Caption reload is suppressed without recursive events');players[0].throwCaptionOption=false;
 assert.equal(source.paused,false);assert.equal(players[0].silent,false);assert.equal(players[0].config.playerVars.controls,0);
 assert.equal(players[0].host.attributes.allow,'autoplay; encrypted-media; fullscreen');
 const bytes=Buffer.from(track.samples,'base64');let peak=0;
 for(let frame=1;frame<bytes.length/2;frame++)if(bytes[frame*2]+bytes[frame*2+1]>bytes[peak*2]+bytes[peak*2+1])peak=frame;
 source.currentTime=peak/30;
 const full=json(source.getAudioLevels());assert.ok(full.every(v=>v>.5));
 source.volume=.2;const quiet=json(source.getAudioLevels());assert.ok(quiet.every((v,i)=>v<full[i]-.2));
 source.muted=true;assert.deepEqual(json(source.getAudioLevels()),[0,0]);assert.equal(players[0].silent,false,'mute must preserve sound while the fade starts');
 assert.equal(players[0].volume,20);env.setNow(250);assert.equal(players[0].volume,10);
 env.setNow(500);assert.equal(players[0].volume,0);assert.equal(players[0].silent,true);
 source.muted=false;source.volume=1;assert.equal(players[0].volume,0);env.setNow(1000);assert.equal(players[0].volume,50);env.setNow(1500);assert.equal(players[0].volume,100);assert.equal(players[0].silent,false);
 source.pause();assert.deepEqual(json(source.getAudioLevels()),[0,0]);
 source.play();players[0].emit(3);assert.deepEqual(json(source.getAudioLevels()),[0,0],'Buffering is silent in the meter');
 players[0].emit(1);assert.ok(source.getAudioLevels()[0]>.5);
 players[0].duration=200;source.poll();assert.deepEqual(json(source.getAudioLevels()),[0,0]);assert.equal(source.meterTrack.status,'duration-mismatch');
 players[0].duration=track.duration;source.poll();assert.ok(source.getAudioLevels()[0]>.5);
 const meterCode=read('index.html').match(/<script id="works-official-meter-v1-script">([\s\S]*?)<\/script>/)[1];
 c.WorksTrailerAudio={getMedia:()=>source,setMuted:value=>{source.muted=value;}};
 vm.runInContext(meterCode,c);
 env.setNow(1540);env.raf.find(fn=>fn.name==='draw')(1540);
 assert.ok(c.WorksAudioMeter.getState().values[0]>.2);
 env.nodes.get('meterHit').listeners.click({stopPropagation(){}});
 assert.equal(source.muted,true);assert.equal(c.WorksAudioMeter.getState().muted,true);assert.equal(players[0].silent,false);assert.equal(players[0].volume,100);
 env.setNow(1790);assert.equal(players[0].volume,50);env.setNow(2040);assert.equal(players[0].volume,0);assert.equal(players[0].silent,true);
 env.nodes.get('meterHit').listeners.click({stopPropagation(){}});
 assert.equal(source.muted,false);assert.equal(c.WorksAudioMeter.getState().muted,false);env.setNow(2540);assert.equal(players[0].volume,50);env.setNow(3040);assert.equal(players[0].volume,100);
 source.pause();env.setNow(4000);for(let i=0;i<35;i++){const draws=env.raf.filter(fn=>fn.name==='draw');draws.at(-1)(4000+i*40);}
 assert.ok(c.WorksAudioMeter.getState().values.every(v=>v<.002));
 source.play();players[0].emit(0);assert.equal(players[0].destroyed,true);assert.equal(players[0].playing,false);assert.deepEqual(json(source.getAudioLevels()),[0,0]);
 source.play();await settle();players[1].ready();assert.equal(players[1].time,0);source.destroy();assert.equal(players[1].destroyed,true);assert.equal(players[1].silent,true);
 const late=environment(false);const closed=new late.context.WorksYouTubeMedia(new Element(),'psYBvyeNis0');closed.play();closed.destroy();late.context.YT=late.API;late.context.onYouTubeIframeAPIReady();await settle();assert.equal(late.players.length,0,'Late API readiness cannot play after close');
 const notReady=environment();const early=new notReady.context.WorksYouTubeMedia(new Element(),'psYBvyeNis0');early.play();await settle();early.destroy();notReady.players[0].ready();assert.equal(notReady.players[0].destroyed,true);assert.equal(notReady.players[0].playing,false);
 const unknown=environment();const noTrack=new unknown.context.WorksYouTubeMedia(new Element(),'shdJ9xanVRM');noTrack.play();await settle();unknown.players[0].ready();assert.deepEqual(json(noTrack.getAudioLevels()),[0,0]);assert.equal(unknown.players[0].playing,true,'Unavailable levels never block actual playback');noTrack.destroy();
 const files=fs.readdirSync(root+'/dist/trailer-levels').filter(name=>name.endsWith('.json'));
 const inventory=JSON.parse(read('works-media-inventory.json'));
 assert.equal(files.length,inventory.films.filter(film=>film.trailer.audioLevels).length,'Every linked meter has a measured soundtrack');
 const datasets=Object.fromEntries(files.map(file=>[file,JSON.parse(read('trailer-levels/'+file))]));
 const all=environment();let requests=0;
 all.context.fetch=async url=>{requests++;return {ok:true,json:async()=>datasets[url.split('/').at(-1)]};};
 for(const [file,data] of Object.entries(datasets)){
  const levels=new all.context.WorksYouTubeLevels(data.videoId,'trailer-levels/'+file);await levels.ready;
  assert.equal(levels.status,'ready',file+' data load');
  const bytes=Buffer.from(data.samples,'base64');let peak=0;
  for(let frame=1;frame<bytes.length/2;frame++)if(bytes[frame*2]+bytes[frame*2+1]>bytes[peak*2]+bytes[peak*2+1])peak=frame;
  const time=peak/data.hz;
  for(const duration of [data.duration,data.source.youtubeMetadataDuration].filter(Number.isFinite)){
   const loud=json(levels.read(time,duration,1));assert.ok(loud.every(x=>x>.3),file+' moves for precise and rounded duration');
   const low=json(levels.read(time,duration,.1));assert.ok(low.every((v,i)=>v<loud[i]),file+' volume response');
   assert.deepEqual(json(levels.read(time,duration,0)),[0,0]);
  }
  assert.deepEqual(json(levels.read(time,data.duration+4,1)),[0,0]);assert.equal(levels.status,'duration-mismatch');
  await new all.context.WorksYouTubeLevels(data.videoId,'trailer-levels/'+file).ready;
 }
 assert.equal(requests,files.length,'Only one lightweight dataset fetch per trailer');
 const bundled=environment();let blockedRequests=0,decodes=0;
 bundled.context.fetch=async()=>{blockedRequests++;throw new Error('JSON is blocked');};
 bundled.context.atob=value=>{decodes++;return atob(value);};
 vm.runInContext(read('works-trailer-levels-data.js'),bundled.context);
 assert.equal(decodes,0,'Opening WORKS does not decode every trailer');
 let active,clock=0;
 bundled.context.WorksTrailerAudio={getMedia:()=>active,setMuted:value=>{active.muted=value;}};
 vm.runInContext(meterCode,bundled.context);
 for(const data of Object.values(datasets)){
  active=new bundled.context.WorksYouTubeMedia(new Element(),data.videoId,{audioLevelsUrl:'trailer-levels/'+data.videoId+'.json'});
  active.play();await settle();const player=bundled.players.at(-1);player.duration=data.source.youtubeMetadataDuration||data.duration;player.ready();await active.meterTrack.ready;
  assert.equal(active.meterTrack.status,'ready',data.videoId+' bundle works with blocked JSON');
  const bytes=Buffer.from(data.samples,'base64');let peak=0;
  for(let frame=1;frame<bytes.length/2;frame++)if(bytes[frame*2]+bytes[frame*2+1]>bytes[peak*2]+bytes[peak*2+1])peak=frame;
  active.currentTime=peak/data.hz;
  assert.ok(active.getAudioLevels().every(v=>v>.3),data.videoId+' measured sound reaches the active adapter');
  clock+=40;bundled.setNow(clock);bundled.raf.filter(fn=>fn.name==='draw').at(-1)(clock);
  assert.ok(bundled.context.WorksAudioMeter.getState().values.every(v=>v>.2),data.videoId+' reaches the displayed meter');
  assert.equal(bundled.nodes.get('meter').dataset.audioSource,data.videoId);
  active.destroy();assert.deepEqual(json(active.getAudioLevels()),[0,0]);
  const reopen=new bundled.context.WorksYouTubeLevels(data.videoId,'trailer-levels/'+data.videoId+'.json');await reopen.ready;
 }
 assert.equal(blockedRequests,0,'Every available trailer meter works without a separate JSON request');
 assert.equal(decodes,files.length,'Measurements are decoded once, only when needed');
 const retry=environment();retry.context.fetch=async()=>{throw new Error('Temporary network failure');};
 const failed=new retry.context.WorksYouTubeLevels(track.videoId,'levels.json');await failed.ready;assert.equal(failed.status,'unavailable');
 retry.context.fetch=async()=>({ok:true,json:async()=>track});
 const recovered=new retry.context.WorksYouTubeLevels(track.videoId,'levels.json');await recovered.ready;assert.equal(recovered.status,'ready','A transient failure can recover on reopening');
 console.log('PASS: all '+files.length+' measured datasets, bundled no-network meter for every linked trailer, lazy decoding, rounded durations, cache and network recovery; captions off on readiness and module reload, recursive API event guard, unsupported caption option fallback; measured stereo/volume/seek, duration mismatch guard, pause/buffering/mute/end/close, meter audio toggle, replay, late API/readiness, playback with unavailable measurements');
})().catch(error=>{console.error(error);process.exit(1);});
