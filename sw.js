/* Bay Shore Relics push service worker.
   The server only sends "tickle" pushes (no payload); on wake the worker
   fetches the real notification content from the API inbox. */
var CFG = { api: '', bid: '' };

function idb() {
  return new Promise(function (res, rej) {
    var r = indexedDB.open('bsr-push', 1);
    r.onupgradeneeded = function () { r.result.createObjectStore('cfg'); };
    r.onsuccess = function () { res(r.result); };
    r.onerror = function () { rej(r.error); };
  });
}
function saveCfg() {
  return idb().then(function (db) {
    return new Promise(function (res, rej) {
      var tx = db.transaction('cfg', 'readwrite');
      tx.objectStore('cfg').put({ api: CFG.api, bid: CFG.bid }, 'cfg');
      tx.oncomplete = function () { res(); };
      tx.onerror = function () { rej(tx.error); };
    });
  });
}
function loadCfg() {
  return idb().then(function (db) {
    return new Promise(function (res) {
      var tx = db.transaction('cfg', 'readonly');
      var g = tx.objectStore('cfg').get('cfg');
      g.onsuccess = function () {
        var v = g.result || {};
        if (v.api) CFG.api = v.api;
        if (v.bid) CFG.bid = v.bid;
        res();
      };
      g.onerror = function () { res(); };
    });
  }).catch(function () {});
}
function urlB64ToU8(s) {
  s = String(s).replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  var bin = atob(s), b = new Uint8Array(bin.length);
  for (var i = 0; i < bin.length; i++) b[i] = bin.charCodeAt(i);
  return b;
}

self.addEventListener('message', function (e) {
  var d = e.data || {};
  if (d.type === 'bsr-init' && d.api && d.bid) {
    CFG.api = d.api;
    CFG.bid = d.bid;
    saveCfg().catch(function () {});
  }
});

self.addEventListener('push', function (e) {
  e.waitUntil((async function () {
    await loadCfg();
    if (!CFG.api || !CFG.bid) return;
    try {
      var r = await fetch(CFG.api + '/api/notifications?bid=' + encodeURIComponent(CFG.bid) + '&via=push');
      var j = await r.json();
      var list = (j && j.ok && j.notifications) || [];
      for (var n of list) {
        await self.registration.showNotification(n.title, {
          body: n.body,
          icon: '/assets/img/logo.png',
          badge: '/assets/img/logo-icon.png',
          tag: n.id,
          data: { url: n.url || '/shop/' }
        });
      }
    } catch (err) { /* stay silent on fetch failure */ }
  })());
});

self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var path = (e.notification.data && e.notification.data.url) || '/shop/';
  var url = new URL(path, self.location.origin).href;
  e.waitUntil((async function () {
    var wins = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (var w of wins) {
      try {
        if (new URL(w.url).origin === self.location.origin) {
          await w.focus();
          await w.navigate(url);
          return;
        }
      } catch (err) {}
    }
    await clients.openWindow(url);
  })());
});

self.addEventListener('pushsubscriptionchange', function (e) {
  e.waitUntil((async function () {
    await loadCfg();
    if (!CFG.api || !CFG.bid) return;
    try {
      var r = await fetch(CFG.api + '/api/push/vapid-key');
      var j = await r.json();
      if (!j || !j.ok || !j.key) return;
      var sub = await self.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToU8(j.key)
      });
      var sj = sub.toJSON();
      await fetch(CFG.api + '/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: sj.endpoint, keys: sj.keys, bid: CFG.bid })
      });
    } catch (err) {}
  })());
});
