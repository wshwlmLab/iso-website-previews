/* WORKS candidate: official YouTube trailers behind the existing WORKS controls. */
(()=>{
  let apiPromise;
  function loadAPI(){
    if(window.YT?.Player)return Promise.resolve(window.YT);
    if(apiPromise)return apiPromise;
    apiPromise=new Promise((resolve,reject)=>{
      const previous=window.onYouTubeIframeAPIReady;
      const timeout=setTimeout(()=>reject(new Error('YouTube API timeout')),20000);
      window.onYouTubeIframeAPIReady=()=>{
        clearTimeout(timeout);
        try{previous?.();}catch(e){}
        resolve(window.YT);
      };
      const script=document.createElement('script');
      script.src='https://www.youtube.com/iframe_api';
      script.onerror=()=>{clearTimeout(timeout);reject(new Error('YouTube API unavailable'));};
      document.head.appendChild(script);
    }).catch(error=>{apiPromise=null;throw error;});
    return apiPromise;
  }

  class WorksYouTubeMedia{
    constructor(surface,videoId,handlers={}){
      this.surface=surface;this.videoId=videoId;this.handlers=handlers;
      this.player=null;this.host=null;this.ready=false;this.closed=false;
      this.paused=true;this.ended=false;this.duration=0;this.time=0;this.loadedFraction=0;
      this.level=1;this.silent=false;this.wantPlay=false;this.generation=0;
      this.outputFactor=1;
      this.muteFader=window.ISOMeterResponse.createVolumeFader(value=>{this.outputFactor=value;this.applyAudio();});
      this.pollTimer=0;this.endMaskTimer=0;this.creating=false;
      this.buffering=true;this.sampledAt=performance.now();this.playbackRate=1;
      this.suppressingCaptions=false;
      this.meterTrack=window.WorksYouTubeLevels
        ?new WorksYouTubeLevels(videoId,handlers.audioLevelsUrl)
        :{status:'unavailable',read:()=>[0,0]};
    }
    get readyState(){return this.ready?3:0;}
    get currentTime(){return this.time;}
    set currentTime(seconds){
      this.time=Math.max(0,Number(seconds)||0);
      this.sampledAt=performance.now();
      if(this.ready)this.player.seekTo(this.time,true);
      if(this.host&&(!this.duration||this.time<this.duration-.08))this.host.style.visibility='visible';
      this.cancelEndMask();this.handlers.onTime?.();
    }
    get volume(){return this.level;}
    set volume(value){this.level=Math.max(0,Math.min(1,Number(value)||0));this.applyAudio();}
    get muted(){return this.silent;}
    set muted(value){
      const next=Boolean(value);if(next===this.silent)return;
      this.silent=next;
      if(this.ready)this.muteFader.setMuted(next);
      else this.muteFader.resetMuted(next);
    }
    applyAudio(){
      if(!this.ready||!this.player)return;
      this.player.setVolume(this.level*this.outputFactor*100);
      this.player[this.outputFactor===0?'mute':'unMute']();
    }
    getAudioLevels(){
      if(this.closed||!this.ready||this.paused||this.buffering||this.ended||this.silent)return [0,0];
      const elapsed=Math.max(0,Math.min(.15,(performance.now()-this.sampledAt)/1000));
      return this.meterTrack.read(this.time+elapsed*this.playbackRate,this.duration,this.level*this.outputFactor);
    }
    disableCaptions(player=this.player){
      if(!player||this.closed||this.suppressingCaptions)return;
      this.suppressingCaptions=true;
      try{
        // cc_load_policy=0 alone can still inherit the viewer's YouTube setting.
        // Clear the selected track and unload captions whenever that module loads.
        const modules=player.getOptions?.()||[];
        if(modules.includes('captions')){
          const track=player.getOption?.('captions','track');
          if(track&&Object.keys(track).length)player.setOption?.('captions','track',{});
          else if(track===undefined&&typeof player.unloadModule!=='function')player.setOption?.('captions','track',{});
        }
      }catch(e){}
      // Clearing an unsupported option must never prevent unloading the module.
      try{player.unloadModule?.('captions');}catch(e){}
      finally{this.suppressingCaptions=false;}
    }
    load(){this.ensurePlayer();}
    async ensurePlayer(){
      if(this.closed||this.player||this.creating)return;
      this.creating=true;
      const generation=++this.generation;
      try{
        const YT=await loadAPI();
        if(this.closed||generation!==this.generation)return;
        const host=document.createElement('div');host.className='trailer-youtube-frame';
        this.surface.appendChild(host);this.host=host;
        this.player=new YT.Player(host,{
          width:'100%',height:'100%',videoId:this.videoId,
          playerVars:{controls:0,autoplay:0,enablejsapi:1,disablekb:1,playsinline:1,fs:0,rel:0,cc_load_policy:0,hl:'it',origin:location.origin},
          events:{
            onReady:event=>{
              if(this.closed||generation!==this.generation){try{event.target.destroy();}catch(e){}return;}
              this.ready=true;this.creating=false;
              const iframe=event.target.getIframe();this.host=iframe;
              iframe.classList.add('trailer-youtube-frame');
              iframe.title=`Trailer ${this.handlers.title||''} — YouTube`;iframe.tabIndex=-1;
              iframe.setAttribute('allow','autoplay; encrypted-media; fullscreen');
              iframe.referrerPolicy='strict-origin-when-cross-origin';
              this.disableCaptions(event.target);
              this.applyAudio();
              if(this.time>0)event.target.seekTo(this.time,true);
              this.pollTimer=setInterval(()=>this.poll(),100);
              this.poll();this.handlers.onReady?.();
              if(this.wantPlay)event.target.playVideo();
            },
            onStateChange:event=>{
              if(this.closed||generation!==this.generation)return;
              if(event.data===YT.PlayerState.PLAYING){
                if(!this.wantPlay){event.target.pauseVideo();return;}
                this.paused=false;this.ended=false;this.buffering=false;
                this.disableCaptions(event.target);
                this.host.style.visibility='visible';
                this.handlers.onPlaying?.();this.poll();
              }else if(event.data===YT.PlayerState.PAUSED){
                this.paused=true;this.cancelEndMask();this.handlers.onPause?.();
              }else if(event.data===YT.PlayerState.ENDED){this.finish();}
              else if(event.data===YT.PlayerState.BUFFERING){this.buffering=true;this.cancelEndMask();}
            },
            onApiChange:event=>{
              if(this.closed||generation!==this.generation)return;
              this.disableCaptions(event.target);
            },
            onAutoplayBlocked:()=>{
              if(this.closed||generation!==this.generation)return;
              this.paused=true;this.wantPlay=false;this.cancelEndMask();this.handlers.onBlocked?.();
            },
            onError:event=>{
              if(this.closed||generation!==this.generation)return;
              this.paused=true;this.wantPlay=false;this.releasePlayer();this.handlers.onError?.(event.data);
            }
          }
        });
      }catch(e){
        if(!this.closed&&generation===this.generation){this.creating=false;this.handlers.onError?.(e.message);}
      }
    }
    play(){
      if(this.closed)return Promise.resolve();
      if(this.ended){this.time=0;this.ended=false;}
      this.wantPlay=true;
      if(this.ready)this.player.playVideo();else this.ensurePlayer();
      return Promise.resolve();
    }
    pause(){
      this.wantPlay=false;this.paused=true;this.cancelEndMask();
      if(this.ready)this.player.pauseVideo();
      this.handlers.onPause?.();
    }
    poll(){
      if(!this.ready||this.closed)return;
      try{
        this.duration=this.player.getDuration()||0;
        this.time=this.player.getCurrentTime()||0;
        this.sampledAt=performance.now();this.playbackRate=this.player.getPlaybackRate?.()||1;
        this.loadedFraction=this.player.getVideoLoadedFraction()||0;
        this.handlers.onTime?.();
        // Hide the picture just before the end; let the original audio finish.
        // ENDED then removes the iframe, so YouTube suggestions cannot remain.
        const remaining=this.duration-this.time;
        this.cancelEndMask();
        if(this.wantPlay&&!this.paused&&this.duration>0&&remaining<.7){
          this.endMaskTimer=setTimeout(()=>{
            if(this.wantPlay&&!this.paused&&this.host)this.host.style.visibility='hidden';
          },Math.max(0,(remaining-.08)*1000));
        }
      }catch(e){}
    }
    cancelEndMask(){clearTimeout(this.endMaskTimer);this.endMaskTimer=0;}
    finish(){
      this.time=this.duration;this.paused=true;this.ended=true;this.wantPlay=false;
      this.releasePlayer();this.handlers.onEnded?.();
    }
    releasePlayer(){
      this.cancelEndMask();clearInterval(this.pollTimer);this.pollTimer=0;
      if(this.host)this.host.style.visibility='hidden';
      const player=this.player;
      this.player=null;this.ready=false;this.creating=false;++this.generation;
      this.buffering=true;
      if(player){try{player.mute();player.stopVideo();}catch(e){}try{player.destroy();}catch(e){}}
      this.host?.remove();this.host=null;
    }
    destroy(){this.closed=true;this.wantPlay=false;this.paused=true;this.releasePlayer();this.muteFader.dispose();}
  }
  window.WorksYouTubeMedia=WorksYouTubeMedia;
})();
