(() => {
  'use strict';
  const root=document.documentElement;
  const toggle=document.getElementById('mobileToggle');
  const panel=document.getElementById('mobileMenu');
  const links=[...panel.querySelectorAll('a[data-target]')];
  const headline=document.getElementById('mobileHeadline');
  const frame=document.getElementById('soglia');
  const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const firstVisit=!window.ISOSiteVisit.hasEnteredSoglia();
  let open=false;
  let introFinished=reduceMotion.matches;
  let mediaReady=false;
  let navigating=false;
  const entranceAnimations=[];
  if(!reduceMotion.matches)headline.style.visibility='hidden';

  function revealPostcard(){
    document.body.classList.toggle('mobile-media-ready',introFinished&&mediaReady);
    frame.inert=!(introFinished&&mediaReady);
    frame.setAttribute('aria-busy',String(!mediaReady));
  }
  revealPostcard();

  function setMenuOpen(next,{focus=true}={}){
    open=Boolean(next);
    toggle.setAttribute('aria-expanded',String(open));
    toggle.setAttribute('aria-label',open?'Chiudi il menu':'Apri il menu');
    panel.setAttribute('aria-hidden',String(!open));
    panel.inert=!open;
    panel.classList.toggle('is-open',open);
    root.classList.toggle('mobile-menu-open',open);
    document.getElementById('mobileContent').inert=open;
    if(focus)(open?links[0]:toggle).focus({preventScroll:true});
  }
  toggle.addEventListener('click',()=>setMenuOpen(!open));
  document.getElementById('mobileLogo').addEventListener('click',()=>setMenuOpen(false,{focus:false}));
  document.addEventListener('keydown',event=>{
    if(!open)return;
    if(event.key==='Escape'){event.preventDefault();setMenuOpen(false);return;}
    if(event.key!=='Tab')return;
    const focusable=[document.getElementById('mobileLogo'),toggle,...links,document.getElementById('meterHit')];
    const at=focusable.indexOf(document.activeElement);
    if(event.shiftKey&&(at===0||at===-1)){
      event.preventDefault();focusable.at(-1).focus();
    }else if(!event.shiftKey&&(at===focusable.length-1||at===-1)){
      event.preventDefault();focusable[0].focus();
    }
  });

  // Mobile changes are applied only to this page's private iframe document.
  // index.html, the desktop stylesheet and the approved eraser source stay intact.
  window.ISOSogliaMobile={
    configureFrame(child){
      const doc=child.document;
      const style=doc.createElement('style');
      style.id='iso-mobile-eraser-layout';
      style.textContent=`
        :root{--frame-top:0px;--frame-side:0px}
        html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#fff}
        .stage{width:100%;height:100%;min-height:0;background:#fff}
        .paper{inset:0;background:#fff}
        .identity,.micro,.menu,#motionBridge{display:none!important}
        .photo-module{left:0;right:auto;top:0;width:100%;height:100%;aspect-ratio:1;touch-action:none}
        .viewport{inset:18px}
        .stone{--cursor-size:44px}
      `;
      doc.head.appendChild(style);
      // The iframe has a square, stable height: address-bar changes and page
      // scrolling never resize or reset the approved pixel engine.
      child.addEventListener('iso:soglia-entered',()=>{
        mediaReady=true;
        revealPostcard();
      });
    },
    get menuOpen(){return open;},
    get ready(){return introFinished&&mediaReady;},
    get firstVisit(){return firstVisit;},
    closeMenu(){setMenuOpen(false,{focus:false});}
  };

  async function formHeadline(){
    try{
      if(document.fonts)await document.fonts.ready;
      if(reduceMotion.matches)return;
      const glyphs=[];
      for(const line of headline.querySelectorAll('.mobile-line')){
        const text=line.textContent;
        line.replaceChildren(...[...text].map(letter=>{
          const span=document.createElement('span');
          span.className='mobile-letter';span.textContent=letter;
          if(letter.trim())glyphs.push(span);
          return span;
        }));
      }
      // Match the approved Soglia letter entrance: random fades in place.
      // A fresh document has a brief fade; history restoration stays still.
      glyphs.forEach(glyph=>{
        const animation=glyph.animate([{opacity:0},{opacity:1}],{
          duration:260,delay:Math.floor(Math.random()*980),
          easing:'cubic-bezier(.2,.7,.2,1)',fill:'both'
        });
        entranceAnimations.push(animation);
      });
      headline.style.visibility='visible';
      await Promise.all(entranceAnimations.map(animation=>animation.finished.catch(()=>{})));
    }catch(error){
      window.__mobileIntroError=error.message;
    }finally{
      entranceAnimations.forEach(animation=>animation.cancel());
      headline.style.visibility='visible';
      introFinished=true;
      revealPostcard();
    }
  }
  formHeadline();

  links.forEach(link=>link.addEventListener('click',async event=>{
    event.preventDefault();
    if(navigating)return;
    const target=link.dataset.target;
    const unhandled=window.dispatchEvent(new CustomEvent('iso:navigate-request',{
      detail:{target,href:link.href,source:'soglia-mobile'},cancelable:true
    }));
    if(!unhandled)return;
    navigating=true;
    const fadeSeconds=reduceMotion.matches?0:.35;
    frame.contentWindow?.dispatchEvent(new CustomEvent('iso:menu-fade',{
      detail:{level:0,deadline:performance.timeOrigin+performance.now()+fadeSeconds*1000}
    }));
    const fade=panel.animate([{opacity:1},{opacity:0}],{duration:fadeSeconds*1000,fill:'forwards'});
    await fade.finished.catch(()=>{});
    window.location.assign(link.href);
  }));

  window.addEventListener('pageshow',event=>{
    if(!event.persisted)return;
    navigating=false;
    panel.getAnimations().forEach(animation=>animation.cancel());
    setMenuOpen(false,{focus:false});
    frame.contentWindow?.dispatchEvent(new CustomEvent('iso:menu-fade',{
      detail:{level:1,deadline:performance.timeOrigin+performance.now()+220}
    }));
  });
})();
