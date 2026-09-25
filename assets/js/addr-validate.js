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
      street: payload.address1, street2: payload.address2, city: payload.city, state: payload.state,
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


  function ensureLiveCss() {
    if (document.getElementById('bsr-addr-live-css')) return;
    var st = document.createElement('style');
    st.id = 'bsr-addr-live-css';
    st.textContent =
      '.addr-live-dd{position:relative;margin-top:6px;background:#fff;border:1px solid #d8cdb4;' +
      'border-radius:10px;box-shadow:0 6px 18px rgba(0,0,0,.12);overflow:hidden}' +
      '.addr-live-item{display:flex;justify-content:space-between;align-items:center;gap:10px;width:100%;' +
      'text-align:left;background:#fff;border:0;border-bottom:1px solid #eee7d3;padding:10px 12px;' +
      'cursor:pointer;font:inherit;color:#222}' +
      '.addr-live-item:last-of-type{border-bottom:0}' +
      '.addr-live-item:active{background:#f4efe2}' +
      '.addr-live-addr{line-height:1.4;font-size:14px}' +
      '.addr-live-use{flex:none;background:#1d4d2b;color:#fff;border-radius:999px;padding:5px 14px;font-size:13px}' +
      '.addr-live-x{position:absolute;top:0;right:2px;border:0;background:none;color:#999;' +
      'font-size:15px;cursor:pointer;padding:6px 8px;line-height:1}' +
      '.addr-live-ok{padding:10px 12px;color:#1d4d2b;font-size:14px}';
    document.head.appendChild(st);
  }

  /* US state name -> abbreviation, for suggestion fills. */
  var US_ST_ABBR = { alabama: 'AL', alaska: 'AK', arizona: 'AZ', arkansas: 'AR', california: 'CA',
    colorado: 'CO', connecticut: 'CT', delaware: 'DE', 'district of columbia': 'DC', florida: 'FL',
    georgia: 'GA', hawaii: 'HI', idaho: 'ID', illinois: 'IL', indiana: 'IN', iowa: 'IA', kansas: 'KS',
    kentucky: 'KY', louisiana: 'LA', maine: 'ME', maryland: 'MD', massachusetts: 'MA', michigan: 'MI',
    minnesota: 'MN', mississippi: 'MS', missouri: 'MO', montana: 'MT', nebraska: 'NE', nevada: 'NV',
    'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY',
    'north carolina': 'NC', 'north dakota': 'ND', ohio: 'OH', oklahoma: 'OK', oregon: 'OR',
    pennsylvania: 'PA', 'rhode island': 'RI', 'south carolina': 'SC', 'south dakota': 'SD',
    tennessee: 'TN', texas: 'TX', utah: 'UT', vermont: 'VT', virginia: 'VA', washington: 'WA',
    'west virginia': 'WV', wisconsin: 'WI', wyoming: 'WY' };

  function fireChange(el) {
    var ev;
    try { ev = new Event('change', { bubbles: true }); }
    catch (e) { ev = document.createEvent('HTMLEvents'); ev.initEvent('change', true, false); }
    el.dispatchEvent(ev);
  }

  /* Fill the form from a tapped autocomplete suggestion. */
  function fillChoice(form, s) {
    function set(name, val) {
      var el = form.querySelector('[name="' + name + '"]');
      if (!el || val == null || val === '') return;
      if (el.tagName === 'SELECT') {
        el.value = val;
        if (!el.value) {
          for (var i = 0; i < el.options.length; i++) {
            if (el.options[i].text.toLowerCase() === String(val).toLowerCase()) { el.selectedIndex = i; break; }
          }
        }
      } else { el.value = val; }
      fireChange(el);
    }
    set('address1', s.street);
    set('city', s.city);
    var st = s.state || '';
    if (st.length !== 2) st = US_ST_ABBR[String(st).toLowerCase()] || st;
    set('state', st.toUpperCase());
    set('postal', (s.zip || '').split(' ')[0]);
    if (s.country) set('country', s.country);
  }

  function fetchSuggestions(q, country) {
    if (!window.BSR || !BSR.api) return Promise.resolve(null);
    return BSR.api('/api/shipping/autocomplete?q=' + encodeURIComponent(q) +
      '&country=' + encodeURIComponent(country || 'US'));
  }

  /* Live as-you-type address autocomplete. A dropdown under the street
     field shows up to 5 matching addresses; tapping one fills the form.
     Shippo still does the final validation silently at save time. */
  /* Keep the browser's own autofill off the address fields so our
     suggestions are the single dropdown. readonly is set here in JS (not
     in the HTML) so a script failure can never leave the form untypeable;
     it is lifted the moment the field is focused. */
  function blockBrowserAutofill(form) {
    form.setAttribute('autocomplete', 'off');
    ['address1', 'address2', 'city', 'postal'].forEach(function (n) {
      var el = form.querySelector('input[name="' + n + '"]');
      if (el) { el.setAttribute('autocomplete', 'off'); el.setAttribute('readonly', 'readonly'); }
    });
    if (!window._bsrAutofillBlockWired) {
      window._bsrAutofillBlockWired = true;
      document.addEventListener('focusin', function (e) {
        var el = e.target;
        if (el && el.matches && el.matches('form.addr-form input[readonly]')) el.removeAttribute('readonly');
      });
    }
  }

  function attachLive(form) {
    var streetEl = form.querySelector('input[name="address1"]');
    var cityEl = form.querySelector('input[name="city"]');
    if (!streetEl || form._bsrLiveAttached) return;
    form._bsrLiveAttached = true;
    ensureLiveCss();
    blockBrowserAutofill(form);

    var anchor = streetEl.closest('.acct-field') || streetEl.parentNode;
    var dd = document.createElement('div');
    dd.className = 'addr-live-dd';
    dd.style.display = 'none';
    anchor.appendChild(dd);

    var timer = null, lastQ = '', dismissedQ = '', seq = 0;

    function hideDd() { dd.style.display = 'none'; dd.innerHTML = ''; }
    function contextQuery() {
      var q = streetEl.value.trim();
      var ct = cityEl ? cityEl.value.trim() : '';
      return ct ? q + ', ' + ct : q;
    }
    function showChoices(list) {
      var html = '';
      list.forEach(function (s, i) {
        html += '<button type="button" class="addr-live-item" data-pick="' + i + '">' +
          '<span class="addr-live-addr">' + esc(s.label || [s.street, s.city, s.state, s.zip].filter(Boolean).join(', ')) + '</span>' +
          '<span class="addr-live-use">Use</span></button>';
      });
      html += '<button type="button" class="addr-live-x" data-dismiss aria-label="Dismiss">&times;</button>';
      dd.innerHTML = html;
      dd.style.display = 'block';
      dd.querySelectorAll('[data-pick]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var s = list[+btn.getAttribute('data-pick')];
          fillChoice(form, s);
          form._bsrValDismissed = '';
          dd.innerHTML = '<div class="addr-live-ok">&#10003; Address filled in.</div>';
          setTimeout(hideDd, 1300);
          lastQ = '__picked__';
        });
      });
      dd.querySelector('[data-dismiss]').addEventListener('click', function () {
        dismissedQ = lastQ;
        form._bsrValDismissed = '__dismissed__';
        hideDd();
      });
    }
    function run() {
      var q = contextQuery();
      /* Typing a new address after a dismissal re-arms save-time verification. */
      if (q !== dismissedQ && form._bsrValDismissed === '__dismissed__') form._bsrValDismissed = '';
      if (q.length < 4 || q === lastQ || q === dismissedQ) { if (q !== lastQ) hideDd(); return; }
      lastQ = q;
      var mySeq = ++seq;
      var countryEl = form.querySelector('[name="country"]');
      fetchSuggestions(q, countryEl ? countryEl.value : 'US').then(function (j) {
        if (mySeq !== seq) return; /* stale */
        if (j && j.ok && j.suggestions && j.suggestions.length) showChoices(j.suggestions);
        else hideDd();
      }).catch(function () { hideDd(); });
    }
    function schedule() {
      if (timer) clearTimeout(timer);
      timer = setTimeout(run, 600);
    }
    streetEl.addEventListener('input', schedule);
    if (cityEl) cityEl.addEventListener('input', schedule);
    if (streetEl.value.trim().length >= 4) timer = setTimeout(run, 600);
  }

  /* Silent submit-time check: validate, fold any corrections into the
     payload, then save. No confirmation dialog. Never blocks saving. */
  function silentCheck(form, payload, doSave) {
    /* User dismissed the suggestions: save their address exactly as typed. */
    if (form._bsrValDismissed === '__dismissed__') { doSave(payload); return; }
    var psig = [payload.address1, payload.city, payload.postal].join('|').toLowerCase();
    if (form._bsrValDismissed && form._bsrValDismissed === psig) { doSave(payload); return; }
    validate(payload).then(function (j) {
      var out = payload;
      if (j && j.ok && j.address &&
          (j.corrected || (j.corrections && j.corrections.length)) &&
          differs(j.address, payload)) {
        var a = j.address;
        out = {
          address1: a.street || payload.address1,
          address2: a.street2 || '',
          city: a.city || payload.city,
          state: a.state || payload.state,
          postal: a.zip || payload.postal,
          country: a.country || payload.country,
          is_default_shipping: payload.is_default_shipping,
          is_default_billing: payload.is_default_billing,
        };
      }
      doSave(out);
    }).catch(function () { doSave(payload); });
  }

  window.BSRAddrValidate = { validate: validate, checkAndConfirm: checkAndConfirm, attachLive: attachLive, silentCheck: silentCheck };
})();
