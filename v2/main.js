/* ============================================================
   BACKLOG KILLER — main.js
   Final: jitter fixes, Apple-grade motion tuning, perf pass,
   mobile gates, three.js hero accent.
   ============================================================ */

/* ---------- boot: Lenis wired into GSAP (single raf source) ---------- */
var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var isSmall = window.matchMedia('(max-width: 767px)').matches;
var lenis = null;

/* entrances: 1.2–1.6s desktop, shorter on mobile */
function dur(x) { return isSmall ? 0.7 : x; }

function killPreloaderNow() {
  var pre = document.getElementById('preloader');
  if (pre && pre.parentNode) pre.parentNode.removeChild(pre);
  document.body.classList.remove('locked');
}

if (window.gsap && window.ScrollTrigger && window.Lenis) {
  gsap.registerPlugin(ScrollTrigger, SplitText);
  ScrollTrigger.defaults({ invalidateOnRefresh: true });
  if (!prefersReduced) {
    lenis = new Lenis({ lerp: 0.1 });
    lenis.on('scroll', ScrollTrigger.update);
    lenis.on('resize', function () { if (window.ScrollTrigger) ScrollTrigger.refresh(); });
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

/* ---------- shared .reveal entrance utility ---------- */
function initReveals() {
  if (prefersReduced || !window.gsap) return;
  $$('.reveal').forEach(function (el) {
    gsap.fromTo(el,
      { y: 44, opacity: 0, willChange: 'transform' },
      {
        y: 0, opacity: 1, duration: dur(1.4), ease: 'power4.out', clearProps: 'willChange',
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
  gsap.set(mobileMenu, { yPercent: -102 });
  gsap.set($$('#mobile-menu a'), { y: 46, opacity: 0 });
  menuTL = gsap.timeline({ paused: true, defaults: { ease: 'power4.out' } });
  menuTL.to(mobileMenu, { yPercent: 0, duration: 0.7 })
        .to($$('#mobile-menu a'), { y: 0, opacity: 1, stagger: 0.08, duration: 0.7 }, '-=0.35');
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

window.addEventListener('error', function () { finishPreloader(true); });

/* ============================================================
   HERO
   ============================================================ */
function heroIntro() {
  if (prefersReduced || !window.gsap) return;

  try {
    if (window.SplitText) {
      var split = new SplitText('#hero-title', { type: 'chars' });
      gsap.from(split.chars, {
        yPercent: 110,
        duration: dur(1.4),
        ease: 'power4.out',
        stagger: 0.05,
        willChange: 'transform',
        clearProps: 'willChange'
      });
    } else {
      gsap.from('#hero-title .line', { yPercent: 110, duration: dur(1.4), ease: 'power4.out', stagger: 0.1 });
    }
  } catch (e) {
    gsap.from('#hero-title', { opacity: 0, duration: dur(1.2), ease: 'power4.out' });
  }

  gsap.from('[data-hero]', {
    y: 26, opacity: 0, duration: dur(1.4), ease: 'power4.out',
    stagger: 0.1, delay: 0.45, willChange: 'transform', clearProps: 'willChange'
  });
}

function initHeroAmbient() {
  if (prefersReduced || !window.gsap) return;

  var mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', function () {
    /* parallax cut 40%: 0.3 -> 0.18, 0.15 -> 0.09; scrubbed */
    gsap.to('.hero-bg', {
      y: function () { return Math.round(window.innerHeight * 0.18); },
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 }
    });
    gsap.to('#hero-float', {
      y: function () { return -Math.round(window.innerHeight * 0.09); },
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 }
    });

    /* mouse parallax — headline 6px, panel 12px (cut 40%) */
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
          tX(-nx * 6); tY(-ny * 6);
          fX(-nx * 12); fY(-ny * 12);
        });
        hero.addEventListener('mouseleave', function () { tX(0); tY(0); fX(0); fY(0); });
      }
    }
  });

  /* scroll hint fades after 80px (static line, no loop) */
  ScrollTrigger.create({
    start: 80,
    onEnter: function () { gsap.to('#scroll-hint', { opacity: 0, duration: 0.4, ease: 'power2.out' }); },
    onEnterBack: function () { gsap.to('#scroll-hint', { opacity: 1, duration: 0.4, ease: 'power2.out' }); }
  });
}

/* ============================================================
   SECTION: three.js low-poly hero accent (desktop, motion-safe)
   ============================================================ */
