import { useEffect, useState } from "react";

import { Navbar } from "@/components/navbar";
import { siteConfig } from "@/config/site";
import PigSvg from "../images/nathan-pig.svg";

const footerStyles = `
  .ft-root {
    width: 100%;
    border-top: 1px solid rgba(255,84,255,0.12);
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 2.5rem;
    padding: 4rem 1.5rem 3rem;
  }
  @media (min-width: 1024px) {
    .ft-root { justify-content: space-between; padding: 4rem 6rem 3rem; }
  }
  @media (min-width: 1280px) {
    .ft-root { padding: 4rem 8rem 3rem; }
  }

  .ft-cols { display: flex; flex-wrap: wrap; align-items: flex-start; gap: 2.5rem; }
  @media (min-width: 768px)  { .ft-cols { gap: 3.75rem; } }
  @media (min-width: 1280px) { .ft-cols { gap: 8.75rem; } }

  /* Mobile default: Projects first, then Home above Legal */
  .ft-text-cols { display: flex; flex-wrap: wrap; align-items: flex-start; gap: 2.5rem; }
  @media (min-width: 768px)  { .ft-text-cols { gap: 3.75rem; } }
  @media (min-width: 1280px) { .ft-text-cols { gap: 8.75rem; } }

  .ft-col-projects { order: 1; }
  .ft-home-legal-group { order: 2; display: flex; flex-direction: column; gap: 1.5rem; }

  /* Desktop: dissolve the wrapper so Home | Projects | Legal sit as siblings */
  @media (min-width: 769px) {
    .ft-text-cols { flex-wrap: nowrap; }
    .ft-home-legal-group { display: contents; }
    .ft-col-home    { order: 1; }
    .ft-col-projects { order: 2; }
    .ft-col-legal   { order: 3; }
  }

  .ft-col-head {
    font-family: 'DM Serif Display', serif;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--foreground, #f8fafc);
    margin-bottom: 0.625rem;
    text-decoration: none;
    display: block;
    transition: color 0.15s;
  }
  a.ft-col-head:hover { color: #ff54ff; }

  .ft-col-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.5rem; }
  .ft-col-link {
    font-family: 'DM Mono', monospace;
    font-size: 0.7rem;
    letter-spacing: 0.06em;
    color: rgba(255,255,255,0.45);
    text-decoration: none;
    transition: color 0.15s;
  }
  .ft-col-link:hover { color: #ff54ff; }

  .ft-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.5rem;
  }
  @media (max-width: 768px) {
    .ft-right { align-items: center; text-align: center; }
  }

  .ft-tagline {
    font-family: 'DM Mono', monospace;
    font-size: 0.7rem;
    letter-spacing: 0.04em;
    color: rgba(255,255,255,0.45);
    line-height: 1.6;
    max-width: 240px;
  }

  .ft-socials { display: flex; align-items: center; gap: 1rem; margin-top: 0.5rem; }
  .ft-social-icon { color: rgba(255,255,255,0.45); transition: color 0.15s; display: flex; }
  .ft-social-icon:hover { color: #ff54ff; }

  .ft-meta {
    font-family: 'DM Mono', monospace;
    font-size: 0.62rem;
    letter-spacing: 0.08em;
    color: rgba(255,255,255,0.3);
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: flex-end;
    margin-top: 0.5rem;
  }
  @media (max-width: 768px) { .ft-meta { justify-content: center; } }

  .ft-status-wrap { display: flex; justify-content: flex-end; width: 100%; }
  @media (max-width: 768px) { .ft-status-wrap { justify-content: center; } }

  .ft-status-btn {
    position: relative;
    display: inline-block;
    cursor: pointer;
    border-radius: 6px;
    overflow: hidden;
  }
  .ft-status-btn:focus-visible { outline: 2px solid #ff54ff; outline-offset: 2px; }

  .ft-modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: rgba(0,0,0,0.75);
    backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }
  .ft-modal {
    position: relative;
    width: min(700px, 100%);
    height: min(520px, 90vh);
    background: #0d0d0d;
    border: 1px solid rgba(255,84,255,0.25);
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .ft-modal-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.6rem 1rem;
    border-bottom: 1px solid rgba(255,84,255,0.12);
    flex-shrink: 0;
  }
  .ft-modal-title {
    font-family: 'DM Mono', monospace;
    font-size: 0.7rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.5);
  }
  .ft-modal-close {
    background: none;
    border: none;
    cursor: pointer;
    color: rgba(255,255,255,0.45);
    font-size: 1.1rem;
    line-height: 1;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    transition: color 0.15s, background 0.15s;
  }
  .ft-modal-close:hover { color: #fff; background: rgba(255,84,255,0.15); }
  .ft-modal iframe { flex: 1; width: 100%; border: 0; }
`;

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [viewCount, setViewCount] = useState<string | null>(null);
  const [statusOpen, setStatusOpen] = useState(false);
  const [badgeKey, setBadgeKey] = useState(0);

  const openStatus = () => setStatusOpen(true);
  const closeStatus = () => {
    setStatusOpen(false);
    setBadgeKey((k) => k + 1);
  };

  useEffect(() => {
    fetch("https://a.bigfluffy.monster/counter/id/asamastersoncom")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((d) => setViewCount(d.Users))
      .catch(() => {});
  }, []);

  return (
    <div className="relative flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto max-w-7xl px-6 flex-grow pt-16">
        {children}
      </main>
      <style>{footerStyles}</style>
      <footer className="ft-root">
        {/* ── Left: logo + columns ── */}
        <div className="ft-cols">
          <a aria-label="Home" href="/">
            <img
              alt="Asa Masterson"
              src={PigSvg}
              style={{ width: 34, height: 34 }}
            />
          </a>

          <div className="ft-text-cols">
            <div className="ft-col-projects">
              <a className="ft-col-head" href="/projects/">Projects &amp; Games</a>
              <ul className="ft-col-list">
                <li><a className="ft-col-link" href="/projects/pacman/">Dot Chomper</a></li>
                <li><a className="ft-col-link" href="/projects/pong/">Paddle Battle</a></li>
                <li><a className="ft-col-link" href="/projects/2048/">2048</a></li>
                <li><a className="ft-col-link" href="/projects/battleships/">Battleships</a></li>
                <li><a className="ft-col-link" href="/projects/block-dash/">Block Dash</a></li>
                <li><a className="ft-col-link" href="/projects/dots-and-boxes/">Dots &amp; Boxes</a></li>
              </ul>
            </div>

            <div className="ft-home-legal-group">
              <div className="ft-col-home">
                <a className="ft-col-head" href="/">Home</a>
                <ul className="ft-col-list">
                  <li><a className="ft-col-link" href="/about/">About</a></li>
                </ul>
              </div>
              <div className="ft-col-legal">
                <p className="ft-col-head">Legal</p>
                <ul className="ft-col-list">
                  <li><a className="ft-col-link" href="/privacy/">Privacy Policy</a></li>
                  <li><a className="ft-col-link" href="/terms/">Terms of Use</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: status, tagline, socials, meta ── */}
        <div className="ft-right">
          <div className="ft-status-wrap">
            <button
              aria-label="View site status"
              className="ft-status-btn"
              type="button"
              onClick={openStatus}
            >
              <iframe
                key={badgeKey}
                height="30"
                src="https://status.asamasterson.com/badge?theme=dark"
                style={{ colorScheme: "normal", border: 0, overflow: "hidden", display: "block", pointerEvents: "none" }}
                title="Site status"
                width="250"
              />
            </button>
          </div>

          <p className="ft-tagline">
            Making cool things for the web — full-stack developer &amp; BSc
            Business Computing student based in Oxford, UK.
          </p>

          <div className="ft-socials">
            <a
              aria-label="GitHub"
              className="ft-social-icon"
              href={siteConfig.links.github}
              rel="noopener noreferrer"
              target="_blank"
            >
              <svg fill="currentColor" height="20" viewBox="0 0 24 24" width="20">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
            <a
              aria-label="LinkedIn"
              className="ft-social-icon"
              href={siteConfig.links.linkedin}
              rel="noopener noreferrer"
              target="_blank"
            >
              <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect height="12" width="4" x="2" y="9" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>
            <a
              aria-label="Instagram"
              className="ft-social-icon"
              href={siteConfig.links.instagram}
              rel="noopener noreferrer"
              target="_blank"
            >
              <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20">
                <rect height="18" rx="5" ry="5" width="18" x="3" y="3" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>
            <a
              aria-label="Twitter / X"
              className="ft-social-icon"
              href={siteConfig.links.twitter}
              rel="noopener noreferrer"
              target="_blank"
            >
              <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
              </svg>
            </a>
            <a
              aria-label="Email"
              className="ft-social-icon"
              href={siteConfig.links.email}
            >
              <svg fill="currentColor" height="20" viewBox="0 0 24 24" width="20">
                <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4.7-8 5.334L4 8.7V6.297l8 5.333 8-5.333V8.7z" />
              </svg>
            </a>
          </div>

          <div className="ft-meta">
            {viewCount && <span>Views — {viewCount}</span>}
            <span>© {new Date().getFullYear()} Asa Masterson</span>
          </div>
        </div>
      </footer>

      {statusOpen && (
        <div className="ft-modal-backdrop" role="dialog" aria-modal="true" aria-label="Site status" onClick={closeStatus}>
          <div className="ft-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ft-modal-bar">
              <span className="ft-modal-title">Site Status</span>
              <button aria-label="Close" className="ft-modal-close" type="button" onClick={closeStatus}>✕</button>
            </div>
            <iframe
              src="https://status.asamasterson.com"
              style={{ colorScheme: "normal", border: 0 }}
              title="Site status page"
            />
          </div>
        </div>
      )}
    </div>
  );
}
