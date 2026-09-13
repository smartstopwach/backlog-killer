'use client';
import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { gsap, ScrollTrigger } from '../lib/gsap';

export default function Marquee() {
  const reduced = useReducedMotion();
  const ref = useRef(null);

  useEffect(() => {
    const track = ref.current;
    if (!track) return;
    track.innerHTML += track.innerHTML;
    track.innerHTML += track.innerHTML;
    if (reduced) return;

    const tween = gsap.to(track, { xPercent: -50, ease: 'none', duration: 22, repeat: -1 });
    const tsTo = gsap.quickTo(tween, 'timeScale', { duration: 0.6, ease: 'power3.out' });

    const vis = ScrollTrigger.create({
      trigger: '.marquee', start: 'top bottom', end: 'bottom top',
      onEnter: () => tween.play(), onEnterBack: () => tween.play(),
      onLeave: () => tween.pause(), onLeaveBack: () => tween.pause()
    });
    const vel = ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: (self) => {
        const mag = 0.6 + Math.min(1, Math.abs(self.getVelocity()) / 4000) * 1.9;
        tsTo(self.direction === 1 ? mag : -mag);
      }
    });
    return () => { vis.kill(); vel.kill(); tween.kill(); };
  }, [reduced]);

  return (
    <section className="marquee" aria-hidden="true">
      <div className="marquee-track" ref={ref}>
        <span className="mq-item">Kill the backlog</span>
        <span className="mq-item">Kill the backlog</span>
        <span className="mq-item">Kill the backlog</span>
        <span className="mq-item">Kill the backlog</span>
      </div>
    </section>
  );
}
