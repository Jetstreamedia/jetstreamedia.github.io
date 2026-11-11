// Scroll reveal: elements fade and slide up as they enter the screen
(function () {
  var targets = document.querySelectorAll(
    'section h2, .lead p, .chips span, .note, .shot, .row, .svc > div, .list li, .mail, .post-card, .tip-card'
  );
  if (!('IntersectionObserver' in window)) return;

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

// Glass pill navigation: the highlight slides from the previous page to the current one
(function () {
  var nav = document.querySelector('.pnav');
  if (!nav) return;
  var items = Array.prototype.slice.call(nav.querySelectorAll('a'));
  var cur = 0;
  items.forEach(function (a, i) { if (a.hasAttribute('aria-current')) cur = i; });
  var prev = NaN;
  try { prev = parseInt(sessionStorage.getItem('navIdx'), 10); } catch (e) {}
  if (!isNaN(prev) && prev !== cur && prev >= 0 && prev < items.length) {
    nav.classList.add('no-anim');
    nav.style.setProperty('--idx', prev);
    void nav.offsetWidth;
    requestAnimationFrame(function () {
      nav.classList.remove('no-anim');
      nav.style.setProperty('--idx', cur);
    });
  }
  try { sessionStorage.setItem('navIdx', cur); } catch (e) {}
})();

// Random marketing tip: a different tip on every refresh, plus a "New tip" button
(function () {
  var textEl = document.getElementById('tip-text');
  var catEl = document.getElementById('tip-cat');
  var btn = document.getElementById('tip-btn');
  if (!textEl || !catEl) return;
  var main = textEl.parentNode;
  var TIPS = [["Meta Ads", "Test one change at a time. If you change the image, the text and the audience together, you will never know what worked."], ["Meta Ads", "Your first line decides whether people keep reading. Put the benefit or the problem in the first few words."], ["Meta Ads", "Give a new campaign a few days to learn before you judge it or change it."], ["Meta Ads", "Refresh your ad creative regularly. Even a good ad gets tired when the same people see it again and again."], ["Meta Ads", "Look at cost per result, not only clicks. Cheap clicks that never buy are expensive."], ["Google Ads", "Add negative keywords early. They stop your budget going to searches that will never become customers."], ["Google Ads", "Match your ad to your landing page. If the ad promises one thing and the page shows another, people leave."], ["Google Ads", "Start with a few focused keywords instead of hundreds. It is easier to learn what works."], ["SEO", "One page, one topic. Give each service its own page instead of squeezing everything into one."], ["SEO", "Write your page title for people first. It is the first thing they read in the search results."], ["SEO", "Answer the real questions your customers ask. Pages that solve a problem are the ones people keep visiting."], ["SEO", "Compress your images. A fast page keeps visitors on your site and is easier to use on a phone."], ["Ad creative", "Design your ad for a phone screen. If the text is hard to read at arm's length, people will scroll past."], ["Ad creative", "Show the product in use. People trust what they can picture in their own life."], ["Ad creative", "One ad, one message. Pick the single most important benefit and build the ad around it."], ["Ad creative", "Real faces and real voices often feel more trustworthy than perfect studio shots."], ["Social media", "Post consistently rather than constantly. A schedule you can keep beats a burst you cannot."], ["Social media", "Reply to comments quickly. It shows there is a real person behind the brand and keeps the conversation going."], ["Social media", "Start with the hook. The first second of a video decides whether people stay."], ["Email", "Write the subject line last, and keep it clear. A clear promise beats a clever one."], ["Email", "Send one email with one goal and one button. Too many choices means no click."], ["Email", "Clean your list now and then. A smaller list of interested people is worth more than a big list that ignores you."], ["Copywriting", "Talk about what the customer gets, not what you do. Benefits beat features."], ["Copywriting", "Use simple words. If a ten-year-old can follow your offer, so can a busy customer."], ["Copywriting", "Always end with a clear next step: call, message, buy or book."], ["Strategy", "Know your numbers before you spend. Work out what a customer is worth, then decide what you can afford to pay to get one."], ["Strategy", "Give every campaign one clear goal, like leads, sales or messages. Without a goal, results are just numbers."], ["Strategy", "Break-even ROAS is 1 divided by your profit margin. Know it before you scale an ad."], ["Strategy", "Look at your best customers and find what they have in common. Then aim your ads at more people like them."], ["Strategy", "Reply to enquiries quickly. Fast follow-up gives you a real advantage over slower competitors."], ["Strategy", "Ask happy customers for a review or a short testimonial. Social proof makes every ad and page work harder."], ["Strategy", "Small tests are cheap. Try a new idea with a small budget before you spend big on it."]];

  function last() { try { return parseInt(localStorage.getItem('tipIdx'), 10); } catch (e) { return NaN; } }
  function pick() {
    var prev = last(), i;
    do { i = Math.floor(Math.random() * TIPS.length); } while (i === prev && TIPS.length > 1);
    try { localStorage.setItem('tipIdx', i); } catch (e) {}
    return TIPS[i];
  }
  function show(t) { catEl.textContent = t[0]; textEl.textContent = t[1]; }

  show(pick());

  if (btn) btn.addEventListener('click', function () {
    var t = pick();
    btn.classList.add('spin');
    main.classList.add('swap');
    setTimeout(function () {
      show(t);
      main.classList.remove('swap');
      btn.classList.remove('spin');
    }, 260);
  });
})();
