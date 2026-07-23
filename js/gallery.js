/**
 * gallery.js
 * Photo gallery: builds two shuffled rows of images, paginates them
 * (arrows, dots, swipe, keyboard, resize-aware), and drives the
 * fullscreen lightbox (open/close, prev/next, swipe, keyboard, Escape).
 */
(function () {
  'use strict';

  let galleryImages = [
    { src: 'assets/images/pastries_showcase_shelf.webp', alt: 'Pastries shelf', key: 'pastriesShelf' },
    { src: 'assets/images/salads_showcase_shelf.webp',  alt: 'Salads showcase', key: 'saladsShowcase' },
    { src: 'assets/images/fruits_berries_pastries_cropped.jpg', alt: 'Fruit & berry pastries', key: 'fruitBerryPastries' },
    { src: 'assets/images/smorbrod.webp',  alt: 'Smörbröd', key: 'smorbrod' },
    { src: 'assets/images/brioche_cream_raspberries.webp', alt: 'Brioche with cream and raspberries', key: 'brioche' },
    { src: 'assets/images/chocolate_berry_bars.webp', alt: 'Chocolate berry bars', key: 'chocolateBars' },
    { src: 'assets/images/apple.webp',  alt: 'Apple tart', key: 'appleTart' },
    { src: 'assets/images/mango.webp',  alt: 'Mango dessert', key: 'mangoDessert' },
    { src: 'assets/images/raspberry.webp', alt: 'Raspberries', key: 'raspberries' },
    { src: 'assets/images/swan_white_mousse.webp', alt: 'White mousse swan', key: 'mousseSwan' },
    { src: 'assets/images/stuffed_croissants_sweet.webp', alt: 'Stuffed croissants', key: 'stuffedCroissants' },
    { src: 'assets/images/chocolate_layered_cake_slices.webp', alt: 'Chocolate layered cake slices', key: 'chocolateCake' },
    { src: 'assets/images/breakfast_foccacia_coffee.webp', alt: 'Breakfast focaccia and coffee', key: 'focacciaCoffee' },
    { src: 'assets/images/chocolate_layered_cake_slices.webp', alt: 'Layered chocolate cake', key: 'layeredCake' },
    { src: 'assets/images/passsionfruit.webp', alt: 'Passion fruit dessert', key: 'passionfruit' },
    { src: 'assets/images/pear.webp', alt: 'Pear pastry', key: 'pearPastry' },
    { src: 'assets/images/interior_sitting.webp', alt: 'Café interior seating', key: 'interior' },
    { src: 'assets/images/entrance.webp', alt: 'Café Berry entrance', key: 'entrance' }
  ];

  function shuffleArray(arr) {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  galleryImages = shuffleArray(galleryImages);

  const galleryRows = document.getElementById('galleryRows');
  const galleryPrev = document.getElementById('galleryPrev');
  const galleryNext = document.getElementById('galleryNext');
  const galleryDots = document.getElementById('galleryDots');

  const half = Math.ceil(galleryImages.length / 2);
  const row1 = galleryImages.slice(0, half);
  const row2 = galleryImages.slice(half);

  function buildRow(images, rowIdx){
    const row = document.createElement('div');
    row.className = 'gallery-row';
    const track = document.createElement('div');
    track.className = 'gallery-track';
    track.dataset.row = String(rowIdx);
    images.forEach((img, i) => {
      const slide = document.createElement('div');
      slide.className = 'gallery-slide';
      slide.dataset.globalIndex = String(rowIdx === 0 ? i : half + i);
      const image = document.createElement('img');
      image.src = img.src;
      image.alt = img.alt;
      image.dataset.i18nAttr = `alt:gallery.images.${img.key}`;
      image.loading = 'lazy';
      image.decoding = 'async';
      slide.appendChild(image);
      slide.addEventListener('click', () => openLightbox(Number(slide.dataset.globalIndex)));
      track.appendChild(slide);
    });
    row.appendChild(track);
    return row;
  }

  galleryRows.appendChild(buildRow(row1, 0));
  galleryRows.appendChild(buildRow(row2, 1));

  galleryRows.addEventListener('error', (e) => {
    if (e.target.tagName === 'IMG'){
      e.target.style.opacity = '.25';
      e.target.alt = (e.target.alt || '') + ' (unavailable)';
    }
  }, true);

  const tracks = galleryRows.querySelectorAll('.gallery-row');
  const visiblePerRow = () => {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 980) return 2;
    return 3;
  };
  const maxIndex = () => Math.max(0, row1.length - visiblePerRow());
  let page = 0;
  const GAP_PX = 17.6;

  function layoutSlides(){
    const visible = visiblePerRow();
    const rowWidth = tracks[0].clientWidth;
    const slideW = (rowWidth - GAP_PX * (visible - 1)) / visible;
    document.querySelectorAll('.gallery-slide').forEach(s => {
      s.style.flex = `0 0 ${slideW}px`;
    });
    return slideW;
  }

  let currentSlideW = layoutSlides();
  function stepPx(){ return currentSlideW + GAP_PX; }

  function goToPage(p, smooth = true){
    page = Math.max(0, Math.min(maxIndex(), p));
    const x = page * stepPx();
    tracks.forEach(t => t.scrollTo({ left: x, behavior: smooth ? 'smooth' : 'auto' }));
    galleryDots.querySelectorAll('button').forEach((b,i) => b.classList.toggle('active', i === page));
    galleryPrev.disabled = page === 0;
    galleryNext.disabled = page >= maxIndex();
  }

  const totalPages = maxIndex() + 1;
  for (let i = 0; i < totalPages; i++){
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', window.translate ? window.translate('gallery.goToSlide', { number: i + 1 }) : `Go to slide ${i+1}`);
    dot.addEventListener('click', () => goToPage(i));
    galleryDots.appendChild(dot);
  }

  galleryPrev.addEventListener('click', () => goToPage(page - 1));
  galleryNext.addEventListener('click', () => goToPage(page + 1));

  let scrollRaf = null;
  tracks.forEach(t => {
    t.addEventListener('scroll', () => {
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = null;
        const x = t.scrollLeft;
        const nearest = Math.round(x / stepPx());
        if (nearest !== page){
          page = nearest;
          galleryDots.querySelectorAll('button').forEach((b,i) => b.classList.toggle('active', i === page));
          galleryPrev.disabled = page === 0;
          galleryNext.disabled = page >= maxIndex();
        }
      });
    }, { passive: true });
  });

  document.addEventListener('keydown', (e) => {
    const galleryInView = (() => {
      const r = document.getElementById('gallery').getBoundingClientRect();
      return r.top < window.innerHeight && r.bottom > 0;
    })();
    if (!galleryInView) return;
    if (lightbox.classList.contains('open')) return;
    if (e.key === 'ArrowLeft') goToPage(page - 1);
    if (e.key === 'ArrowRight') goToPage(page + 1);
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      currentSlideW = layoutSlides();
      const newTotal = maxIndex() + 1;
      const dots = Array.from(galleryDots.children);
      if (newTotal > dots.length){
        for (let i = dots.length; i < newTotal; i++){
          const dot = document.createElement('button');
          dot.type = 'button';
          dot.setAttribute('aria-label', window.translate ? window.translate('gallery.goToSlide', { number: i + 1 }) : `Go to slide ${i+1}`);
          dot.addEventListener('click', () => goToPage(i));
          galleryDots.appendChild(dot);
        }
      } else if (newTotal < dots.length){
        for (let i = dots.length - 1; i >= newTotal; i--){
          galleryDots.removeChild(galleryDots.children[i]);
        }
      }
      if (page > maxIndex()) page = maxIndex();
      goToPage(page, false);
    }, 150);
  });

  goToPage(0, false);

  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  const lightboxCounter = document.getElementById('lightboxCounter');
  let lbIdx = 0;

  function openLightbox(i){
    lbIdx = i;
    const img = galleryImages[i];
    lightboxImg.src = img.src;
    lightboxImg.alt = window.translate ? window.translate(`gallery.images.${img.key}`) : img.alt;
    lightboxCounter.textContent = `${i+1} / ${galleryImages.length}`;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox(){
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  function lbStep(delta){
    lbIdx = (lbIdx + delta + galleryImages.length) % galleryImages.length;
    openLightbox(lbIdx);
  }
  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', () => lbStep(-1));
  lightboxNext.addEventListener('click', () => lbStep(1));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') lbStep(-1);
    if (e.key === 'ArrowRight') lbStep(1);
  });

  let lbStartX = 0;
  lightbox.addEventListener('touchstart', e => { lbStartX = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - lbStartX;
    if (Math.abs(dx) > 40) lbStep(dx > 0 ? -1 : 1);
  });
})();
