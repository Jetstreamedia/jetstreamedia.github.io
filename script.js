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
