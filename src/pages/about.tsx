import ToruLogoUrl from "../images/toru_digital_logo.jpg";

import SEOHead from "@/seo/SEOHead";
import { pageMeta } from "@/seo/meta";
import { useTrackPageReadBottom } from "@/lib/analytics";
import DefaultLayout from "@/layouts/default";

// ─── Page-specific styles only.
//     Design tokens, .section-*, .section-divider live in globals.css
// ──────────────────────────────────────────────────────────────────────────────
const pageStyles = `
  /* ════════════════════════════════════════════════
     INTRO / ABOUT HERO
  ════════════════════════════════════════════════ */
  .about-page-wrap {
    max-width: 900px;
    margin: 0 auto;
    width: 100%;
    /* pt-16 on <main> already provides 64px — keep this tight */
    padding: 2rem 2rem 0;
  }
  @media (max-width: 640px) {
    .about-page-wrap { padding: 1.5rem 1.25rem 0; }
  }

  .about-hero {
    display: grid;
    /* 340px is clamped so text column never gets squeezed below ~320px */
    grid-template-columns: 1fr minmax(220px, 320px);
    gap: 3rem;
    align-items: start;
    padding-top: 1rem;
  }
  @media (max-width: 720px) {
    .about-hero {
      grid-template-columns: 1fr;
      gap: 2rem;
    }
    /* Photo goes BELOW the text on mobile — name first is better UX */
    .about-hero-img-wrap { order: 1; }
  }

  .about-hero-eyebrow {
    font-family: 'DM Mono', monospace;
    font-size: 0.7rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--brand);
    margin-bottom: 1rem;
  }
  .about-hero-name {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(2.4rem, 7vw, 5.5rem);
    line-height: 0.95;
    letter-spacing: -0.02em;
    margin: 0 0 1.5rem;
  }
  .about-hero-name-outline {
    display: block;
    -webkit-text-stroke: 2px var(--stroke-color);
    color: transparent;
  }
  .about-hero-name-solid {
    display: block;
    color: var(--brand);
  }

  .about-body {
    font-family: 'DM Serif Display', serif;
    font-size: 1.05rem;
    line-height: 1.75;
    color: var(--muted);
    margin-bottom: 1.1rem;
  }
  .about-body strong {
    font-style: normal;
    color: var(--stroke-color);
  }
  .dark .about-body strong { color: #f0f0f0; }

  .about-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 1.75rem;
  }
  .about-tag {
    font-family: 'DM Mono', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--brand);
    background: var(--tag-bg);
    border: 1px solid rgba(255,84,255,0.2);
    padding: 0.3rem 0.7rem;
    border-radius: 4px;
  }

  /* Photo */
  .about-hero-img-wrap { position: relative; }
  .about-hero-img {
    width: 100%;
    aspect-ratio: 3/4;
    object-fit: cover;
    border-radius: 16px;
    display: block;
    border: 1px solid var(--card-border);
  }
  @media (max-width: 720px) {
    .about-hero-img { aspect-ratio: 16/9; max-height: 280px; }
  }
  .about-hero-img-caption {
    font-family: 'DM Mono', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
    margin-top: 0.6rem;
    text-align: center;
  }

  /* ════════════════════════════════════════════════
     PULL QUOTE
  ════════════════════════════════════════════════ */
  .pull-quote {
    border-left: 3px solid var(--brand);
    padding: 1rem 1.5rem;
    margin: 2rem 0;
    background: var(--tag-bg);
    border-radius: 0 12px 12px 0;
  }
  .pull-quote-text {
    font-family: 'DM Serif Display', serif;
    font-style: italic;
    font-size: 1.1rem;
    line-height: 1.6;
    color: var(--stroke-color);
    margin: 0 0 0.5rem;
  }
  .dark .pull-quote-text { color: #f0f0f0; }
  .pull-quote-source {
    font-family: 'DM Mono', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--brand);
  }

  /* ════════════════════════════════════════════════
     HACKATHON CARDS
  ════════════════════════════════════════════════ */
  .hack-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.25rem;
  }
  @media (max-width: 640px) { .hack-grid { grid-template-columns: 1fr; } }

  .hack-card-wide { grid-column: span 2; }
  @media (max-width: 640px) { .hack-card-wide { grid-column: span 1; } }

  .hack-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 16px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
    transition: border-color 0.2s, transform 0.2s;
    position: relative;
    overflow: hidden;
  }
  .hack-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--brand), rgba(255,84,255,0.2));
    opacity: 0;
    transition: opacity 0.2s;
  }
  .hack-card:hover { border-color: var(--brand); transform: translateY(-3px); }
  .hack-card:hover::before { opacity: 1; }

  .hack-card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
  }
  .hack-card-logo {
    width: 44px; height: 44px;
    border-radius: 10px;
    object-fit: contain;
    background: var(--tag-bg);
    padding: 6px;
    flex-shrink: 0;
  }
  .hack-card-logo-placeholder {
    width: 44px; height: 44px;
    border-radius: 10px;
    background: var(--tag-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    flex-shrink: 0;
  }
  .hack-card-badge {
    font-family: 'DM Mono', monospace;
    font-size: 0.62rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--brand);
    background: var(--tag-bg);
    border: 1px solid rgba(255,84,255,0.2);
    padding: 0.25rem 0.6rem;
    border-radius: 4px;
    white-space: nowrap;
    align-self: flex-start;
  }
  .hack-card-title {
    font-family: 'DM Serif Display', serif;
    font-size: 1.1rem;
    line-height: 1.2;
    margin-bottom: 0.15rem;
  }
  .hack-card-org {
    font-family: 'DM Mono', monospace;
    font-size: 0.68rem;
    letter-spacing: 0.08em;
    color: var(--brand);
    text-transform: uppercase;
  }
  .hack-card-desc {
    font-family: 'DM Serif Display', serif;
    font-style: italic;
    font-size: 0.92rem;
    line-height: 1.6;
    color: var(--muted);
    flex: 1;
  }
  .hack-card-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-top: auto;
  }
  .hack-card-tag {
    font-family: 'DM Mono', monospace;
    font-size: 0.62rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted);
    background: var(--tag-bg);
    border: 1px solid var(--card-border);
    padding: 0.2rem 0.5rem;
    border-radius: 3px;
  }

  /* Wide card (Met Police × AWS) inner 2-col layout */
  .hack-card-wide .hack-card-inner {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }
  @media (max-width: 640px) {
    .hack-card-wide .hack-card-inner { grid-template-columns: 1fr; }
  }

  /* Venue/Hosts info panels inside wide card */
  .hack-info-panel {
    background: var(--tag-bg);
    border: 1px solid rgba(255,84,255,0.15);
    border-radius: 12px;
    padding: 1rem;
  }
  .hack-info-panel-label {
    font-family: 'DM Mono', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--brand);
    margin-bottom: 0.4rem;
  }
  .hack-info-panel-value {
    font-family: 'DM Serif Display', serif;
    font-size: 0.9rem;
    color: var(--muted);
  }

  /* ════════════════════════════════════════════════
     HOW I WORK / VALUES
  ════════════════════════════════════════════════ */
  .values-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }
  @media (max-width: 700px) { .values-grid { grid-template-columns: 1fr; } }
  @media (min-width: 701px) and (max-width: 900px) {
    .values-grid { grid-template-columns: 1fr 1fr; }
  }

  .value-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 16px;
    padding: 1.5rem;
    transition: border-color 0.2s;
  }
  .value-card:hover { border-color: var(--brand); }
  .value-icon { font-size: 1.5rem; margin-bottom: 0.75rem; display: block; }
  .value-title {
    font-family: 'DM Serif Display', serif;
    font-size: 1rem;
    margin-bottom: 0.4rem;
  }
  .value-desc {
    font-family: 'DM Serif Display', serif;
    font-style: italic;
    font-size: 0.85rem;
    line-height: 1.55;
    color: var(--muted);
  }
`;

