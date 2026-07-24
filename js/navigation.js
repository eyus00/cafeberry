/**
 * navigation.js
 * Sticky navbar scroll state, mobile overlay menu (open/close, Escape,
 * swipe-to-close), and smooth-scroll for on-page anchor links.
 */
(function () {
  'use strict';

  const navbar = document.getElementById('navbar');
  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const menuToggle = document.getElementById('menuToggle');
  const floatingMenuToggle = document.getElementById('floatingMenuToggle');
  const mobileOverlay = document.getElementById('mobileOverlay');
  let touchStartX = 0;
  function setMobile(open){
    if (menuToggle) menuToggle.classList.toggle('active', open);
    if (floatingMenuToggle) floatingMenuToggle.classList.toggle('active', open);
    mobileOverlay.classList.toggle('active', open);
    mobileOverlay.setAttribute('aria-hidden', String(!open));
    if (menuToggle) menuToggle.setAttribute('aria-expanded', String(open));
    if (floatingMenuToggle) floatingMenuToggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) {
      const first = mobileOverlay.querySelector('a');
      if (first) setTimeout(() => first.focus(), 60);
    }
  }
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      setMobile(!mobileOverlay.classList.contains('active'));
      menuToggle.blur();
    });
  }
  if (floatingMenuToggle) {
    floatingMenuToggle.addEventListener('click', () => {
      setMobile(!mobileOverlay.classList.contains('active'));
      floatingMenuToggle.blur();
    });
  }
  window.closeMobile = () => setMobile(false);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileOverlay.classList.contains('active')) setMobile(false);
  });
  mobileOverlay.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, false);
  mobileOverlay.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    if (touchStartX - touchEndX > 50) {
      setMobile(false);
    }
  }, false);

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e){
      const href = this.getAttribute('href');
      if (!href || href === '#') return;
      const t = document.querySelector(href);
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior:'smooth', block:'start' }); }
    });
  });
})();
