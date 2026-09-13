'use client';
import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { gsap, ScrollTrigger, SplitText } from '../lib/gsap';
import { useMagnetic } from '../lib/hooks';
import { dur } from '../lib/motion';

export default function Cta() {
  const reduced = useReducedMotion();
  const ref = useRef(null);
  useMagnetic(ref, reduced);

  useEffect(() => {
    if (reduced) return;
    const scope = ref.current;
    gsap.to(scope.querySelector('.cta-bg'), {
      y: () => Math.round(window.innerHeight * 0.12), ease: 'none',
      scrollTrigger: { trigger: scope, start: 'top bottom', end: 'bottom top', scrub: 1 }
    });
    gsap.fromTo(scope.querySelector('.cta-wipe'), { scaleX: 0 }, {
      scaleX: 1, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: scope, start: 'top 65%', once: true },
      onComplete: () => gsap.to(scope.querySelector('.cta-wipe'), { opacity: 0, duration: 0.6, ease: 'power2.out' })
    });
    try {
      const split = new SplitText(scope.querySelector('#cta-title'), { type: 'chars' });
      gsap.from(split.chars, {
        yPercent: 110, duration: dur(1.4), ease: 'power4.out', stagger: 0.045,
        willChange: 'transform', clearProps: 'willChange',
        scrollTrigger: { trigger: scope, start: 'top 70%', once: true }
      });
    } catch (e) {
      gsap.from(scope.querySelector('#cta-title'), {
        opacity: 0, duration: dur(1.3), ease: 'power4.out',
        scrollTrigger: { trigger: scope, start: 'top 70%', once: true }
      });
    }
    gsap.from([scope.querySelector('.cta-copy'), scope.querySelector('.cta-actions')], {
      y: 26, opacity: 0, duration: dur(1.3), ease: 'power4.out', stagger: 0.12, delay: 0.4,
      willChange: 'transform', clearProps: 'willChange',
      scrollTrigger: { trigger: scope, start: 'top 65%', once: true }
    });
  }, [reduced]);

  return (
    <section className="cta" id="start" ref={ref}>
      <div className="cta-bg" aria-hidden="true">
        <div className="glow glow-a"></div>
        <div className="glow glow-b"></div>
      </div>
      <div className="cta-wipe" aria-hidden="true"></div>
      <div className="container cta-inner">
        <h2 className="cta-title" id="cta-title">
          <span className="line">ONE LECTURE.</span>
          <span className="line">RIGHT NOW.</span>
        </h2>
        <p className="cta-copy">Nobody is coming to clear it for you. Open the tracker, log tonight&#39;s two lectures, and let tomorrow-you inherit a smaller war.</p>
        <div className="cta-actions">
          <a href="tracker.html" className="btn btn-primary btn-big" data-magnetic>Open the tracker</a>
          <a className="quiet-link" href="#method">or re-read the method</a>
        </div>
      </div>
    </section>
  );
}
