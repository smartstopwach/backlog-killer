'use client';
import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { gsap, ScrollTrigger } from '../lib/gsap';
import { dur } from '../lib/motion';

const IMGS = [
  ['g-a', 'pw-physics-wall', 'Physics wall full of derivations', '4 PM slot — Physics wall'],
  ['g-b', 'pw-organic-chem', 'Organic chemistry reaction maps', 'OC reaction maps, SKC style'],
  ['g-c', 'pw-zoology-diagrams', 'Zoology diagram notebook', 'Zoology diagrams, twice a week'],
  ['g-d', 'pw-botany-charts', 'Botany charts and flashcards', 'Botany charts — Vipin Sir'],
  ['g-e', 'pw-night-desk', 'Night study desk with lamp', 'The 10 PM backlog shift'],
  ['g-f', 'pw-test-day', 'Sunday test paper and OMR sheet', 'Sunday — test day, not lecture day']
];

export default function Gallery() {
  const reduced = useReducedMotion();
  const ref = useRef(null);

  useEffect(() => {
    if (reduced) return;
    const items = Array.from(ref.current.querySelectorAll('.g-item'));
    gsap.set(items, { clipPath: 'inset(0 0 100% 0)' });
    gsap.set(items.map((el) => el.querySelector('img')), { scale: 1.3, y: 40 });
    const batch = ScrollTrigger.batch(items, {
      start: 'top 88%',
      onEnter: (b) => {
        gsap.to(b, { clipPath: 'inset(0 0 0% 0)', duration: dur(1.4), ease: 'power4.out', stagger: 0.12, overwrite: true, clearProps: 'clip-path' });
        b.forEach((el) => gsap.to(el.querySelector('img'), { scale: 1, y: 0, duration: dur(1.4), ease: 'power4.out', overwrite: true, clearProps: 'transform' }));
      }
    });
    return () => batch.forEach((x) => x.kill());
  }, [reduced]);

  return (
    <section className="gallery-section" id="gallery" ref={ref}>
      <div className="container">
        <p className="eyebrow">Field notes</p>
        <h2 className="duo-title" style={{ marginBottom: '56px' }}>THE WAR, DOCUMENTED.</h2>
        <div className="gallery">
          {IMGS.map(([cls, seed, alt, cap]) => (
            <figure className={'g-item ' + cls} key={seed}>
              <img src={'https://picsum.photos/seed/' + seed + '/1200/1600'} width="1200" height="1600" loading="lazy" decoding="async" alt={alt} />
              <figcaption className="g-cap">{cap}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
