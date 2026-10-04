// Scroll reveal: elements fade and slide up as they enter the screen
(function () {
  var targets = document.querySelectorAll(
    'section h2, .lead p, .chips span, .note, .shot, .row, .svc > div, .list li, .mail'
  );
  if (!('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  targets.forEach(function (el) {
    var siblings = Array.prototype.filter.call(el.parentNode.children, function (c) {
      return c.tagName === el.tagName;
    });
    var i = siblings.indexOf(el);
    el.style.setProperty('--d', Math.min(i * 70, 350) + 'ms');
    el.classList.add('reveal');
    io.observe(el);
  });
})();

// Count-up numbers in the hero gauges
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('[data-count]').forEach(function (el) {
    var end = parseFloat(el.dataset.count), dec = parseInt(el.dataset.decimals || '0', 10);
    var pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    var start = null, delay = 500, dur = 1600;
    el.textContent = pre + (0).toFixed(dec) + suf;
    function tick(t) {
      if (start === null) start = t;
      var p = Math.min(Math.max((t - start - delay) / dur, 0), 1);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = pre + (end * e).toFixed(dec) + suf;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
})();

// Contact form: sends the message to your email through Web3Forms
(function () {
  var form = document.getElementById('contact-form');
  if (!form) return;
  var status = form.querySelector('.form-status');
  var btn = form.querySelector('button[type="submit"]');
  var EMAIL = 'zubaerh50@gmail.com';

  function say(msg, cls) { status.textContent = msg; status.className = 'form-status ' + (cls || ''); }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var data = {};
    new FormData(form).forEach(function (v, k) { data[k] = v; });
    if (data.botcheck) return;
    if (!data.name || !data.email || !data.service || !data.message) {
      say('Please fill in your name, email, service and message.', 'err');
      return;
    }
    if (!data.access_key || data.access_key === 'YOUR_ACCESS_KEY') {
      say('The form is not set up yet. Please email me at ' + EMAIL + '.', 'err');
      return;
    }
    btn.disabled = true; btn.textContent = 'Sending...'; say('');
    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j.success) throw new Error('failed');
        form.reset();
        say('Thank you! Your message was sent. I will reply soon.', 'ok');
      })
      .catch(function () {
        say('Something went wrong. Please email me at ' + EMAIL + '.', 'err');
      })
      .then(function () { btn.disabled = false; btn.textContent = 'Send message'; });
  });
})();

// Slide-out menu
(function () {
  var btn = document.querySelector('.menu-btn');
  var drawer = document.getElementById('drawer');
  var scrim = document.querySelector('.scrim');
  if (!btn || !drawer || !scrim) return;

  function setOpen(open) {
    drawer.classList.toggle('open', open);
    scrim.classList.toggle('show', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.documentElement.classList.toggle('no-scroll', open);
  }
  btn.addEventListener('click', function () { setOpen(!drawer.classList.contains('open')); });
  scrim.addEventListener('click', function () { setOpen(false); });
  drawer.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && drawer.classList.contains('open')) { setOpen(false); btn.focus(); }
  });
})();
