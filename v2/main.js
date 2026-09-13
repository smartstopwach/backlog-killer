/* ============================================================
   BACKLOG KILLER — main.js (Tukda 1: foundation, preloader, hero)
   ============================================================ */

/* ---------- boot: Lenis wired into GSAP ---------- */
var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var lenis = null;

function killPreloaderNow() {
  var pre = document.getElementById('preloader');
  if (pre && pre.parentNode) pre.parentNode.removeChild(pre);
  document.body.classList.remove('locked');
}

if (window.gsap && window.ScrollTrigger && window.Lenis) {
  gsap.registerPlugin(ScrollTrigger, SplitText);
  if (!prefersReduced) {
    lenis = new Lenis({ lerp: 0.1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
} else {
  /* CDN failed — never trap the user */
  killPreloaderNow();
}

/* ---------- tiny helpers ---------- */
function $(s, c) { return (c || document).querySelector(s); }
function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

/* ---------- global chrome ---------- */
var header = $('#site-header');
var progressBar = $('#progress-bar');

/* scroll progress — scaleX only */
if (window.ScrollTrigger) {
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: function (self) {
      if (progressBar) progressBar.style.transform = 'scaleX(' + self.progress + ')';
    }
  });
}

/* header transparent -> blurred after 40px */
function headerOnScroll() {
  var y = lenis ? lenis.scroll : (window.scrollY || window.pageYOffset || 0);
  if (header) header.classList.toggle('scrolled', y > 40);
}
if (lenis) lenis.on('scroll', headerOnScroll);
window.addEventListener('scroll', headerOnScroll, { passive: true });

/* ---------- magnetic hover helper ---------- */
function initMagnetic() {
  if (prefersReduced || !window.gsap) return;
  $$('[data-magnetic]').forEach(function (el) {
    var xTo = gsap.quickTo(el, 'x', { duration: 0.45, ease: 'power3.out' });
    var yTo = gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3.out' });
    el.addEventListener('mousemove', function (e) {
      var r = el.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * 0.3);
      yTo((e.clientY - r.top - r.height / 2) * 0.3);
    });
    el.addEventListener('mouseleave', function () { xTo(0); yTo(0); });
  });
}

/* ---------- shared .reveal entrance utility (used by later sections) ---------- */
function initReveals() {
  if (prefersReduced || !window.gsap) return;
  $$('.reveal').forEach(function (el) {
    gsap.fromTo(el,
      { y: 44, opacity: 0, willChange: 'transform' },
      {
        y: 0, opacity: 1, duration: 1, ease: 'power3.out', clearProps: 'willChange',
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
  });
}

/* ---------- mobile menu ---------- */
var menuBtn = $('#menu-btn');
var mobileMenu = $('#mobile-menu');
var menuTL = null;
var menuOpen = false;

function buildMenuTL() {
  if (menuTL || !window.gsap || prefersReduced) return;
  gsap.set(mobileMenu, { yPercent: -102, willChange: 'transform' });
  gsap.set($$('#mobile-menu a'), { y: 46, opacity: 0 });
  menuTL = gsap.timeline({ paused: true, defaults: { ease: 'power4.out' } });
  menuTL.to(mobileMenu, { yPercent: 0, duration: 0.7 })
        .to($$('#mobile-menu a'), { y: 0, opacity: 1, stagger: 0.06, duration: 0.7 }, '-=0.35');
}
function setMenu(open) {
  if (!mobileMenu) return;
  menuOpen = open;
  document.body.classList.toggle('menu-open', open);
  if (menuBtn) menuBtn.setAttribute('aria-expanded', String(open));
  mobileMenu.setAttribute('aria-hidden', String(!open));
  if (prefersReduced || !window.gsap) {
    mobileMenu.style.transform = open ? 'translateY(0)' : 'translateY(-102%)';
  } else {
    buildMenuTL();
    if (open) menuTL.play(); else menuTL.reverse();
  }
  if (lenis) { open ? lenis.stop() : lenis.start(); }
}
if (menuBtn) {
  menuBtn.addEventListener('click', function () { setMenu(!menuOpen); });
}

/* ---------- anchor scrolling (Lenis-aware) ---------- */
function initAnchors() {
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var target = $(id);
      if (!target) return;
      e.preventDefault();
      if (menuOpen) setMenu(false);
      if (lenis) {
        lenis.scrollTo(id === '#top' ? 0 : target, { offset: -70, duration: 1.2 });
      } else {
        if (id === '#top') window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
        else target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' });
      }
    });
  });
}

