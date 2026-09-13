# ⚡ BACKLOG KILLER

A war room for PW aspirants — track every lecture, kill the backlog, keep the streak.
Built for **Lakshya NEET 2027** (Phy · Manish Raj Sir / OC · SKC Sir / Zoo · Samapti Mam / Bot · Vipin Sir).

##  LIVE LINKS

| Kya | Link |
|---|---|
| **Cinematic site** | https://smartstopwach.github.io/backlog-killer/ |
| **Backlog tracker app** | https://smartstopwach.github.io/backlog-killer/tracker.html |

> Site purani dikhe? `Ctrl+Shift+R` (hard refresh) maaro ya incognito mein kholo — GitHub Pages ka cache hota hai.

## Features
- 📡 Live lecture sync — Mon–Sat ~2 lectures/day auto-add, batch timetable se
- 🎓 Teacher lock — parallel batch mein se sirf tumhare teacher ki lectures
- ⚔️ Kill Plan — deadline tum batao, target = baaki lectures ÷ baaki din
- 🔄 Miss-a-day reshuffle — plan sharminda nahi karta, redistribute karta hai
- 🔥 Streak + zero-day celebration

## Repo structure
- `/` (root) — cinematic single-page site (index.html, styles.css, main.js)
- `/tracker.html` — working backlog tracker (localStorage, backup/restore)
- `/v2/` — same static site, reference copy
- `/web/` — Next.js componentised build (dev: `npm i && npm run dev`)
