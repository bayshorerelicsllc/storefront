/* ==========================================================================
 * Bay Shore Relics — shared storefront JS.
 * API client, cart store, theme loader, header/footer layout renderer,
 * monochrome line-icon sprite, toasts, consent, accessibility toolbar.
 * Every content page includes this + theme.css and calls BSR.init().
 * ========================================================================== */
(function () {
  'use strict';
  var API = 'https://cm.bayshorerelicsllc.com';

  /* ---------------- icons (monochrome line SVG sprite) ---------------- */
  var PATHS = {
    search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
    account: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5"/>',
    cart: '<path d="M3 4h2l2.4 12.2a1 1 0 0 0 1 .8h8.7a1 1 0 0 0 1-.8L20.5 8H6"/><circle cx="9.5" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    'chev-down': '<path d="M6 9l6 6 6-6"/>',
    'chev-left': '<path d="M15 6l-6 6 6 6"/>',
    'chev-right': '<path d="M9 6l6 6-6 6"/>',
    trash: '<path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m3 0l-.8 12.2a1 1 0 0 1-1 .8H7.8a1 1 0 0 1-1-.8L6 7"/>',
    check: '<path d="M4.5 12.5l5 5 10-11"/>',
    truck: '<path d="M2 6h12v10H2zM14 10h4l4 4v2h-8z"/><circle cx="6.5" cy="18" r="1.8"/><circle cx="17.5" cy="18" r="1.8"/>',
    shield: '<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/><path d="M9 12l2 2 4-4.5"/>',
    box: '<path d="M3.5 8L12 3.5 20.5 8v8L12 20.5 3.5 16z"/><path d="M3.5 8L12 12.5 20.5 8M12 12.5V20"/>',
    tag: '<path d="M3.5 12V4a1 1 0 0 1 1-1h8.5l9 9-9.5 9.5z"/><circle cx="8.5" cy="8.5" r="1.3"/>',
    'arrow-right': '<path d="M4 12h15M13 6l6 6-6 6"/>',
    filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
    logout: '<path d="M14 4H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h8M10 12h11M18 8l4 4-4 4"/>',
    package: '<path d="M3.5 8L12 3.5 20.5 8v8L12 20.5 3.5 16z"/><path d="M3.5 8L12 12.5 20.5 8M12 12.5V20"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    lock: '<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 7l8.5 6 8.5-6"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.1"/>',
    sun: '<circle cx="12" cy="12" r="4.5"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5 5l1.8 1.8M17.2 17.2L19 19M19 5l-1.8 1.8M6.8 17.2L5 19"/>',
    moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
    text: '<path d="M5 6V4h14v2M12 4v16M9 20h6"/>',
    contrast: '<circle cx="12" cy="12" r="9"/><path d="M12 3v18M12 3a9 9 0 0 1 0 18"/>',
    motion: '<path d="M4 12h6l-2-3m2 3l-2 3M14 12h6l-2-3m2 3l-2 3"/>',
    train: '<rect x="5" y="3" width="14" height="13" rx="3"/><path d="M5 10h14M9 20l-2 2m10-2l2 2M8.5 13.5h.1M15.5 13.5h.1"/>',
    ticket: '<path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z"/><path d="M14 6v2m0 3v2m0 3v2"/>'
  };
  function icon(name, cls) {
    return '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true">' +
      (PATHS[name] || PATHS.info) + '</svg>';
  }

  /* ---------------- API client ---------------- */
  function api(path, opts) {
    opts = opts || {};
    var headers = { 'Content-Type': 'application/json' };
    return fetch(API + path, {
      method: opts.method || 'GET',
      headers: headers,
      credentials: 'include',
      body: opts.body ? JSON.stringify(opts.body) : undefined
    }).then(function (r) {
      return r.json().catch(function () { return { ok: false, error: 'Network error.' }; })
        .then(function (j) { j._status = r.status; return j; });
    }).catch(function () { return { ok: false, error: 'Could not reach the store server.' }; });
  }

  /* ---------------- money ---------------- */
  function money(cents) {
    return '$' + (Math.round(cents || 0) / 100).toFixed(2);
  }

  /* ---------------- cart (localStorage, slugs only, qty always 1) ---------------- */
  var CART_KEY = 'bsr-cart-v1';
  function readCart() {
    try {
      var a = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
      return Array.isArray(a) ? a.filter(function (s) { return typeof s === 'string'; }) : [];
    } catch (e) { return []; }
  }
  function writeCart(a) { localStorage.setItem(CART_KEY, JSON.stringify(a)); updateCartBadge(); }
  var cart = {
    list: readCart,
    count: function () { return readCart().length; },
    has: function (slug) { return readCart().indexOf(slug) !== -1; },
    add: function (slug) {
      var a = readCart();
      if (a.indexOf(slug) === -1) { a.push(slug); writeCart(a); }
      return a.length;
    },
    remove: function (slug) { writeCart(readCart().filter(function (s) { return s !== slug; })); },
    clear: function () { writeCart([]); }
  };
  function updateCartBadge() {
    var els = document.querySelectorAll('.cart-count');
    var n = cart.count();
    for (var i = 0; i < els.length; i++) els[i].textContent = n > 0 ? n : '';
  }

  /* ---------------- theme ---------------- */
  var themeCache = null;
  function applyTheme(t) {
    var root = document.documentElement.style;
    if (t.color_accent) root.setProperty('--accent', t.color_accent);
    if (t.color_bg) root.setProperty('--bg', t.color_bg);
    if (t.color_text) root.setProperty('--text', t.color_text);
    if (t.font_heading && t.font_heading !== 'system') root.setProperty('--font-head', t.font_heading);
    if (t.font_body && t.font_body !== 'system') root.setProperty('--font-body', t.font_body);
    var ann = document.getElementById('bsr-announce');
    if (ann) {
      if (t.announcement_enabled === false || t.announcement_enabled === 0 || t.announcement_enabled === '0') {
        ann.style.display = 'none';
      } else if (t.announcement) {
        ann.innerHTML = t.announcement_link
          ? '<a href="' + esc(t.announcement_link) + '">' + esc(t.announcement) + '</a>'
          : esc(t.announcement);
      } else ann.innerHTML = '';
    }
    if (t.favicon_url) {
      var fav = document.querySelector('link[rel="icon"]');
      if (fav) fav.href = t.favicon_url;
    }
    if (t.seo_description) {
      var md = document.querySelector('meta[name="description"]');
      if (md && !md.getAttribute('content')) md.setAttribute('content', t.seo_description);
    }
    document.querySelectorAll('[data-tagline]').forEach(function (el) { if (t.tagline) el.textContent = t.tagline; });
    document.querySelectorAll('[data-hero-headline]').forEach(function (el) { if (t.hero_headline) el.textContent = t.hero_headline; });
    document.querySelectorAll('[data-hero-subtext]').forEach(function (el) { if (t.hero_subtext) el.textContent = t.hero_subtext; });
    document.querySelectorAll('[data-hero]').forEach(function (el) { if (t.hero_image) el.style.backgroundImage = 'url("' + String(t.hero_image).replace(/"/g, '') + '")'; });
    document.querySelectorAll('[data-featured]').forEach(function (el) { if (t.featured_enabled === false || t.featured_enabled === 0 || t.featured_enabled === '0') el.style.display = 'none'; });
    document.querySelectorAll('[data-footer-newsletter]').forEach(function (el) { if (t.footer_newsletter === false || t.footer_newsletter === 0 || t.footer_newsletter === '0') el.style.display = 'none'; });
    document.querySelectorAll('[data-pay-badges]').forEach(function (el) { if (t.payment_icons === false || t.payment_icons === 0 || t.payment_icons === '0') el.style.display = 'none'; });
    var tb = document.querySelector('[data-trust-badges]');
    if (tb && t.trust_badges) {
      var lines = String(t.trust_badges).split(/\n+/).map(function (s) { return s.trim(); }).filter(Boolean);
      if (lines.length) tb.innerHTML = lines.map(function (l) { return '<div class="feature"><div><h3>' + esc(l) + '</h3></div></div>'; }).join('');
    }
    var soc = document.querySelector('[data-social]');
    if (soc) {
      var links = [];
      if (t.social_facebook) links.push(['Facebook', t.social_facebook]);
      if (t.social_instagram) links.push(['Instagram', t.social_instagram]);
      if (t.social_x) links.push(['X', t.social_x]);
      soc.innerHTML = links.map(function (l) { return '<a href="' + esc(l[1]) + '" target="_blank" rel="noopener">' + esc(l[0]) + '</a>'; }).join(' · ');
    }
    document.querySelectorAll('[data-store-name]').forEach(function (el) { el.textContent = t.store_name || 'Bay Shore Relics LLC'; });
    var year = new Date().getFullYear();
    document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = year; });
  }
  function themeDraftId() {
    try {
      var m = /[?&]preview=([^&]+)/.exec(location.search);
      return m ? decodeURIComponent(m[1]) : null;
    } catch (e) { return null; }
  }
  function loadTheme() {
    var draft = themeDraftId();
    if (draft) {
      return api('/api/catalog/theme?draft=' + encodeURIComponent(draft)).then(function (j) {
        var t = (j && j.ok && j.theme) ? j.theme : {};
        applyTheme(t); return t;
      }).catch(function () { return {}; });
    }
    if (themeCache) { applyTheme(themeCache); return Promise.resolve(themeCache); }
    return api('/api/catalog/theme').then(function (j) {
      var t = (j && j.ok && j.theme) ? j.theme : {};
      themeCache = t; applyTheme(t); return t;
    }).catch(function () { return {}; });
  }

  /* ---------------- account ---------------- */
  var meCache = null;
  function me(force) {
    if (meCache && !force) return Promise.resolve(meCache);
    return api('/api/account/me').then(function (j) {
      meCache = (j && j.ok) ? j.customer : null;
      return meCache;
    });
  }

  /* ---------------- menus (Commerce Manager > Online Store > Navigation) ---------------- */
  var menuCache = null;
  function applyMenus(menus) {
    var main = null;
    for (var i = 0; i < menus.length; i++) {
      var h = menus[i].handle || '';
      if (h === 'main-menu') { main = menus[i]; break; }
    }
    if (!main || !main.items || !main.items.length) return;
    var html = main.items.map(function (it) {
      return '<a href="' + esc(it.url || '#') + '">' + esc(it.label || '') + '</a>';
    }).join('');
    var navs = document.querySelectorAll('#bsr-header .main-nav');
    for (var n = 0; n < navs.length; n++) navs[n].innerHTML = html;
    var drawerNav = document.querySelector('#bsr-drawer nav');
    if (drawerNav) {
      drawerNav.innerHTML = main.items.map(function (it) {
        return '<a href="' + esc(it.url || '#') + '">' + icon('arrow-right', 'ic-sm') + esc(it.label || '') + '</a>';
      }).join('') +
      '<a href="/account/" data-account-btn>' + icon('account', 'ic-sm') + 'Account</a>' +
      '<a href="/cart/">' + icon('cart', 'ic-sm') + 'Cart</a>';
    }
  }
    wireAccountButtons();
    updateAccountButton();
  function loadMenus() {
    if (menuCache) { applyMenus(menuCache); return Promise.resolve(menuCache); }
    return api('/api/catalog/menus').then(function (j) {
      menuCache = (j && j.ok && j.menus) ? j.menus : [];
      applyMenus(menuCache); return menuCache;
    }).catch(function () { return []; });
  }

  /* ---------------- toasts ---------------- */
  function toast(msg, type) {
    var box = document.getElementById('bsr-toasts');
    if (!box) {
      box = document.createElement('div');
      box.id = 'bsr-toasts'; box.className = 'toasts';
      document.body.appendChild(box);
    }
    var el = document.createElement('div');
    el.className = 'toast ' + (type || '');
    el.innerHTML = icon(type === 'err' ? 'info' : 'check', 'ic-sm') + '<span></span>';
    el.querySelector('span').textContent = msg;
    box.appendChild(el);
    setTimeout(function () { el.remove(); }, 4200);
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------------- layout ---------------- */
  var NAV = [
    { href: '/shop/', label: 'Shop', key: 'shop' },
    { href: '/sold/', label: 'Sold', key: 'sold' },
    { href: '/track/', label: 'Track order', key: 'track' },
    { href: '/about/', label: 'About', key: 'about' },
    { href: '/contact/', label: 'Contact', key: 'contact' }
  ];
  function renderLayout(opts) {
    opts = opts || {};
    var active = opts.active || '';
    var headerEl = document.getElementById('bsr-header');
    if (headerEl) {
      var navHtml = NAV.map(function (n) {
        return '<a href="' + n.href + '" class="' + (active === n.key ? 'active' : '') + '">' + n.label + '</a>';
      }).join('');
      headerEl.innerHTML =
        '<div class="announce" id="bsr-announce"></div>' +
        '<div class="site-header"><div class="wrap">' +
        '<button class="icon-btn hamburger" id="bsr-menu-btn" aria-label="Open menu">' + icon('menu') + '</button>' +
        '<a class="brand" href="/shop/"><img src="/assets/img/logo.png" alt="Bay Shore Relics logo"><span class="name" data-store-name>Bay Shore Relics LLC</span></a>' +
        '<nav class="main-nav" aria-label="Main">' + navHtml + '</nav>' +
        '<div class="header-icons">' +
        '<button class="icon-btn" id="bsr-search-btn" aria-label="Search">' + icon('search') + '</button>' +
        '<button class="icon-btn" data-account-btn aria-label="Account">' + icon('account') + '</button>' +
        '<a class="icon-btn" href="/cart/" aria-label="Cart">' + icon('cart') + '<span class="cart-count"></span></a>' +
        '</div></div></div>' +
        '<div class="drawer-scrim" id="bsr-scrim"></div>' +
        '<aside class="drawer" id="bsr-drawer" aria-label="Menu"><div class="drawer-head">' +
        '<span class="brand drawer-brand"><img src="/assets/img/logo.png" alt="Bay Shore Relics logo"><span class="name" data-store-name>Bay Shore Relics LLC</span></span>' +
        '<button class="icon-btn" id="bsr-drawer-close" aria-label="Close menu">' + icon('close') + '</button></div>' +
        '<nav>' + NAV.map(function (n) {
          return '<a href="' + n.href + '">' + icon('arrow-right', 'ic-sm') + esc(n.label) + '</a>';
        }).join('') +
        '<a href="/account/" data-account-btn>' + icon('account', 'ic-sm') + 'Account</a>' +
        '<a href="/cart/">' + icon('cart', 'ic-sm') + 'Cart</a>' +
        '</nav></aside>' +
        '<div class="search-overlay" id="bsr-search"><div class="wrap">' +
        '<div style="display:flex;justify-content:flex-end;margin-bottom:14px"><button class="icon-btn" id="bsr-search-close" aria-label="Close search">' + icon('close') + '</button></div>' +
        '<form class="search-box" action="/search/" method="get">' +
        '<input type="search" name="q" placeholder="Search slides…" aria-label="Search slides" required>' +
        '<button class="btn btn-primary" type="submit">Search</button></form></div></div>';
      var drawer = document.getElementById('bsr-drawer');
      var scrim = document.getElementById('bsr-scrim');
      var searchOv = document.getElementById('bsr-search');
      function closeAll() { drawer.classList.remove('open'); scrim.classList.remove('open'); searchOv.classList.remove('open'); }
      wireAccountButtons();
      document.getElementById('bsr-menu-btn').addEventListener('click', function () { drawer.classList.add('open'); scrim.classList.add('open'); });
      document.getElementById('bsr-drawer-close').addEventListener('click', closeAll);
      scrim.addEventListener('click', closeAll);
      document.getElementById('bsr-search-btn').addEventListener('click', function () { searchOv.classList.add('open'); var i = searchOv.querySelector('input'); if (i) i.focus(); });
      document.getElementById('bsr-search-close').addEventListener('click', closeAll);
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAll(); });
    }
    var footerEl = document.getElementById('bsr-footer');
    if (footerEl) {
      footerEl.innerHTML =
        '<footer class="site-footer"><div class="wrap"><div class="footer-grid">' +
        '<div class="newsletter" data-footer-newsletter><h4>Get first dibs on new slides</h4>' +
        '<p>One-of-a-kind vintage railroad slides. When they\'re gone, they\'re gone.</p>' +
        '<form class="promo-row" action="https://formsubmit.co/hello@bayshorerelicsllc.com" method="POST">' +
        '<input type="hidden" name="_subject" value="[Launch List] Notify me at launch — Bay Shore Relics LLC">' +
        '<input type="email" name="email" placeholder="Email address" required aria-label="Email address">' +
        '<button class="btn btn-primary btn-sm" type="submit">Join</button></form></div>' +
        '<div><h4>Shop</h4><ul>' +
        '<li><a href="/shop/">All slides</a></li><li><a href="/sold/">Sold archive</a></li>' +
        '<li><a href="/track/">Track your order</a></li><li><a href="/cart/">Cart</a></li></ul></div>' +
        '<div><h4>Help</h4><ul>' +
        '<li><a href="/contact/">Contact us</a></li><li><a href="/policies/shipping/">Shipping</a></li>' +
        '<li><a href="/policies/returns/">Returns</a></li><li><a href="/about/">About</a></li></ul></div>' +
        '<div><h4>Policies</h4><ul>' +
        '<li><a href="/policies/privacy/">Privacy</a></li><li><a href="/policies/terms/">Terms</a></li>' +
        '<li><a href="/policies/cookies/">Cookies</a></li><li><a href="/policies/accessibility/">Accessibility</a></li></ul></div>' +
        '</div><div class="footer-bottom"><span>© <span data-year></span> <span data-store-name>Bay Shore Relics LLC</span>. All rights reserved.</span>' +
        '<span class="accept-badge" data-pay-badges aria-label="We accept Visa, Mastercard, American Express, Discover, PayPal, Venmo, Google Pay, and Apple Pay">' +
        '<img src="/assets/img/payments/visa.svg" alt="Visa" loading="lazy">' +
        '<img src="/assets/img/payments/mastercard.svg" alt="Mastercard" loading="lazy">' +
        '<img src="/assets/img/payments/amex.svg" alt="American Express" loading="lazy">' +
        '<img src="/assets/img/payments/discover.svg" alt="Discover" loading="lazy">' +
        '<img src="/assets/img/payments/paypal.svg" alt="PayPal" loading="lazy">' +
        '<img src="/assets/img/payments/venmo.svg" alt="Venmo" loading="lazy">' +
        '<img src="/assets/img/payments/gpay.svg" alt="Google Pay" loading="lazy">' +
        '<img src="/assets/img/payments/applepay.svg" alt="Apple Pay" loading="lazy">' +
        '</span>' +
        '<span data-social></span>' +
        '</div></div></footer>';
    }
    renderA11yBar();
    updateCartBadge();
  }

  /* ---------------- a11y toolbar ---------------- */
  function renderA11yBar() {
    if (document.getElementById('bsr-a11y')) return;
    var bar = document.createElement('div');
    bar.className = 'a11y-bar'; bar.id = 'bsr-a11y';
    bar.innerHTML =
      '<button class="icon-btn" data-a="large" aria-label="Larger text" title="Larger text">' + icon('text') + '</button>' +
      '<button class="icon-btn" data-a="contrast" aria-label="High contrast" title="High contrast">' + icon('contrast') + '</button>' +
      '<button class="icon-btn" data-a="motion" aria-label="Reduce motion" title="Reduce motion">' + icon('motion') + '</button>' +
      '<button class="icon-btn" data-a="dark" aria-label="Dark mode" title="Dark mode">' + icon('moon') + '</button>';
    document.body.appendChild(bar);
    var prefs = {};
    try { prefs = JSON.parse(localStorage.getItem('bsr-a11y') || '{}'); } catch (e) {}
    function apply() {
      var h = document.documentElement;
      h.classList.toggle('a11y-large', !!prefs.large);
      h.classList.toggle('a11y-contrast', !!prefs.contrast);
      h.classList.toggle('a11y-motion', !!prefs.motion);
      h.setAttribute('data-theme', prefs.dark ? 'dark' : 'light');
    }
    apply();
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-a]');
      if (!b) return;
      var k = b.getAttribute('data-a');
      prefs[k] = !prefs[k];
      try { localStorage.setItem('bsr-a11y', JSON.stringify(prefs)); } catch (e2) {}
      apply();
    });
  }

  /* ---------------- consent (analytics only after Accept) ---------------- */
  var CONSENT_KEY = 'bsr-consent';
  function consentState() { try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; } }
  function loadAnalytics() {
    if (window._bsrAnalyticsLoaded) return;
    window._bsrAnalyticsLoaded = true;
    loadTheme().then(function (t) {
      var gid = (t && t.ga4_id) || 'G-D1BV6KQNMD';
      var s = document.createElement('script');
      s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(gid);
      document.head.appendChild(s);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag('js', new Date());
      window.gtag('config', gid, { anonymize_ip: true });
      var c = document.createElement('script');
      c.async = true; c.src = 'https://www.clarity.ms/tag/yn53meg966';
      document.head.appendChild(c);
    });
  }
  function renderConsent() {
    if (consentState()) { if (consentState() === 'accepted') loadAnalytics(); return; }
    var el = document.createElement('div');
    el.className = 'consent'; el.id = 'bsr-consent';
    el.innerHTML = '<p>We use privacy-friendly analytics to improve the shop. Accept to allow Google Analytics and Microsoft Clarity; reject and we set nothing.</p>' +
      '<div class="row"><button class="btn btn-primary btn-sm" data-c="accepted">Accept</button>' +
      '<button class="btn btn-ghost btn-sm" data-c="rejected">Reject</button>' +
      '<a class="btn btn-ghost btn-sm" href="/policies/cookies/">Cookie policy</a></div>';
    document.body.appendChild(el);
    requestAnimationFrame(function () { el.classList.add('show'); });
    el.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-c]');
      if (!b) return;
      setConsent(b.getAttribute('data-c'));
    });
  }
  function setConsent(v) {
    try { localStorage.setItem(CONSENT_KEY, v); } catch (e) {}
    var el = document.getElementById('bsr-consent');
    if (el) el.remove();
    if (v === 'accepted') loadAnalytics();
  }

  /* ---------------- init ---------------- */
  function init(opts) {
    opts = opts || {};
    renderLayout(opts);
    loadTheme();
    loadMenus();
    renderConsent();
    return me().catch(function () { return null; });
  }

  /* ---------------- login modal (lazy-loaded) ---------------- */
  var loginModalLoading = null;
  function ensureLoginModal() {
    if (window.BSR.showLogin && !window.BSR.showLogin._stub) return Promise.resolve();
    if (loginModalLoading) return loginModalLoading;
    loginModalLoading = new Promise(function (resolve) {
      var s = document.createElement('script');
      s.src = '/assets/js/login-modal.js?v=20260925g';
      s.onload = function () { resolve(); };
      s.onerror = function () { resolve(); };
      document.head.appendChild(s);
    });
    return loginModalLoading;
  }
  /* Stub: replaced by the real BSR.showLogin from login-modal.js once loaded. */
  function showLogin(opts) {
    return ensureLoginModal().then(function () {
      if (window.BSR.showLogin && !window.BSR.showLogin._stub) {
        return window.BSR.showLogin(opts);
      }
      window.location = '/account/login/';
    });
  }
  showLogin._stub = true;
  /* Account buttons: signed in → /account/, signed out → login modal. */
  /* Update the account/person icon to reflect signed-in state. */
  /* Inject account-button styles once. */
  (function () {
    if (document.getElementById('bsr-account-btn-css')) return;
    var st = document.createElement('style');
    st.id = 'bsr-account-btn-css';
    st.textContent = '.account-initial{display:inline-flex;align-items:center;justify-content:center;' +
      'width:28px;height:28px;border-radius:50%;background:#1e4d33;color:#fff;' +
      'font-weight:700;font-size:.95rem;line-height:1}' +
      '.icon-btn.signed-in{background:rgba(255,255,255,.12)}';
    document.head.appendChild(st);
  })();

  function updateAccountButton() {
    me().then(function (c) {
      var btns = document.querySelectorAll('[data-account-btn]');
      for (var i = 0; i < btns.length; i++) {
        var btn = btns[i];
        /* Only update the header icon button, not drawer links. */
        if (btn.tagName !== 'BUTTON') continue;
        if (c) {
          /* Signed in: show user's initial. */
          var initial = ((c.name || c.email || '?').trim().charAt(0) || '?').toUpperCase();
          btn.innerHTML = '<span class="account-initial">' + esc(initial) + '</span>';
          btn.setAttribute('aria-label', 'Account: ' + (c.name || c.email || ''));
          btn.classList.add('signed-in');
        } else {
          btn.innerHTML = icon('account');
          btn.setAttribute('aria-label', 'Account');
          btn.classList.remove('signed-in');
        }
      }
    }).catch(function () {});
  }

  function wireAccountButtons() {
    /* Event delegation: works even when header renders after this runs. */
    if (wireAccountButtons._done) return;
    wireAccountButtons._done = true;
    document.addEventListener('click', function (e) {
      var t = e.target;
      var btn = null;
      /* Walk up manually for maximum compatibility. */
      while (t && t !== document) {
        if (t.hasAttribute && t.hasAttribute('data-account-btn')) { btn = t; break; }
        t = t.parentNode;
      }
      if (!btn) return;
      e.preventDefault();
      /* Login page redirects to /account/ if already signed in. */
      window.location = '/account/login/';
    });
  }

  window.BSR = {
    api: api, money: money, esc: esc, icon: icon,
    cart: cart, updateCartBadge: updateCartBadge,
    loadTheme: loadTheme, applyTheme: applyTheme, loadMenus: loadMenus,
    me: me, toast: toast, init: init,
    setConsent: setConsent, consentState: consentState,
    showLogin: showLogin, wireAccountButtons: wireAccountButtons,
    API: API
  };
})();
