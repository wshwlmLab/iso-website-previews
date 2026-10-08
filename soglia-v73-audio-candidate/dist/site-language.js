(() => {
  if (!window.ISOSiteLanguage) {
    let shared;
    try { if (window.parent !== window) shared = window.parent?.ISOSiteLanguage; } catch (_) {}
    if (shared) window.ISOSiteLanguage = shared;
    else {
      const key = 'iso.language';
      let language = 'it';
      try { if (window.localStorage.getItem(key) === 'en') language = 'en'; } catch (_) {}
      const listeners = new Set();
      function setLanguage(next) {
        if ((next !== 'it' && next !== 'en') || next === language) return language;
        language = next;
        try { window.localStorage.setItem(key, language); } catch (_) {}
        listeners.forEach(listener => listener(language));
        window.dispatchEvent(new CustomEvent('iso:language-change', { detail: { language } }));
        return language;
      }
      window.ISOSiteLanguage = Object.freeze({
        getLanguage: () => language,
        setLanguage,
        toggleLanguage: () => setLanguage(language === 'it' ? 'en' : 'it'),
        subscribe(listener) {
          listeners.add(listener);
          listener(language);
          return () => listeners.delete(listener);
        }
      });
    }
  }
  const unsubscribe = window.ISOSiteLanguage.subscribe(language => {
    document.documentElement.lang = language;
  });
  window.addEventListener('pagehide', event => { if (!event.persisted) unsubscribe(); });
})();
