'use client';
import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { gsap, ScrollTrigger } from '../lib/gsap';
import { useMagnetic } from '../lib/hooks';
import { dur } from '../lib/motion';

const CARDS = [
  ['01', 'Live lecture sync', 'The timetable does the data entry. Mon–Sat, your two followed-teacher lectures land in the backlog before you even open the app. Nothing to type, nothing to remember.'],
  ['02', 'Teacher lock', 'PW runs two teachers per subject in parallel. You follow one. We count one — Manish Raj, SKC, Samapti Sinha or Vipin Sharma. The other batch never touches your numbers.'],
  ['03', 'Kill plan math', 'You say “20 days”. We do one division: remaining lectures by remaining days. That quotient is tomorrow’s target, recalculated every morning. That’s the whole trick.'],
  ['04', 'Miss-a-day reshuffle', 'Miss a day and nothing turns red. The undone lectures fold into the days that remain and the target quietly rises by one or two. The plan adjusts; it never lectures you.'],
  ['05', 'Streak & zero day', 'Streaks count targets hit, not feelings. When pending finally reads zero, the site says shabaash and stops talking. That’s the only celebration built in.']
];

export default function Duo() {
  const reduced = useReducedMotion();
  const ref = useRef(null);
  useMagnetic(ref, reduced);

  /* .reveal entrances for the sticky column */
  useEffect(() => {
    if (reduced) return;
    const els = ref.current.querySelectorAll('.reveal');
    const tweens = Array.from(els).map((el) =>
      gsap.fromTo(el, { y: 44, opacity: 0, willChange: 'transform' },
        { y: 0, opacity: 1, duration: dur(1.4), ease: 'power4.out', clearProps: 'willChange',
          scrollTrigger: { trigger: el, start: 'top 88%' } })
    );
    return () => tweens.forEach((t) => t.scrollTrigger && t.scrollTrigger.kill());
  }, [reduced]);

  /* batch card entrances */
  useEffect(() => {
    if (reduced) return;
    const cards = ref.current.querySelectorAll('.card');
    gsap.set(cards, { y: 60, opacity: 0, scale: 0.98 });
    const batch = ScrollTrigger.batch(cards, {
      start: 'top 85%',
      onEnter: (b) => gsap.to(b, { y: 0, opacity: 1, scale: 1, duration: dur(1.3), ease: 'power4.out', stagger: 0.14, overwrite: true, clearProps: 'transform,opacity' }),
      onEnterBack: (b) => gsap.to(b, { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out', overwrite: true })
    });
    return () => batch.forEach((b) => b.kill());
  }, [reduced]);

  return (
    <section className="duo-section" id="tracker" ref={ref}>
      <div className="container duo">
        <div className="duo-left">
          <p className="eyebrow reveal">The arsenal</p>
          <h2 className="duo-title reveal">BUILT LIKE A WAR ROOM.</h2>
          <p className="duo-copy reveal">Every feature exists for one number — lectures left. If a feature doesn&#39;t shrink it, it&#39;s not in the app.</p>
          <a href="tracker.html" className="btn btn-primary" data-magnetic>Open the tracker</a>
        </div>
        <div className="duo-right">
          {CARDS.map(([idx, title, copy]) => (
            <article className="card" key={idx}>
              <span className="idx" aria-hidden="true">{idx}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
