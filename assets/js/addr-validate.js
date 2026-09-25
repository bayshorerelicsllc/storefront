/* Bay Shore Relics — address auto-validation (Shippo via Commerce Manager).
   Shared module for the account address book and checkout.
   Usage: BSRAddrValidate.checkAndConfirm(form, payload, doSave)
   - form: the <form> element (must contain #addr-validate-msg or .addr-validate-msg)
   - payload: { address1, address2, city, state, postal, country }
   - doSave: function(payload) called when the address is accepted.
   Never blocks saving: on validator error or undeliverable address the user
   can always keep their version. */
(function () {
  'use strict';

  var ENDPOINT = '/api/shipping/validate-address';

  function qs(obj) {
    return Object.keys(obj).map(function (k) {
      return encodeURIComponent(k) + '=' + encodeURIComponent(obj[k] || '');
    }).join('&');
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function msgEl(form) {
    return form.querySelector('#addr-validate-msg, .addr-validate-msg');
  }

  function fmtAddr(a) {
    var parts = [a.address1 || a.street];
    if (a.address2 || a.street2) parts.push(a.address2 || a.street2);
    parts.push([a.city, a.state, a.postal || a.zip].filter(Boolean).join(', '));
    if (a.country) parts.push(a.country);
    return parts.filter(Boolean).join('<br>');
  }

  /* Compare the corrected address to what the user typed. True when the
     validator changed something meaningful. */
  function differs(corrected, payload) {
    if (!corrected) return false;
    var norm = function (s) { return String(s || '').trim().toLowerCase().replace(/[.,]/g, ''); };
    return norm(corrected.street) !== norm(payload.address1) ||
           norm(corrected.street2) !== norm(payload.address2) ||
           norm(corrected.city) !== norm(payload.city) ||
           norm(corrected.state) !== norm(payload.state) ||
           norm(corrected.zip) !== norm(payload.postal);
  }

  function validate(payload) {
    if (!window.BSR || !BSR.api) return Promise.resolve({ ok: false, error: 'unavailable' });
    return BSR.api(ENDPOINT + '?' + qs({
      street: payload.address1, city: payload.city, state: payload.state,
      zip: payload.postal, country: payload.country || 'US',
    }));
  }

  /* Main entry: validate, then either save directly or ask the user. */
  function checkAndConfirm(form, payload, doSave) {
    var box = msgEl(form);
    var btn = form.querySelector('[type="submit"]');
    if (btn) btn.disabled = true;
    if (box) box.innerHTML = '<p class="addr-val-note">Checking address&hellip;</p>';

    function done() { if (btn) btn.disabled = false; }

    validate(payload).then(function (j) {
      done();
      /* Validator unreachable or errored: don't block the save. */
      if (!j || !j.ok) { doSave(payload); return; }

      var corrected = j.address || null;
      var suggested = (j.corrected || (j.corrections && j.corrections.length)) && differs(corrected, payload);

      if (j.deliverable && !suggested) {
        if (box) box.innerHTML = '<p class="addr-val-ok">&#10003; Address looks good.</p>';
        doSave(payload);
        return;
      }

      if (suggested) {
        /* Offer the corrected version. */
        if (box) box.innerHTML =
          '<div class="addr-val-suggest"><p><strong>Did you mean:</strong><br>' + fmtAddr({
            address1: corrected.street, address2: corrected.street2,
            city: corrected.city, state: corrected.state,
            postal: corrected.zip, country: corrected.country || payload.country,
          }) + '</p>' +
          '<div class="addr-val-actions">' +
          '<button type="button" class="btn btn-primary btn-sm" data-val-use>Use suggested</button> ' +
          '<button type="button" class="btn btn-ghost btn-sm" data-val-keep>Keep mine</button>' +
          '</div></div>';
        var useBtn = box.querySelector('[data-val-use]');
        var keepBtn = box.querySelector('[data-val-keep]');
        if (useBtn) useBtn.addEventListener('click', function () {
          var fixed = {
            address1: corrected.street || payload.address1,
            address2: corrected.street2 || '',
            city: corrected.city || payload.city,
            state: corrected.state || payload.state,
            postal: corrected.zip || payload.postal,
            country: corrected.country || payload.country,
            is_default_shipping: payload.is_default_shipping,
            is_default_billing: payload.is_default_billing,
          };
          if (box) box.innerHTML = '<p class="addr-val-ok">&#10003; Using the verified address.</p>';
          doSave(fixed);
        });
        if (keepBtn) keepBtn.addEventListener('click', function () {
          if (box) box.innerHTML = '';
          doSave(payload);
        });
        return;
      }

      /* Not deliverable (or no suggestion): warn but allow save. */
      var reasons = (j.reasons && j.reasons.length) ? j.reasons[0] : 'We could not verify this address.';
      if (box) box.innerHTML =
        '<div class="addr-val-warn"><p><strong>Heads up:</strong> ' + esc(reasons) +
        ' You can still save it, but deliveries may fail.</p>' +
        '<div class="addr-val-actions">' +
        '<button type="button" class="btn btn-primary btn-sm" data-val-keep>Save anyway</button> ' +
        '<button type="button" class="btn btn-ghost btn-sm" data-val-edit>Edit address</button>' +
        '</div></div>';
      var saveBtn = box.querySelector('[data-val-keep]');
      var editBtn = box.querySelector('[data-val-edit]');
      if (saveBtn) saveBtn.addEventListener('click', function () {
        if (box) box.innerHTML = '';
        doSave(payload);
      });
      if (editBtn) editBtn.addEventListener('click', function () {
        if (box) box.innerHTML = '';
        var first = form.querySelector('input[name="address1"]');
        if (first) first.focus();
      });
    }).catch(function () {
      done();
      doSave(payload); /* never block on validator failure */
    });
  }


  /* Live as-you-type validation. Attaches debounced listeners to the
     street/city/ZIP fields: shows a live status and offers one-tap
     fill-in of the corrected address. Never blocks typing or saving. */
  function attachLive(form) {
    var box = msgEl(form);
    if (!box || form._bsrLiveAttached) return;
    form._bsrLiveAttached = true;
    var streetEl = form.querySelector('input[name="address1"]');
    var cityEl = form.querySelector('input[name="city"]');
    var zipEl = form.querySelector('input[name="postal"]');
    if (!streetEl) return;
    var timer = null, lastSig = '';

    function sig() {
      return [streetEl.value, cityEl ? cityEl.value : '', zipEl ? zipEl.value : ''].join('|').toLowerCase();
    }
    function ready() {
      var st = streetEl.value.trim();
      var zp = zipEl ? zipEl.value.trim() : '';
      var ct = cityEl ? cityEl.value.trim() : '';
      return st.length >= 5 && (zp.length >= 3 || ct.length >= 2);
    }
    function fieldVal(name) {
      var el = form.querySelector('[name="' + name + '"]');
      return el ? el.value : '';
    }
    function setField(name, val) {
      var el = form.querySelector('[name="' + name + '"]');
      if (!el || val == null) return;
      el.value = val;
      var ev;
      try { ev = new Event('change', { bubbles: true }); }
      catch (e) { ev = document.createEvent('HTMLEvents'); ev.initEvent('change', true, false); }
      el.dispatchEvent(ev);
    }
    function run() {
      var s = sig();
      if (s === lastSig) return;
      lastSig = s;
      if (!ready()) {
        if (box.querySelector('.addr-val-ok,.addr-val-note')) box.innerHTML = '';
        return;
      }
      box.innerHTML = '<p class="addr-val-note">Checking address&hellip;</p>';
      var payload = {
        address1: streetEl.value.trim(),
        address2: fieldVal('address2'),
        city: cityEl ? cityEl.value.trim() : '',
        state: fieldVal('state'),
        postal: zipEl ? zipEl.value.trim() : '',
        country: fieldVal('country') || 'US',
      };
      validate(payload).then(function (j) {
        if (sig() !== s) return; /* user kept typing; stale result */
        if (!j || !j.ok) { box.innerHTML = ''; return; }
        var corrected = j.address || null;
        var suggested = (j.corrected || (j.corrections && j.corrections.length)) && differs(corrected, payload);
        if (j.deliverable && !suggested) {
          box.innerHTML = '<p class="addr-val-ok">&#10003; Address looks good.</p>';
          return;
        }
        if (suggested) {
          box.innerHTML =
            '<div class="addr-val-suggest"><p><strong>Did you mean:</strong><br>' + fmtAddr({
              address1: corrected.street, address2: corrected.street2,
              city: corrected.city, state: corrected.state,
              postal: corrected.zip, country: corrected.country || payload.country,
            }) + '</p>' +
            '<div class="addr-val-actions">' +
            '<button type="button" class="btn btn-primary btn-sm" data-live-use>Use this address</button>' +
            '</div></div>';
          var useBtn = box.querySelector('[data-live-use]');
          if (useBtn) useBtn.addEventListener('click', function () {
            setField('address1', corrected.street || payload.address1);
            setField('address2', corrected.street2 || '');
            setField('city', corrected.city || payload.city);
            setField('state', corrected.state || payload.state);
            setField('postal', corrected.zip || payload.postal);
            box.innerHTML = '<p class="addr-val-ok">&#10003; Address updated.</p>';
            lastSig = sig();
          });
          return;
        }
        box.innerHTML = '';
      }).catch(function () { /* stay silent; the submit-time check still runs */ });
    }
    function schedule() {
      if (timer) clearTimeout(timer);
      timer = setTimeout(run, 800);
    }
    [streetEl, cityEl, zipEl].forEach(function (el) {
      if (el) el.addEventListener('input', schedule);
    });
    /* Validate pre-filled values right away (e.g. editing a saved address). */
    if (ready()) timer = setTimeout(run, 600);
  }

  window.BSRAddrValidate = { validate: validate, checkAndConfirm: checkAndConfirm, attachLive: attachLive };
})();
