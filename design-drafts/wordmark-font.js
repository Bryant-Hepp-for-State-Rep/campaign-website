/* Shared wordmark-font controller.
   Reads `hep4rep-logo-font` from localStorage and sets three
   CSS custom properties on <html>: --wordmark-font,
   --wordmark-weight, --wordmark-tracking. Listens for
   storage events so cross-document changes (e.g. user picks
   a font on the gallery, the open-iframe drafts re-render)
   propagate live.

   Loaded by each theme draft and by the gallery. The logo
   exploration tool has its own larger control bar that
   manages the same key.
*/
(function () {
  var FONT_KEY = 'hep4rep-logo-font';

  var FONTS = {
    'inter':         { family: '"Inter", sans-serif',                weight: 900, tracking: '-0.04em'  },
    'archivo':       { family: '"Archivo Black", sans-serif',        weight: 400, tracking: '-0.025em' },
    'anton':         { family: '"Anton", sans-serif',                weight: 400, tracking: '-0.02em'  },
    'bricolage':     { family: '"Bricolage Grotesque", sans-serif',  weight: 800, tracking: '-0.03em'  },
    'big-shoulders': { family: '"Big Shoulders Display", sans-serif',weight: 900, tracking: '-0.015em' },
    'bowlby':        { family: '"Bowlby One", sans-serif',           weight: 400, tracking: '-0.015em' },
    'roboto-slab':   { family: '"Roboto Slab", serif',               weight: 900, tracking: '-0.03em'  },
    'fraunces':      { family: '"Fraunces", serif',                  weight: 900, tracking: '-0.03em'  },
    'funnel':        { family: '"Funnel Display", sans-serif',       weight: 900, tracking: '-0.035em' },
    'bungee':        { family: '"Bungee", sans-serif',               weight: 400, tracking: '0.005em' }
  };

  function applyFont(key) {
    var s = document.documentElement.style;
    if (key && FONTS[key]) {
      var f = FONTS[key];
      s.setProperty('--wordmark-font', f.family);
      s.setProperty('--wordmark-weight', f.weight);
      s.setProperty('--wordmark-tracking', f.tracking);
    } else {
      s.removeProperty('--wordmark-font');
      s.removeProperty('--wordmark-weight');
      s.removeProperty('--wordmark-tracking');
    }
  }

  try { applyFont(localStorage.getItem(FONT_KEY)); } catch (e) {}

  window.addEventListener('storage', function (e) {
    if (e.key === FONT_KEY) applyFont(e.newValue);
  });

  // Expose for the gallery control bar / future tooling.
  window.__hepp4repFont = {
    apply: applyFont,
    fonts: FONTS,
    key: FONT_KEY
  };
})();
