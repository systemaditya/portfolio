// Motion layer: scroll progress, word-by-word headings, staggered lists, hero spotlight and drifting
// grid, card tilt, magnetic buttons, gliding nav indicator, experience rail, back-to-top ring, chart
// count-up. All of it is decorative: content is complete without it. Pointer effects run only on
// mouse/trackpad devices, and everything except plain state changes is skipped for reduced motion.
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var narrow = window.matchMedia('(max-width: 960px)');

  /* ---------- Reveal-on-view helper ---------- */
  var watchers = [];
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.classList.add('is-in');
      var cb = en.target.__onIn; if (cb) cb();
      io.unobserve(en.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0 }) : null;
  function whenVisible(node, cb) {
    if (cb) node.__onIn = cb;
    if (reduce || !io) { node.classList.add('is-in'); if (cb) cb(); return; }
    io.observe(node);
  }

  /* ---------- 1. Headings revealed word by word ---------- */
  function wrapWord(content, i) {
    var w = document.createElement('span'); w.className = 'w'; w.setAttribute('aria-hidden', 'true');
    var inner = document.createElement('span'); inner.style.setProperty('--i', i);
    inner.append(content); w.append(inner);
    return w;
  }
  function splitWords(h) {
    var label = h.textContent.replace(/\s+/g, ' ').trim();
    var frag = document.createDocumentFragment(), i = 0;
    Array.prototype.slice.call(h.childNodes).forEach(function (node) {
      if (node.nodeType === 3) {
        node.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) frag.append(' ');
          else frag.append(wrapWord(document.createTextNode(part), i++));
        });
      } else {
        frag.append(wrapWord(node.cloneNode(true), i++));
      }
    });
    h.replaceChildren(frag);
    h.setAttribute('aria-label', label);
    h.classList.add('split');
  }
  if (!reduce) {
    $$('.hero-title, .h2, .resume-band h2').forEach(function (h) {
      splitWords(h);
      if (h.classList.contains('hero-title')) requestAnimationFrame(function () { requestAnimationFrame(function () { h.classList.add('is-in'); }); });
      else whenVisible(h);
    });
  }

  /* ---------- 2. Lists and chip groups fade up one item at a time ---------- */
  $$('.skill .chips, .role-list, .csteps, .facts, .contact-list, .role-tools, .metrics, .creds, .edu, .stego-notes ul, .topic-chips').forEach(function (group) {
    Array.prototype.slice.call(group.children).forEach(function (c, i) { c.style.setProperty('--i', Math.min(i, 10)); });
    group.classList.add('stagger');
    whenVisible(group);
  });

  /* ---------- 3. Chart labels count up with their bars ---------- */
  $$('.bar-v b').forEach(function (b) {
    var target = parseInt(b.textContent, 10);
    if (!target) return;
    whenVisible(b, function () {
      if (reduce) return;
      var start = null, dur = 1200;
      function step(t) {
        if (!start) start = t;
        var p = Math.min((t - start) / dur, 1);
        b.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + '%';
        if (p < 1) requestAnimationFrame(step);
      }
      b.textContent = '0%';
      setTimeout(function () { requestAnimationFrame(step); }, 150);
    });
  });

  /* ---------- 4. Hero: drifting grid + pointer spotlight ---------- */
  var hero = $('.hero');
  if (hero) {
    var bg = document.createElement('div'); bg.className = 'hero-bg'; bg.setAttribute('aria-hidden', 'true');
    var gridLayer = document.createElement('div'); gridLayer.className = 'hero-bg-grid';
    bg.append(gridLayer);
    var spot = document.createElement('div'); spot.className = 'hero-spot'; spot.setAttribute('aria-hidden', 'true');
    hero.prepend(bg, spot);
    hero.classList.add('has-bg');
    if (finePointer && !reduce) {
      var raf = 0, mx = 0, my = 0;
      hero.addEventListener('pointermove', function (e) {
        var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top;
        if (!raf) raf = requestAnimationFrame(function () { raf = 0; spot.style.setProperty('--mx', mx + 'px'); spot.style.setProperty('--my', my + 'px'); });
      });
    }
  }

  /* ---------- 5. Cards tilt toward the pointer, with a soft spotlight ---------- */
  if (finePointer && !reduce) {
    $$('.project, .skill, .cred, .edu-card, a.contact-item').forEach(function (card) {
      var light = document.createElement('span'); light.className = 'tilt-spot'; light.setAttribute('aria-hidden', 'true');
      card.append(light);
      card.classList.add('tilt');
      var frame = 0, px = 0, py = 0;
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect(); px = (e.clientX - r.left) / r.width; py = (e.clientY - r.top) / r.height;
        if (frame) return;
        frame = requestAnimationFrame(function () {
          frame = 0;
          var max = card.offsetWidth > 700 ? 1.6 : 4.5; // wide cards tilt less
          card.classList.add('is-tilting');
          card.style.transform = 'perspective(1000px) rotateX(' + ((0.5 - py) * max).toFixed(2) + 'deg) rotateY(' + ((px - 0.5) * max).toFixed(2) + 'deg) translateY(-3px)';
          light.style.setProperty('--sx', (px * 100).toFixed(1) + '%');
          light.style.setProperty('--sy', (py * 100).toFixed(1) + '%');
        });
      });
      card.addEventListener('pointerleave', function () {
        if (frame) { cancelAnimationFrame(frame); frame = 0; }
        card.classList.remove('is-tilting');
        card.style.transform = '';
      });
    });
  }

  /* ---------- 6. Buttons: magnetic pull + light sweep ---------- */
  $$('.btn-primary, .btn-accent, .resume-band .btn-light').forEach(function (b) { b.classList.add('btn-shine'); });
  if (finePointer && !reduce) {
    $$('.hero-ctas .btn, .hero-ctas .icon-btn, .resume-actions .btn, .nav-actions .btn, .contact-copy .btn').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) / r.width, dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        b.style.transform = 'translate(' + (dx * 8).toFixed(1) + 'px,' + (dy * 6).toFixed(1) + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  }

  /* ---------- 7. Navigation pill that glides to the active / hovered link ---------- */
  var links = $('#nav-links');
  if (links) {
    var pill = document.createElement('span'); pill.className = 'nav-indicator'; pill.setAttribute('aria-hidden', 'true');
    links.prepend(pill);
    links.classList.add('has-indicator');
    var moveTo = function (a) {
      var show = !!a && !narrow.matches;
      // Toggle only on change: the observer below must never be re-triggered by the pill itself.
      if (pill.classList.contains('on') !== show) pill.classList.toggle('on', show);
      if (!show) return;
      pill.style.width = a.offsetWidth + 'px';
      pill.style.setProperty('--x', a.offsetLeft + 'px');
    };
    var active = function () { return $('a.active', links); };
    $$('a', links).forEach(function (a) { a.addEventListener('mouseenter', function () { moveTo(a); }); });
    links.addEventListener('mouseleave', function () { moveTo(active()); });
    // Follow the scroll-spy's .active class on the links (not the pill, which also lives in this container).
    new MutationObserver(function (records) {
      if (records.some(function (r) { return r.target !== pill; })) moveTo(active());
    }).observe(links, { subtree: true, attributes: true, attributeFilter: ['class'] });
    window.addEventListener('resize', function () { moveTo(active()); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { moveTo(active()); });
  }

  /* ---------- 8. Experience rail ---------- */
  var timeline = $('.timeline');
  var railFill = null, roles = [];
  if (timeline) {
    var rail = document.createElement('div'); rail.className = 'timeline-rail'; rail.setAttribute('aria-hidden', 'true');
    railFill = document.createElement('span'); rail.append(railFill);
    timeline.prepend(rail);
    roles = $$('.role', timeline);
    roles.forEach(function (r) { var d = document.createElement('span'); d.className = 'rail-dot'; d.setAttribute('aria-hidden', 'true'); r.prepend(d); });
  }

  /* ---------- 9. Scroll progress + back to top ---------- */
  var progress = document.createElement('div'); progress.className = 'scroll-progress'; progress.setAttribute('aria-hidden', 'true');
  var toTop = document.createElement('button');
  toTop.type = 'button'; toTop.className = 'to-top'; toTop.setAttribute('aria-label', 'Back to top');
  toTop.innerHTML = '<svg class="ring" viewBox="0 0 50 50" aria-hidden="true"><circle cx="25" cy="25" r="24"/></svg><svg aria-hidden="true"><use href="#i-arrow"/></svg>';
  toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    var brand = $('.brand'); if (brand) brand.focus({ preventScroll: true });
  });
  document.body.append(progress, toTop);

  var ticking = false;
  function update() {
    ticking = false;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    progress.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    toTop.style.setProperty('--p', p.toFixed(4));
    toTop.classList.toggle('show', window.scrollY > window.innerHeight * 0.9);
    if (railFill) {
      var r = timeline.getBoundingClientRect(), mark = window.innerHeight * 0.6;
      var fill = Math.max(0, Math.min(1, (mark - r.top) / r.height));
      railFill.style.setProperty('--p', fill.toFixed(4));
      roles.forEach(function (role) { role.classList.toggle('passed', role.getBoundingClientRect().top + 40 < mark); });
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();
