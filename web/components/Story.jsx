'use client';
import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { gsap } from '../lib/gsap';

const LINES = [
  'You didn’t fall behind in one day.',
  'You fell behind one lecture at a time.',
  'Unwatched lectures become an unopened app.',
  'So we count them and deal them back.'
];

export default function Story() {
  const reduced = useReducedMotion();
  const ref = useRef(null);

  useEffect(() => {
    if (reduced) return;
    const mm = gsap.matchMedia();
    mm.add('(min-width: 768px)', () => {
      const scope = ref.current;
      const lines = scope.querySelectorAll('.story-line');
      const bar = scope.querySelector('#story-progress');
      const beat = scope.querySelector('#story-beat');
      gsap.set(lines, { opacity: 0, y: 40, clipPath: 'inset(0 0 100% 0)' });
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out', duration: 1 },
        scrollTrigger: {
          trigger: scope, start: 'top top', end: '+=200%',
          pin: true, pinSpacing: true, anticipateResize: true, anticipatePin: 1,
          fastScrollEnd: true, scrub: 1,
          onUpdate: (self) => {
            if (bar) bar.style.transform = 'scaleY(' + self.progress + ')';
            if (beat) beat.textContent = '0' + Math.min(4, Math.floor(self.progress * 4) + 1);
          }
        }
      });
      const step = 1.6;
      lines.forEach((line, i) => {
        const t = i * step;
        tl.to(line, { opacity: 1, y: 0, clipPath: 'inset(0 0 -8% 0)' }, t);
        if (i > 0) tl.to(lines[i - 1], { opacity: 0, y: -40 }, t - 0.5);
      });
      tl.to({}, { duration: 1 });
    });
    return () => mm.revert();
  }, [reduced]);

  return (
    <section className="story" id="method" ref={ref}>
      <h2 className="sr-only">Why the backlog grows</h2>
      <div className="story-pin">
        <div className="container story-stage">
          <div className="story-bar" aria-hidden="true"><i id="story-progress"></i></div>
          {LINES.map((l, i) => <p className="story-line" key={i}>{l}</p>)}
          <div className="story-count" aria-hidden="true"><span id="story-beat">01</span>/04</div>
        </div>
      </div>
    </section>
  );
}
