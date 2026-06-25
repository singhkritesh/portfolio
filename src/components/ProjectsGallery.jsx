import { useCallback, useEffect, useRef, useState } from 'react';
import CardSwap, { Card } from './CardSwap';

export default function ProjectsGallery({ projects }) {
  const [cardIndex, setCardIndex] = useState(0);
  const [scrolled, setScrolled]   = useState(false);

  const cardSwapRef   = useRef(null);
  const cardIndexRef  = useRef(0);
  const sectionTopRef = useRef(0);
  const sectionHRef   = useRef(0);

  const syncToScroll = useCallback(() => {
    const sy         = window.scrollY;
    const top        = sectionTopRef.current;
    const scrollable = sectionHRef.current - window.innerHeight;
    if (scrollable <= 0) return;

    const scrollWithin = sy - top;
    if (scrollWithin < 0 || scrollWithin > scrollable) return;

    if (scrollWithin > 80) setScrolled(true);

    const sliceSize = scrollable / projects.length;
    const newIndex  = Math.max(0, Math.min(projects.length - 1, Math.floor(scrollWithin / sliceSize)));

    if (newIndex !== cardIndexRef.current) {
      cardSwapRef.current?.goTo(newIndex);
      cardIndexRef.current = newIndex;
      setCardIndex(newIndex);
    }
  }, [projects.length]);

  // Compute section bounds and immediately sync card to current scroll position.
  // Runs on resize and load so images in preceding sections don't cause stale bounds.
  useEffect(() => {
    function updateBounds() {
      const el = document.getElementById('projects');
      if (!el) return;
      const rect = el.getBoundingClientRect();
      sectionTopRef.current = rect.top + window.scrollY;
      sectionHRef.current   = el.offsetHeight;
      syncToScroll();
    }
    updateBounds();
    window.addEventListener('resize', updateBounds);
    window.addEventListener('load',   updateBounds);
    return () => {
      window.removeEventListener('resize', updateBounds);
      window.removeEventListener('load',   updateBounds);
    };
  }, [syncToScroll]);

  useEffect(() => {
    window.addEventListener('scroll', syncToScroll, { passive: true });
    return () => window.removeEventListener('scroll', syncToScroll);
  }, [syncToScroll]);

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
          autoPlay={false}
          easing="linear"
          width={460}
          height={400}
          cardDistance={44}
          verticalDistance={52}
          skewAmount={4}
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
