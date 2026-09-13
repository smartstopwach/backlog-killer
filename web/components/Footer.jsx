'use client';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="f-brand">
            <div className="logo">BACKLOG<span>KILLER</span></div>
            <p>A war room for PW aspirants — track every lecture, kill the backlog, keep the streak.</p>
          </div>
          <nav className="f-col" aria-label="Site">
            <h3>Site</h3>
            <a className="f-link" href="#method">Method</a>
            <a className="f-link" href="#timetable">The week</a>
            <a className="f-link" href="#tracker">Arsenal</a>
            <a className="f-link" href="#faq">FAQ</a>
          </nav>
          <nav className="f-col" aria-label="Tracker">
            <h3>Tracker</h3>
            <a className="f-link" href="tracker.html">Open tracker</a>
            <a className="f-link" href="tracker.html">Live schedule</a>
            <a className="f-link" href="tracker.html">Kill plan</a>
            <a className="f-link" href="tracker.html">Backup &amp; restore</a>
          </nav>
          <nav className="f-col" aria-label="Batch">
            <h3>Batch</h3>
            <a className="f-link" href="https://www.pw.live" target="_blank" rel="noopener">Physics Wallah</a>
            <a className="f-link" href="https://github.com/smartstopwach/backlog-killer" target="_blank" rel="noopener">GitHub repo</a>
            <span className="f-note">Lakshya NEET 2027</span>
          </nav>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Backlog Killer — built between lectures.</p>
          <div className="f-legal">
            <a className="f-link" href="https://github.com/smartstopwach/backlog-killer" target="_blank" rel="noopener">GitHub</a>
            <a className="f-link" href="#top">Back to top</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
