'use client';
import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import * as THREE from 'three';
import { gsap, ScrollTrigger, SplitText } from '../lib/gsap';
import { useMagnetic } from '../lib/hooks';
import { dur, pointerFine } from '../lib/motion';

export default function Hero() {
  const reduced = useReducedMotion();
  const ref = useRef(null);
  useMagnetic(ref, reduced);

  /* intro when the preloader curtain lifts */
  useEffect(() => {
    if (reduced) return;
    const intro = () => {
      const scope = ref.current;
      if (!scope) return;
      try {
        const split = new SplitText(scope.querySelector('#hero-title'), { type: 'chars' });
        gsap.from(split.chars, {
          yPercent: 110, duration: dur(1.4), ease: 'power4.out', stagger: 0.05,
          willChange: 'transform', clearProps: 'willChange'
        });
      } catch (e) {
        gsap.from(scope.querySelector('#hero-title'), { opacity: 0, duration: dur(1.2), ease: 'power4.out' });
      }
      gsap.from(scope.querySelectorAll('[data-hero]'), {
        y: 26, opacity: 0, duration: dur(1.4), ease: 'power4.out',
        stagger: 0.1, delay: 0.45, willChange: 'transform', clearProps: 'willChange'
      });
    };
    window.addEventListener('bk-curtain', intro);
    return () => window.removeEventListener('bk-curtain', intro);
  }, [reduced]);

  /* ambient: parallax (0.18/0.09), mouse (6/12), hint fade — desktop only */
  useEffect(() => {
    if (reduced) return;
    const mm = gsap.matchMedia();
    mm.add('(min-width: 900px)', () => {
      const scope = ref.current;
      gsap.to(scope.querySelector('.hero-bg'), {
        y: () => Math.round(window.innerHeight * 0.18), ease: 'none',
        scrollTrigger: { trigger: scope, start: 'top top', end: 'bottom top', scrub: 1 }
      });
      gsap.to(scope.querySelector('#hero-float'), {
        y: () => -Math.round(window.innerHeight * 0.09), ease: 'none',
        scrollTrigger: { trigger: scope, start: 'top top', end: 'bottom top', scrub: 1 }
      });
      if (pointerFine()) {
        const tX = gsap.quickTo('#hero-title', 'x', { duration: 0.7, ease: 'power3.out' });
        const tY = gsap.quickTo('#hero-title', 'y', { duration: 0.7, ease: 'power3.out' });
        const fX = gsap.quickTo('#hero-float-mouse', 'x', { duration: 0.7, ease: 'power3.out' });
        const fY = gsap.quickTo('#hero-float-mouse', 'y', { duration: 0.7, ease: 'power3.out' });
        const move = (e) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          const ny = e.clientY / window.innerHeight - 0.5;
          tX(-nx * 6); tY(-ny * 6); fX(-nx * 12); fY(-ny * 12);
        };
        const leave = () => { tX(0); tY(0); fX(0); fY(0); };
        scope.addEventListener('mousemove', move);
        scope.addEventListener('mouseleave', leave);
        return () => { scope.removeEventListener('mousemove', move); scope.removeEventListener('mouseleave', leave); };
      }
    });
    const hint = ScrollTrigger.create({
      start: 80,
      onEnter: () => gsap.to('#scroll-hint', { opacity: 0, duration: 0.4, ease: 'power2.out' }),
      onEnterBack: () => gsap.to('#scroll-hint', { opacity: 1, duration: 0.4, ease: 'power2.out' })
    });
    return () => { mm.revert(); hint.kill(); };
  }, [reduced]);

  /* three.js low-poly accent — no WebGL under reduced motion */
  useEffect(() => {
    if (reduced) return;
    const mm = gsap.matchMedia();
    mm.add('(min-width: 768px)', () => {
      const canvas = ref.current && ref.current.querySelector('#hero-3d');
      if (!canvas) return;
      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
      } catch (e) { return; }
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 20);
      camera.position.z = 5.2;
      const geo = new THREE.IcosahedronGeometry(1.55, 0);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x111a2b, metalness: 0.55, roughness: 0.38, flatShading: true, transparent: true, opacity: 0.9
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.x = 1.9;
      scene.add(mesh);
      const l1 = new THREE.PointLight(0xff4d2e, 1.4, 30); l1.position.set(3, 2, 4); scene.add(l1);
      const l2 = new THREE.PointLight(0xffc857, 1.1, 30); l2.position.set(-3, -2, 3); scene.add(l2);
      scene.add(new THREE.AmbientLight(0x223044, 0.7));

      let mx = 0, my = 0;
      const mouse = (e) => { mx = e.clientX / window.innerWidth - 0.5; my = e.clientY / window.innerHeight - 0.5; };
      if (pointerFine()) window.addEventListener('mousemove', mouse, { passive: true });

      const fit = () => {
        const w = canvas.clientWidth, h = canvas.clientHeight;
        if (w && h && (canvas.width !== w || canvas.height !== h)) {
          renderer.setSize(w, h, false);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
        }
      };
      const clock = new THREE.Clock();
      let rafId = null, inView = true;
      const frame = () => {
        rafId = requestAnimationFrame(frame);
        const t = clock.getElapsedTime();
        mesh.rotation.y = t * 0.12 + mx * 0.25;
        mesh.rotation.x = Math.sin(t * 0.08) * 0.15 + my * 0.2;
        fit();
        renderer.render(scene, camera);
      };
      const start = () => { if (rafId === null && inView && !document.hidden) rafId = requestAnimationFrame(frame); };
      const stop = () => { if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; } };
      const io = new IntersectionObserver((en) => { inView = en[0].isIntersecting; inView ? start() : stop(); }, { threshold: 0 });
      io.observe(canvas);
      const vis = () => (document.hidden ? stop() : start());
      document.addEventListener('visibilitychange', vis);
      const fade = ScrollTrigger.create({
        trigger: ref.current, start: 'top top', end: 'bottom top', scrub: 1,
        onUpdate: (s) => { canvas.style.opacity = String(1 - s.progress); }
      });
      start();
      return () => {
        stop(); io.disconnect(); fade.kill();
        document.removeEventListener('visibilitychange', vis);
        window.removeEventListener('mousemove', mouse);
        geo.dispose(); mat.dispose(); renderer.dispose();
      };
    });
    return () => mm.revert();
  }, [reduced]);

  return (
    <section className="hero" id="top" ref={ref}>
      <canvas id="hero-3d" className="hero-3d" aria-hidden="true"></canvas>
      <div className="hero-bg" aria-hidden="true">
        <div className="hero-dots"></div>
        <div className="glow glow-a"></div>
        <div className="glow glow-b"></div>
      </div>

      <div className="container hero-inner">
        <div className="hero-copy" id="hero-copy">
          <p className="eyebrow" data-hero>बैकलॉग ख़त्म · A PW war room</p>
          <h1 className="hero-title" id="hero-title">
            <span className="line">BACKLOG IS</span>
            <span className="line">A DEBT.</span>
          </h1>
          <p className="hero-sub" data-hero>It counts the two lectures PW adds to your day, prices what you skipped, and hands you tomorrow&#39;s exact target. Miss a day and it re-deals the remaining lectures across the days you have left.</p>
          <div className="hero-ctas" data-hero>
            <a href="tracker.html" className="btn btn-primary" data-magnetic>Start killing backlog</a>
            <a href="#method" className="btn btn-ghost" data-magnetic>See the method</a>
          </div>
          <p className="hero-meta" data-hero>Lakshya NEET 2027 · 12 live lectures a week · plan reshuffles daily</p>
        </div>

        <div className="hero-float" id="hero-float" aria-hidden="true">
          <div className="hero-float-mouse" id="hero-float-mouse">
            <div className="float-card" id="float-card">
              <div className="float-num">12</div>
              <div className="float-label">live lectures every week — auto-synced straight from your PW timetable</div>
              <div className="float-tags">
                <span>PHY · Manish Raj</span><span>OC · SKC</span><span>ZOO · Samapti</span><span>BOT · Vipin</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="scroll-hint" id="scroll-hint" aria-hidden="true">
        <span className="hint-line" id="hint-line"></span>
        <span className="hint-word">SCROLL</span>
      </div>
    </section>
  );
}
