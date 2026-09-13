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

  /* scroll parallax: background 0.3x, float 0.15x */
  gsap.to('.hero-bg', {
    y: 180, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  });
  gsap.to('#hero-float', {
    y: -110, ease: 'none',
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
   INIT
   ============================================================ */
function init() {
  initMagnetic();
  initReveals();
  initAnchors();
  initHeroAmbient();
  headerOnScroll();
  runPreloader();
}

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
