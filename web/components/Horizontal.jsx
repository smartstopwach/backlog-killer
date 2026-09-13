'use client';
import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { gsap } from '../lib/gsap';

const PANELS = [
  ['MON–WED', 'Physics 4:00 · Organic Chem 6:15', 'Manish Raj Sir, then SKC Sir. Two lectures auto-logged before you even open the app.', ['PHY', 'OC']],
  ['THU', 'Zoology 4:00 · Physics 6:15', 'Samapti Sinha Mam’s diagrams, then one more Manish Raj Sir slot. Backlog +2, plan absorbs it.', ['ZOO', 'PHY']],
  ['FRI–SAT', 'Zoo + Bot, then OC + Bot', 'Vipin Sharma Sir’s botany runs both days. The week’s heaviest stretch — the plan front-loads it.', ['ZOO', 'BOT', 'OC']],
  ['SUN', 'Off. Test · DPP · revision.', 'No live lectures, no new backlog. Rest is part of the plan — streaks survive on the weekly test.', ['REST']]
];

export default function Horizontal() {
  const reduced = useReducedMotion();
  const ref = useRef(null);

  useEffect(() => {
    if (reduced) return;
    const mm = gsap.matchMedia();
    mm.add('(min-width: 900px)', () => {
      const scope = ref.current;
      const row = scope.querySelector('.h-row');
      const dashes = scope.querySelectorAll('.h-dash');
      const travel = () => row.scrollWidth - scope.clientWidth;
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scope, start: 'top top',
          end: () => '+=' + travel(),
          pin: true, pinSpacing: true, anticipateResize: true, anticipatePin: 1,
          fastScrollEnd: true, invalidateOnRefresh: true, scrub: 1,
          onUpdate: (self) => {
            const idx = Math.min(3, Math.floor(self.progress * 4));
            dashes.forEach((d, i) => {
              d.style.transform = 'scaleX(' + (i === idx ? 3 : 1) + ')';
              d.classList.toggle('on', i === idx);
            });
          }
        }
      });
      tl.to(row, { x: () => -travel(), ease: 'none' });
    });
    return () => mm.revert();
  }, [reduced]);

  return (
    <section className="hscroll" id="timetable" ref={ref}>
      <h2 className="sr-only">The week, hour by hour</h2>
      <div className="h-wrap">
        <div className="h-row">
          {PANELS.map(([day, title, copy, tags]) => (
            <div className="h-panel" key={day}>
              <div className="h-day">{day}</div>
              <div>
                <h3>{title}</h3>
                <p>{copy}</p>
                <div className="h-tags">{tags.map((t) => <span key={t}>{t}</span>)}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="h-dashes" aria-hidden="true">
          <span className="h-dash on"></span><span className="h-dash"></span><span className="h-dash"></span><span className="h-dash"></span>
        </div>
      </div>
    </section>
  );
}
