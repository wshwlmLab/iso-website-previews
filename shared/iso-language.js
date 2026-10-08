/* ISO locale contract: it/en, localStorage iso-language, URL ?lang=it|en. */
(() => {
  'use strict';
  const storageKey = 'iso-language';
  const valid = value => value === 'it' || value === 'en';
  let stored = null;
  try { stored = localStorage.getItem(storageKey); } catch { /* Storage can be unavailable. */ }
  const requested = new URL(location.href).searchParams.get('lang');
  let language = valid(requested) ? requested : valid(stored) ? stored : 'it';
  const listeners = new Set(), bound = new WeakSet();
  const labels = {
    it: { soundOn: 'ATTIVA L’AUDIO', switchTo: 'ENGLISH', mute: 'Disattiva l’audio', unmute: 'Riattiva l’audio', enter: 'Entra nel sito', advance: 'Avanza nella presentazione', switchLabel: 'Switch to English' },
    en: { soundOn: 'SOUND ON', switchTo: 'ITALIANO', mute: 'Mute audio', unmute: 'Unmute audio', enter: 'Enter the site', advance: 'Next installation layer', switchLabel: 'Passa all’italiano' }
  };
  function remember() {
    document.documentElement.lang = language;
    try { localStorage.setItem(storageKey, language); } catch { /* The URL still carries the choice. */ }
  }
  function href(value) {
    const url = new URL(value, document.baseURI); url.searchParams.set('lang', language); return url.href;
  }
  function set(value) {
    if (!valid(value)) throw new Error('Lingua non valida');
    language = value; remember();
    try { history.replaceState(history.state, '', href(location.href)); } catch { /* UI switching remains available. */ }
    listeners.forEach(listener => listener(language));
    window.dispatchEvent(new CustomEvent('iso:languagechange', { detail: { language } }));
  }
  function text(key) { return labels[language][key]; }
  function bindHome(root) {
    if (bound.has(root)) return;
    const prompt = root.querySelector('.audio-label');
    if (!prompt) return;
    bound.add(root);
    let selector = root.querySelector('.home-language');
    if (!selector) {
      selector = document.createElement('button'); selector.className = 'home-language'; selector.type = 'button';
      prompt.after(selector);
    }
    const hit = root.querySelector('.meter-hit'), plus = root.querySelector('.plus'), advance = root.querySelector('.advance');
    const destination = plus?.getAttribute('href');
    function apply() {
      prompt.textContent = text('soundOn'); selector.textContent = text('switchTo');
      selector.lang = language === 'it' ? 'en' : 'it'; selector.setAttribute('aria-label', text('switchLabel'));
      if (hit) hit.setAttribute('aria-label', text(hit.getAttribute('aria-pressed') === 'true' ? 'unmute' : 'mute'));
      if (plus && destination) { plus.href = href(destination); plus.setAttribute('aria-label', text('enter')); }
      if (advance) advance.setAttribute('aria-label', text('advance'));
    }
    selector.addEventListener('click', event => {
      event.stopPropagation(); set(language === 'it' ? 'en' : 'it');
    });
    listeners.add(apply); apply();
  }
  remember();
  window.ISOLanguage = Object.freeze({ storageKey, get: () => language, set, text, href, bindHome,
    subscribe(listener) { listeners.add(listener); listener(language); return () => listeners.delete(listener); }
  });
  document.querySelectorAll('.stage, .scene').forEach(bindHome);
})();
