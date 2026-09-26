/* Bay Shore Relics — shared checkout helpers (clean 3-page flow).
   Small, shared pieces used by /checkout/ and /checkout/shipping/.
   No page-specific ids in here except the modal root #bsr-val-modal-root. */
(function () {
  'use strict';

  function val(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }
  function setV(id, v) {
    var el = document.getElementById(id);
    if (el) el.value = (v == null ? '' : v);
  }
  function setSel(id, v) {
    var el = document.getElementById(id);
    if (el) el.value = (v || 'US');
  }

  function cleanPhone(v) {
    var s = String(v == null ? '' : v).trim();
    if (!s) return '';
    var plus = s.charAt(0) === '+' ? '+' : '';
    return (plus + s.replace(/\D/g, '')).slice(0, 41);
  }

  function fieldErr(inputId, msg) {
    var input = document.getElementById(inputId);
    if (!input) return;
    var errId = 'e-' + inputId;
    var errEl = document.getElementById(errId);
    if (!errEl) {
      errEl = document.createElement('div');
      errEl.id = errId;
      errEl.className = 'field-error';
      errEl.style.cssText = 'color:#c00;font-size:12px;margin-top:4px;display:none;';
      input.parentNode.appendChild(errEl);
    }
    if (msg) {
      errEl.textContent = msg;
      errEl.style.display = 'block';
      input.style.borderColor = '#c00';
    } else {
      errEl.style.display = 'none';
      input.style.borderColor = '';
    }
  }

  function clearFieldErrs(scopeSelector) {
    var root = scopeSelector ? document.querySelector(scopeSelector) : document;
    if (!root) return;
    var errs = root.querySelectorAll('.field-error');
    for (var i = 0; i < errs.length; i++) errs[i].style.display = 'none';
    var inputs = root.querySelectorAll('input');
    for (var j = 0; j < inputs.length; j++) inputs[j].style.borderColor = '';
  }

  function emailOk(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim());
  }

  function unitAlreadyInAddress(suggUnit, origAddr1, origAddr2) {
    if (!suggUnit) return false;
    var origFull = ((origAddr1 || '') + ' ' + (origAddr2 || '')).toLowerCase();
    var suggLower = suggUnit.toLowerCase().trim();
    if (origFull.indexOf(suggLower) !== -1) return true;
    var m = suggLower.match(/([a-z]*\d+[a-z]*|\d+)\s*$/);
    if (m) {
      var unitId = (m[1] || m[0]).replace(/[^a-z0-9]/g, '');
      if (unitId) {
        var re = new RegExp('\\b' + unitId + '\\b');
        if (re.test(origFull)) return true;
      }
    }
    return false;
  }

  function modalRoot() {
    return document.getElementById('bsr-val-modal-root');
  }

  function fmtAddr(a) {
    var lines = [];
    if (a.address1 || a.street) lines.push(a.address1 || a.street);
    if (a.address2 || a.street2) lines.push(a.address2 || a.street2);
    var csz = '';
    if (a.city && a.state) csz = a.city + ', ' + a.state + ' ' + (a.postal || a.zip || '');
    else csz = [a.city || '', a.state || '', a.postal || a.zip || ''].filter(Boolean).join(' ');
    if (csz) lines.push(csz);
    if (a.country) lines.push(a.country);
    return lines.join('<br>');
  }

  /* Warning popup shown before the confirmation modal when the validator
     flags something (missing unit, unverifiable address). */
  function showWarningPopup(results, warnings, onOk, onClose) {
    var root = modalRoot();
    if (!root) { onOk(); return; }
    var warnByKind = {};
    warnings.forEach(function (w) { warnByKind[w.kind] = w.message; });
    var cols = results.map(function (r) {
      var kindLabel = r.kind === 'bill' ? 'Bill to' : 'Ship to';
      var warnHtml = '';
      if (warnByKind[r.kind]) {
        warnHtml = '<div style="background:#fff3cd;border:1px solid #ffc107;border-radius:8px;padding:12px;font-size:13px;line-height:1.5;color:#856404;margin:8px 0;word-wrap:break-word;overflow-wrap:break-word;">' +
          '<strong>\u26a0 Heads up:</strong> ' + warnByKind[r.kind] + '</div>';
      }
      return '<div class="val-col" style="flex:1;min-width:0;overflow:hidden;">' +
        '<div style="text-align:center;margin-bottom:8px;"><span class="val-kind">' + kindLabel + '</span></div>' +
        '<div class="val-addr" style="margin:0 0 8px 0;word-wrap:break-word;overflow-wrap:break-word;">' + fmtAddr(r.original) + '</div>' +
        warnHtml + '</div>';
    }).join('');
    root.innerHTML =
      '<div class="bsr-val-modal-overlay" id="warn-overlay">' +
      '<div class="bsr-val-modal" style="max-width:600px;position:relative;box-sizing:border-box;overflow:hidden;">' +
      '<button type="button" id="warn-close-btn" style="position:absolute;top:12px;right:12px;background:none;border:none;font-size:24px;cursor:pointer;color:#666;line-height:1;">&times;</button>' +
      '<h3 style="text-align:center;margin:0 0 8px 0;padding-right:32px;">Address issue' + (warnings.length > 1 ? 's' : '') + '</h3>' +
      '<p style="text-align:center;margin:0 0 16px 0;font-size:12px;color:#96660f;line-height:1.4;">' +
      '\u26a0 Double-check: if your address has an apartment, unit, suite, or site number, make sure it\u2019s included.' +
      '</p>' +
      '<div style="display:flex;gap:16px;' + (window.innerWidth < 640 ? 'flex-direction:column;' : '') + '">' + cols + '</div>' +
      '<div class="val-actions" style="margin-top:20px;text-align:center;">' +
      '<button type="button" class="val-use" id="warn-ok-btn" style="padding:12px 36px;font-size:15px;">I understand</button>' +
      '</div></div></div>';
    var closeWarn = function () { root.innerHTML = ''; if (onClose) onClose(); };
    document.getElementById('warn-close-btn').addEventListener('click', closeWarn);
    document.getElementById('warn-overlay').addEventListener('click', function (e) {
      if (e.target.id === 'warn-overlay') closeWarn();
    });
    document.getElementById('warn-ok-btn').addEventListener('click', function () {
      root.innerHTML = ''; onOk();
    });
  }

  /* Confirmation modal — ALWAYS shown for every address, even when the
     validator found no correction. Caller decides what happens on
     continue via onDone(fixed). */
  function showValidationModal(results, continueLabel, onDone, onClose) {
    var root = modalRoot();
    if (!root) { onDone(results.map(function (r) { return { kind: r.kind, address: r.original }; })); return; }

    var hasSuggestions = results.some(function (r) { return r.suggested; });

    var cell = function (html, extraStyle) {
      return '<div style="' + (extraStyle || '') + '">' + html + '</div>';
    };
    var nCols = results.length;
    var isMobileGrid = window.innerWidth < 640;

    var labelRow = results.map(function (r) {
      var label = r.kind === 'bill' ? 'Billing address' : 'Shipping address';
      var labelHtml = '<span style="display:inline-block;background:#1a3c22;color:#fff;font-size:12px;font-weight:700;padding:6px 18px;border-radius:20px;">' + label + '</span>';
      return cell('<div style="text-align:center;">' + labelHtml + '</div>');
    }).join('');

    var suggLabelRow = results.map(function (r) {
      return cell(r.suggested ? '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#1a3c22;">Suggested correction</div>' : '');
    }).join('');

    var suggBoxRow = results.map(function (r) {
      if (!r.suggested) return cell('');
      return cell('<div style="background:#f1f8e9;border:2px solid #aed581;border-radius:10px;padding:14px;font-size:14px;line-height:1.6;color:#1a3c22;height:100%;box-sizing:border-box;">' + fmtAddr(r.suggested) + '</div>', 'height:100%;');
    }).join('');

    var btnRow = results.map(function (r, idx) {
      if (!r.suggested) return cell('');
      return cell(
        '<div style="display:flex;gap:8px;height:48px;">' +
        '<button type="button" data-use="' + idx + '" style="flex:1;padding:8px;background:#fff;color:#1a3c22;border:2px solid #1a3c22;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;overflow:hidden;">Use suggested</button>' +
        '<button type="button" data-keep="' + idx + '" style="flex:1;padding:8px;background:#1a3c22;color:#fff;border:2px solid #1a3c22;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;overflow:hidden;">\u2713 Keeping mine</button>' +
        '</div>', 'height:100%;');
    }).join('');

    var yoursLabelRow = results.map(function (r) {
      return cell('<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#666;">' + (r.suggested ? 'Your entry' : 'Address') + '</div>');
    }).join('');

    var yoursBoxRow = results.map(function (r) {
      return cell('<div style="background:#fafafa;border:1px solid #e0e0e0;border-radius:10px;padding:14px;font-size:14px;line-height:1.6;color:#333;height:100%;box-sizing:border-box;">' + fmtAddr(r.original) + '</div>', 'height:100%;');
    }).join('');

    var warnRow = results.map(function (r) {
      var suggUnit = (r.suggested && r.suggested.address2 ? r.suggested.address2 : '').trim();
      var unitInOrig = unitAlreadyInAddress(suggUnit, r.original.address1 || r.original.street, r.original.address2 || r.original.street2);
      if (r.suggested && suggUnit && !unitInOrig) {
        return cell('<div style="background:#fff8e1;border:1px solid #ffd54f;border-radius:8px;padding:10px;font-size:12px;line-height:1.4;color:#5d4037;"><strong>\u26a0 Unit needed:</strong> Without it, your package may not arrive.</div>');
      }
      if (!r.suggested) {
        return cell('<div style="background:#fff8e1;border:1px solid #ffd54f;border-radius:8px;padding:10px;font-size:12px;line-height:1.4;color:#5d4037;"><strong>\u26a0 Please verify:</strong> If this address is incorrect, you may not receive your mail.</div>');
      }
      return cell('');
    }).join('');

    var gridStyle = isMobileGrid ?
      'display:grid;grid-template-columns:1fr;gap:12px;' :
      'display:grid;grid-template-columns:repeat(' + nCols + ',1fr);gap:16px 20px;align-items:stretch;';

    var cards = '<div style="' + gridStyle + '">' + labelRow + suggLabelRow + suggBoxRow + btnRow + yoursLabelRow + yoursBoxRow + warnRow + '</div>';

    root.innerHTML =
      '<div class="bsr-val-modal-overlay" id="val-overlay">' +
      '<div class="bsr-val-modal" style="max-width:600px;">' +
      '<button type="button" id="val-close-btn" aria-label="Close" style="position:absolute;top:16px;right:16px;width:36px;height:36px;background:#f5f5f5;border:none;border-radius:50%;font-size:20px;cursor:pointer;color:#666;display:flex;align-items:center;justify-content:center;line-height:1;">\u00d7</button>' +
      '<div style="text-align:center;margin-bottom:6px;">' +
      '<h3 style="margin:0 0 8px 0;font-size:22px;font-weight:700;color:#1a3c22;letter-spacing:-0.3px;">Confirm your address</h3>' +
      '<p style="margin:0;font-size:14px;color:#666;line-height:1.5;max-width:440px;margin-left:auto;margin-right:auto;">' +
      (hasSuggestions ? 'Our address validator found a correction for your address. Please review below.' : 'Please review your address below.') +
      '</p>' +
      '<p style="margin:8px 0 0 0;font-size:12px;color:#96660f;line-height:1.4;max-width:440px;margin-left:auto;margin-right:auto;">' +
      '\u26a0 Double-check: if your address has an apartment, unit, suite, or site number, make sure it\u2019s included above.' +
      '</p>' +
      '</div>' +
      '<div style="height:1px;background:#e8e4d8;margin:20px 0;"></div>' +
      cards +
      '<div style="height:1px;background:#e8e4d8;margin:24px 0 20px 0;"></div>' +
      '<div style="text-align:center;">' +
      '<button type="button" id="val-continue-btn" style="padding:12px 36px;background:#1a3c22;color:#fff;border:none;border-radius:8px;font-size:15px;font-weight:700;cursor:pointer;letter-spacing:0.2px;">' + continueLabel + '</button>' +
      '</div>' +
      '</div>' +
      '</div>';

    var choices = {};
    results.forEach(function (r, idx) { choices[idx] = 'keep'; });

    root.querySelectorAll('[data-use]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = btn.getAttribute('data-use');
        choices[idx] = 'use';
        btn.style.background = '#1a3c22'; btn.style.color = '#fff'; btn.style.border = 'none';
        var kb = root.querySelector('[data-keep="' + idx + '"]');
        if (kb) { kb.style.background = '#fff'; kb.style.color = '#1a3c22'; kb.style.border = '2px solid #1a3c22'; }
        btn.textContent = '\u2713 Using suggested';
        if (kb) kb.textContent = 'Keep mine';
      });
    });
    root.querySelectorAll('[data-keep]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = btn.getAttribute('data-keep');
        choices[idx] = 'keep';
        btn.style.background = '#1a3c22'; btn.style.color = '#fff'; btn.style.border = 'none';
        btn.textContent = '\u2713 Keeping mine';
        var ub = root.querySelector('[data-use="' + idx + '"]');
        if (ub) { ub.style.background = '#fff'; ub.style.color = '#1a3c22'; ub.style.border = '2px solid #1a3c22'; ub.textContent = 'Use suggested'; }
      });
    });
    root.querySelectorAll('[data-keep]').forEach(function (btn) {
      btn.style.background = '#1a3c22'; btn.style.color = '#fff'; btn.style.border = 'none';
      btn.textContent = '\u2713 Keeping mine';
    });

    var closeModal = function () { root.innerHTML = ''; if (onClose) onClose(); };
    document.getElementById('val-close-btn').addEventListener('click', closeModal);
    document.getElementById('val-overlay').addEventListener('click', function (e) {
      if (e.target.id === 'val-overlay') closeModal();
    });
    setTimeout(function () {
      var grid = root.querySelector('div[style*="grid-template-columns"]');
      if (!grid) return;
      var cols = nCols;
      var items = Array.prototype.slice.call(grid.children);
      for (var r = 0; r < items.length; r += cols) {
        var rowItems = items.slice(r, r + cols);
        var maxH = 0;
        rowItems.forEach(function (el) {
          el.style.height = 'auto';
          var h = el.offsetHeight;
          if (h > maxH) maxH = h;
        });
        rowItems.forEach(function (el) {
          el.style.height = maxH + 'px';
          el.style.boxSizing = 'border-box';
        });
      }
    }, 50);

    document.getElementById('val-continue-btn').addEventListener('click', function () {
      root.innerHTML = '';
      var fixed = results.map(function (r, idx) {
        if (r.suggested && choices[idx] === 'use') {
          var out = {};
          for (var k in r.original) out[k] = r.original[k];
          var c = r.suggestedRaw;
          if (c.street) out.address1 = c.street;
          if (c.street2) out.address2 = c.street2;
          if (c.city) out.city = c.city;
          if (c.state) out.state = c.state;
          if (c.zip) out.postal = c.zip;
          if (c.country) out.country = c.country;
          return { kind: r.kind, address: out };
        }
        return { kind: r.kind, address: r.original };
      });
      onDone(fixed);
    });
  }

  /* Run our address validator on one payload. Never rejects: on validator
     outage the result carries validationFailed so the caller can still
     proceed (validator outages must never block checkout). */
  function validateOne(kind, payload) {
    return new Promise(function (resolve) {
      if (!window.BSRAddrValidate || !BSRAddrValidate.validate) {
        resolve({ kind: kind, original: payload, suggested: null, suggestedRaw: null, undeliverable: true, validationFailed: true });
        return;
      }
      BSRAddrValidate.validate(payload).then(function (j) {
        if (!j || !j.ok) {
          resolve({ kind: kind, original: payload, suggested: null, suggestedRaw: null, undeliverable: true, validationFailed: true });
          return;
        }
        var corrected = j.address || null;
        var hasSuggestion = (j.corrected || (j.corrections && j.corrections.length));
        if (!hasSuggestion || !corrected) {
          resolve({ kind: kind, original: payload, suggested: null, suggestedRaw: null, undeliverable: !(j && j.deliverable) });
          return;
        }
        var diff = false;
        [['street', 'address1'], ['city', 'city'], ['state', 'state'], ['zip', 'postal']].forEach(function (pair) {
          if (corrected[pair[0]] && String(corrected[pair[0]]).toLowerCase() !== String(payload[pair[1]] || '').toLowerCase()) diff = true;
        });
        if (!diff) {
          resolve({ kind: kind, original: payload, suggested: null, suggestedRaw: null, undeliverable: !(j && j.deliverable) });
          return;
        }
        resolve({
          kind: kind, original: payload,
          suggested: {
            address1: corrected.street, address2: corrected.street2,
            city: corrected.city, state: corrected.state,
            postal: corrected.zip, country: corrected.country || payload.country
          },
          suggestedRaw: corrected, undeliverable: !(j && j.deliverable)
        });
      }).catch(function () {
        resolve({ kind: kind, original: payload, suggested: null, suggestedRaw: null, undeliverable: true, validationFailed: true });
      });
    });
  }

  /* Build the standard warning list for validation results. */
  function buildWarnings(results) {
    var warnings = [];
    results.forEach(function (r) {
      var suggUnit = (r.suggested && r.suggested.address2 ? r.suggested.address2 : '').trim();
      var unitInOrig = unitAlreadyInAddress(suggUnit, r.original.address1, r.original.address2);
      if (r.suggested && suggUnit && !unitInOrig) {
        warnings.push({
          kind: r.kind, address: r.original,
          message: 'Our address validator detected a unit/apartment number (' + suggUnit + ') for this address that you did not include. Without it, you may not receive your item.'
        });
      }
      if (r.undeliverable) {
        warnings.push({
          kind: r.kind, address: r.original,
          message: r.validationFailed ?
            'Our address validator could not verify this address. Please double-check it before continuing.' :
            'Our address validator could not verify this address as deliverable. Please double-check it.'
        });
      }
    });
    return warnings;
  }

  /* Standard flow: warnings popup first (if any), then the confirmation
     modal — ALWAYS shown for every address. opts: {continueLabel}.
     done(fixed) runs after the modal decision. resetBtn runs on close. */
  function runValidationFlow(kind, payload, opts, done, resetBtn) {
    var showConfirm = function (result) {
      showValidationModal([result], opts.continueLabel, function (fixed) {
        done(fixed[0].address);
      }, resetBtn);
    };
    validateOne(kind, payload).then(function (result) {
      var warnings = buildWarnings([result]);
      if (warnings.length) {
        showWarningPopup([result], warnings, function () { showConfirm(result); }, resetBtn);
      } else {
        showConfirm(result);
      }
    });
  }

  window.BSRCheckout = {
    val: val, setV: setV, setSel: setSel,
    cleanPhone: cleanPhone, fieldErr: fieldErr, clearFieldErrs: clearFieldErrs, emailOk: emailOk,
    unitAlreadyInAddress: unitAlreadyInAddress,
    showWarningPopup: showWarningPopup,
    showValidationModal: showValidationModal,
    validateOne: validateOne,
    buildWarnings: buildWarnings,
    runValidationFlow: runValidationFlow
  };
})();
