(() => {
  const meter=document.getElementById('audioMeter');
  const bars=[...meter.querySelectorAll('span')];
  const paths=['audio/river.mp3','audio/endless-ascent.mp3','audio/sciola.mp3'];
  const players=paths.map(src=>{
    const audio=new Audio(src);
    audio.loop=true;
    audio.preload='auto';
    return audio;
  });
  let context,master,analyser,gains;
  let muted=false;
  let fractions=[0,0,0];

  function ramp(param,target,seconds){
    const now=context.currentTime;
    if(param.cancelAndHoldAtTime) param.cancelAndHoldAtTime(now);
    else {param.cancelScheduledValues(now);param.setValueAtTime(param.value,now)}
    param.linearRampToValueAtTime(target,now+seconds);
  }

  function start(){
    if(context){
      context.resume();
      players.forEach(audio=>{if(audio.paused) audio.play().catch(()=>{})});
      return;
    }
    const AudioContext=window.AudioContext||window.webkitAudioContext;
    if(!AudioContext) return;
    context=new AudioContext();
    master=context.createGain();
    analyser=context.createAnalyser();
    analyser.fftSize=2048;
    analyser.smoothingTimeConstant=.75;
    master.gain.value=muted?0:1;
    master.connect(analyser);
    analyser.connect(context.destination);
    gains=players.map((audio,i)=>{
      const source=context.createMediaElementSource(audio);
      const gain=context.createGain();
      gain.gain.value=fractions[i];
      source.connect(gain).connect(master);
      audio.play().catch(()=>{});
      return gain;
    });
    context.resume();
    drawMeter();
  }

  function drawMeter(){
    if(!context) return;
    const data=new Uint8Array(analyser.frequencyBinCount);
    const draw=()=>{
      analyser.getByteFrequencyData(data);
      for(let i=0;i<bars.length;i++){
        const from=Math.floor(2*Math.pow(data.length/3,i/bars.length));
        const to=Math.min(data.length,Math.max(from+1,Math.floor(2*Math.pow(data.length/3,(i+1)/bars.length))));
        let sum=0;
        for(let j=from;j<to;j++) sum+=data[j];
        const amplitude=sum/(to-from)/255;
        const level=muted?.18:Math.max(.18,Math.min(1,amplitude*2.5));
        bars[i].style.transform=`scaleY(${level})`;
        bars[i].style.opacity=muted?'.12':String(.3+level*.7);
      }
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  }

  window.addEventListener('soglia:visibility',e=>{
    fractions=e.detail.fractions.map(v=>Math.max(0,Math.min(1,v)));
    if(!context) return;
    gains.forEach((gain,i)=>{
      gain.gain.setTargetAtTime(fractions[i],context.currentTime,.045);
    });
  });

  document.addEventListener('pointerdown',start,{capture:true});
  document.addEventListener('keydown',start,{capture:true});
  meter.addEventListener('click',()=>{
    start();
    muted=!muted;
    meter.setAttribute('aria-pressed',String(muted));
    meter.setAttribute('aria-label',muted?'Attiva audio':'Disattiva audio');
    if(context) ramp(master.gain,muted?0:1,1);
  });
  window.__sogliaAudio={get fractions(){return fractions},get players(){return players},get muted(){return muted}};
})();
