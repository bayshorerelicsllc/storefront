/* Bay Shore Relics — reusable login modal + inline login form.
 *
 * TURNSTILE SITE KEY — REPLACE THIS with your Cloudflare Turnstile site key:
 * Cloudflare Dashboard → Security → Turnstile → Add site → copy the Site Key.
 * The Secret Key goes in the commerce-manager worker's environment variables
 * as TURNSTILE_SECRET_KEY (NOT in this file).
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
    '.bsr-login-overlay{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;',
    'background:rgba(42,36,27,.55);backdrop-filter:blur(2px);padding:20px;box-sizing:border-box;',
    'animation:bsrLoginFade .18s ease}',
    '@keyframes bsrLoginFade{from{opacity:0}to{opacity:1}}',
    '.bsr-login-card{background:#f8f4e9;color:#2a241b;border-radius:16px;max-width:400px;width:100%;',
    'max-height:92vh;overflow-y:auto;position:relative;padding:34px 30px 26px;',
    'box-shadow:0 18px 60px rgba(0,0,0,.28);animation:bsrLoginPop .22s ease}',
    '@keyframes bsrLoginPop{from{transform:translateY(10px) scale(.98);opacity:0}to{transform:none;opacity:1}}',
    '.bsr-login-close{position:absolute;top:12px;right:12px;width:34px;height:34px;border:none;background:transparent;',
    'font-size:20px;line-height:1;color:#2a241b;cursor:pointer;border-radius:50%}',
    '.bsr-login-close:hover{background:rgba(42,36,27,.08)}',
    '.bsr-login-card h2{margin:0 0 6px;font-size:1.35rem;color:#2a241b;font-weight:650}',
    '.bsr-login-sub{margin:0 0 18px;font-size:.9rem;color:#6b6252;line-height:1.5}',
    '.bsr-oauth-pills{display:flex;flex-direction:column;align-items:center;gap:12px;margin:0 0 6px}',
    '.bsr-oauth-pill{display:flex;align-items:center;justify-content:center;gap:11px;width:100%;max-width:380px;',
    'min-height:44px;padding:9px 18px;border:1px solid #d5d5d5;border-radius:999px;background:#fff;color:#2a241b;',
    'font-size:15px;font-weight:500;font-family:inherit;cursor:pointer;text-decoration:none;box-sizing:border-box;',
    'box-shadow:0 1px 2px rgba(0,0,0,.06);transition:box-shadow .15s,background .15s;line-height:1.2}',
    '.bsr-oauth-pill:hover{background:#f8f8f8;box-shadow:0 2px 6px rgba(0,0,0,.1)}',
    '.bsr-oauth-pill:active{box-shadow:0 1px 2px rgba(0,0,0,.08);transform:translateY(1px)}',
    '.bsr-oauth-pill img,.bsr-oauth-pill svg{width:20px;height:20px;flex-shrink:0;display:block}',
    '.bsr-login-div{display:flex;align-items:center;gap:12px;margin:20px 0;color:#8a8172;font-size:.82rem}',
    '.bsr-login-div::before,.bsr-login-div::after{content:"";flex:1;height:1px;background:#ddd5bd}',
    '.bsr-field{margin-bottom:20px}',
    '.bsr-field label{display:block;font-size:.83rem;color:#8a8172;margin-bottom:2px}',
    '.bsr-field input{width:100%;border:none;border-bottom:2px solid #ddd5bd;background:transparent;',
    'padding:10px 2px;font-size:1.02rem;color:#2a241b;border-radius:0;box-sizing:border-box}',
    '.bsr-field input:focus{outline:none;border-bottom-color:#1e4d33}',
    '.bsr-field .hint{font-size:.78rem;color:#8a8172;margin-top:4px}',
    '.bsr-btn{display:flex;align-items:center;justify-content:center;width:100%;min-height:48px;border:none;',
    'border-radius:999px;padding:12px 20px;font-size:1rem;font-weight:600;font-family:inherit;cursor:pointer;',
    'background:#1e4d33;color:#fff;text-align:center;box-sizing:border-box;',
    'box-shadow:0 2px 6px rgba(30,77,51,.28);transition:background .15s,box-shadow .15s;line-height:1.2}',
    '.bsr-btn:hover{background:#163a26;box-shadow:0 3px 10px rgba(30,77,51,.34)}',
    '.bsr-btn:active{box-shadow:0 1px 3px rgba(30,77,51,.25);transform:translateY(1px)}',
    '.bsr-btn:disabled{opacity:.6;cursor:wait}',
    '.bsr-error{display:none;background:#fdecea;color:#9c2b1e;border:1px solid #f3c1b8;border-radius:10px;',
    'padding:10px 14px;font-size:.87rem;margin:0 0 16px;line-height:1.45}',
    '.bsr-error.show{display:block}',
    '.bsr-step-email{font-size:.9rem;color:#6b6252;margin:0 0 20px}',
    '.bsr-link{background:none;border:none;color:#1e4d33;font-size:.9rem;cursor:pointer;text-decoration:underline;padding:0}',
    '.bsr-center{text-align:center}',
    '.bsr-muted-link{color:#1e4d33;font-size:.9rem}',
    '.bsr-turnstile-wrap{display:flex;justify-content:center;margin:4px 0 14px;min-height:0}',
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
  /* OAuth popup                                                         */
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
    var checkTimer = setInterval(function () {
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
  /* Shared login form (used by both modal and inline page)              */
  /* ------------------------------------------------------------------ */
  var GOOGLE_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.3H12v4.5h6.5c-.1 1.1-.8 2.7-2.4 3.8l-.1.1 3.5 2.7.2.1c2.2-2 3.8-5 3.8-8.9z"/><path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.8-2.9c-1 .7-2.4 1.2-4.1 1.2-3.1 0-5.8-2.1-6.8-5l-.1.1-3.7 2.9v.1C3.3 21.3 7.3 24 12 24z"/><path fill="#FBBC05" d="M5.2 14.4c-.2-.7-.4-1.5-.4-2.4s.1-1.7.4-2.4l-.1-.1-3.6-2.8-.1.1C.5 8.5 0 10.2 0 12s.5 3.5 1.4 5.1l3.8-2.7z"/><path fill="#EA4335" d="M12 4.7c1.8 0 3 .8 3.7 1.4l3.3-3.2C16.9 1.1 14.7 0 12 0 7.3 0 3.3 2.7 1.4 6.9l3.8 2.9c1-2.9 3.7-5.1 6.8-5.1z"/></svg>';
  var AMAZON_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#000" d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595l.315-.14c.138-.06.234-.1.293-.13.226-.088.39-.046.525.13.12.174.09.336-.12.48-.256.19-.6.41-1.006.654-1.244.743-2.64 1.316-4.185 1.726a17.617 17.617 0 01-10.951-.577 17.88 17.88 0 01-5.43-3.35c-.1-.074-.151-.15-.151-.22 0-.047.021-.09.051-.13zm6.565-6.218c0-1.005.247-1.863.743-2.577.495-.71 1.17-1.25 2.04-1.615.796-.335 1.756-.575 2.912-.72.39-.046 1.033-.103 1.92-.174v-.37c0-.93-.105-1.558-.3-1.875-.302-.43-.78-.65-1.44-.65h-.182c-.48.046-.896.196-1.246.46-.35.27-.575.63-.675 1.096-.06.3-.206.465-.435.51l-2.52-.315c-.248-.06-.372-.18-.372-.39 0-.046.007-.09.022-.15.247-1.29.855-2.25 1.82-2.88.976-.616 2.1-.975 3.39-1.05h.54c1.65 0 2.957.434 3.888 1.29.135.15.27.3.405.48.12.165.224.314.283.45.075.134.15.33.195.57.06.254.105.42.135.51.03.104.062.3.076.615.01.313.02.493.02.553v5.28c0 .376.06.72.165 1.036.105.313.21.54.315.674l.51.674c.09.136.136.256.136.36 0 .12-.06.226-.18.314-1.2 1.05-1.86 1.62-1.963 1.71-.165.135-.375.15-.63.045a6.062 6.062 0 01-.526-.496l-.31-.347a9.391 9.391 0 01-.317-.42l-.3-.435c-.81.886-1.603 1.44-2.4 1.665-.494.15-1.093.227-1.83.227-1.11 0-2.04-.343-2.76-1.034-.72-.69-1.08-1.665-1.08-2.94l-.05-.076zm3.753-.438c0 .566.14 1.02.425 1.364.285.34.675.512 1.155.512.045 0 .106-.007.195-.02.09-.016.134-.023.166-.023.614-.16 1.08-.553 1.424-1.178.165-.28.285-.58.36-.91.09-.32.12-.59.135-.8.015-.195.015-.54.015-1.005v-.54c-.84 0-1.484.06-1.92.18-1.275.36-1.92 1.17-1.92 2.43l-.035-.02z"/><path fill="#FF9900" d="M16.615 18.83c.03-.06.075-.11.132-.17.362-.243.714-.41 1.05-.5a8.094 8.094 0 011.612-.24c.14-.012.28 0 .41.03.65.06 1.05.168 1.172.33.063.09.099.228.099.39v.15c0 .51-.149 1.11-.424 1.8-.278.69-.664 1.248-1.156 1.68-.073.06-.14.09-.197.09-.03 0-.06 0-.09-.012-.09-.044-.107-.12-.064-.24.54-1.26.806-2.143.806-2.64 0-.15-.03-.27-.087-.344-.145-.166-.55-.257-1.224-.257-.243 0-.533.016-.87.046-.363.045-.7.09-1 .135-.09 0-.148-.014-.18-.044-.03-.03-.036-.047-.02-.077 0-.017.006-.03.02-.063v-.06z"/></svg>';
  var PAYPAL_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#003087" d="M7.1 21.5h3.2l1.1-7.1h2.5c3.9 0 6.9-3.4 7.1-6.9.1-2.5-1.9-4.6-4.5-4.9L7.1 21.5zm3.9-18.9h6.4c.9 0 1.9.2 2.4.5-.2 2.7-2.7 5.5-6.4 5.5H9.6l1.4-6z" transform="translate(-4.9 0)"/></svg>';

  function oauthPillsHtml() {
    return '' +
      '<div class="bsr-oauth-pills">' +
      '<button type="button" class="bsr-oauth-pill" data-oauth="google">' + GOOGLE_SVG + '<span>Continue with Google</span></button>' +
      '<button type="button" class="bsr-oauth-pill" data-oauth="amazon">' + AMAZON_SVG + '<span>Continue with Amazon</span></button>' +
      '<button type="button" class="bsr-oauth-pill" data-oauth="paypal">' + PAYPAL_SVG + '<span>Continue with PayPal</span></button>' +
      '</div>' +
      '<div class="bsr-login-div">or with email</div>';
  }

  /* Build the auth form inside `container`. opts: {heading, sub}. */
  function buildForm(container, opts) {
    opts = opts || {};
    container.innerHTML =
      '<div class="bsr-error" data-el="error" role="alert"></div>' +
      oauthPillsHtml() +
      // Step 1: email
      '<div data-step="email">' +
      '<h2>' + escHtml(opts.heading || 'Sign in') + '</h2>' +
      (opts.sub ? '<p class="bsr-login-sub">' + escHtml(opts.sub) + '</p>' : '') +
      '<div class="bsr-field"><label for="bsr-login-email">Email</label>' +
      '<input type="email" data-el="email" id="bsr-login-email" autocomplete="email" placeholder="you@example.com"></div>' +
      '<button type="button" class="bsr-btn" data-el="continue">Continue</button>' +
      '<p class="bsr-center" style="margin:16px 0 0"><a class="bsr-muted-link" href="/shop/">Continue as guest</a></p>' +
      '</div>' +
      // Step 2a: sign in (existing account)
      '<div data-step="login" hidden>' +
      '<h2>Welcome back</h2>' +
      '<p class="bsr-step-email"><span data-el="login-email"></span> &middot; <button type="button" class="bsr-link" data-el="edit-login">Edit</button></p>' +
      '<div class="bsr-field"><label>Password</label>' +
      '<input type="password" data-el="password" autocomplete="current-password"></div>' +
      '<div class="bsr-turnstile-wrap" data-el="ts-login"></div>' +
      '<button type="button" class="bsr-btn" data-el="signin">Sign in</button>' +
      '<p class="bsr-center" style="margin:14px 0 0"><button type="button" class="bsr-link" data-el="forgot">Forgot password?</button></p>' +
      '</div>' +
      // Step 2b: create account (new email)
      '<div data-step="register" hidden>' +
      '<h2>Create your account</h2>' +
      '<p class="bsr-step-email"><span data-el="register-email"></span> &middot; <button type="button" class="bsr-link" data-el="edit-register">Edit</button></p>' +
      '<div class="bsr-field"><label>Name</label>' +
      '<input type="text" data-el="name" autocomplete="name" placeholder="Your name"></div>' +
      '<div class="bsr-field"><label>Password</label>' +
      '<input type="password" data-el="password2" autocomplete="new-password">' +
      '<div class="hint">8+ characters</div></div>' +
      '<div class="bsr-turnstile-wrap" data-el="ts-register"></div>' +
      '<button type="button" class="bsr-btn" data-el="create">Create account</button>' +
      '</div>';

    var q = function (sel) { return container.querySelector('[data-el="' + sel + '"]'); };
    var stepEmail = container.querySelector('[data-step="email"]');
    var stepLogin = container.querySelector('[data-step="login"]');
    var stepRegister = container.querySelector('[data-step="register"]');
    var errBox = q('error');
    var currentEmail = '';
    var tsWidgets = { login: null, register: null };

    function showError(msg) {
      errBox.textContent = msg;
      errBox.classList.add('show');
    }
    function clearError() {
      errBox.textContent = '';
      errBox.classList.remove('show');
    }

    /* Bulletproof step switching: the hidden attribute (backed by
       [hidden]{display:none!important}) guarantees Step 1 is fully gone
       when Step 2 shows — never both visible at once. */
    function goStep(name) {
      stepEmail.hidden = (name !== 'email');
      stepLogin.hidden = (name !== 'login');
      stepRegister.hidden = (name !== 'register');
      clearError();
    }
    function editEmail() {
      goStep('email');
      var em = q('email');
      if (em) em.focus();
    }

    /* Turnstile: render one widget per Step 2 container, lazily on first
       entry to that step. Skipped entirely until a real site key is set. */
    function ensureTurnstile(which) {
      if (!TURNSTILE_SITE_KEY || TURNSTILE_SITE_KEY === 'TURNSTILE_SITE_KEY') return Promise.resolve(null);
      return loadTurnstile().then(function () {
        if (!window.turnstile) return null;
        if (tsWidgets[which] !== null) return tsWidgets[which];
        var mount = q(which === 'login' ? 'ts-login' : 'ts-register');
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

    /* OAuth buttons → popup flow. */
    var pills = container.querySelectorAll('[data-oauth]');
    for (var i = 0; i < pills.length; i++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          clearError();
          oauthPopup(btn.getAttribute('data-oauth'), showError);
        });
      })(pills[i]);
    }

    /* Step 1 → check email → route to Step 2a or 2b. */
    q('continue').addEventListener('click', function () {
      clearError();
      var email = q('email').value.trim().toLowerCase();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        showError('Please enter a valid email address.');
        return;
      }
      var btn = this;
      btn.disabled = true;
      btn.textContent = 'Checking…';
      BSR.api('/api/account/check-email', { method: 'POST', body: { email: email } })
        .then(function (j) {
          btn.disabled = false;
          btn.textContent = 'Continue';
          if (!j || !j.ok) {
            showError((j && j.error) || 'Something went wrong. Please try again.');
            return;
          }
          currentEmail = email;
          if (j.exists) {
            q('login-email').textContent = email;
            goStep('login');
            ensureTurnstile('login');
            q('password').focus();
          } else {
            q('register-email').textContent = email;
            goStep('register');
            ensureTurnstile('register');
            q('name').focus();
          }
        })
        .catch(function () {
          btn.disabled = false;
          btn.textContent = 'Continue';
          showError('Something went wrong. Please try again.');
        });
    });

    q('edit-login').addEventListener('click', editEmail);
    q('edit-register').addEventListener('click', editEmail);
    q('forgot').addEventListener('click', function () {
      showError('Password reset is coming soon — contact us if you need help signing in.');
    });

    /* Step 2a: sign in. */
    q('signin').addEventListener('click', function () {
      clearError();
      var pw = q('password').value;
      if (!pw) { showError('Please enter your password.'); return; }
      var btn = this;
      btn.disabled = true;
      btn.textContent = 'Signing in…';
      var body = { email: currentEmail, password: pw };
      var tok = turnstileToken('login');
      if (tok) body.cf_turnstile_response = tok;
      BSR.api('/api/account/login', { method: 'POST', body: body })
        .then(function (j) {
          if (j && j.ok) {
            onAuthSuccess();
          } else {
            if (j && j.error === 'captcha_failed') {
              showError('Please complete the CAPTCHA and try again.');
            } else {
              showError((j && j.error) || 'Sign in failed. Please try again.');
            }
            resetTurnstile('login');
            btn.disabled = false;
            btn.textContent = 'Sign in';
          }
        })
        .catch(function () {
          showError('Sign in failed. Please try again.');
          resetTurnstile('login');
          btn.disabled = false;
          btn.textContent = 'Sign in';
        });
    });

    /* Step 2b: create account. */
    q('create').addEventListener('click', function () {
      clearError();
      var name = q('name').value.trim();
      var pw = q('password2').value;
      if (!name) { showError('Please enter your name.'); return; }
      if (pw.length < 8) { showError('Password must be at least 8 characters.'); return; }
      var btn = this;
      btn.disabled = true;
      btn.textContent = 'Creating…';
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
            btn.textContent = 'Create account';
          } else if (j && j.error && /already exists/i.test(j.error)) {
            // Race: account created between the email check and submit.
            q('login-email').textContent = currentEmail;
            goStep('login');
            ensureTurnstile('login');
            showError('That email now has an account — please sign in.');
            btn.disabled = false;
            btn.textContent = 'Create account';
          } else {
            showError((j && j.error) || 'Could not create your account. Please try again.');
            resetTurnstile('register');
            btn.disabled = false;
            btn.textContent = 'Create account';
          }
        })
        .catch(function () {
          showError('Could not create your account. Please try again.');
          resetTurnstile('register');
          btn.disabled = false;
          btn.textContent = 'Create account';
        });
    });

    /* Enter key submits the visible step. */
    function onEnter(el, btnSel) {
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); q(btnSel).click(); }
      });
    }
    onEnter(q('email'), 'continue');
    onEnter(q('password'), 'signin');
    onEnter(q('name'), 'create');
    onEnter(q('password2'), 'create');

    // Start on Step 1.
    goStep('email');
  }

  function escHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* Called after any successful auth (modal or inline or OAuth popup). */
  function onAuthSuccess() {
    closeModal();
    if (typeof BSR !== 'undefined' && BSR.refreshAuthState) {
      try { BSR.refreshAuthState(); } catch (e) {}
    }
    window.location = '/account/';
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

  function showLogin(opts) {
    opts = opts || {};
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
    buildForm(overlay.querySelector('[data-el="form"]'), {
      heading: opts.heading || 'Sign in',
      sub: opts.sub || 'Sign in to track orders, check out faster, and manage your account.'
    });
    // Keep a handle so BSR.refreshAuthState (if present) can find it.
    overlay._bsrLoginModal = true;
    return overlay;
  }

  /* Inline (non-modal) form for the /account/login/ fallback page. */
  function renderLoginForm(container, opts) {
    injectCss();
    if (typeof container === 'string') container = document.querySelector(container);
    if (!container) return;
    buildForm(container, opts || {});
  }

  /* Public API. */
  window.BSR = window.BSR || {};
  window.BSR.showLogin = showLogin;
  window.BSR.renderLoginForm = renderLoginForm;
  window.BSR.closeLogin = closeModal;
})();
