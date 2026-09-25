/* Bay Shore Relics — Logitech-style login (dedicated page + modal).
 *
 * Layout mirrors Logitech's id.logi.com sign-in: brand wordmark up top,
 * underline fields, big rectangular LOGIN button, OR divider, social
 * circles, underlined toggle link — in Northwoods colors.
 *
 * TURNSTILE SITE KEY is set below. The Secret Key lives in the
 * commerce-manager worker's environment as TURNSTILE_SECRET_KEY.
 */
var TURNSTILE_SITE_KEY = '0x4AAAAAAFDXwhByfdKoDTPH';

(function () {
  'use strict';

  var OAUTH_BASE = 'https://cm.bayshorerelicsllc.com';
  var OAUTH_ORIGIN = 'https://cm.bayshorerelicsllc.com';
  var TURNSTILE_API = 'https://challenges.cloudflare.com/turnstile/v0/api.js';

  /* ------------------------------------------------------------------ */
  /* Styles (injected once)                                              */
  /* ------------------------------------------------------------------ */
  var CSS = [
    '[hidden]{display:none!important}',
    /* Modal chrome */
    '.bsr-login-overlay{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;',
    'background:rgba(42,36,27,.55);backdrop-filter:blur(2px);padding:20px;box-sizing:border-box;',
    'animation:bsrLoginFade .18s ease}',
    '@keyframes bsrLoginFade{from{opacity:0}to{opacity:1}}',
    '.bsr-login-card{background:#f8f4e9;color:#2a241b;border-radius:14px;max-width:430px;width:100%;',
    'max-height:92vh;overflow-y:auto;position:relative;padding:42px 38px 32px;',
    'box-shadow:0 18px 60px rgba(0,0,0,.28);animation:bsrLoginPop .22s ease}',
    '@keyframes bsrLoginPop{from{transform:translateY(10px) scale(.98);opacity:0}to{transform:none;opacity:1}}',
    '.bsr-login-close{position:absolute;top:12px;right:12px;width:34px;height:34px;border:none;background:transparent;',
    'font-size:20px;line-height:1;color:#2a241b;cursor:pointer;border-radius:50%}',
    '.bsr-login-close:hover{background:rgba(42,36,27,.08)}',
    /* Shared Logitech-style form */
    '.bsr-loginform{max-width:400px;margin:0 auto}',
    '.bsr-brand{display:flex;align-items:center;justify-content:center;gap:14px;margin:2px 0 10px;',
    'font-family:var(--font-head,"Bitter",Georgia,"Times New Roman",serif);font-weight:800;font-size:1.85rem;',
    'letter-spacing:.01em;line-height:1.1;color:#1e4d33;white-space:nowrap}',
    '.bsr-brand img{width:66px;height:66px;object-fit:contain;flex:none}',
    '.bsr-welcome{font-family:var(--font-head,"Bitter",Georgia,"Times New Roman",serif);font-size:1.35rem;',
    'font-weight:700;color:#1e4d33;text-align:center;margin:0 0 10px}',
    '.bsr-email-line{text-align:center;font-size:.94rem;color:#2a241b;margin:0 0 34px}',
    '.bsr-link-sm{background:none;border:none;color:#2a241b;font-size:.8rem;cursor:pointer;',
    'text-decoration:underline;padding:0 4px;font-family:inherit}',
    '.bsr-guest{text-align:center;margin:34px 0 0}',
    '.bsr-passkey{text-align:center;margin:34px 0 10px}',
    '.bsr-passkey-btn{background:none;border:none;color:#1e4d33;font-size:.85rem;font-weight:700;',
    'letter-spacing:.05em;text-decoration:underline;cursor:pointer;padding:8px;font-family:inherit}',
    '.bsr-passkey-btn:disabled{opacity:.5;cursor:wait}',
    '.bsr-passkey-msg{font-size:.8rem;color:#8a6d3b;min-height:20px;margin-top:4px}',
    '.bsr-tagline{text-align:center;color:#2a241b;font-size:1.04rem;font-weight:700;margin:0 0 30px;line-height:1.55}',
    '.bsr-expressbox{background:#ffffff;border:1px solid rgba(30,77,51,.14);border-radius:16px;',
    'box-shadow:0 8px 24px rgba(30,77,51,.12),0 2px 6px rgba(0,0,0,.05);',
    'padding:26px 20px 30px;margin:30px 0 0}',
    '.bsr-expressbox .bsr-tagline{margin:0 0 22px}',
    '.bsr-expressbox .bsr-circles{margin:0}',
    '.bsr-error{display:none;background:#fdecea;color:#9c2b1e;border:1px solid #f3c1b8;border-radius:10px;',
    'padding:10px 14px;font-size:.87rem;margin:0 0 20px;line-height:1.45}',
    '.bsr-error.show{display:block}',
    '.bsr-field{margin-bottom:42px}',
    '.bsr-field label{display:block;font-size:.95rem;letter-spacing:0;text-transform:none;',
    'color:#5a5347;margin-bottom:8px;font-weight:500}',
    '.bsr-field input{width:100%;border:none;border-bottom:2px solid #cfc6ab;background:transparent;',
    'padding:12px 2px;font-size:1.06rem;color:#2a241b;border-radius:0;box-sizing:border-box;font-family:inherit}',
    '.bsr-field input:focus{outline:none;border-bottom-color:#1e4d33}',
    '.bsr-pw-wrap{position:relative}',
    '.bsr-pw-wrap input{padding-right:38px}',
    '.bsr-eye{position:absolute;right:0;top:50%;transform:translateY(-50%);background:none;border:none;',
    'color:#8a8172;cursor:pointer;padding:6px 2px;line-height:0}',
    '.bsr-eye:hover{color:#2a241b}',
    '.bsr-hint{font-size:.78rem;color:#8a8172;margin-top:5px}',
    '.bsr-forgot{text-align:right;margin:-16px 0 30px}',
    '.bsr-link{background:none;border:none;color:#2a241b;font-size:.88rem;cursor:pointer;',
    'text-decoration:underline;padding:0;font-family:inherit}',
    '.bsr-captcha-note{text-align:center;font-size:.74rem;color:#8a8172;margin:28px 0 0;line-height:1.6}',
    '.bsr-captcha-note a{color:#2a241b}',
    '.bsr-cf-mark{height:1.3em;width:auto;vertical-align:-0.25em;margin-right:.45em}',
    '.bsr-cf-word{white-space:nowrap}',
    '.bsr-loginbtn{width:100%;min-height:58px;background:#1e4d33;color:#fff;border:none;border-radius:4px;',
    'font-size:.98rem;font-weight:700;letter-spacing:.07em;cursor:pointer;font-family:inherit;margin-top:6px;',
    'transition:background .15s}',
    '.bsr-loginbtn:hover{background:#163a26}',
    '.bsr-loginbtn:active{transform:translateY(1px)}',
    '.bsr-loginbtn:disabled{opacity:.6;cursor:wait}',
    '.bsr-or{display:flex;align-items:center;gap:14px;margin:46px 0 38px;color:#8a8172;',
    'font-size:.8rem;letter-spacing:.12em;font-weight:600}',
    '.bsr-or::before,.bsr-or::after{content:"";flex:1;height:1px;background:#d8d0b8}',
    '.bsr-circles{display:flex;justify-content:center;gap:22px;margin:0 0 42px}',
    '.bsr-circle{width:64px;height:64px;border-radius:50%;background:#fff;border:2px solid #1e4d33;',
    'display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0;',
    'box-shadow:0 1px 2px rgba(0,0,0,.06);transition:box-shadow .15s,transform .15s}',
    '.bsr-circle:hover{box-shadow:0 3px 10px rgba(0,0,0,.12);transform:translateY(-1px)}',
    '.bsr-circle:active{transform:translateY(0);box-shadow:0 1px 2px rgba(0,0,0,.08)}',
    '.bsr-circle svg{width:26px;height:26px;display:block}',
    '.bsr-switch{text-align:center;margin:0}',
    '.bsr-link-u{background:none;border:none;color:#2a241b;font-size:.87rem;font-weight:700;',
    'letter-spacing:.05em;cursor:pointer;text-decoration:underline;padding:0;font-family:inherit}',
    '.bsr-turnstile-wrap{display:flex;justify-content:center;margin:0 0 14px;min-height:0}',
    '.bsr-turnstile-wrap:empty{display:none}'
  ].join('\n');

  function injectCss() {
    if (document.getElementById('bsr-login-css')) return;
    var s = document.createElement('style');
    s.id = 'bsr-login-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  /* ------------------------------------------------------------------ */
  /* Turnstile                                                           */
  /* ------------------------------------------------------------------ */
  var turnstileLoading = null;
  function loadTurnstile() {
    if (window.turnstile) return Promise.resolve();
    if (turnstileLoading) return turnstileLoading;
    turnstileLoading = new Promise(function (resolve) {
      var s = document.createElement('script');
      s.src = TURNSTILE_API + '?render=explicit';
      s.async = true; s.defer = true;
      s.onload = function () { resolve(); };
      s.onerror = function () { resolve(); }; // fail soft — backend skips when unconfigured
      document.head.appendChild(s);
    });
    return turnstileLoading;
  }
  function turnstileConfigured() {
    return TURNSTILE_SITE_KEY && TURNSTILE_SITE_KEY !== 'TURNSTILE_SITE_KEY' && window.turnstile;
  }

  /* ------------------------------------------------------------------ */
  /* OAuth popup (keeps the ?popup=1 flow: popup posts back, then closes)*/
  /* ------------------------------------------------------------------ */
  function oauthPopup(provider, onError) {
    var url = OAUTH_BASE + '/api/account/' + provider + '/start?popup=1';
    var w = 500, h = 600;
    var left = Math.max(0, (window.screen.width - w) / 2);
    var top = Math.max(0, (window.screen.height - h) / 2);
    var popup = null;
    try {
      popup = window.open(url, 'bsr-oauth',
        'width=' + w + ',height=' + h + ',left=' + left + ',top=' + top + ',resizable=yes,scrollbars=yes');
    } catch (e) { popup = null; }
    if (!popup) {
      onError('Please allow popups for this site to sign in with ' +
        provider.charAt(0).toUpperCase() + provider.slice(1) + '.');
      return;
    }
    var done = false;
    var checkTimer = null;
    function cleanup() {
      done = true;
      window.removeEventListener('message', onMessage);
      if (checkTimer) clearInterval(checkTimer);
    }
    function onMessage(e) {
      if (done) return;
      if (e.origin !== OAUTH_ORIGIN) return;
      if (e.source !== popup) return;
      if (!e.data || e.data.type !== 'bsr-oauth-complete') return;
      cleanup();
      // Verify the session before trusting the popup result.
      BSR.api('/api/account/me').then(function (j) {
        if (j && j.ok) {
          onAuthSuccess();
        } else {
          onError('Sign-in completed but we could not verify your session. Please try again.');
        }
      }).catch(function () {
        onError('Sign-in completed but we could not verify your session. Please try again.');
      });
    }
    window.addEventListener('message', onMessage);
    checkTimer = setInterval(function () {
      if (done) return;
      var closed = false;
      try { closed = popup.closed; } catch (e) { closed = true; }
      if (closed) {
        cleanup();
        onError('Sign-in was cancelled.');
      }
    }, 600);
  }

  /* ------------------------------------------------------------------ */
  /* Brand SVGs                                                          */
  /* ------------------------------------------------------------------ */
  var GOOGLE_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.3H12v4.5h6.5c-.1 1.1-.8 2.7-2.4 3.8l-.1.1 3.5 2.7.2.1c2.2-2 3.8-5 3.8-8.9z"/><path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.8-2.9c-1 .7-2.4 1.2-4.1 1.2-3.1 0-5.8-2.1-6.8-5l-.1.1-3.7 2.9v.1C3.3 21.3 7.3 24 12 24z"/><path fill="#FBBC05" d="M5.2 14.4c-.2-.7-.4-1.5-.4-2.4s.1-1.7.4-2.4l-.1-.1-3.6-2.8-.1.1C.5 8.5 0 10.2 0 12s.5 3.5 1.4 5.1l3.8-2.7z"/><path fill="#EA4335" d="M12 4.7c1.8 0 3 .8 3.7 1.4l3.3-3.2C16.9 1.1 14.7 0 12 0 7.3 0 3.3 2.7 1.4 6.9l3.8 2.9c1-2.9 3.7-5.1 6.8-5.1z"/></svg>';
  var AMAZON_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#000" d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595l.315-.14c.138-.06.234-.1.293-.13.226-.088.39-.046.525.13.12.174.09.336-.12.48-.256.19-.6.41-1.006.654-1.244.743-2.64 1.316-4.185 1.726a17.617 17.617 0 01-10.951-.577 17.88 17.88 0 01-5.43-3.35c-.1-.074-.151-.15-.151-.22 0-.047.021-.09.051-.13zm6.565-6.218c0-1.005.247-1.863.743-2.577.495-.71 1.17-1.25 2.04-1.615.796-.335 1.756-.575 2.912-.72.39-.046 1.033-.103 1.92-.174v-.37c0-.93-.105-1.558-.3-1.875-.302-.43-.78-.65-1.44-.65h-.182c-.48.046-.896.196-1.246.46-.35.27-.575.63-.675 1.096-.06.3-.206.465-.435.51l-2.52-.315c-.248-.06-.372-.18-.372-.39 0-.046.007-.09.022-.15.247-1.29.855-2.25 1.82-2.88.976-.616 2.1-.975 3.39-1.05h.54c1.65 0 2.957.434 3.888 1.29.135.15.27.3.405.48.12.165.224.314.283.45.075.134.15.33.195.57.06.254.105.42.135.51.03.104.062.3.076.615.01.313.02.493.02.553v5.28c0 .376.06.72.165 1.036.105.313.21.54.315.674l.51.674c.09.136.136.256.136.36 0 .12-.06.226-.18.314-1.2 1.05-1.86 1.62-1.963 1.71-.165.135-.375.15-.63.045a6.062 6.062 0 01-.526-.496l-.31-.347a9.391 9.391 0 01-.317-.42l-.3-.435c-.81.886-1.603 1.44-2.4 1.665-.494.15-1.093.227-1.83.227-1.11 0-2.04-.343-2.76-1.034-.72-.69-1.08-1.665-1.08-2.94l-.05-.076zm3.753-.438c0 .566.14 1.02.425 1.364.285.34.675.512 1.155.512.045 0 .106-.007.195-.02.09-.016.134-.023.166-.023.614-.16 1.08-.553 1.424-1.178.165-.28.285-.58.36-.91.09-.32.12-.59.135-.8.015-.195.015-.54.015-1.005v-.54c-.84 0-1.484.06-1.92.18-1.275.36-1.92 1.17-1.92 2.43l-.035-.02z"/><path fill="#FF9900" d="M16.615 18.83c.03-.06.075-.11.132-.17.362-.243.714-.41 1.05-.5a8.094 8.094 0 011.612-.24c.14-.012.28 0 .41.03.65.06 1.05.168 1.172.33.063.09.099.228.099.39v.15c0 .51-.149 1.11-.424 1.8-.278.69-.664 1.248-1.156 1.68-.073.06-.14.09-.197.09-.03 0-.06 0-.09-.012-.09-.044-.107-.12-.064-.24.54-1.26.806-2.143.806-2.64 0-.15-.03-.27-.087-.344-.145-.166-.55-.257-1.224-.257-.243 0-.533.016-.87.046-.363.045-.7.09-1 .135-.09 0-.148-.014-.18-.044-.03-.03-.036-.047-.02-.077 0-.017.006-.03.02-.063v-.06z"/></svg>';
  var PAYPAL_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#0079C1" d="M19.79 6.142c-.01.087-.01.175-.023.261a7.76 7.76 0 0 1-7.695 6.598H9.007l-.283 1.795-.013.083-.692 4.39-.134.843-.014.088H6.86l-.497 3.15a.562.562 0 0 0 .555.65h3.612c.34 0 .63-.249.683-.585l.952-6.031a.692.692 0 0 1 .683-.584h2.126a6.793 6.793 0 0 0 6.707-5.752c.306-1.95-.466-3.744-1.89-4.906z"/><path fill="#003087" d="M7.016 19.198h-4.2a.562.562 0 0 1-.555-.65L5.093.584A.692.692 0 0 1 5.776 0h7.222c3.417 0 5.904 2.488 5.846 5.5-.006.25-.027.5-.066.747A6.794 6.794 0 0 1 12.071 12H8.743a.69.69 0 0 0-.682.583l-.325 2.056-.013.083-.692 4.39-.015.087z"/></svg>';
  var EYE_SVG = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
  var EYE_OFF_SVG = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';

  var CAPTCHA_NOTE = '<p class="bsr-captcha-note">This site is <span class="bsr-cf-word">protected by ' +
    '<img class="bsr-cf-mark" src="/assets/img/cloudflare-mark.png" alt="">Cloudflare</span> and our ' +
    '<a href="/privacy/">Privacy Policy</a> and ' +
    '<a href="/terms/">Terms of Service</a> apply.</p>';

  function circlesHtml() {
    return '' +
      '<div class="bsr-circles">' +
      '<button type="button" class="bsr-circle" data-oauth="google" aria-label="Continue with Google">' + GOOGLE_SVG + '</button>' +
      '<button type="button" class="bsr-circle" data-oauth="amazon" aria-label="Continue with Amazon">' + AMAZON_SVG + '</button>' +
      /* PayPal login hidden 2026-09-25: 'Log in with PayPal' approval pending at PayPal */
      '</div>';
  }

  /* ------------------------------------------------------------------ */
  /* ------------------------------------------------------------------ */
  /* Passkey helpers (WebAuthn). Backend is live; see hidden_files snippets. */
  /* ------------------------------------------------------------------ */
  function b64urlToBytes(s) {
    s = String(s).replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    var bin = atob(s), out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  function bytesToB64url(bytes) {
    var bin = '', i;
    for (i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function passkeySupported() {
    return !!(window.PublicKeyCredential && window.isSecureContext !== false &&
      navigator.credentials && navigator.credentials.get);
  }

  /* ------------------------------------------------------------------ */
  /* Shared login form: email-first unified sign in / sign up.           */
  /* Step 1: email -> check-email. Step 2a: password + SIGN IN.           */
  /* Step 2b: name + password + CREATE ACCOUNT. Used by modal + page.    */
  /* ------------------------------------------------------------------ */
  function validEmail(v) {
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(v || ''));
  }

  function buildForm(container) {
    container.innerHTML =
      '<div class="bsr-loginform">' +
      '<div class="bsr-error" data-el="error" role="alert"></div>' +
      '<div class="bsr-brand"><img src="/assets/img/logo.png" alt="Bay Shore Relics logo"><span>Bay Shore Relics LLC</span></div>' +
      '<div class="bsr-expressbox"><p class="bsr-tagline">Express login using one of the methods below.</p>' +
      circlesHtml() + '</div>' +
      '<div class="bsr-or"><span>OR</span></div>' +
      /* ---- STEP 1: email ---- */
      '<div data-step="email">' +
      '<div class="bsr-field"><label for="bsr-li-email">Email address</label>' +
      '<input type="email" data-el="email" id="bsr-li-email" autocomplete="email" placeholder="you@example.com"></div>' +
      '<p class="bsr-hint">Don\'t have an account yet? Enter your email and we\'ll help you create one!</p>' +
      '<button type="button" class="bsr-loginbtn" data-el="continue">CONTINUE</button>' +
      '<div data-el="passkey-mount-1"></div>' +
      '<p class="bsr-guest"><button type="button" class="bsr-link" data-el="guest">Continue as guest</button></p>' +
      '</div>' +
      /* ---- STEP 2a: existing account -> sign in ---- */
      '<div data-step="signin" hidden>' +
      '<p class="bsr-welcome">Welcome back!</p>' +
      '<p class="bsr-email-line"><span data-el="email-echo"></span> <button type="button" class="bsr-link-sm" data-el="edit">Edit</button></p>' +
      '<div class="bsr-field"><label for="bsr-li-pw">Password</label>' +
      '<div class="bsr-pw-wrap"><input type="password" data-el="password" id="bsr-li-pw" autocomplete="current-password">' +
      '<button type="button" class="bsr-eye" data-el="eye-signin" aria-label="Show password">' + EYE_SVG + '</button></div></div>' +
      '<p class="bsr-forgot"><button type="button" class="bsr-link" data-el="forgot">Forgot password?</button></p>' +
      '<div class="bsr-turnstile-wrap" data-el="ts-signin"></div>' +
      '<button type="button" class="bsr-loginbtn" data-el="signin">SIGN IN</button>' +
      '<div data-el="passkey-mount-2"></div>' +
      '</div>' +
      /* ---- STEP 2b: new account -> create ---- */
      '<div data-step="register" hidden>' +
      '<p class="bsr-welcome">Create your account</p>' +
      '<p class="bsr-email-line"><span data-el="email-echo"></span> <button type="button" class="bsr-link-sm" data-el="edit">Edit</button></p>' +
      '<div class="bsr-field"><label for="bsr-rg-name">Full name</label>' +
      '<input type="text" data-el="name" id="bsr-rg-name" autocomplete="name"></div>' +
      '<div class="bsr-field"><label for="bsr-rg-pw">Password</label>' +
      '<div class="bsr-pw-wrap"><input type="password" data-el="password2" id="bsr-rg-pw" autocomplete="new-password">' +
      '<button type="button" class="bsr-eye" data-el="eye-register" aria-label="Show password">' + EYE_SVG + '</button></div>' +
      '<div class="bsr-hint">8+ characters</div></div>' +
      '<div class="bsr-turnstile-wrap" data-el="ts-register"></div>' +
      '<button type="button" class="bsr-loginbtn" data-el="create">CREATE ACCOUNT</button>' +
      '</div>' +
      CAPTCHA_NOTE +
      '</div>';

    var q = function (sel) { return container.querySelector('[data-el="' + sel + '"]'); };
    var qa = function (sel) { return container.querySelectorAll('[data-el="' + sel + '"]'); };
    var stepEmail = container.querySelector('[data-step="email"]');
    var stepSignin = container.querySelector('[data-step="signin"]');
    var stepRegister = container.querySelector('[data-step="register"]');
    var errBox = q('error');
    var tsWidgets = { signin: null, register: null };
    var currentEmail = '';

    function showError(msg) {
      errBox.textContent = msg;
      errBox.classList.add('show');
      errBox.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
    function clearError() {
      errBox.textContent = '';
      errBox.classList.remove('show');
    }
    function setEcho(email) {
      var els = qa('email-echo');
      for (var i = 0; i < els.length; i++) els[i].textContent = email;
    }
    function goStep(name) {
      stepEmail.hidden = (name !== 'email');
      stepSignin.hidden = (name !== 'signin');
      stepRegister.hidden = (name !== 'register');
      clearError();
      if (name === 'signin') ensureTurnstile('signin');
      else if (name === 'register') ensureTurnstile('register');
    }

    /* Password show/hide toggles. */
    function wireEye(btnSel, inputSel) {
      var btn = q(btnSel), input = q(inputSel);
      if (!btn || !input) return;
      btn.addEventListener('click', function () {
        var show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        btn.innerHTML = show ? EYE_OFF_SVG : EYE_SVG;
        btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
      });
    }
    wireEye('eye-signin', 'password');
    wireEye('eye-register', 'password2');

    /* Turnstile: one widget per step 2, rendered lazily on first entry. */
    function ensureTurnstile(which) {
      if (!TURNSTILE_SITE_KEY || TURNSTILE_SITE_KEY === 'TURNSTILE_SITE_KEY') return Promise.resolve(null);
      return loadTurnstile().then(function () {
        if (!window.turnstile) return null;
        if (tsWidgets[which] !== null) return tsWidgets[which];
        var mount = q(which === 'signin' ? 'ts-signin' : 'ts-register');
        if (!mount) return null;
        try {
          tsWidgets[which] = window.turnstile.render(mount, { sitekey: TURNSTILE_SITE_KEY });
        } catch (e) { tsWidgets[which] = null; }
        return tsWidgets[which];
      });
    }
    function turnstileToken(which) {
      if (!turnstileConfigured()) return '';
      var id = tsWidgets[which];
      if (id === null || id === undefined) return '';
      try { return window.turnstile.getResponse(id) || ''; } catch (e) { return ''; }
    }
    function resetTurnstile(which) {
      if (!turnstileConfigured()) return;
      var id = tsWidgets[which];
      if (id === null || id === undefined) return;
      try { window.turnstile.reset(id); } catch (e) {}
    }

    /* OAuth circles -> popup flow. */
    var circles = container.querySelectorAll('[data-oauth]');
    for (var i = 0; i < circles.length; i++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          clearError();
          oauthPopup(btn.getAttribute('data-oauth'), showError);
        });
      })(circles[i]);
    }

    /* Continue as guest -> straight to the cart, no account needed. */
    function guestGo() {
      closeModal();
      window.location = '/cart/';
    }
    var guestBtns = qa('guest');
    for (var gi = 0; gi < guestBtns.length; gi++) {
      guestBtns[gi].addEventListener('click', guestGo);
    }

    /* Edit email -> back to step 1. */
    var editBtns = qa('edit');
    for (var ei = 0; ei < editBtns.length; ei++) {
      editBtns[ei].addEventListener('click', function () { goStep('email'); });
    }

    q('forgot').addEventListener('click', function () {
      showError('Password reset is coming soon — contact us if you need help signing in.');
    });

    /* Step 1: CONTINUE -> check whether the email has an account. */
    q('continue').addEventListener('click', function () {
      clearError();
      var email = q('email').value.trim().toLowerCase();
      if (!validEmail(email)) {
        showError('Please enter a valid email address.');
        return;
      }
      var btn = this;
      btn.disabled = true;
      btn.textContent = 'CHECKING…';
      BSR.api('/api/account/check-email', { method: 'POST', body: { email: email } })
        .then(function (j) {
          btn.disabled = false;
          btn.textContent = 'CONTINUE';
          if (j && j.ok) {
            currentEmail = email;
            setEcho(email);
            goStep(j.exists ? 'signin' : 'register');
          } else {
            showError((j && j.error) || 'Could not continue. Please try again.');
          }
        })
        .catch(function () {
          btn.disabled = false;
          btn.textContent = 'CONTINUE';
          showError('Could not continue. Please try again.');
        });
    });

    /* Step 2a: SIGN IN. */
    q('signin').addEventListener('click', function () {
      clearError();
      var pw = q('password').value;
      if (!pw) { showError('Please enter your password.'); return; }
      var btn = this;
      btn.disabled = true;
      btn.textContent = 'SIGNING IN…';
      var body = { email: currentEmail, password: pw };
      var tok = turnstileToken('signin');
      if (tok) body.cf_turnstile_response = tok;
      BSR.api('/api/account/login', { method: 'POST', body: body })
        .then(function (j) {
          if (j && j.ok) {
            onAuthSuccess();
          } else {
            if (j && j.error === 'captcha_failed') {
              showError('Please complete the CAPTCHA and try again.');
            } else {
              showError((j && j.error) || 'Sign in failed. Please check your password.');
            }
            resetTurnstile('signin');
            btn.disabled = false;
            btn.textContent = 'SIGN IN';
          }
        })
        .catch(function () {
          showError('Sign in failed. Please try again.');
          resetTurnstile('signin');
          btn.disabled = false;
          btn.textContent = 'SIGN IN';
        });
    });

    /* Step 2b: CREATE ACCOUNT. */
    q('create').addEventListener('click', function () {
      clearError();
      var name = q('name').value.trim();
      var pw = q('password2').value;
      if (!name) { showError('Please enter your name.'); return; }
      if (pw.length < 8) { showError('Password must be at least 8 characters.'); return; }
      var btn = this;
      btn.disabled = true;
      btn.textContent = 'CREATING…';
      var body = { name: name, email: currentEmail, password: pw };
      var tok = turnstileToken('register');
      if (tok) body.cf_turnstile_response = tok;
      BSR.api('/api/account/register', { method: 'POST', body: body })
        .then(function (j) {
          if (j && j.ok) {
            onAuthSuccess();
          } else if (j && j.error === 'captcha_failed') {
            showError('Please complete the CAPTCHA and try again.');
            resetTurnstile('register');
            btn.disabled = false;
            btn.textContent = 'CREATE ACCOUNT';
          } else if (j && j.error && /already exists/i.test(j.error)) {
            goStep('signin');
            showError('That email already has an account — please sign in.');
            btn.disabled = false;
            btn.textContent = 'CREATE ACCOUNT';
          } else {
            showError((j && j.error) || 'Could not create your account. Please try again.');
            resetTurnstile('register');
            btn.disabled = false;
            btn.textContent = 'CREATE ACCOUNT';
          }
        })
        .catch(function () {
          showError('Could not create your account. Please try again.');
          resetTurnstile('register');
          btn.disabled = false;
          btn.textContent = 'CREATE ACCOUNT';
        });
    });

    /* Passkey sign-in buttons (Logitech-style link). Mounted in steps 1 & 2a. */
    function mountPasskeys() {
      if (!passkeySupported()) return;
      var mounts = [q('passkey-mount-1'), q('passkey-mount-2')];
      for (var i = 0; i < mounts.length; i++) {
        if (!mounts[i]) continue;
        mounts[i].innerHTML =
          '<div class="bsr-passkey"><button type="button" class="bsr-passkey-btn">' +
          '&#x1F511; USE PASSKEY TO LOG IN</button>' +
          '<div class="bsr-passkey-msg"></div></div>';
      }
      var btns = container.querySelectorAll('.bsr-passkey-btn');
      for (var j = 0; j < btns.length; j++) {
        btns[j].addEventListener('click', function () { doPasskeyLogin(this); });
      }
    }

    function doPasskeyLogin(clickedBtn) {
      var wrap = clickedBtn.parentNode;
      var msgEl = wrap ? wrap.querySelector('.bsr-passkey-msg') : null;
      function msg(t) { if (msgEl) msgEl.textContent = t || ''; }
      msg('');
      var btns = container.querySelectorAll('.bsr-passkey-btn');
      for (var i = 0; i < btns.length; i++) btns[i].disabled = true;
      var emailInput = q('email');
      var email = currentEmail || (emailInput ? emailInput.value.trim().toLowerCase() : '');
      var pkScoped = false;
      BSR.api('/api/account/passkey/login/start', { method: 'POST', body: email ? { email: email } : {} })
        .then(function (start) {
          if (!start || !start.ok) throw new Error((start && start.error) || 'Could not start passkey sign-in.');
          var allow = start.allowCredentials || [];
          pkScoped = allow.length > 0;
          var opts = {
            challenge: b64urlToBytes(start.challenge),
            rpId: start.rpId,
            userVerification: start.userVerification || 'preferred',
            timeout: 60000
          };
          if (pkScoped) {
            opts.allowCredentials = allow.map(function (c) {
              return { type: c.type || 'public-key', id: b64urlToBytes(c.id) };
            });
          }
          return navigator.credentials.get({ publicKey: opts });
        })
        .then(function (cred) {
          if (!cred) throw new Error('cancelled');
          var resp = cred.response;
          return BSR.api('/api/account/passkey/login/finish', { method: 'POST', body: {
            id: cred.id,
            rawId: bytesToB64url(new Uint8Array(cred.rawId)),
            response: {
              authenticatorData: bytesToB64url(new Uint8Array(resp.authenticatorData)),
              clientDataJSON: bytesToB64url(new Uint8Array(resp.clientDataJSON)),
              signature: bytesToB64url(new Uint8Array(resp.signature)),
              userHandle: resp.userHandle ? bytesToB64url(new Uint8Array(resp.userHandle)) : null
            }
          }}).then(function (fin) {
            if (fin && fin.ok) { onAuthSuccess(); return null; }
            throw new Error((fin && fin.error) || 'Passkey sign-in failed.');
          });
        })
        .catch(function (e) {
          var m = String((e && e.message) || e || '');
          if (/notallowederror|aborterror/i.test(m)) {
            // Scoped to an account that HAS passkeys: the device prompt showed
            // and the user dismissed it -> stay silent. Otherwise there was
            // no passkey to offer -> say so.
            msg(pkScoped ? '' : 'No passkey found for this device — sign in with password first.');
          } else if (/notsupported/i.test(m)) {
            msg('This device or browser does not support passkeys.');
          } else if (/cancelled/i.test(m)) {
            msg('');
          } else {
            msg(m);
          }
          for (var i = 0; i < btns.length; i++) btns[i].disabled = false;
        });
    }
    mountPasskeys();

    /* Enter key submits the visible step. */
    function onEnter(el, btnSel) {
      if (!el) return;
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); q(btnSel).click(); }
      });
    }
    onEnter(q('email'), 'continue');
    onEnter(q('password'), 'signin');
    onEnter(q('name'), 'create');
    onEnter(q('password2'), 'create');

    /* Surface ?error= (e.g. from a failed OAuth redirect). */
    try {
      var eq = new URLSearchParams(window.location.search).get('error');
      if (eq) showError(String(eq).replace(/_/g, ' '));
    } catch (e) {}

    // Start at the email step.
    goStep('email');
  }

  /* Called after any successful auth (page, modal, or OAuth popup).
     Back to the homepage, per the store's chosen flow. */
  function onAuthSuccess() {
    closeModal();
    if (typeof BSR !== 'undefined' && BSR.refreshAuthState) {
      try { BSR.refreshAuthState(); } catch (e) {}
    }
    window.location = '/';
  }

  /* ------------------------------------------------------------------ */
  /* Modal                                                               */
  /* ------------------------------------------------------------------ */
  var overlay = null;

  function closeModal() {
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    overlay = null;
    document.removeEventListener('keydown', onEsc);
  }
  function onEsc(e) {
    if (e.key === 'Escape') closeModal();
  }

  function showLogin() {
    injectCss();
    closeModal();
    overlay = document.createElement('div');
    overlay.className = 'bsr-login-overlay';
    overlay.innerHTML =
      '<div class="bsr-login-card" role="dialog" aria-modal="true" aria-label="Sign in">' +
      '<button type="button" class="bsr-login-close" aria-label="Close">&times;</button>' +
      '<div data-el="form"></div>' +
      '</div>';
    overlay.querySelector('.bsr-login-close').addEventListener('click', closeModal);
    overlay.addEventListener('mousedown', function (e) {
      if (e.target === overlay) closeModal();
    });
    document.addEventListener('keydown', onEsc);
    document.body.appendChild(overlay);
    buildForm(overlay.querySelector('[data-el="form"]'));
    overlay._bsrLoginModal = true;
    return overlay;
  }

  /* Inline (non-modal) form for the /account/login/ page. */
  function renderLoginForm(container) {
    injectCss();
    if (typeof container === 'string') container = document.querySelector(container);
    if (!container) return;
    buildForm(container);
  }

  /* Public API. */
  window.BSR = window.BSR || {};
  window.BSR.showLogin = showLogin;
  window.BSR.renderLoginForm = renderLoginForm;
  window.BSR.closeLogin = closeModal;
})();
