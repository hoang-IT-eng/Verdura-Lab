/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    __GE?: {
      et: () => new (
        container: HTMLElement,
        onLoaded: () => void,
        onIntroDone: () => void
      ) => {
        startHoverTransition: () => void;
        stopHoverTransition: () => void;
        audioStore?: {
          isInitialized: boolean;
          initAudio: () => void;
          toggleMute: () => boolean;
        };
      };
      Y: () => {
        (): {
          isInitialized: boolean;
          initAudio: () => void;
          toggleMute: () => boolean;
        };
      };
    };
    webpackChunk_N_E?: any[];
    __req?: (id: number) => any;
  }
}

export default function App() {
  const valleyContainerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isIntroDone, setIsIntroDone] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isFooterOpen, setIsFooterOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const valleyInstanceRef = useRef<any>(null);
  const audioStoreRef = useRef<any>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFooterOpen) {
        setIsFooterOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFooterOpen]);

  useEffect(() => {
    // Check for ?autostart=1 query param
    const params = new URLSearchParams(window.location.search);
    const autostart = params.get('autostart') === '1';

    let introShown = false;

    const initValley = () => {
      if (!valleyContainerRef.current) return;

      if (!window.__GE) {
        if (window.webpackChunk_N_E && !window.__req) {
          window.webpackChunk_N_E.push([[90001], {}, function (r: any) { window.__req = r; }]);
        }
        if (window.__req) {
          window.__req(889);
        }
      }

      if (!window.__GE) {
        console.warn('Valley engine not found in window.__GE, retrying in 50ms...');
        setTimeout(initValley, 50);
        return;
      }

      try {
        const Valley = window.__GE.et();
        const audioStore = window.__GE.Y();
        audioStoreRef.current = audioStore;

        const valley = new Valley(
          valleyContainerRef.current,
          () => {
            // onLoaded callback
            setIsLoaded(true);
          },
          () => {
            // onIntroDone callback (called every frame after intro completes)
            if (!introShown) {
              introShown = true;
              setIsIntroDone(true);
            }
          }
        );

        valleyInstanceRef.current = valley;

        try {
          audioStore().initAudio();
        } catch (e) {
          console.log('Audio autostart deferred until user interaction');
        }

        if (autostart) {
          setIsLoaded(true);
          introShown = true;
          setIsIntroDone(true);
        }
      } catch (err) {
        console.error('Error initializing Fernhollow valley engine:', err);
      }
    };

    // If DOM already loaded or after short tick
    const timer = setTimeout(initValley, 10);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const handleSoundToggle = () => {
    if (!audioStoreRef.current) {
      if (window.__GE) {
        audioStoreRef.current = window.__GE.Y();
      }
    }
    if (!audioStoreRef.current) return;

    const s = audioStoreRef.current();
    if (!s.isInitialized) {
      try {
        s.initAudio();
      } catch (e) {
        console.warn('initAudio error:', e);
      }
    }
    if (!s.isInitialized) return;

    const muted = s.toggleMute();
    setIsAudioPlaying(!muted);
  };

  const handleCtaEnter = () => {
    if (valleyInstanceRef.current?.startHoverTransition) {
      valleyInstanceRef.current.startHoverTransition();
    }
  };

  const handleCtaLeave = () => {
    if (valleyInstanceRef.current?.stopHoverTransition) {
      valleyInstanceRef.current.stopHoverTransition();
    }
  };

  return (
    <>
      <div id="valley" ref={valleyContainerRef} aria-hidden="true" data-testid="valley-container">
        <div className="js-canvas-container" data-testid="canvas-container"></div>
      </div>

      <div
        className={`ui ${isIntroDone ? 'on' : ''}`}
        id="ui"
        data-testid="ui-overlay"
      >
        <header>
          <a className="logo" href="#" aria-label="Fernhollow">
            Fernhollow
          </a>
          <nav aria-label="Main">
            <a href="#work">Work</a>
            <a href="#about">About</a>
            <a href="#journal">Journal</a>
            <a className="pill" href="#contact">
              Let’s talk
            </a>
          </nav>
        </header>

        <section className="hero">
          <h1>Grown, not built.</h1>
          <p className="cap">
            Rooted in nature.
            <br />
            Built for what’s next.
          </p>
          <a
            className="go"
            href="#work"
            id="go"
            aria-label="See our work"
            onPointerEnter={handleCtaEnter}
            onPointerLeave={handleCtaLeave}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 12h16M14 6l6 6-6 6" />
            </svg>
          </a>
        </section>

        <footer className="footer-bar" data-testid="footer-bar">
          <span className="copyright">© 2026 Fernhollow</span>
          <span className="collab-badge">
            <span className="badge-dot" aria-hidden="true"></span>
            Available for collaborations
          </span>
          <button
            type="button"
            className="footer-drawer-trigger"
            onClick={() => setIsFooterOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={isFooterOpen}
            aria-controls="footer-drawer"
            data-testid="footer-trigger"
          >
            Studio Details [ + ]
          </button>
        </footer>

        <div className="corner">
          <span>Scroll to wander</span>
          <i aria-hidden="true"></i>
          <div className="sound-wrapper">
            <button
              className="sound"
              id="sound"
              type="button"
              aria-pressed={isAudioPlaying}
              aria-label={`Ambient sound: ${isAudioPlaying ? 'Playing' : 'Muted'}`}
              aria-describedby="sound-tooltip"
              onClick={handleSoundToggle}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 9.5v5h3.5L12 18V6L7.5 9.5Z" />
                <path className="w" d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />
                <path className="x" d="m16 10 4 4m0-4-4 4" />
              </svg>
            </button>
            <div id="sound-tooltip" role="tooltip" className="sound-tooltip" data-testid="sound-tooltip">
              <span className={`status-dot ${isAudioPlaying ? 'playing' : 'muted'}`} aria-hidden="true"></span>
              <span>{isAudioPlaying ? 'Playing' : 'Muted'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Studio Footer Drawer */}
      <div
        className={`footer-backdrop ${isFooterOpen ? 'open' : ''}`}
        onClick={() => setIsFooterOpen(false)}
        aria-hidden={!isFooterOpen}
      />

      <aside
        id="footer-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Fernhollow Studio Information & Colophon"
        className={`footer-drawer ${isFooterOpen ? 'open' : ''}`}
        data-testid="footer-drawer"
      >
        <div className="drawer-header">
          <div>
            <h2>Fernhollow Regenerative Studio</h2>
            <p>
              Harmonizing living biology, spatial architecture, and generative digital flora.
              Rooted in nature, engineered for what’s next.
            </p>
          </div>
          <button
            type="button"
            className="drawer-close-btn"
            onClick={() => setIsFooterOpen(false)}
            aria-label="Close studio information drawer"
          >
            ✕
          </button>
        </div>

        <div className="drawer-grid">
          <div className="drawer-col">
            <h3>Ethos & Practice</h3>
            <ul>
              <li>Bio-Integrated Architecture</li>
              <li>Living Mycelium Scaffolding</li>
              <li>Closed-Loop Spatial Systems</li>
              <li>1% for the Planet Member</li>
              <li>Carbon Negative Infrastructure</li>
            </ul>
          </div>

          <div className="drawer-col">
            <h3>Global Studios</h3>
            <ul>
              <li><strong>London:</strong> 42 Shoreditch High St, E1 6JJ</li>
              <li><strong>Zurich:</strong> Seefeldstrasse 114, 8008</li>
              <li><strong>Kyoto:</strong> Kamigyo-ku, Horikawa-dori</li>
              <li>Working across GMT · CET · JST</li>
            </ul>
          </div>

          <div className="drawer-col">
            <h3>Direct Inquiries</h3>
            <ul>
              <li><a href="mailto:hello@fernhollow.studio">hello@fernhollow.studio</a></li>
              <li><a href="mailto:commissions@fernhollow.studio">commissions@fernhollow.studio</a></li>
              <li><a href="mailto:press@fernhollow.studio">press@fernhollow.studio</a></li>
              <li><a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram ↗</a></li>
              <li><a href="https://linkedin.com" target="_blank" rel="noreferrer">LinkedIn ↗</a></li>
            </ul>
          </div>

          <div className="drawer-col">
            <h3>Seasonal Dispatch</h3>
            <p style={{ fontSize: 'calc(13 * var(--u))', color: 'rgba(245, 239, 226, 0.7)', lineHeight: '1.4' }}>
              Quarterly essays on regenerative landscapes, bio-computation, and spatial living systems.
            </p>
            <form
              className="dispatch-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (newsletterEmail.trim()) {
                  setIsSubscribed(true);
                }
              }}
            >
              <div className="dispatch-input-row">
                <input
                  type="email"
                  required
                  placeholder="Enter email address"
                  className="dispatch-input"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  aria-label="Email address for newsletter"
                />
                <button type="submit" className="dispatch-btn">
                  Join
                </button>
              </div>
              {isSubscribed && (
                <p className="dispatch-success" role="status">
                  ✓ Welcome to our seasonal dispatch.
                </p>
              )}
            </form>
          </div>
        </div>

        <div className="drawer-bottom-bar">
          <div>
            © 2026 Fernhollow Studio. Powered by the 3D Night Valley Engine (Three.js r154).
          </div>
          <div className="drawer-bottom-links">
            <a href="#privacy" onClick={(e) => { e.preventDefault(); }}>Privacy Policy</a>
            <a href="#terms" onClick={(e) => { e.preventDefault(); }}>Terms of Practice</a>
            <a href="#colophon" onClick={(e) => { e.preventDefault(); }}>Colophon</a>
          </div>
        </div>
      </aside>

      <div
        className={`loader ${isLoaded ? 'gone' : ''}`}
        id="loader"
        data-testid="loader"
      >
        <span></span>
      </div>
    </>
  );
}