function initHero3D() {
  if (prefersReduced || !window.THREE || !window.gsap) return; /* no WebGL context at all */

  var mm = gsap.matchMedia();
  mm.add('(min-width: 768px)', function () {
    var canvas = $('#hero-3d');
    if (!canvas) return;
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
    } catch (e) { return; }
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, 1, 0.1, 20);
    camera.position.z = 5.2;

    var geo = new THREE.IcosahedronGeometry(1.55, 0); /* low-poly, 1 draw call */
    var mat = new THREE.MeshStandardMaterial({
      color: 0x111a2b, metalness: 0.55, roughness: 0.38,
      flatShading: true, transparent: true, opacity: 0.9
    });
    var mesh = new THREE.Mesh(geo, mat);
    mesh.position.x = 1.9;
    scene.add(mesh);

    var l1 = new THREE.PointLight(0xff4d2e, 1.4, 30); l1.position.set(3, 2, 4); scene.add(l1);
    var l2 = new THREE.PointLight(0xffc857, 1.1, 30); l2.position.set(-3, -2, 3); scene.add(l2);
    scene.add(new THREE.AmbientLight(0x223044, 0.7));

    var mx = 0, my = 0;
    if (window.matchMedia('(pointer: fine)').matches) {
      window.addEventListener('mousemove', function (e) {
        mx = e.clientX / window.innerWidth - 0.5;
        my = e.clientY / window.innerHeight - 0.5;
      }, { passive: true });
    }

    function fit() {
      var w = canvas.clientWidth, h = canvas.clientHeight;
      if (w && h && (canvas.width !== w || canvas.height !== h)) {
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }
    }

    var clock = new THREE.Clock();
    var rafId = null, inView = true;

    function frame() {
      rafId = requestAnimationFrame(frame);
      var t = clock.getElapsedTime();
      mesh.rotation.y = t * 0.12 + mx * 0.25;   /* slow spin + subtle mouse reaction */
      mesh.rotation.x = Math.sin(t * 0.08) * 0.15 + my * 0.2;
      fit();
      renderer.render(scene, camera);
    }
    function start() { if (rafId === null && inView && !document.hidden) rafId = requestAnimationFrame(frame); }
    function stop() { if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; } }

    var io = new IntersectionObserver(function (entries) {
      inView = entries[0].isIntersecting;
      if (inView) start(); else stop();
    }, { threshold: 0 });
    io.observe(canvas);
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });

    /* fade out on scroll */
    ScrollTrigger.create({
      trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1,
      onUpdate: function (self) { canvas.style.opacity = String(1 - self.progress); }
    });

    start();

    return function () { /* teardown: dispose everything */
      stop();
      io.disconnect();
      geo.dispose();
      mat.dispose();
      renderer.dispose();
    };
  });
}

/* ============================================================
   SECTION 3 — MARQUEE (linear allowed here only)
   ============================================================ */
function initMarquee() {
  var track = $('#marquee-track');
  if (!track) return;
  /* duplicate the track in JS for a gapless -50% loop (x2 so ultrawide never gaps) */
  track.innerHTML += track.innerHTML;
  track.innerHTML += track.innerHTML;
  if (prefersReduced || !window.gsap || !window.ScrollTrigger) return;

  var tween = gsap.to(track, { xPercent: -50, ease: 'none', duration: 22, repeat: -1 });
  var tsTo = gsap.quickTo(tween, 'timeScale', { duration: 0.6, ease: 'power3.out' });

  /* pause when off-screen — no offscreen animation */
  ScrollTrigger.create({
    trigger: '.marquee', start: 'top bottom', end: 'bottom top',
    onEnter: function () { tween.play(); },
    onEnterBack: function () { tween.play(); },
    onLeave: function () { tween.pause(); },
    onLeaveBack: function () { tween.pause(); }
  });

  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: function (self) {
      var speed = Math.abs(self.getVelocity());
      var mag = 0.6 + Math.min(1, speed / 4000) * 1.9; /* clamped 0.6 – 2.5 */
      tsTo(self.direction === 1 ? mag : -mag);
    }
  });
}

/* ============================================================
   SECTION 4 — PINNED STORY (pinned >=768px only)
   ============================================================ */