/* ============================================================
   PRELOADER
   ============================================================ */
var preState = { done: false, heroStarted: false };
var PRE_LABELS = ['syncing timetable', 'counting lectures', 'loading kill plan'];
var PRE_FINAL = 'ready — kill mode on';

function startHeroIntro() {
  if (preState.heroStarted) return;
  preState.heroStarted = true;
  heroIntro();
}

function finishPreloader(instant) {
  if (preState.done) return;
  preState.done = true;

  var label = $('#pre-label');
  if (label) label.textContent = PRE_FINAL;

  if (prefersReduced || instant || !window.gsap) {
    killPreloaderNow();
    startHeroIntro();
    if (window.ScrollTrigger) ScrollTrigger.refresh();
    return;
  }

  gsap.to(['#pre-content', '#pre-count'], { opacity: 0, duration: 0.35, delay: 0.2, ease: 'power2.out' });
  gsap.to('.pre-top', {
    yPercent: -101, duration: 0.9, delay: 0.5, ease: 'power4.inOut',
    onStart: startHeroIntro
  });
  gsap.to('.pre-bottom', {
    yPercent: 101, duration: 0.9, delay: 0.5, ease: 'power4.inOut',
    onComplete: function () {
      killPreloaderNow();
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    }
  });
}

function runPreloader() {
  var pre = $('#preloader');
  if (!pre || !window.gsap || prefersReduced) { finishPreloader(true); return; }

  var countEl = $('#pre-count');
  var labelEl = $('#pre-label');
  var labelIdx = 0;

  /* cycle the label every 700ms with a quick fade */
  var labelTimer = setInterval(function () {
    if (!labelEl || preState.done) { clearInterval(labelTimer); return; }
    gsap.to(labelEl, {
      opacity: 0, duration: 0.16, ease: 'power2.out',
      onComplete: function () {
        labelIdx = (labelIdx + 1) % PRE_LABELS.length;
        labelEl.textContent = PRE_LABELS[labelIdx];
        gsap.to(labelEl, { opacity: 1, duration: 0.16, ease: 'power2.in' });
      }
    });
  }, 700);

  /* counter 000 -> 100 */
  var counter = { n: 0 };
  gsap.to(counter, {
    n: 100, duration: 1.9, ease: 'power3.inOut',
    onUpdate: function () {
      if (countEl) countEl.textContent = String(Math.round(counter.n)).padStart(3, '0');
    },
    onComplete: function () {
      clearInterval(labelTimer);
      setTimeout(function () { finishPreloader(false); }, 250);
    }
  });

  /* SAFETY: never trap the user — 4s hard cap */
  setTimeout(function () {
    clearInterval(labelTimer);
    finishPreloader(false);
  }, 4000);
}

/* if anything throws anywhere, unlock the page */
window.addEventListener('error', function () { finishPreloader(true); });

/* ============================================================
   HERO
   ============================================================ */
function heroIntro() {
  if (prefersReduced || !window.gsap) return; /* CSS shows everything by default */

  /* oversized headline — SplitText chars lifting out of clipped lines */
  try {
    if (window.SplitText) {
      var split = new SplitText('#hero-title', { type: 'chars' });
      gsap.from(split.chars, {
        yPercent: 110,
        duration: 1.1,
        ease: 'power4.out',
        stagger: 0.035,
        willChange: 'transform',
        clearProps: 'willChange'
      });
    } else {
      gsap.from('#hero-title .line', { yPercent: 110, duration: 1.1, ease: 'power4.out', stagger: 0.08 });
    }
  } catch (e) {
    gsap.from('#hero-title', { opacity: 0, duration: 0.8, ease: 'power3.out' });
  }

  /* eyebrow, paragraph, CTAs, metadata */
  gsap.from('[data-hero]', {
    y: 26, opacity: 0, duration: 0.9, ease: 'power3.out',
    stagger: 0.07, delay: 0.25, willChange: 'transform', clearProps: 'willChange'
  });

  /* floating panel entrance — opacity only; y is owned by parallax/ambient layers */
  gsap.from('#hero-float', {
    opacity: 0, duration: 1, ease: 'power3.out', delay: 0.5
  });
}

