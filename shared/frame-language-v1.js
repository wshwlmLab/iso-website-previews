/* ISO frame language v1 — load after shared/site-language.js. */
(() => {
  function shuffle(items) {
    items=[...items];
    for(let index=items.length-1;index>0;index--){
      const other=Math.floor(Math.random()*(index+1));
      [items[index],items[other]]=[items[other],items[index]];
    }
    return items;
  }
  function mount() {
    document.querySelectorAll('.location-language').forEach(button=>{
      if(button.dataset.isoLanguageBound==='v1')return;
      const locationName=button.querySelector('.location-name');
      const languageTarget=button.querySelector('.language-target');
      if(!locationName||!languageTarget)return;
      button.dataset.isoLanguageBound='v1';
      const glyphs=[...locationName.textContent].map(letter=>{
        const glyph=document.createElement('span');
        glyph.className='location-letter';
        glyph.textContent=letter;
        return glyph;
      });
      locationName.replaceChildren(...glyphs);
      const letters=glyphs.filter(glyph=>glyph.textContent.trim());
      let exitDuration=0;
      shuffle(letters).forEach((glyph,index)=>{
        const delay=index*72+Math.random()*40;
        glyph.style.setProperty('--location-exit-delay',`${delay}ms`);
        exitDuration=Math.max(exitDuration,delay+190);
      });
      shuffle(letters).forEach((glyph,index)=>{
        glyph.style.setProperty('--location-return-delay',`${index*38+Math.random()*18}ms`);
      });
      button.style.setProperty('--location-exit-duration',`${exitDuration}ms`);
      const unsubscribe=window.ISOSiteLanguage.subscribe(language=>{
        languageTarget.textContent=language==='it'?'ENGLISH':'ITALIANO';
        button.setAttribute('aria-label',language==='it'?'Passa alla versione inglese':'Switch to Italian');
      });
      button.addEventListener('click',event=>{
        event.stopPropagation();
        window.ISOSiteLanguage.toggleLanguage();
      });
      button.addEventListener('keydown',event=>{
        if(event.code==='Space'||event.code==='Enter')event.stopPropagation();
      });
      window.addEventListener('pagehide',event=>{if(!event.persisted)unsubscribe();});
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
  else mount();
})();
