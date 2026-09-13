'use client';
import { useEffect } from 'react';
import { useReducedMotion } from 'framer-motion';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '../lib/gsap';

export default function LenisProvider({ children }) {
  const reduced = useReducedMotion();
  useEffect(() => {
    /* keep Lenis from fighting Next's scroll restoration */
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
    if (reduced) return;
    const lenis = new Lenis({ lerp: 0.1 });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    lenis.on('resize', () => ScrollTrigger.refresh());
    const tick = (t) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      window.__lenis = null;
    };
  }, [reduced]);
  return <>{children}</>;
}