function initStory() {
  var section = $('.story');
  if (!section || !window.gsap || !window.ScrollTrigger) return;
  var lines = $$('.story-line', section);
  var bar = $('#story-progress');
  var beat = $('#story-beat');

  if (prefersReduced) return; /* CSS shows all 4 lines stacked */

  var mm = gsap.matchMedia();
  mm.add('(min-width: 768px)', function () {
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
        anticipatePin: 1,
        fastScrollEnd: true,
        scrub: 1,
        onUpdate: function (self) {
          if (bar) bar.style.transform = 'scaleY(' + self.progress + ')';
          if (beat) beat.textContent = '0' + Math.min(4, Math.floor(self.progress * 4) + 1);
        }
      }
    });

    var step = 1.6;
    lines.forEach(function (line, i) {
      var t = i * step;
      tl.to(line, { opacity: 1, y: 0, clipPath: 'inset(0 0 -8% 0)' }, t);
      if (i > 0) tl.to(lines[i - 1], { opacity: 0, y: -40 }, t - 0.5);
    });
    tl.to({}, { duration: 1 });

    return function () { gsap.set(lines, { clearProps: 'all' }); };
  });
}

/* ============================================================
   SECTION 5 — STICKY TWO-COLUMN
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
        duration: dur(1.3), ease: 'power4.out', stagger: 0.14,
        overwrite: true, clearProps: 'transform,opacity'
      });
    },
    onEnterBack: function (batch) {
      gsap.to(batch, { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out', overwrite: true });
    }
  });
}

/* ============================================================
   SECTION 6 — HORIZONTAL SCROLL
   ============================================================ */
function initHorizontal() {
  var section = $('.hscroll');
  if (!section || !window.gsap || !window.ScrollTrigger || prefersReduced) return;
  var row = $('.h-row', section);
  var dashes = $$('.h-dash', section);
  if (!row) return;

  var mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', function () {
    var travel = function () { return row.scrollWidth - section.clientWidth; };
    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: function () { return '+=' + travel(); },
        pin: true,
        pinSpacing: true,
        anticipateResize: true,
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
   SECTION 7 — IMAGE REVEAL
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
        clipPath: 'inset(0 0 0% 0)', duration: dur(1.4), ease: 'power4.out',
        stagger: 0.12, overwrite: true, clearProps: 'clip-path'
      });
      batch.forEach(function (el) {
        gsap.to($('img', el), {
          scale: 1, y: 0, duration: dur(1.4), ease: 'power4.out',
          overwrite: true, clearProps: 'transform'
        });
      });
    }
  });
}

/* ============================================================
   SECTION 8 — STATS
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
   SECTION 9 — FAQ
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
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    });
  });
}

/* ============================================================
   SECTION 10 — FINAL CTA
   ============================================================ */
function initCta() {
  var section = $('.cta');
  if (!section || !window.gsap || !window.ScrollTrigger) return;

  if (!prefersReduced) {
    gsap.to('.cta-bg', {
      y: function () { return Math.round(window.innerHeight * 0.12); },
      ease: 'none',
      scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 1 }
    });

    gsap.fromTo('.cta-wipe', { scaleX: 0 }, {
      scaleX: 1, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: section, start: 'top 65%', once: true },
      onComplete: function () { gsap.to('.cta-wipe', { opacity: 0, duration: 0.6, ease: 'power2.out' }); }
    });

    try {
      if (window.SplitText) {
        var split = new SplitText('#cta-title', { type: 'chars' });
        gsap.from(split.chars, {
          yPercent: 110, duration: dur(1.4), ease: 'power4.out', stagger: 0.045,
          willChange: 'transform', clearProps: 'willChange',
          scrollTrigger: { trigger: section, start: 'top 70%', once: true }
        });
      } else {
        gsap.from('#cta-title .line', {
          yPercent: 110, duration: dur(1.4), ease: 'power4.out', stagger: 0.08,
          scrollTrigger: { trigger: section, start: 'top 70%', once: true }
        });
      }
    } catch (e) {
      gsap.from('#cta-title', {
        opacity: 0, duration: dur(1.3), ease: 'power4.out',
        scrollTrigger: { trigger: section, start: 'top 70%', once: true }
      });
    }

    gsap.from(['.cta-copy', '.cta-actions'], {
      y: 26, opacity: 0, duration: dur(1.3), ease: 'power4.out', stagger: 0.12, delay: 0.4,
      willChange: 'transform', clearProps: 'willChange',
      scrollTrigger: { trigger: section, start: 'top 65%', once: true }
    });
  }
}

/* ============================================================
   CUSTOM CURSOR — desktop only
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
  initHero3D();
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

try {
  init();
} catch (e) {
  finishPreloader(true);
}

/* refresh ScrollTrigger on load, fonts, resize (pins survive reloads) */
window.addEventListener('load', function () {
  if (window.ScrollTrigger) ScrollTrigger.refresh();
});
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(function () {
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  });
}
var resizeTimer = null;
window.addEventListener('resize', function () {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(function () {
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }, 200);
});
