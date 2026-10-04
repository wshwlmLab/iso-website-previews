/* The custom circle cursor was withdrawn on 2026-10-04.
 * Compatibility entry point for old imports. Leave native browser cursors alone.
 */
(() => {
  'use strict';
  if (typeof window.ISOCursor?.destroy === 'function') window.ISOCursor.destroy();
  const restore = (doc = document) => {
    doc.documentElement?.removeAttribute('data-iso-cursor-mode');
    doc.querySelectorAll('[data-iso-cursor-dot],[data-iso-cursor-style]').forEach(node => node.remove());
  };
  restore();
  window.ISOCursor = Object.freeze({version: '2.0-native', mode: 'native', install: restore, refresh: restore, destroy: restore});
})();
