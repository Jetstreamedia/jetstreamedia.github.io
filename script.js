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

// Click a gauge to see what the metric means
(function () {
  var dlg = document.getElementById('metric-dialog');
  if (!dlg || typeof dlg.showModal !== 'function') return;
  var DATA = {"ctr": {"title": "What is CTR?", "lead": "Click-through rate shows how many people clicked your ad after seeing it. It tells you whether your ad is interesting enough to get attention.", "formula": "CTR = (Clicks ÷ Impressions) × 100", "example": "An ad is shown 1,000 times and gets 20 clicks. CTR = 20 ÷ 1,000 × 100 = 2%.", "tips": ["Open with a strong hook in the first line or the first second.", "Show the product or result clearly, and design for a phone screen.", "Test new images, videos and headlines, one change at a time.", "Check that the ad reaches the right audience."], "guide": true}, "cpl": {"title": "What is Cost per Lead?", "lead": "Cost per lead is what you pay, on average, to get one enquiry, such as a form fill, a message or a call. A lower cost per lead means you get enquiries more cheaply.", "formula": "CPL = Total ad spend ÷ Number of leads", "example": "You spend 100 and get 20 leads. CPL = 100 ÷ 20 = 5 per lead.", "tips": ["Make the offer clear so the right people respond.", "Keep the form short and the landing page fast.", "Improve the audience and turn off what does not perform.", "Compare CPL with what a customer is worth to you, not with other businesses."], "guide": true}, "roas": {"title": "What is ROAS?", "lead": "Return on ad spend shows how much revenue you earn for every 1 you spend on ads. A ROAS of 2.8x means every 1 spent brought back 2.8 in revenue.", "formula": "ROAS = Revenue from ads ÷ Ad spend", "example": "You spend 100 on ads and make 280 in sales, so ROAS = 280 ÷ 100 = 2.8x. Revenue is not profit: break-even ROAS = 1 ÷ your profit margin.", "tips": ["Send traffic to a clear landing page with a strong offer.", "Put more budget into the ads and audiences that already sell.", "Improve the creative and the offer, not only the targeting.", "Track sales properly so you know which ads bring revenue."], "guide": true}, "cr": {"title": "What is Conversion Rate?", "lead": "Conversion rate is the share of visitors who take the action you want, such as buying, sending a message or filling in a form.", "formula": "Conversion rate = (Conversions ÷ Visitors) × 100", "example": "500 people visit your page and 25 buy or send an enquiry. Conversion rate = 25 ÷ 500 × 100 = 5%.", "tips": ["Give each page one clear goal and one clear button.", "Make the page fast and easy to use on a phone.", "Add trust: reviews, real photos and clear contact details.", "Keep forms and checkout as short as possible."], "guide": false}};
  var $ = function (id) { return document.getElementById(id); };

  function openMetric(g) {
    var d = DATA[g.getAttribute('data-metric')];
    if (!d) return;
    var v = g.querySelector('.val');
    var dec = parseInt(v.getAttribute('data-decimals') || '0', 10);
    $('md-badge').textContent = (v.getAttribute('data-prefix') || '') + Number(v.getAttribute('data-count')).toFixed(dec) + (v.getAttribute('data-suffix') || '');
    $('md-title').textContent = d.title;
    $('md-lead').textContent = d.lead;
    $('md-formula').textContent = d.formula;
    $('md-example').textContent = d.example;
    var ul = $('md-tips'); ul.textContent = '';
    d.tips.forEach(function (t) { var li = document.createElement('li'); li.textContent = t; ul.appendChild(li); });
    $('md-guide').style.display = d.guide ? '' : 'none';
    dlg.showModal();
    dlg.querySelector('.md-card').scrollTop = 0;
  }

  document.querySelectorAll('.gauge[data-metric]').forEach(function (g) {
    g.addEventListener('click', function () { openMetric(g); });
    g.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openMetric(g); }
    });
  });
  dlg.querySelector('.md-close').addEventListener('click', function () { dlg.close(); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
})();

// Big "Jetstreamedia" wordmark: rises from behind the photo while the letters decode, left to right
(function () {
  var el = document.querySelector('.wordmark');
  if (!el) return;
  var text = el.getAttribute('data-text') || el.textContent;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var C = [[139,109,255],[77,141,255],[45,212,232]];
  function colorAt(t) {
    var a = t < .5 ? C[0] : C[1], b = t < .5 ? C[1] : C[2], u = t < .5 ? t * 2 : (t - .5) * 2;
    return 'rgb(' + [0,1,2].map(function (k) { return Math.round(a[k] + (b[k] - a[k]) * u); }).join(',') + ')';
  }
  function run() {
    el.textContent = '';
    el.classList.add('split');
    var chars = text.split('');
    var spans = chars.map(function (ch, i) {
      var s = document.createElement('span');
      s.textContent = ch;
      s.style.color = colorAt(i / (chars.length - 1));
      el.appendChild(s);
      return s;
    });
    spans.forEach(function (s) { s.style.width = s.getBoundingClientRect().width + 'px'; });
    if (reduce) return;
    var POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%$&*+=?';
    var start = performance.now(), delay = 450, stagger = 95, dur = 750;
    spans.forEach(function (s) { s.style.opacity = 0; });
    function frame(now) {
      var done = true;
      spans.forEach(function (s, i) {
        var p = (now - start - delay - i * stagger) / dur;
        if (p < 0) { done = false; return; }
        if (p < 1) {
          done = false;
          s.style.opacity = (0.25 + 0.75 * p).toFixed(2);
          s.style.filter = 'blur(' + (12 * (1 - p)).toFixed(1) + 'px)';
          if (Math.random() < 0.55) s.textContent = POOL.charAt(Math.floor(Math.random() * POOL.length));
        } else {
          s.textContent = chars[i]; s.style.opacity = 1; s.style.filter = 'none';
        }
      });
      if (!done) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  var ready = (document.fonts && document.fonts.load) ? document.fonts.load('800 60px Unbounded') : Promise.resolve();
  Promise.race([ready, new Promise(function (r) { setTimeout(r, 1500); })]).then(run, run);
})();
