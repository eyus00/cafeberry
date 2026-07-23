# Café Berry


```
index.html                  ← the whole page; sections are comment-marked:
                               <!-- MENU -->, <!-- Menu category: Breakfast -->, etc.

css/
  base/                      variables.css, reset.css, utilities.css, buttons.css
  components/                one file per section (navigation, hero, gallery, menu, …)
  responsive/                tablet.css (≤980px), mobile.css (≤768px), small-mobile.css (≤480px)

js/
  navigation.js              navbar scroll state, mobile overlay open/close, smooth-scroll anchors
  animations.js              scroll-reveal (".rv" fade/slide-in) IntersectionObserver
  menu-rail.js               active-category tracking for the sticky/mobile menu rail
  utils.js                   small shared DOM helpers (keyboard activation for role="link")
  newsletter.js              newsletter form submit handling
  gallery.js                 gallery build/pagination + lightbox (kept together — tightly coupled)
  language.js                i18n engine 

lang/
  en.json, fi.json           

assets/images/               

```


## Finding things in `index.html`

Search for these comment markers to jump straight to a section:

```
<!-- Sticky header nav + mobile overlay menu -->
<!-- Hero section with scroll indicator and flavor ticker -->
<!-- Photo gallery + lightbox -->
<!-- Quote / interlude section -->
<!-- ===================== MENU ===================== -->
<!-- Menu category: Breakfast -->   (…and one per category, 19 total)
<!-- Visit / location section -->
<!-- Newsletter signup -->
<!-- Site footer -->
```


## Adding a new menu category

1. In `index.html`, find the last `<!-- Menu category: … -->` block
   inside `<div class="menu-content">` and copy its markup shape for
   your new category (matching `<div class="menu-block" id="...">`).
2. Add matching links to both the desktop rail (`<nav class="menu-rail"
   id="rail">`) and the mobile rail (`<nav class="menu-rail-mobile"
   id="railMobile">`) near the top of the menu section.
3. Add translation keys to `lang/en.json` and `lang/fi.json`.

## Adding a new language

This only requires a new `lang/xx.json`
file and registering a button in the language switcher inside
`index.html`'s nav — no other HTML changes needed. `js/language.js`
handles loading, fallback, and persistence already.
