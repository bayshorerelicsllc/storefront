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
    bell: '<path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10.3 20a2 2 0 0 0 3.4 0"/>',
    heart: '<path d="M12 20.7C7.2 16.4 3.5 13.1 3.5 9.3 3.5 6.6 5.6 4.5 8.3 4.5c1.6 0 3 .8 3.7 2 .7-1.2 2.1-2 3.7-2 2.7 0 4.8 2.1 4.8 4.8 0 3.8-3.7 7.1-8.5 11.4z"/>',
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

  /* ---------------- cart: server-reserved, qty always 1 ---------------- */
  var CART_KEY = 'bsr-cart-v1';
  var WISH_KEY = 'bsr-wishlist-v1';
  var BID_KEY = 'bsr-bid-v1';
  var NOTIF_SEEN_KEY = 'bsr-notif-seen-v1';
  var LOCAL_NOTIF_KEY = 'bsr-notif-local-v1';
  var HOLD_MS = 30 * 60 * 1000;   /* reservation length */
  var WARN_MS = 5 * 60 * 1000;    /* warn this long before expiry */
  var IDLE_MS = 5 * 60 * 1000;    /* no input this long = inactive */

  function bid() {
    try {
      var b = localStorage.getItem(BID_KEY);
      if (!b) {
        b = 'b-' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
        localStorage.setItem(BID_KEY, b);
      }
      return b;
    } catch (e) { return 'b-anon'; }
  }

  function readCart() {
    try {
      var a = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
      if (!Array.isArray(a)) return [];
      return a.map(function (it) {
        if (typeof it === 'string') return { slug: it, token: '', exp: 0 };
        if (it && typeof it.slug === 'string') return { slug: it.slug, token: it.token || '', exp: it.exp || 0 };
        return null;
      }).filter(Boolean);
    } catch (e) { return []; }
  }
  function writeCart(a) { try { localStorage.setItem(CART_KEY, JSON.stringify(a)); } catch (e) {} updateCartBadge(); }

  var cart = {
    items: readCart,
    list: function () { return readCart().map(function (i) { return i.slug; }); },
    count: function () { return readCart().length; },
    has: function (slug) { return readCart().some(function (i) { return i.slug === slug; }); },
    tokens: function () {
      var t = {};
      readCart().forEach(function (i) { if (i.token) t[i.slug] = i.token; });
      return t;
    },
    /* Reserve on the server, then add locally. Resolves {ok:true} or {ok:false,error}. */
    add: function (slug) {
      return api('/api/cart/reserve', { method: 'POST', body: { slug: slug, bid: bid() } }).then(function (j) {
        if (j && j.ok && j.token) {
          var a = readCart().filter(function (i) { return i.slug !== slug; });
          a.push({ slug: slug, token: j.token, exp: j.expires_at || (Date.now() + HOLD_MS) });
          writeCart(a);
          markActive();
          return { ok: true };
        }
        return { ok: false, error: (j && j.error) || 'Could not reserve this slide.' };
      });
    },
    release: function (slug, purchased) {
      var it = null, rest = [];
      readCart().forEach(function (i) { if (i.slug === slug) it = i; else rest.push(i); });
      writeCart(rest);
      if (it && it.token) {
        api('/api/cart/release', { method: 'POST', body: { slug: slug, token: it.token, purchased: !!purchased } });
      }
    },
    remove: function (slug) { cart.release(slug, false); },
    clear: function (purchased) {
      var items = readCart();
      writeCart([]);
      items.forEach(function (it) {
        if (it.token) api('/api/cart/release', { method: 'POST', body: { slug: it.slug, token: it.token, purchased: !!purchased } });
      });
    },
    heartbeatOne: function (it) {
      return api('/api/cart/heartbeat', { method: 'POST', body: { slug: it.slug, token: it.token } }).then(function (j) {
        if (j && j.ok) {
          var a = readCart();
          a.forEach(function (x) { if (x.slug === it.slug && x.token === it.token) x.exp = j.expires_at || (Date.now() + HOLD_MS); });
          writeCart(a);
          return true;
        }
        return false;
      }).catch(function () { return true; }); /* network blip: never drop on a failed ping */
    }
  };
  function updateCartBadge() {
    var els = document.querySelectorAll('.cart-count');
    var n = cart.count();
    for (var i = 0; i < els.length; i++) els[i].textContent = n > 0 ? n : '';
  }

  /* ---------------- wishlist (local; survives across visits until site data is cleared) ---------------- */
  function readWish() {
    try {
      var a = JSON.parse(localStorage.getItem(WISH_KEY) || '[]');
      return Array.isArray(a) ? a.filter(function (s) { return typeof s === 'string'; }) : [];
    } catch (e) { return []; }
  }
  function writeWish(a) { try { localStorage.setItem(WISH_KEY, JSON.stringify(a)); } catch (e) {} updateWishBadge(); }
  var wishlist = {
    list: readWish,
    count: function () { return readWish().length; },
    has: function (slug) { return readWish().indexOf(slug) !== -1; },
    add: function (slug) {
      var a = readWish();
      if (a.indexOf(slug) === -1) { a.push(slug); writeWish(a); }
    },
    remove: function (slug) { writeWish(readWish().filter(function (s) { return s !== slug; })); }
  };
  function updateWishBadge() {
    var els = document.querySelectorAll('.wish-count');
    var n = wishlist.count();
    for (var i = 0; i < els.length; i++) els[i].textContent = n > 0 ? n : '';
  }

  /* ---------------- wishlist toggle button: one shared affordance for every
     product card / preview, mirroring Add to cart. Pages render it with
     BSR.wishToggleHtml(slug) inside .card-img; one delegated handler below
     owns the toggle everywhere. ---------------- */
  function wishToggleHtml(slug) {
    var on = wishlist.has(slug);
    return '<button type="button" class="wish-toggle' + (on ? ' on' : '') + '" data-wish-toggle="' + esc(slug) + '"' +
      ' aria-pressed="' + (on ? 'true' : 'false') + '"' +
      ' aria-label="' + (on ? 'Remove from wishlist' : 'Add to wishlist') + '">' +
      icon('heart', 'ic-sm') + '</button>';
  }
  function paintWishToggles(root) {
    var btns = (root || document).querySelectorAll('[data-wish-toggle]');
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i], on = wishlist.has(b.getAttribute('data-wish-toggle'));
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.setAttribute('aria-label', on ? 'Remove from wishlist' : 'Add to wishlist');
    }
  }
  function wireWishToggles() {
    document.addEventListener('click', function (e) {
      var t = e.target && e.target.closest ? e.target.closest('[data-wish-toggle]') : null;
      if (!t) return;
      e.preventDefault();
      e.stopPropagation();
      var slug = t.getAttribute('data-wish-toggle');
      if (wishlist.has(slug)) { wishlist.remove(slug); toast('Removed from your wishlist'); }
      else { wishlist.add(slug); toast('Added to your wishlist'); }
      paintWishToggles(document);
    });
  }

  /* ---------------- notifications: bell + browser ---------------- */
  function readLocalNotifs() {
    try {
      var a = JSON.parse(localStorage.getItem(LOCAL_NOTIF_KEY) || '[]');
      return Array.isArray(a) ? a : [];
    } catch (e) { return []; }
  }
  function readSeenIds() {
    try { return JSON.parse(localStorage.getItem(NOTIF_SEEN_KEY) || '{}'); } catch (e) { return {}; }
  }
  function writeSeenIds(o) {
    try {
      var keys = Object.keys(o);
      if (keys.length > 100) { keys.slice(0, keys.length - 100).forEach(function (k) { delete o[k]; }); }
      localStorage.setItem(NOTIF_SEEN_KEY, JSON.stringify(o));
    } catch (e) {}
  }
  var serverNotifs = [];
  function allNotifs() {
    var local = readLocalNotifs();
    var merged = serverNotifs.concat(local);
    merged.sort(function (a, b) { return (b.created_at || 0) - (a.created_at || 0); });
    return merged.slice(0, 30);
  }
  function unreadCount() {
    var n = 0;
    serverNotifs.forEach(function (x) { if (!x.read) n++; });
    readLocalNotifs().forEach(function (x) { if (!x.read) n++; });
    return n;
  }
  function updateNotifBadge() {
    var els = document.querySelectorAll('.notif-count');
    var n = unreadCount();
    for (var i = 0; i < els.length; i++) {
      els[i].textContent = n > 0 ? (n > 9 ? '9+' : n) : '';
      els[i].style.display = n > 0 ? '' : 'none';
    }
  }
  function relTime(ts) {
    var d = Date.now() - (ts || 0);
    if (d < 60000) return 'just now';
    if (d < 3600000) return Math.floor(d / 60000) + 'm ago';
    if (d < 86400000) return Math.floor(d / 3600000) + 'h ago';
    return Math.floor(d / 86400000) + 'd ago';
  }
  var notifFirstPoll = true;
  /* In-page popup when the bell goes off with a new notification.
     "Available again" alerts render like an order-summary line: photo, title, price, Add to cart. */
  function notifPopup(n) {
    var wrap = document.getElementById('bsr-notif-popups');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'bsr-notif-popups';
      wrap.className = 'bsr-notif-popups';
      document.body.appendChild(wrap);
    }
    if (wrap.querySelector('[data-nid="' + n.id + '"]')) return;
    while (wrap.children.length >= 3) wrap.removeChild(wrap.firstChild);
    var el = document.createElement('div');
    el.className = 'bsr-notif-popup';
    el.setAttribute('data-nid', n.id);
    function dismiss() { if (el.parentNode) el.parentNode.removeChild(el); }
    var closeBtn = '<button class="bsr-notif-popup-x" aria-label="Dismiss">&times;</button>';
    if (n.title === 'Available again' && n.product) {
      var p = n.product;
      el.innerHTML = closeBtn +
        '<div class="bsr-np-row">' +
          (p.image ? '<img class="bsr-np-img" src="' + esc(p.image) + '" alt="">'
                   : '<div class="bsr-np-img bsr-np-noimg"></div>') +
          '<div class="bsr-np-main">' +
            '<div class="t">' + esc((p.item_number ? p.item_number + ' \u00B7 ' : '') + (p.title || n.title)) + '</div>' +
            '<div class="bsr-np-price">' + money(p.price_cents) + '</div>' +
            '<div class="b">' + esc(n.body) + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="bsr-modal-actions">' +
          '<button class="btn btn-primary btn-sm bsr-np-add" type="button">Add to cart</button>' +
          (n.url ? '<a class="btn btn-secondary btn-sm" href="' + esc(n.url) + '">View</a>' : '') +
        '</div>' +
        '<div class="bsr-np-urgent">Act fast \u2014 it\u2019s one of a kind and could sell any minute.</div>' +
        '<div class="bsr-np-err" style="display:none"></div>';
      el.querySelector('.bsr-notif-popup-x').addEventListener('click', function (ev) { ev.stopPropagation(); dismiss(); });
      var addBtn = el.querySelector('.bsr-np-add');
      addBtn.addEventListener('click', function (ev) {
        ev.stopPropagation();
        addBtn.disabled = true;
        addBtn.textContent = 'Adding\u2026';
        BSR.cart.add(n.slug).then(function (r) {
          if (r && r.ok) { dismiss(); toast('Added \u2014 reserved for 30 minutes'); pollNotifications(); }
          else {
            var err = el.querySelector('.bsr-np-err');
            err.style.display = '';
            err.textContent = (r && r.error) || 'Could not add it right now.';
            addBtn.disabled = false;
            addBtn.textContent = 'Add to cart';
          }
        });
      });
    } else {
      el.innerHTML = closeBtn +
        '<div class="t">' + esc(n.title) + '</div>' +
        '<div class="b">' + esc(n.body) + '</div>' +
        (n.url ? '<span class="bsr-notif-popup-a">View &rsaquo;</span>' : '');
      el.querySelector('.bsr-notif-popup-x').addEventListener('click', function (ev) { ev.stopPropagation(); dismiss(); });
      if (n.url) el.addEventListener('click', function () { window.location.href = n.url; });
    }
    wrap.appendChild(el);
    setTimeout(dismiss, 15000);
  }
  function pollNotifications() {
    return api('/api/notifications?bid=' + encodeURIComponent(bid())).then(function (j) {
      if (!j || !j.ok) return;
      serverNotifs = j.notifications || [];
      var seen = readSeenIds(), changed = false, fresh = [];
      serverNotifs.forEach(function (n) {
        if (!seen[n.id]) { seen[n.id] = 1; changed = true; if (!n.read) fresh.push(n); }
      });
      if (changed) writeSeenIds(seen);
      if (!notifFirstPoll && fresh.length) {
        var panelOpen = notifPanelEl && notifPanelEl.classList.contains('open');
        fresh.forEach(function (n) {
          if (('Notification' in window) && Notification.permission === 'granted') {
            try { new Notification(n.title, { body: n.body, icon: '/assets/img/logo.png', tag: n.id }); } catch (e) {}
          }
          if (!panelOpen) notifPopup(n);
        });
      }
      notifFirstPoll = false;
      updateNotifBadge();
      renderNotifPanel();
    }).catch(function () {});
  }
  /* A notification created on this device (e.g. wishlist moves). */
  function notifyLocal(title, body, slug) {
    var a = readLocalNotifs();
    a.unshift({ id: 'l' + Date.now(), title: title, body: body, slug: slug || '',
      url: slug ? '/product.html?slug=' + encodeURIComponent(slug) : '/cart/',
      created_at: Date.now(), read: false });
    try { localStorage.setItem(LOCAL_NOTIF_KEY, JSON.stringify(a.slice(0, 20))); } catch (e) {}
    updateNotifBadge();
    renderNotifPanel();
    if (('Notification' in window) && Notification.permission === 'granted') {
      try { new Notification(title, { body: body, icon: '/assets/img/logo.png' }); } catch (e) {}
    }
  }
  function markNotifsRead() {
    var ids = serverNotifs.filter(function (n) { return !n.read; }).map(function (n) { return n.id; });
    serverNotifs.forEach(function (n) { n.read = true; });
    var local = readLocalNotifs(), touched = false;
    local.forEach(function (n) { if (!n.read) { n.read = true; touched = true; } });
    if (touched) { try { localStorage.setItem(LOCAL_NOTIF_KEY, JSON.stringify(local)); } catch (e) {} }
    updateNotifBadge();
    renderNotifPanel();
    if (ids.length) api('/api/notifications/read', { method: 'POST', body: { bid: bid(), ids: ids } }).catch(function () {});
  }

  /* Bell dropdown panel (built once). */
  var notifPanelEl = null;
  function notifCss() {
    if (document.getElementById('bsr-notif-css')) return;
    var st = document.createElement('style');
    st.id = 'bsr-notif-css';
    st.textContent =
      '.notif-btn{position:relative}' +
      '.notif-count{position:absolute;top:2px;right:2px;min-width:16px;height:16px;padding:0 4px;border-radius:8px;' +
      'background:#c0392b;color:#fff;font-size:10px;line-height:16px;text-align:center;font-weight:700}' +
      '.wish-count{position:absolute;top:2px;right:2px;min-width:16px;height:16px;padding:0 4px;border-radius:8px;' +
      'background:var(--gold,#c9a227);color:#2a241b;font-size:10px;line-height:16px;text-align:center;font-weight:700}' +
      '.wish-count:empty{display:none}' +
      '.card-img{position:relative}' +
      '.wish-toggle{position:absolute;top:8px;right:8px;width:36px;height:36px;border-radius:50%;border:0;cursor:pointer;' +
      'background:rgba(255,255,255,.94);color:#5a5348;display:flex;align-items:center;justify-content:center;' +
      'box-shadow:0 2px 8px rgba(0,0,0,.20);z-index:2;padding:0;transition:transform .15s ease,color .15s ease}' +
      '.wish-toggle:hover{transform:scale(1.1)}' +
      '.wish-toggle.on{color:#c0392b}' +
      '.wish-toggle.on svg{fill:#c0392b}' +
      '.notif-panel{position:fixed;top:64px;right:12px;width:min(360px,calc(100vw - 24px));max-height:70vh;overflow:auto;' +
      'background:var(--card,#fff);border:1px solid var(--border,#e2ddd2);border-radius:12px;box-shadow:0 12px 40px rgba(0,0,0,.18);' +
      'z-index:1200;padding:8px;display:none}' +
      '.notif-panel.open{display:block}' +
      '.notif-panel h3{margin:6px 8px 4px;font-size:15px}' +
      '.notif-item{display:block;padding:10px 8px;border-top:1px solid var(--border,#eee);text-decoration:none;color:inherit}' +
      '.notif-item:first-of-type{border-top:0}' +
      '.notif-item .t{font-weight:700;font-size:14px}' +
      '.notif-item .b{font-size:13px;color:var(--muted,#666);margin-top:2px}' +
      '.notif-item .w{font-size:11px;color:var(--muted,#999);margin-top:4px}' +
      '.notif-item.unread .t::before{content:"";display:inline-block;width:8px;height:8px;border-radius:4px;background:#c0392b;margin-right:6px}' +
      '.notif-empty{padding:18px 8px;text-align:center;color:var(--muted,#777);font-size:14px}' +
      '.bsr-notif-popups{position:fixed;right:12px;bottom:12px;z-index:1400;display:flex;flex-direction:column;gap:8px;max-width:min(360px,calc(100vw - 24px))}' +
      '.bsr-notif-popup{position:relative;background:var(--card,#fff);border:1px solid var(--border,#e2ddd2);border-radius:12px;' +
      'box-shadow:0 12px 40px rgba(0,0,0,.22);padding:12px 36px 12px 12px;cursor:pointer;animation:bsrPopIn .25s ease-out}' +
      '.bsr-notif-popup .t{font-weight:700;font-size:14px}' +
      '.bsr-notif-popup .b{font-size:13px;color:var(--muted,#666);margin-top:2px}' +
      '.bsr-notif-popup-a{display:inline-block;margin-top:6px;font-size:13px;font-weight:700;color:var(--accent,#1a5c3a)}' +
      '.bsr-notif-popup-x{position:absolute;top:6px;right:8px;border:0;background:none;font-size:18px;line-height:1;cursor:pointer;color:var(--muted,#999)}' +
      '.bsr-np-row{display:flex;gap:10px;align-items:flex-start}' +
      '.bsr-np-img{width:72px;height:72px;object-fit:cover;border-radius:8px;flex:none;background:var(--chip,#f1ece1)}' +
      '.bsr-np-noimg{display:block}' +
      '.bsr-np-main{flex:1;min-width:0}' +
      '.bsr-np-price{font-weight:700;margin-top:2px}' +
      '.bsr-notif-popup .bsr-modal-actions{margin-top:10px}' +
      '.bsr-np-err{color:#b3261e;font-size:13px;margin-top:8px}' +
      '.bsr-np-urgent{font-size:12px;font-weight:700;color:#9a5b00;margin-top:8px}' +
      '@keyframes bsrPopIn{from{transform:translateY(8px);opacity:0}to{transform:none;opacity:1}}' +
      '.notif-enable{margin:8px;padding:10px;border:1px dashed var(--border,#ccc);border-radius:8px;text-align:center;font-size:13px}' +
      '.bsr-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:1300;display:flex;align-items:center;justify-content:center;padding:16px}' +
      '.bsr-modal{background:var(--card,#fff);border-radius:14px;max-width:420px;width:100%;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,.25)}' +
      '.bsr-modal h2{margin:0 0 10px;font-size:20px}' +
      '.bsr-modal p{margin:0 0 10px;font-size:15px}' +
      '.bsr-modal .muted{color:var(--muted,#666);font-size:13px}' +
      '.bsr-modal #bsr-exp-count{font-variant-numeric:tabular-nums}' +
      '.bsr-modal-actions{display:flex;gap:10px;margin-top:16px;flex-wrap:wrap}' +
      '.held-note{display:flex;align-items:center;gap:8px;padding:10px 12px;border:1px solid var(--border,#e2ddd2);' +
      'border-radius:8px;background:var(--chip,#f7f4ec);font-size:14px;margin-bottom:10px}' +
      '.notify-box{border:1px solid var(--border,#e2ddd2);border-radius:8px;padding:12px;margin-bottom:10px}' +
      '.notify-box p{margin:0 0 8px;font-size:14px}' +
      '.notify-box .row{display:flex;gap:8px}' +
      '.notify-box input{flex:1}' +
      '.wish-line{display:flex;gap:10px;align-items:center;padding:10px 0;border-top:1px solid var(--border,#eee)}';
    document.head.appendChild(st);
  }
  function renderNotifPanel() {
    if (!notifPanelEl) return;
    var items = allNotifs();
    var permNote = '';
    if (('Notification' in window) && Notification.permission === 'default') {
      permNote = '<div class="notif-enable">Want a pop-up when a watched slide frees up?<br>' +
        '<button class="btn btn-secondary btn-sm" id="notif-enable-btn" type="button" style="margin-top:8px">Enable browser notifications</button></div>';
    }
    notifPanelEl.innerHTML = '<h3>Notifications</h3>' + permNote +
      (items.length ? items.map(function (n) {
        return '<a class="notif-item' + (n.read ? '' : ' unread') + '" href="' + esc(n.url || '/shop/') + '">' +
          '<div class="t">' + esc(n.title) + '</div>' +
          '<div class="b">' + esc(n.body) + '</div>' +
          '<div class="w">' + relTime(n.created_at) + '</div></a>';
      }).join('') : '<div class="notif-empty">Nothing here yet.<br>We\u2019ll let you know when a watched slide becomes available.</div>');
    var eb = document.getElementById('notif-enable-btn');
    if (eb) eb.addEventListener('click', function () { enableBrowserNotifications(''); });
  }
  function wireNotifBell() {
    notifCss();
    var btn = document.getElementById('bsr-notif-btn');
    if (!btn) return;
    notifPanelEl = document.createElement('div');
    notifPanelEl.className = 'notif-panel';
    notifPanelEl.id = 'bsr-notif-panel';
    document.body.appendChild(notifPanelEl);
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = notifPanelEl.classList.toggle('open');
      if (open) { pollNotifications().then(function () { markNotifsRead(); }); }
    });
    document.addEventListener('click', function (e) {
      if (notifPanelEl && notifPanelEl.classList.contains('open') &&
          !notifPanelEl.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
        notifPanelEl.classList.remove('open');
      }
    });
    updateNotifBadge();
    renderNotifPanel();
  }

  /* ---------------- browser push ---------------- */
  function urlB64ToU8(s) {
    s = String(s).replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    var bin = atob(s), b = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) b[i] = bin.charCodeAt(i);
    return b;
  }
  function enableBrowserNotifications(email) {
    if (!('Notification' in window)) { toast('This browser doesn\u2019t support notifications', 'err'); return Promise.resolve(false); }
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return Notification.requestPermission().then(function (p) {
        if (p === 'granted') { toast('Notifications on for this visit'); pollNotifications(); return true; }
        return false;
      });
    }
    return Notification.requestPermission().then(function (p) {
      if (p !== 'granted') { toast('Notifications blocked in this browser', 'err'); return false; }
      return navigator.serviceWorker.register('/sw.js').then(function (reg) {
        return api('/api/push/vapid-key').then(function (j) {
          if (!j || !j.ok || !j.key) throw new Error('no vapid key');
          return reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlB64ToU8(j.key) });
        }).then(function (sub) {
          var sj = sub.toJSON();
          function sendInit() {
            try {
              var c = reg.active || reg.waiting;
              if (c) c.postMessage({ type: 'bsr-init', api: API, bid: bid() });
            } catch (e) {}
          }
          sendInit();
          if (reg.active) { try { reg.active.addEventListener('statechange', sendInit); } catch (e) {} }
          return api('/api/push/subscribe', { method: 'POST',
            body: { endpoint: sj.endpoint, keys: sj.keys, email: email || '', bid: bid() } });
        }).then(function () {
          toast('Browser notifications on');
          renderNotifPanel();
          pollNotifications();
          return true;
        });
      });
    }).catch(function () { toast('Could not turn on notifications', 'err'); return false; });
  }

  /* ---------------- reservation upkeep: activity heartbeat + expiry warning ---------------- */
  var lastActive = Date.now();
  function markActive() { lastActive = Date.now(); }
  ['mousemove', 'keydown', 'touchstart', 'click', 'scroll'].forEach(function (ev) {
    document.addEventListener(ev, markActive, { passive: true });
  });

  /* Remove sold/gone items from every local wishlist. The same slide may sit in
     many shoppers' wishlists; once it sells it is purged from all of them. */
  function pruneWishlist() {
    var slugs = wishlist.list();
    if (!slugs.length) return Promise.resolve(0);
    return api('/api/cart/status', { method: 'POST', body: { slugs: slugs, tokens: {} } }).then(function (j) {
      var n = 0;
      if (j && j.ok && j.status) {
        slugs.forEach(function (s) {
          var st = j.status[s];
          if ((st === 'sold' || st === 'gone') && wishlist.has(s)) { wishlist.remove(s); n++; }
        });
        if (n) paintWishToggles(document);
      }
      return n;
    }).catch(function () { return 0; });
  }
  function dropToWishlist(slug) {
    /* Sold/gone items never enter the wishlist: purge them everywhere instead. */
    api('/api/cart/status', { method: 'POST', body: { slugs: [slug], tokens: {} } }).then(function (j) {
      var st = (j && j.ok && j.status) ? j.status[slug] : null;
      if (st === 'sold' || st === 'gone') {
        cart.release(slug, false);
        if (wishlist.has(slug)) wishlist.remove(slug);
        paintWishToggles(document);
        toast('That slide just sold — removed from your cart', 'err');
        if (window.BSR && BSR._onCartDrop) { try { BSR._onCartDrop(slug); } catch (e) {} }
        return;
      }
      cart.release(slug, false);
      if (!wishlist.has(slug)) wishlist.add(slug);
      notifyLocal('Moved to your wishlist',
        'Your reservation ended before checkout. It\u2019s in your wishlist \u2014 add it back while it\u2019s still available.', slug);
      toast('Moved to your wishlist');
      if (window.BSR && BSR._onCartDrop) { try { BSR._onCartDrop(slug); } catch (e) {} }
    }).catch(function () {
      cart.release(slug, false);
      if (!wishlist.has(slug)) wishlist.add(slug);
      toast('Moved to your wishlist');
      if (window.BSR && BSR._onCartDrop) { try { BSR._onCartDrop(slug); } catch (e) {} }
    });
  }

  var expiryModalOpen = false, expiryTimer = null;
  function closeExpiryModal() {
    expiryModalOpen = false;
    if (expiryTimer) { clearInterval(expiryTimer); expiryTimer = null; }
    var m = document.getElementById('bsr-expiry-modal');
    if (m && m.parentNode) m.parentNode.removeChild(m);
  }
  function showExpiryModal(count) {
    if (expiryModalOpen) return;
    expiryModalOpen = true;
    notifCss();
    var overlay = document.createElement('div');
    overlay.id = 'bsr-expiry-modal';
    overlay.className = 'bsr-modal-overlay';
    var plural = count === 1 ? 'slide' : 'slides';
    overlay.innerHTML =
      '<div class="bsr-modal" role="dialog" aria-modal="true" aria-label="Reservation expiring">' +
      '<h2>Need more time?</h2>' +
      '<p>Your reservation for ' + count + ' ' + plural + ' ends in <strong id="bsr-exp-count">5:00</strong>.</p>' +
      '<p class="muted">After that ' + (count === 1 ? 'it goes' : 'they go') + ' back on sale and ' +
      (count === 1 ? 'moves' : 'move') + ' to your wishlist.</p>' +
      '<div class="bsr-modal-actions">' +
      '<button class="btn btn-primary" id="bsr-exp-keep" type="button">Yes \u2014 keep my ' + plural + '</button>' +
      '<button class="btn btn-secondary" id="bsr-exp-release" type="button">Release them</button>' +
      '</div></div>';
    document.body.appendChild(overlay);
    var tick = function () {
      var items = readCart().filter(function (i) { return i.token; });
      if (!items.length) { closeExpiryModal(); return; }
      var left = Math.min.apply(null, items.map(function (i) { return (i.exp || 0) - Date.now(); }));
      var el = document.getElementById('bsr-exp-count');
      if (el) {
        var s = Math.max(0, Math.ceil(left / 1000));
        el.textContent = Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2);
      }
      if (left <= 0) {
        closeExpiryModal();
        items.forEach(function (it) {
          cart.heartbeatOne(it).then(function (alive) { if (!alive) dropToWishlist(it.slug); });
        });
      }
    };
    expiryTimer = setInterval(tick, 1000);
    tick();
    document.getElementById('bsr-exp-keep').addEventListener('click', function () {
      markActive();
      var items = readCart().filter(function (i) { return i.token; });
      if (!items.length) { closeExpiryModal(); return; }
      var pending = items.length;
      items.forEach(function (it) {
        cart.heartbeatOne(it).then(function (alive) {
          if (!alive) dropToWishlist(it.slug);
          if (--pending <= 0) {
            closeExpiryModal();
            toast('Reservation extended 30 minutes');
            pollNotifications();
          }
        });
      });
    });
    document.getElementById('bsr-exp-release').addEventListener('click', function () {
      readCart().filter(function (i) { return i.token; }).forEach(function (it) { dropToWishlist(it.slug); });
      closeExpiryModal();
    });
  }

  function upkeepTick() {
    if (document.hidden) return;
    pollNotifications(); /* bell badge + popups stay live even with an empty cart */
    var items = readCart().filter(function (i) { return i.token; });
    if (!items.length) { if (expiryModalOpen) closeExpiryModal(); return; }
    var idle = (Date.now() - lastActive) > IDLE_MS;
    if (!idle) {
      /* Shopping actively: extend every hold. */
      if (expiryModalOpen) closeExpiryModal();
      items.forEach(function (it) {
        cart.heartbeatOne(it).then(function (alive) { if (!alive) dropToWishlist(it.slug); });
      });
      return;
    }
    /* Idle: only warn as the reservation runs out. */
    var now = Date.now();
    var minLeft = Math.min.apply(null, items.map(function (i) { return (i.exp || 0) - now; }));
    if (minLeft <= 0) {
      closeExpiryModal();
      items.forEach(function (it) {
        cart.heartbeatOne(it).then(function (alive) { if (!alive) dropToWishlist(it.slug); });
      });
      return;
    }
    if (minLeft < WARN_MS && !expiryModalOpen) showExpiryModal(items.length);
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
        '<button class="icon-btn notif-btn" id="bsr-notif-btn" aria-label="Notifications">' + icon('bell') + '<span class="notif-count"></span></button>' +
        '<a class="icon-btn" href="/account/?tab=wishlist" aria-label="Wishlist">' + icon('heart') + '<span class="wish-count"></span></a>' +
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
        '<a href="/account/?tab=wishlist">' + icon('heart', 'ic-sm') + 'Wishlist</a>' +
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
    wireNotifBell();
    updateWishBadge();
    wireWishToggles();
    setInterval(upkeepTick, 30 * 1000);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) { markActive(); upkeepTick(); } });
    upkeepTick();
    pollNotifications();
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
      /* Check auth first: signed in -> /account/, else -> /account/login/. */
      var done = false;
      function go(url) { if (!done) { done = true; window.location = url; } }
      /* Timeout fallback: if me() hangs, go to login (which redirects if signed in). */
      setTimeout(function () { go('/account/login/'); }, 2000);
      try {
        me().then(function (c) { go(c ? '/account/' : '/account/login/'); })
            .catch(function () { go('/account/login/'); });
      } catch (err) { go('/account/login/'); }
    });
  }

  window.BSR = {
    api: api, money: money, esc: esc, icon: icon,
    cart: cart, updateCartBadge: updateCartBadge, wishlist: wishlist, updateWishBadge: updateWishBadge,
    wishToggleHtml: wishToggleHtml, paintWishToggles: paintWishToggles, pruneWishlist: pruneWishlist,
    bid: bid, pollNotifications: pollNotifications, notifyLocal: notifyLocal,
    enableBrowserNotifications: enableBrowserNotifications, markNotifsRead: markNotifsRead,
    dropToWishlist: dropToWishlist,
    loadTheme: loadTheme, applyTheme: applyTheme, loadMenus: loadMenus,
    me: me, toast: toast, init: init,
    setConsent: setConsent, consentState: consentState,
    showLogin: showLogin, wireAccountButtons: wireAccountButtons,
    API: API
  };
})();
