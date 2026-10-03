// Previous frame handshake, from the published v18 candidate.
      function loadFrozenSoglia() {
        return new Promise((resolve, reject) => {
          const source = new URL(frame.dataset.source + window.location.search, window.location.href);
          source.searchParams.set('build', '20261003-preload');
          const sourceURL = source.href;
          const timeout = setTimeout(() => finish(new Error('Pagina non disponibile')), 45000);
          function finish(error) {
            clearTimeout(timeout);
            frame.removeEventListener('load', loaded);
            if (error) reject(error); else resolve();
          }
          async function loaded() {
            try {
              if (frame.contentWindow.location.href !== sourceURL) return;
              const child = frame.contentWindow;
              if (typeof child.__prepareFrozenSoglia !== 'function' || typeof child.__startSogliaExperience !== 'function') {
                throw new Error('Pagina non disponibile');
              }
              frame.contentDocument.documentElement.style.setProperty('--frame-side', '1vw');
              frame.contentDocument.addEventListener('pointerdown', ensureAudioStarted, { capture: true });
              await child.__prepareFrozenSoglia();
              finish();
            } catch (error) { finish(error); }
          }
          frame.addEventListener('load', loaded);
          frame.src = sourceURL;
        });
      }