export default function AboutPage() {
  useTrackPageReadBottom("about");

  return (
    <DefaultLayout>
      <SEOHead meta={pageMeta.about} />
      <style>{pageStyles}</style>

      {/* ══════════════════════════════════════════ INTRO */}
      <div className="about-page-wrap">
        <div className="about-hero">
          {/* Left: text */}
          <div>
            <p className="about-hero-eyebrow">About me</p>
            <h1 className="about-hero-name">
              <span className="about-hero-name-outline">Asa</span>
              <span className="about-hero-name-solid">Masterson.</span>
            </h1>

            <p className="about-body">
              I'm a <strong>BSc Business Computing student</strong> at the
              University of Northampton and a developer with a particular
              interest in <strong>self-hosted infrastructure</strong>, writing
              Python, and building things that are actually useful.
            </p>
            <p className="about-body">
              I grew up in Oxford and started messing around with Python and
              Linux in secondary school — that's when I built my first website,
              asamasterson.com, off a Raspberry Pi. I went on to study a{" "}
              <strong>
                T-Level in Digital Production, Design and Development
              </strong>{" "}
              at City of Oxford College (Merit), completing an industry
              placement at <strong>Oxfordshire County Council</strong> as a
              Customer Support Engineer.
            </p>
            <p className="about-body">
              Outside of university I run my own server stack on{" "}
              <strong>bigfluffy.monster</strong> — Coolify, MinIO S3, databases
              — and I'm active in the <strong>NN1 Dev community</strong> in
              Northampton.
            </p>

            <div className="pull-quote">
              <p className="pull-quote-text">
                "I think T Levels are good for anyone who likes to be more
                interactive and hands-on with work-based learning and group
                work."
              </p>
              <span className="pull-quote-source">
                — Asa Masterson · Activate Learning T Levels Celebration Week
                2023
              </span>
            </div>

            <div className="about-tags">
              {[
                "Python",
                "Django",
                "React",
                "TypeScript",
                "Rust",
                "Docker",
                "Coolify",
                "FastAPI",
                "SQL",
                "Tailwind CSS",
                "Self-hosted",
              ].map((t) => (
                <span key={t} className="about-tag">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Right: photo — sits below text on mobile (order: 1) */}
          <div className="about-hero-img-wrap">
            <img
              alt="Asa Masterson outside City of Oxford College"
              className="about-hero-img"
              src="https://minio-s3.bigfluffy.monster/pigsare-pink/assets/asa-flannel-college.webp"
            />
            <p className="about-hero-img-caption">
              City of Oxford College · 2023
            </p>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════ HACKATHONS */}
      <div className="section-divider" />
      <div className="section-wrap">
        <div className="section-header">
          <p className="section-eyebrow">01 · Events &amp; Hackathons</p>
          <h2 className="section-title">
            <span className="section-title-outline">Hackathons </span>
            <span className="section-title-solid">&amp; Events.</span>
          </h2>
          <p className="section-sub">
            Competing, building, and meeting people — in and out of university.
          </p>
        </div>

        <div className="hack-grid">
          {/* Toru */}
          <div className="hack-card">
            <div className="hack-card-header">
              <img
                alt="Toru logo"
                className="hack-card-logo"
                src={ToruLogoUrl}
              />
              <span className="hack-card-badge">
                Toru Digital · Northampton
              </span>
            </div>
            <div>
              <p className="hack-card-org">Toru Digital</p>
              <p className="hack-card-title">Toru Challenge Hackathon</p>
            </div>
            <p className="hack-card-desc">
              Whilst at university, I took part in a two-day industry challenge
              at the University of Northampton set by Toru Digital, tasked with
              designing and developing an e-commerce solution for a high-end
              jewellery company with a focus on improving the online customer
              journey. I built the FastAPI backend, handling product reviews and
              e-commerce queries, containerised with Docker and running a
              self-hosted MySQL database.
            </p>
            <div className="hack-card-tags">
              <span className="hack-card-tag">FastAPI</span>
              <span className="hack-card-tag">Python</span>
              <span className="hack-card-tag">Docker</span>
              <span className="hack-card-tag">MySQL</span>
            </div>
          </div>

          {/* Triad */}
          <div className="hack-card">
            <div className="hack-card-header">
              <div className="hack-card-logo-placeholder">⚡</div>
              <span className="hack-card-badge">Triad · Milton Keynes</span>
            </div>
            <div>
              <p className="hack-card-org">Triad</p>
              <p className="hack-card-title">Triad Hackathon</p>
            </div>
            <p className="hack-card-desc">
              Whilst at university, I took part in a two-day industry challenge
              event at Triad's offices in Milton Keynes, tasked with designing
              and prototyping an AI-powered Discovery Plan tool aligned to
              Government digital standards. Working under real industry
              expectations, teams integrated OpenAI models, considered security,
              governance and ethical AI constraints, and delivered commercially
              focused presentations to Triad's senior leadership.
            </p>
            <div className="hack-card-tags">
              <span className="hack-card-tag">AI</span>
              <span className="hack-card-tag">Python</span>
              <span className="hack-card-tag">OpenAI</span>
              <span className="hack-card-tag">Gov digital standards</span>
            </div>
          </div>

          {/* Met Police × AWS — wide */}
          <div className="hack-card hack-card-wide">
            <div className="hack-card-header">
              <div style={{ display: "flex", gap: "0.6rem" }}>
                <div
                  className="hack-card-logo-placeholder"
                  title="Metropolitan Police"
                >
                  🚔
                </div>
                <div
                  className="hack-card-logo-placeholder"
                  title="Amazon Web Services"
                >
                  ☁️
                </div>
              </div>
              <span className="hack-card-badge">Experience Haus · London</span>
            </div>
            <div className="hack-card-inner">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.9rem",
                }}
              >
                <div>
                  <p className="hack-card-org">Metropolitan Police &amp; AWS</p>
                  <p className="hack-card-title">
                    Met Police × AWS Innovation Challenge
                  </p>
                </div>
                <p className="hack-card-desc">
                  Whilst at college, I took part in a workshop event at
                  Experience Haus in London bringing together young people,
                  designers, and police officers for an honest open discussion
                  on improving public-police relationships. Rather than a coding
                  challenge, the day was about co-designing real solutions —
                  working with designers and mentors from employers, charities,
                  and government to tackle difficult societal problems.
                  Sponsored by Amazon Web Services.
                </p>
                <div className="hack-card-tags">
                  <span className="hack-card-tag">Design thinking</span>
                  <span className="hack-card-tag">Community</span>
                  <span className="hack-card-tag">Problem solving</span>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                <div className="hack-info-panel">
                  <p className="hack-info-panel-label">Venue</p>
                  <p className="hack-info-panel-value">
                    Experience Haus, Shoreditch, London
                  </p>
                </div>
                <div className="hack-info-panel">
                  <p className="hack-info-panel-label">Hosts</p>
                  <p className="hack-info-panel-value">
                    Metropolitan Police · Amazon Web Services
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════ HOW I WORK */}
      <div className="section-divider" />
      <div className="section-wrap">
        <div className="section-header">
          <p className="section-eyebrow">02 · Approach</p>
          <h2 className="section-title">
            <span className="section-title-solid">How I </span>
            <span className="section-title-outline">Work.</span>
          </h2>
          <p className="section-sub">A few principles I keep coming back to.</p>
        </div>

        <div className="values-grid">
          <div className="value-card">
            <span className="value-icon">🏗️</span>
            <p className="value-title">Build to learn</p>
            <p className="value-desc">
              I learn fastest by shipping something real. Side projects — from a
              view counter to a full Django e-commerce site — teach me more than
              any tutorial.
            </p>
          </div>
          <div className="value-card">
            <span className="value-icon">🐷</span>
            <p className="value-title">Own your stack</p>
            <p className="value-desc">
              I self-host my websites, APIs, and databases on my own VPS using
              Coolify, with MinIO handling object storage — including assets for
              this site. Running it all means I understand every layer.
            </p>
          </div>
          <div className="value-card">
            <span className="value-icon">🤝</span>
            <p className="value-title">Community first</p>
            <p className="value-desc">
              I'm a regular at NN1 Dev Club in Northampton — monthly talks
              covering everything from compiler internals to async workflows,
              followed by drinks where the best conversations happen.
            </p>
          </div>
        </div>
      </div>

      <div className="section-divider" style={{ marginBottom: "3rem" }} />
    </DefaultLayout>
  );
}