'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useMotionValueEvent, useReducedMotion } from 'framer-motion';
import { gsap } from '../lib/gsap';
import { useAnchors, useMagnetic } from '../lib/hooks';
import { pointerFine } from '../lib/motion';

export default function Chrome() {
  const reduced = useReducedMotion();
  const { scrollYProgress, scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 40));

  const headerRef = useRef(null);
  const menuRef = useRef(null);
  const btnRef = useRef(null);
  const tlRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useMagnetic(headerRef, reduced);
  useAnchors(reduced);

  /* mobile overlay menu */
  useEffect(() => {
    if (reduced || !menuRef.current) return;
    const links = menuRef.current.querySelectorAll('a');
    gsap.set(menuRef.current, { yPercent: -102 });
    gsap.set(links, { y: 46, opacity: 0 });
    tlRef.current = gsap.timeline({ paused: true, defaults: { ease: 'power4.out' } });
    tlRef.current
      .to(menuRef.current, { yPercent: 0, duration: 0.7 })
      .to(links, { y: 0, opacity: 1, stagger: 0.08, duration: 0.7 }, '-=0.35');
    return () => { if (tlRef.current) tlRef.current.kill(); };
  }, [reduced]);

  const setMenu = (open) => {
    setMenuOpen(open);
    document.body.classList.toggle('menu-open', open);
    if (btnRef.current) btnRef.current.setAttribute('aria-expanded', String(open));
    if (menuRef.current) {
      menuRef.current.setAttribute('aria-hidden', String(!open));
      if (reduced) menuRef.current.style.transform = open ? 'translateY(0)' : 'translateY(-102%)';
      else if (tlRef.current) (open ? tlRef.current.play() : tlRef.current.reverse());
    }
    if (window.__lenis) (open ? window.__lenis.stop() : window.__lenis.start());
  };

  /* custom cursor: 12px dot + 40px trailing ring, desktop only */
  useEffect(() => {
    if (reduced || !pointerFine()) return;
    const mm = gsap.matchMedia();
    mm.add('(min-width: 900px)', () => {
      const dot = document.createElement('div'); dot.className = 'cursor-dot';
      const ring = document.createElement('div'); ring.className = 'cursor-ring';
      document.body.appendChild(dot); document.body.appendChild(ring);
      document.body.classList.add('has-cursor');
      const dX = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3.out' });
      const dY = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3.out' });
      const rX = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3.out' });
      const rY = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3.out' });
      const move = (e) => { dX(e.clientX); dY(e.clientY); rX(e.clientX); rY(e.clientY); };
      const over = (e) => {
        const hit = e.target.closest ? e.target.closest('a, button, [data-magnetic]') : null;
        gsap.to(ring, { scale: hit ? 1.8 : 1, opacity: hit ? 0.6 : 0.35, duration: 0.35, ease: 'power3.out', overwrite: true });
      };
      window.addEventListener('mousemove', move, { passive: true });
      window.addEventListener('mouseover', over, { passive: true });
      return () => {
        window.removeEventListener('mousemove', move);
        window.removeEventListener('mouseover', over);
        document.body.classList.remove('has-cursor');
        dot.remove(); ring.remove();
      };
    });
    return () => mm.revert();
  }, [reduced]);

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <motion.div id="progress-bar" style={{ scaleX: scrollYProgress }} />
      <div id="grain" aria-hidden="true" />

      <header id="site-header" className={scrolled ? 'scrolled' : ''} ref={headerRef}>
        <div className="container header-inner">
          <a className="logo" href="#top" data-magnetic> BACKLOG<span>KILLER</span></a>
          <nav className="desktop-nav" aria-label="Primary">
            <a href="#method">Method</a>
            <a href="#timetable">Timetable</a>
            <a href="#tracker">Tracker</a>
          </nav>
          <a href="#start" className="btn btn-primary btn-sm" data-magnetic>Start killing</a>
          <button id="menu-btn" ref={btnRef} aria-label="Open menu" aria-expanded="false" onClick={() => setMenu(!menuOpen)}>
            <span></span><span></span>
          </button>
        </div>
      </header>

      <div id="mobile-menu" ref={menuRef} aria-hidden="true">
        <nav aria-label="Mobile">
          <a href="#method" onClick={() => setMenu(false)}><span className="idx">01</span>Method</a>
          <a href="#timetable" onClick={() => setMenu(false)}><span className="idx">02</span>Timetable</a>
          <a href="#tracker" onClick={() => setMenu(false)}><span className="idx">03</span>Tracker</a>
          <a href="#start" onClick={() => setMenu(false)}><span className="idx">04</span>Start</a>
        </nav>
      </div>
    </>
  );
}
