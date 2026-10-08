(() => {
  if (window.ISOSiteVisit) return;
  // One visit per browser tab, shared by every page on the site's origin.
  // Deliberately independent of build numbers and cartolina versions.
  const key = 'iso.soglia.entered';
  let entered = false;
  function hasEnteredSoglia() {
    if (!entered) {
      try { entered = window.sessionStorage.getItem(key) === '1'; } catch (_) {}
    }
    return entered;
  }
  function markSogliaEntered() {
    entered = true;
    try { window.sessionStorage.setItem(key, '1'); } catch (_) {}
  }
  window.ISOSiteVisit = Object.freeze({ hasEnteredSoglia, markSogliaEntered });
})();
