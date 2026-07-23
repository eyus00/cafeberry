/**
 * animations.js
 * Scroll-reveal: fades/slides ".rv" elements in once they enter the
 * viewport. Respects prefers-reduced-motion via the CSS side (see
 * css/base/utilities.css), this only toggles the ".in" class.
 */
(function () {
  'use strict';

  const reveals = document.querySelectorAll('.rv');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  reveals.forEach(el => io.observe(el));
})();
