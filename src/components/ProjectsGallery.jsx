import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CardSwap, { Card } from './CardSwap';

gsap.registerPlugin(ScrollTrigger);

export default function ProjectsGallery({ projects }) {
  const [cardIndex, setCardIndex] = useState(0);
  const [scrolled, setScrolled]   = useState(false);

  const cardSwapRef  = useRef(null);
  const cardIndexRef = useRef(0);
  const scrolledRef  = useRef(false);

  useEffect(() => {
    if (!cardSwapRef.current) return;
    const section = document.getElementById('projects');
    if (!section) return;

    const N = projects.length;

    // Build the flat master timeline (n-1 transitions, each 1 unit long)
    const masterTl = cardSwapRef.current.buildMasterTimeline();
    if (!masterTl) return;

    // Pin the animation to the section's full scroll distance
    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5,
      animation: masterTl,
      onUpdate: (self) => {
        // progress 0→1 spans N-1 transitions; round to nearest card index
        const idx = Math.min(N - 1, Math.max(0, Math.round(self.progress * (N - 1))));
        if (idx !== cardIndexRef.current) {
          cardIndexRef.current = idx;
          setCardIndex(idx);
        }
        if (!scrolledRef.current && self.progress > 0) {
          scrolledRef.current = true;
          setScrolled(true);
        }
      },
    });

    return () => {
      st.kill();
      masterTl.kill();
    };
  }, [projects.length]);

  const current = projects[cardIndex] ?? projects[0];

  return (
    <div className="pg-gallery">
      {/* Counter + category — top-left */}
      <div className="pg-meta">
        <span className="pg-label">Projects</span>
        <span className="pg-counter">
          <span className="pg-counter-current">{String(cardIndex + 1).padStart(2, '0')}</span>
          <span className="pg-counter-sep"> / </span>
          <span className="pg-counter-total">{String(projects.length).padStart(2, '0')}</span>
        </span>
        <span className="pg-category">{current.category}</span>
      </div>

      {/* Progress rail — left side */}
      <div className="pg-rail">
        {projects.map((_, i) => (
          <div
            key={i}
            className={`pg-rail-dot${
              i === cardIndex ? ' pg-rail-dot--active'
              : i < cardIndex  ? ' pg-rail-dot--done'
              : ''
            }`}
          />
        ))}
      </div>

      {/* Card stack — centred */}
      <div className="pg-stack">
        <CardSwap
          ref={cardSwapRef}
          width={460}
          height={400}
          cardDistance={44}
          verticalDistance={52}
          skewAmount={0}
        >
          {projects.map((p, i) => (
            <Card
              key={i}
              style={{
                background: '#f7f7f7',
                border: '1px solid #e4e4e4',
                boxShadow: '0 2px 16px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <div className="pg-card">
                <div className="pg-card-header">
                  <div className="pg-tags">
                    {p.tags.map(t => (
                      <span key={t.label} className={`pg-tag${t.accent ? ' pg-tag--accent' : ''}`}>
                        {t.label}
                      </span>
                    ))}
                  </div>
                  <span className="pg-date">{p.date}</span>
                </div>

                <h3 className="pg-title">{p.title}</h3>

                <ul className="pg-bullets">
                  {p.bullets.map((b, bi) => <li key={bi}>{b}</li>)}
                </ul>

                {p.repo && (
                  <div className="pg-footer">
                    <a
                      href={p.repo}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="pg-repo"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                      </svg>
                      View Repo
                    </a>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </CardSwap>
      </div>

      {/* Scroll cue — bottom-right */}
      <div className={`pg-cue${scrolled ? ' pg-cue--hidden' : ''}`}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M6 2v8M2 7l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        scroll
      </div>
    </div>
  );
}
