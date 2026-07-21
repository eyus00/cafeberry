(() => {
  'use strict';

  const supportedLanguages = ['en', 'fi'];
  const cache = new Map();
  let english;
  let currentLanguage;

  const getPath = (source, path) => path.split('.').reduce((value, key) => value && value[key], source);
  const interpolate = (value, variables = {}) => value.replace(/\{(\w+)\}/g, (_, key) => variables[key] ?? `{${key}}`);

  async function loadLanguage(language) {
    if (!cache.has(language)) {
      const response = await fetch(`lang/${language}.json`);
      if (!response.ok) throw new Error(`Unable to load language: ${language}`);
      cache.set(language, response.json());
    }
    return cache.get(language);
  }

  function translate(translations, key, variables) {
    const localized = getPath(translations, key);
    if (typeof localized === 'string') return interpolate(localized, variables);
    const fallback = getPath(english, key);
    if (typeof fallback === 'string') {
      if (translations !== english) console.warn(`Missing translation for "${key}"; using English.`);
      return interpolate(fallback, variables);
    }
    console.warn(`Missing translation key: "${key}".`);
    return key;
  }

  function translateDocument(translations) {
    document.querySelectorAll('[data-i18n]').forEach((element) => {
      const key = element.dataset.i18n;
      const value = translate(translations, key);
      if (element.dataset.i18nHtml !== undefined) element.innerHTML = value;
      else element.textContent = value;
    });

    const railKeys = { breakfast: 'breakfast', pastries: 'pastries', savory: 'savory', sweet: 'sweet', soup: 'soup', salads: 'salads', coffee: 'coffee', iced: 'iced', flavoured: 'lattes', juices: 'juices', tea: 'tea', softdrinks: 'softDrinks', wines: 'wines', beer: 'beer', nonalcoholic: 'nonAlcoholic', cocktails: 'cocktails', spirits: 'spirits', snacks: 'snacks', gelato: 'gelato' };
    Object.entries(railKeys).forEach(([id, key]) => {
      const value = translate(translations, `menu.rail.${key}`);
      document.querySelectorAll(`[href="#${id}"]`).forEach((link) => { link.textContent = value; });
      const heading = document.querySelector(`#${id} .menu-cat-title`);
      if (heading) heading.innerHTML = translate(translations, `menu.categories.${key}`);
    });

    const menuCopy = translations.menu?.copy || {};
    const menuCopyTargets = '.menu-cat-note, .menu-subhead, .m-item-name, .m-item-desc, .bf-card h4, .bf-card p, .bf-card a, .flavor-tag, .price-block-label, .price-block-time, .wine-region, .wine-style, .featured-eyebrow, .featured-name, .featured-region, .featured-desc, .featured-notes span, .featured-staff, .featured-bottle span';
    document.querySelectorAll(menuCopyTargets).forEach((element) => {
      const sourceText = element.dataset.sourceText || element.textContent.trim();
      element.dataset.sourceText = sourceText;
      const localizedText = menuCopy[sourceText] ?? menuCopy[sourceText.replace(/&/g, '&amp;')];
      if (localizedText !== undefined) {
        if (element.querySelector('.m-tags') && element.firstChild) element.firstChild.textContent = localizedText;
        else element.textContent = localizedText;
      } else if (currentLanguage === 'en') {
        if (element.querySelector('.m-tags') && element.firstChild) element.firstChild.textContent = sourceText;
        else element.textContent = sourceText;
      }
    });

    document.querySelectorAll('[data-i18n-attr]').forEach((element) => {
      element.dataset.i18nAttr.split(',').forEach((pair) => {
        const [attribute, key] = pair.trim().split(':');
        if (attribute && key) element.setAttribute(attribute, translate(translations, key));
      });
    });

    document.title = translate(translations, 'meta.title');
    document.documentElement.lang = currentLanguage;
    document.querySelector('meta[name="description"]')?.setAttribute('content', translate(translations, 'meta.description'));
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', translate(translations, 'meta.title'));
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', translate(translations, 'meta.ogDescription'));
    document.querySelector('meta[property="og:locale"]')?.setAttribute('content', translate(translations, 'meta.locale'));
    document.querySelector('meta[name="apple-mobile-web-app-title"]')?.setAttribute('content', 'Café Berry');

    const schema = document.querySelector('script[type="application/ld+json"]');
    if (schema) {
      const data = JSON.parse(schema.textContent);
      data.description = translate(translations, 'meta.schemaDescription');
      data.servesCuisine = currentLanguage === 'fi' ? ['Leipomo', 'Kahvi', 'Leivonnaiset', 'Viini'] : ['Bakery', 'Coffee', 'Pastries', 'Winery'];
      schema.textContent = JSON.stringify(data);
    }

    document.querySelectorAll('[data-language]').forEach((button) => {
      const active = button.dataset.language === currentLanguage;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  const languageFadeDuration = 240;

  const wait = (duration) => new Promise((resolve) => setTimeout(resolve, duration));

  async function setLanguage(language) {
    const nextLanguage = supportedLanguages.includes(language) ? language : 'en';
    if (!english) english = await loadLanguage('en');
    const translations = nextLanguage === 'en' ? english : await loadLanguage(nextLanguage);
    const shouldAnimate = currentLanguage && currentLanguage !== nextLanguage && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (shouldAnimate) {
      document.body.classList.add('language-transitioning');
      await wait(languageFadeDuration);
    }

    currentLanguage = nextLanguage;
    window.translate = (key, variables) => translate(translations, key, variables);
    translateDocument(translations);
    localStorage.setItem('language', nextLanguage);
    window.dispatchEvent(new CustomEvent('languagechange', { detail: { language: nextLanguage, translations, translate: (key, variables) => translate(translations, key, variables) } }));

    if (shouldAnimate) {
      document.body.offsetHeight;
      document.body.classList.remove('language-transitioning');
    }
  }

  window.setLanguage = setLanguage;
  window.addEventListener('DOMContentLoaded', async () => {
    document.querySelectorAll('[data-language]').forEach((button) => button.addEventListener('click', () => setLanguage(button.dataset.language)));
    const stored = localStorage.getItem('language');
    const detected = navigator.language?.toLowerCase().startsWith('fi') ? 'fi' : 'en';
    try {
      await setLanguage(supportedLanguages.includes(stored) ? stored : detected);
    } catch (error) {
      console.error(error);
    }
  });
})();