function initHeroAmbient() {
  if (prefersReduced || !window.gsap) return;

  /* floating card: slow 6s yoyo drift between -12 and 12 */
  gsap.fromTo('#float-card', { y: -12 }, { y: 12, duration: 3, yoyo: true, repeat: -1, ease: 'sine.inOut' });

  /* parallax + mouse effects: desktop only, zero below 900px */
  var mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', function () {
    /* scroll parallax: background 0.3x, float 0.15x */
    gsap.to('.hero-bg', {
      y: function () { return Math.round(window.innerHeight * 0.3); },
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
    gsap.to('#hero-float', {
      y: function () { return -Math.round(window.innerHeight * 0.15); },
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 }
    });

    /* mouse parallax — headline 10px, panel 20px, against the cursor */
    if (window.matchMedia('(pointer: fine)').matches) {
      var tX = gsap.quickTo('#hero-title', 'x', { duration: 0.7, ease: 'power3.out' });
      var tY = gsap.quickTo('#hero-title', 'y', { duration: 0.7, ease: 'power3.out' });
      var fX = gsap.quickTo('#hero-float-mouse', 'x', { duration: 0.7, ease: 'power3.out' });
      var fY = gsap.quickTo('#hero-float-mouse', 'y', { duration: 0.7, ease: 'power3.out' });
      var hero = $('.hero');
      if (hero) {
        hero.addEventListener('mousemove', function (e) {
          var nx = e.clientX / window.innerWidth - 0.5;
          var ny = e.clientY / window.innerHeight - 0.5;
          tX(-nx * 10); tY(-ny * 10);
          fX(-nx * 20); fY(-ny * 20);
        });
        hero.addEventListener('mouseleave', function () { tX(0); tY(0); fX(0); fY(0); });
      }
    }
  });

  /* scroll hint: looping scaleY line, gone after 80px */
  gsap.fromTo('#hint-line', { scaleY: 0 }, {
    scaleY: 1, duration: 0.8, yoyo: true, repeat: -1,
    ease: 'sine.inOut', transformOrigin: 'top center'
  });
  ScrollTrigger.create({
    start: 80,
    onEnter: function () { gsap.to('#scroll-hint', { opacity: 0, duration: 0.4, ease: 'power2.out' }); },
    onEnterBack: function () { gsap.to('#scroll-hint', { opacity: 1, duration: 0.4, ease: 'power2.out' }); }
  });
}

/* ============================================================
   SECTION 3 — MARQUEE (linear allowed here only)
   ============================================================ */
function initMarquee() {
  var track = $('#marquee-track');
  if (!track) return;
  /* duplicate the track in JS for a seamless -50% loop (x2 so ultrawide never gaps) */
  track.innerHTML += track.innerHTML;
  track.innerHTML += track.innerHTML;
  if (prefersReduced || !window.gsap || !window.ScrollTrigger) return;

  var tween = gsap.to(track, { xPercent: -50, ease: 'none', duration: 22, repeat: -1 });
  var tsTo = gsap.quickTo(tween, 'timeScale', { duration: 0.6, ease: 'power3.out' });

  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: function (self) {
      var speed = Math.abs(self.getVelocity());
      var mag = 0.6 + Math.min(1, speed / 4000) * 1.9; /* clamped 0.6 – 2.5, never frantic */
      tsTo(self.direction === 1 ? mag : -mag);         /* flip with scroll direction */
    }
  });
}

/* ============================================================
   SECTION 4 — PINNED STORY (one scrub timeline, 4 beats)
   ============================================================ */
function initStory() {
  var section = $('.story');
  if (!section || !window.gsap || !window.ScrollTrigger) return;
  var lines = $$('.story-line', section);
  var bar = $('#story-progress');
  var beat = $('#story-beat');

  /* reduced motion: CSS already shows all 4 lines stacked, un-pinned */
  if (prefersReduced) return;

  gsap.set(lines, { opacity: 0, y: 40, clipPath: 'inset(0 0 100% 0)' });

  var tl = gsap.timeline({
    defaults: { ease: 'power3.out', duration: 1 },
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: '+=200%',
      pin: true,
      pinSpacing: true,
      anticipateResize: true,
      fastScrollEnd: true,
      anticipatePin: 1,
      scrub: true,
      onUpdate: function (self) {
        if (bar) bar.style.transform = 'scaleY(' + self.progress + ')';
        if (beat) beat.textContent = '0' + Math.min(4, Math.floor(self.progress * 4) + 1);
      }
    }
  });

  var step = 1.6;
  lines.forEach(function (line, i) {
    var t = i * step;
    /* enter: lift from y 40 behind a clip-path inset reveal */
    tl.to(line, { opacity: 1, y: 0, clipPath: 'inset(0 0 -8% 0)' }, t);
    /* previous line exits at y -40, crossfading under the newcomer */
    if (i > 0) {
      tl.to(lines[i - 1], { opacity: 0, y: -40 }, t - 0.5);
    }
  });
  /* let the resolution breathe before unpin */
  tl.to({}, { duration: 1 });
}

