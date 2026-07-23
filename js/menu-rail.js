/**
 * menu-rail.js
 * Tracks which menu category is in view and highlights the matching
 * link in both the sticky desktop rail and the horizontal mobile rail,
 * including the sliding indicator bar on desktop.
 */
(function () {
  'use strict';

  const blocks = document.querySelectorAll('.menu-block');
  const railLinks = document.querySelectorAll('.rail-link');
  const mobileLinks = document.querySelectorAll('#railMobile a');
  const indicator = document.getElementById('railIndicator');
  const rail = document.getElementById('rail');

  function setActive(id){
    railLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#'+id));
    mobileLinks.forEach(l => {
      const active = l.getAttribute('href') === '#'+id;
      l.classList.toggle('active', active);
      if (active) {
        const rail = document.getElementById('railMobile');
        const rect = l.getBoundingClientRect();
        const railRect = rail.getBoundingClientRect();
        const centerOffset = (railRect.width - rect.width) / 2;
        const targetScroll = l.offsetLeft - centerOffset;
        rail.scrollTo({left: Math.max(0, Math.min(targetScroll, rail.scrollWidth - rail.clientWidth)), behavior: 'smooth'});
      }
    });
    const activeLink = document.querySelector('.rail-link.active');
    if (activeLink && rail){
      const railTop = rail.getBoundingClientRect().top;
      const linkRect = activeLink.getBoundingClientRect();
      indicator.style.transform = `translateY(${linkRect.top - railTop}px)`;
      indicator.style.height = linkRect.height + 'px';
    }
  }

  const menuIO = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
  }, { threshold: 0, rootMargin: '-40% 0px -55% 0px' });
  blocks.forEach(b => menuIO.observe(b));
})();
