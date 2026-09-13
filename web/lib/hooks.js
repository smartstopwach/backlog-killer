'use client';
import { useEffect } from 'react';
import { gsap } from './gsap';

/* magnetic hover for every [data-magnetic] inside the given ref */
export function useMagnetic(ref, reduced) {
  useEffect(() => {
    if (reduced || !ref.current) return;
    const els = ref.current.querySelectorAll('[data-magnetic]');
    const cleanups = [];
    els.forEach((el) => {
      const xTo = gsap.quickTo(el, 'x', { duration: 0.45, ease: 'power3.out' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3.out' });
      const move = (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.3);
        yTo((e.clientY - r.top - r.height / 2) * 0.3);
      };
      const leave = () => { xTo(0); yTo(0); };
      el.addEventListener('mousemove', move);
      el.addEventListener('mouseleave', leave);
      cleanups.push(() => {
        el.removeEventListener('mousemove', move);
        el.removeEventListener('mouseleave', leave);
        gsap.set(el, { clearProps: 'transform' });
      });
    });
    return () => cleanups.forEach((f) => f());
  }, [reduced]);
}

/* hash-anchor scrolling through Lenis without fighting Next */
export function useAnchors(reduced) {
  useEffect(() => {
    const onClick = (e) => {
      const a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const lenis = window.__lenis;
      if (lenis && !reduced) {
        lenis.scrollTo(id === '#top' ? 0 : target, { offset: -70, duration: 1.2 });
      } else {
        target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [reduced]);
}