/* ============================================================
   SECTION 5 — STICKY TWO-COLUMN (batch card entrances)
   ============================================================ */
function initDuo() {
  var cards = $$('.card');
  if (!cards.length || prefersReduced || !window.gsap || !window.ScrollTrigger) return;

  gsap.set(cards, { y: 60, opacity: 0, scale: 0.98 });
  ScrollTrigger.batch(cards, {
    start: 'top 85%',
    onEnter: function (batch) {
      gsap.to(batch, {
        y: 0, opacity: 1, scale: 1,
        duration: 0.9, ease: 'power3.out', stagger: 0.1,
        overwrite: true, clearProps: 'transform,opacity' /* hand back to CSS for hover */
      });
    },
    onEnterBack: function (batch) {
      gsap.to(batch, { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out', overwrite: true });
    }
  });
}

/* ============================================================
   SECTION 6 — HORIZONTAL SCROLL (pinned, survives refresh)
   ============================================================ */
function initHorizontal() {
  var section = $('.hscroll');
  if (!section || !window.gsap || !window.ScrollTrigger || prefersReduced) return;
  var row = $('.h-row', section);
  var dashes = $$('.h-dash', section);
  if (!row) return;

  /* matchMedia: build pin only >=900px, auto-revert below (no broken pin left) */
  var mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', function () {
    var travel = function () { return row.scrollWidth - section.clientWidth; };
    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: function () { return '+=' + travel(); },  /* recalc'd on every refresh */
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        fastScrollEnd: true,
        invalidateOnRefresh: true,
        scrub: 1,
        onUpdate: function (self) {
          var idx = Math.min(3, Math.floor(self.progress * 4));
          dashes.forEach(function (d, i) {
            d.style.transform = 'scaleX(' + (i === idx ? 3 : 1) + ')';
            d.classList.toggle('on', i === idx);
          });
        }
      }
    });
    tl.to(row, { x: function () { return -travel(); }, ease: 'none' });
    return function () { gsap.set(row, { clearProps: 'transform' }); };
  });
}

/* ============================================================
   SECTION 7 — IMAGE REVEAL (batch wipe + settle)
   ============================================================ */
function initGallery() {
  var items = $$('.g-item');
  if (!items.length || !window.gsap || !window.ScrollTrigger || prefersReduced) return;

  gsap.set(items, { clipPath: 'inset(0 0 100% 0)' });
  gsap.set(items.map(function (el) { return $('img', el); }), { scale: 1.3, y: 40 });

  ScrollTrigger.batch(items, {
    start: 'top 88%',
    onEnter: function (batch) {
      gsap.to(batch, {
        clipPath: 'inset(0 0 0% 0)', duration: 1.1, ease: 'power3.out',
        stagger: 0.08, overwrite: true, clearProps: 'clip-path'
      });
      batch.forEach(function (el) {
        gsap.to($('img', el), {
          scale: 1, y: 0, duration: 1.1, ease: 'power3.out',
          overwrite: true, clearProps: 'transform' /* hand back to CSS hover */
        });
      });
    }
  });
}

/* ============================================================
   SECTION 8 — STATS (count-up, once at top 80%)
   ============================================================ */
function initStats() {
  $$('.stat-num').forEach(function (el, i) {
    var target = parseFloat(el.getAttribute('data-target') || '0');
    if (prefersReduced || !window.gsap) {
      el.textContent = target.toLocaleString('en-IN');
      return;
    }
    el.textContent = (0).toLocaleString('en-IN');
    ScrollTrigger.create({
      trigger: el,
      start: 'top 80%',
      once: true,
      onEnter: function () {
        gsap.set(el, { willChange: 'contents' });
        var obj = { n: 0 };
        gsap.to(obj, {
          n: target, duration: 1.8, delay: i * 0.12, ease: 'power2.out',
          onUpdate: function () { el.textContent = Math.round(obj.n).toLocaleString('en-IN'); },
          onComplete: function () {
            el.textContent = target.toLocaleString('en-IN');
            gsap.set(el, { clearProps: 'willChange' });
          }
        });
      }
    });
  });
}

/* ============================================================
   SECTION 9 — FAQ (grid-rows accordion, one open, a11y)
   ============================================================ */
