'use client';
import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { gsap, ScrollTrigger } from '../lib/gsap';

const LABELS = ['syncing timetable', 'counting lectures', 'loading kill plan'];
const FINAL = 'ready — kill mode on';

export default function Preloader() {
  const reduced = useReducedMotion();
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    document.body.classList.add('locked');

    const state = { done: false, lifted: false };
    let labelTimer = null;

    const unlock = () => { el.remove(); document.body.classList.remove('locked'); };
    const lift = () => {
      if (state.lifted) return;
      state.lifted = true;
      window.dispatchEvent(new CustomEvent('bk-curtain'));
    };
    const finish = (instant) => {
      if (state.done) return;
      state.done = true;
      if (labelTimer) clearInterval(labelTimer);
      const label = el.querySelector('#pre-label');
      if (label) label.textContent = FINAL;
      if (reduced || instant) { unlock(); lift(); ScrollTrigger.refresh(); return; }
      gsap.to([el.querySelector('#pre-content'), el.querySelector('#pre-count')],
        { opacity: 0, duration: 0.35, delay: 0.2, ease: 'power2.out' });
      gsap.to(el.querySelector('.pre-top'), { yPercent: -101, duration: 0.9, delay: 0.5, ease: 'power4.inOut', onStart: lift });
      gsap.to(el.querySelector('.pre-bottom'), {
        yPercent: 101, duration: 0.9, delay: 0.5, ease: 'power4.inOut',
        onComplete: () => { unlock(); ScrollTrigger.refresh(); }
      });
    };

    if (reduced) { finish(true); return () => document.body.classList.remove('locked'); }

    const labelEl = el.querySelector('#pre-label');
    const countEl = el.querySelector('#pre-count');
    let idx = 0;
    labelTimer = setInterval(() => {
      if (state.done) { clearInterval(labelTimer); return; }
      gsap.to(labelEl, {
        opacity: 0, duration: 0.16, ease: 'power2.out',
        onComplete: () => {
          idx = (idx + 1) % LABELS.length;
          labelEl.textContent = LABELS[idx];
          gsap.to(labelEl, { opacity: 1, duration: 0.16, ease: 'power2.in' });
        }
      });
    }, 700);

    const counter = { n: 0 };
    gsap.to(counter, {
      n: 100, duration: 1.9, ease: 'power3.inOut',
      onUpdate: () => { countEl.textContent = String(Math.round(counter.n)).padStart(3, '0'); },
      onComplete: () => { clearInterval(labelTimer); setTimeout(() => finish(false), 250); }
    });

    const safety = setTimeout(() => finish(false), 4000);
    const onError = () => finish(true);
    window.addEventListener('error', onError);

    return () => {
      clearTimeout(safety);
      clearInterval(labelTimer);
      window.removeEventListener('error', onError);
      document.body.classList.remove('locked');
    };
  }, [reduced]);

  return (
    <div id="preloader" ref={ref} aria-hidden="true">
      <div className="pre-half pre-top"></div>
      <div className="pre-half pre-bottom"></div>
      <div className="pre-content" id="pre-content">
        <div className="pre-word">BACK<em>LOG</em></div>
        <div className="pre-label" id="pre-label">syncing timetable</div>
      </div>
      <div className="pre-count" id="pre-count">000</div>
    </div>
  );
}
