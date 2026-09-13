'use client';
import { useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { ScrollTrigger } from '../lib/gsap';

const QA = [
  ['Does this connect to my Physics Wallah account?',
   'No — and it never will ask for your PW login. PW has no public API, so watch-progress can never auto-import; live lectures are added from your batch’s weekly timetable instead, and you log the rest with one tap. If you watch on a different device, we won’t know until you press +.'],
  ['What happens if I miss a whole week?',
   'Open the site and the live sync adds every missed day’s lectures automatically — about two per day, Mon to Sat. Then the kill plan simply re-divides the new total across your remaining days. No penalty screen, no guilt trip.'],
  ['Do I need an account or is my data uploaded?',
   'No account — which is also the limitation: everything lives in this browser’s localStorage, so clearing site data without a backup deletes your backlog. The Backup button downloads a JSON; that’s your side of the deal.'],
  ['My batch has two teachers per subject — will lectures double-count?',
   'No. The teacher lock counts exactly one lecture per subject per day, from the teacher you follow — Manish Raj, SKC, Samapti Sinha or Vipin Sharma. The parallel batch is invisible to your backlog.'],
  ['What if I finish less than today’s target?',
   'The leftover lectures roll into tomorrow and the target recalculates — remaining divided by days left. Your streak only breaks if you stay below your daily goal, not if one day goes soft.'],
  ['Will it work properly on my phone?',
   'Yes, from 375px up — the tracker is the part you’ll use between classes. Honest caveats: it needs internet on first load for fonts and libraries, and it doesn’t sync between two phones. One device, one backlog.']
];

export default function Faq() {
  const reduced = useReducedMotion();
  const ref = useRef(null);

  const toggle = (item, btn) => {
    const wasOpen = item.classList.contains('open');
    ref.current.querySelectorAll('.faq-item').forEach((o) => {
      o.classList.remove('open');
      o.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
    });
    if (!wasOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
    ScrollTrigger.refresh();
  };

  return (
    <section className="faq-section" id="faq" ref={ref}>
      <div className="container">
        <p className="eyebrow">No fluff</p>
        <h2 className="duo-title" style={{ marginBottom: '40px' }}>ASKED EVERY DAY.</h2>
        <div className="faq">
          {QA.map(([q, a], i) => (
            <div className="faq-item" key={i}>
              <button className="faq-q" aria-expanded="false" aria-controls={'faqa' + (i + 1)} id={'faqq' + (i + 1)}
                onClick={(e) => toggle(e.currentTarget.parentNode, e.currentTarget)}>
                {q}
                <span className="faq-plus" aria-hidden="true"></span>
              </button>
              <div className="faq-a" id={'faqa' + (i + 1)} role="region" aria-labelledby={'faqq' + (i + 1)}>
                <div className="faq-a-inner"><p>{a}</p></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
