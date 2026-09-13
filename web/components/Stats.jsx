'use client';
import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { gsap, ScrollTrigger } from '../lib/gsap';

const STATS = [
  [12, 'live lectures a week, auto-synced', ''],
  [2, 'new lectures land in your backlog daily', ''],
  [97, 'NEET chapters mapped across Phy · Chem · Bio', ''],
  [100, 'of Mon–Sat timetable covered by the sync', '%']
];

export default function Stats() {
  const reduced = useReducedMotion();
  const ref = useRef(null);

  useEffect(() => {
    const nums = ref.current.querySelectorAll('.stat-num');
    nums.forEach((el, i) => {
      const target = parseFloat(el.getAttribute('data-target') || '0');
      if (reduced) { el.textContent = target.toLocaleString('en-IN'); return; }
      el.textContent = (0).toLocaleString('en-IN');
      const st = ScrollTrigger.create({
        trigger: el, start: 'top 80%', once: true,
        onEnter: () => {
          gsap.set(el, { willChange: 'contents' });
          const obj = { n: 0 };
          gsap.to(obj, {
            n: target, duration: 1.8, delay: i * 0.12, ease: 'power2.out',
            onUpdate: () => { el.textContent = Math.round(obj.n).toLocaleString('en-IN'); },
            onComplete: () => { el.textContent = target.toLocaleString('en-IN'); gsap.set(el, { clearProps: 'willChange' }); }
          });
        }
      });
      el.__st = st;
    });
    return () => nums.forEach((el) => el.__st && el.__st.kill());
  }, [reduced]);

  return (
    <section className="stats-section" id="stats" ref={ref}>
      <div className="container">
        <div className="stats-row">
          {STATS.map(([n, label, suffix], i) => (
            <div className="stat" key={i}>
              <div className="stat-line">
                <span className="stat-num" data-target={n}>0</span>
                {suffix ? <span className="stat-suffix">{suffix}</span> : null}
              </div>
              <div className="stat-label">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