function initFaq() {
  var items = $$('.faq-item');
  items.forEach(function (item) {
    var btn = $('.faq-q', item);
    if (!btn) return;
    btn.addEventListener('click', function () {
      var wasOpen = item.classList.contains('open');
      items.forEach(function (other) {
        other.classList.remove('open');
        var b = $('.faq-q', other);
        if (b) b.setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
      /* keep pins honest while heights change */
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    });
  });
}

/* ============================================================
   SECTION 10 — FINAL CTA (masked chars + line wipe + 0.2x bg)
   ============================================================ */
function initCta() {
  var section = $('.cta');
  if (!section || !window.gsap || !window.ScrollTrigger) return;

  /* low-opacity returning gradients, parallax 0.2x */
  if (!prefersReduced) {
    gsap.to('.cta-bg', {
      y: function () { return Math.round(window.innerHeight * 0.2); },
      ease: 'none',
      scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true }
    });

    /* thin line-mask wipe crosses once on enter */
    gsap.fromTo('.cta-wipe', { scaleX: 0 }, {
      scaleX: 1, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: section, start: 'top 65%', once: true },
      onComplete: function () { gsap.to('.cta-wipe', { opacity: 0, duration: 0.6, ease: 'power2.out' }); }
    });

    /* oversized headline, chars lifting behind clipped lines */
    try {
      if (window.SplitText) {
        var split = new SplitText('#cta-title', { type: 'chars' });
        gsap.from(split.chars, {
          yPercent: 110, duration: 1.1, ease: 'power4.out', stagger: 0.03,
          willChange: 'transform', clearProps: 'willChange',
          scrollTrigger: { trigger: section, start: 'top 70%', once: true }
        });
      } else {
        gsap.from('#cta-title .line', {
          yPercent: 110, duration: 1.1, ease: 'power4.out', stagger: 0.06,
          scrollTrigger: { trigger: section, start: 'top 70%', once: true }
        });
      }
    } catch (e) {
      gsap.from('#cta-title', {
        opacity: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 70%', once: true }
      });
    }

    gsap.from(['.cta-copy', '.cta-actions'], {
      y: 26, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08, delay: 0.2,
      willChange: 'transform', clearProps: 'willChange',
      scrollTrigger: { trigger: section, start: 'top 65%', once: true }
    });
  }
}

/* ============================================================
   CUSTOM CURSOR — 12px dot + 40px trailing ring, desktop only
   ============================================================ */
function initCursor() {
  if (prefersReduced || !window.gsap) return;
  if (!window.matchMedia('(pointer: fine)').matches) return;

  var mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', function () {
    var dot = document.createElement('div');
    var ring = document.createElement('div');
    dot.className = 'cursor-dot';
    ring.className = 'cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);
    document.body.classList.add('has-cursor');

    var dX = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3.out' });
    var dY = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3.out' });
    var rX = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3.out' });
    var rY = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3.out' });

    var move = function (e) {
      dX(e.clientX); dY(e.clientY);
      rX(e.clientX); rY(e.clientY);
    };
    var over = function (e) {
      var hit = e.target.closest ? e.target.closest('a, button, [data-magnetic]') : null;
      gsap.to(ring, {
        scale: hit ? 1.8 : 1,
        opacity: hit ? 0.6 : 0.35,
        duration: 0.35, ease: 'power3.out', overwrite: true
      });
    };
    window.addEventListener('mousemove', move, { passive: true });
    window.addEventListener('mouseover', over, { passive: true });

    return function () {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseover', over);
      document.body.classList.remove('has-cursor');
      if (dot.parentNode) dot.parentNode.removeChild(dot);
      if (ring.parentNode) ring.parentNode.removeChild(ring);
    };
  });
}

/* ============================================================
   INIT
   ============================================================ */
function init() {
  initMagnetic();
  initReveals();
  initAnchors();
  initHeroAmbient();
  initMarquee();
  initStory();
  initDuo();
  initHorizontal();
  initGallery();
  initStats();
  initFaq();
  initCta();
  initCursor();
  headerOnScroll();
  runPreloader();
}

/* recalc pins on resize (horizontal section must survive mid-page reloads) */
var resizeTimer = null;
window.addEventListener('resize', function () {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(function () {
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }, 200);
});

try {
  init();
} catch (e) {
  finishPreloader(true);
}

/* refresh ScrollTrigger on load and after fonts settle */
window.addEventListener('load', function () {
  if (window.ScrollTrigger) ScrollTrigger.refresh();
});
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(function () {
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  });
}
