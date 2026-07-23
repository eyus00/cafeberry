/**
 * utils.js
 * Small, generic DOM helpers shared across modules.
 * Currently: keyboard activation (Enter/Space) for elements using
 * role="link" with an onclick handler, so they're keyboard-accessible.
 */
(function () {
  'use strict';

  document.querySelectorAll('[role="link"][onclick]').forEach(el => {
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); }
    });
  });
})();
