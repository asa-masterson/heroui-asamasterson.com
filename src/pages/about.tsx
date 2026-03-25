import DefaultLayout from "@/layouts/default";
import ToruLogoUrl from "../images/toru_digital_logo.jpg";

// ─── Styles — identical tokens to index.tsx ───────────────────────────────────
const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&display=swap');

  :root {
    --brand:        #ff54ff;
    --stroke-color: #111111;
    --muted:        #6b7280;
    --card-border:  rgba(0,0,0,0.08);
    --card-bg:      #ffffff;
    --tag-bg:       rgba(255,84,255,0.08);
  }
  .dark {
    --stroke-color: #f0f0f0;
    --muted:        #9ca3af;
    --card-border:  rgba(255,255,255,0.08);
    --card-bg:      rgba(255,255,255,0.03);
    --tag-bg:       rgba(255,84,255,0.12);
  }

  /* ── Shared section structure ── */
  .about-page-wrap {
    max-width: 900px;
    margin: 0 auto;
    width: 100%;
    padding: 5rem 2rem 2rem;
  }
  .section-wrap-about {
    max-width: 900px;
    margin: 0 auto;
    width: 100%;
    padding: 4rem 2rem;
  }
  .section-divider {
    width: 100%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,84,255,.25), transparent);
    margin: 0 auto;
    max-width: 900px;
  }
  .section-eyebrow {
    font-family: 'DM Mono', monospace;
    font-size: 0.7rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--brand);
    margin-bottom: 0.6rem;
  }
  .section-title {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(2.2rem, 6vw, 4rem);
    line-height: 1;
    letter-spacing: -0.02em;
    margin: 0 0 0.75rem;
  }
  .section-title-outline {
    -webkit-text-stroke: 1.5px var(--stroke-color);
    color: transparent;
  }
  .section-title-solid { color: var(--brand); }
  .section-sub {
    font-family: 'DM Serif Display', serif;
    font-style: italic;
    font-size: 1rem;
    color: var(--muted);
    margin-top: 0.25rem;
    margin-bottom: 2.5rem;
  }

  /* ══════════════════════════════════════
     HERO / INTRO
  ══════════════════════════════════════ */
  .about-hero {
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 3rem;
    align-items: start;
    padding-top: 2rem;
  }
  @media (max-width: 700px) {
    .about-hero {
      grid-template-columns: 1fr;
    }
    .about-hero-img-wrap { order: -1; }
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
    font-size: clamp(2.8rem, 7vw, 5.5rem);
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
    font-size: 1.1rem;
    line-height: 1.7;
    color: var(--muted);
    margin-bottom: 1.25rem;
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
    margin-top: 2rem;
  }
  .about-tag {
    font-family: 'DM Mono', monospace;
    font-size: 0.68rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--brand);
    background: var(--tag-bg);
    border: 1px solid rgba(255,84,255,0.2);
    padding: 0.3rem 0.7rem;
    border-radius: 4px;
  }

  /* Photo */
  .about-hero-img-wrap {
    position: relative;
  }
  .about-hero-img {
    width: 100%;
    aspect-ratio: 3/4;
    object-fit: cover;
    border-radius: 16px;
    display: block;
    border: 1px solid var(--card-border);
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

  /* ══════════════════════════════════════
     HACKATHON CARDS
  ══════════════════════════════════════ */
  .hack-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.25rem;
  }
  @media (max-width: 640px) { .hack-grid { grid-template-columns: 1fr; } }

  /* College event spans full width */
  .hack-card-wide { grid-column: span 2; }
  @media (max-width: 640px) { .hack-card-wide { grid-column: span 1; } }

  .hack-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 16px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
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
  .hack-card:hover {
    border-color: var(--brand);
    transform: translateY(-3px);
  }
  .hack-card:hover::before { opacity: 1; }

  .hack-card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
  }
  .hack-card-logo {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    object-fit: contain;
    background: var(--tag-bg);
    padding: 6px;
    flex-shrink: 0;
  }
  .hack-card-logo-placeholder {
    width: 44px;
    height: 44px;
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
    font-size: 1.15rem;
    line-height: 1.2;
    margin-bottom: 0.2rem;
  }
  .hack-card-org {
    font-family: 'DM Mono', monospace;
    font-size: 0.7rem;
    letter-spacing: 0.08em;
    color: var(--brand);
    text-transform: uppercase;
  }
  .hack-card-desc {
    font-family: 'DM Serif Display', serif;
    font-style: italic;
    font-size: 0.95rem;
    line-height: 1.6;
    color: var(--muted);
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
    background: var(--card-border);
    padding: 0.2rem 0.5rem;
    border-radius: 3px;
  }

  /* Wide card layout (college event) */
  .hack-card-wide .hack-card-inner {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }
  @media (max-width: 640px) {
    .hack-card-wide .hack-card-inner { grid-template-columns: 1fr; }
  }
  .hack-card-wide .hack-card-desc { font-size: 1rem; }

  /* ══════════════════════════════════════
     APPROACH / VALUES
  ══════════════════════════════════════ */
  .values-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }
  @media (max-width: 640px) { .values-grid { grid-template-columns: 1fr; } }

  .value-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 16px;
    padding: 1.5rem;
    transition: border-color 0.2s;
  }
  .value-card:hover { border-color: var(--brand); }

  .value-icon {
    font-size: 1.5rem;
    margin-bottom: 0.75rem;
    display: block;
  }
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

  /* ══════════════════════════════════════
     PULL QUOTE
  ══════════════════════════════════════ */
  .pull-quote {
    border-left: 3px solid var(--brand);
    padding: 1rem 1.5rem;
    margin: 2.5rem 0;
    background: var(--tag-bg);
    border-radius: 0 12px 12px 0;
  }
  .pull-quote-text {
    font-family: 'DM Serif Display', serif;
    font-style: italic;
    font-size: 1.15rem;
    line-height: 1.6;
    color: var(--stroke-color);
    margin: 0 0 0.5rem;
  }
  .dark .pull-quote-text { color: #f0f0f0; }
  .pull-quote-source {
    font-family: 'DM Mono', monospace;
    font-size: 0.68rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--brand);
  }
`;

export default function AboutPage() {
  return (
    <DefaultLayout>
      <style>{pageStyles}</style>

      {/* ══════════════════════════════════════════
          INTRO
      ══════════════════════════════════════════ */}
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
              I'm a <strong>BSc Business Computing student</strong> at the University of Northampton
              and a self-taught full-stack developer with a particular interest in
              <strong> self-hosted infrastructure</strong>, systems programming in Rust, and
              building things that are actually useful.
            </p>
            <p className="about-body">
              I grew up in Oxford and started writing code seriously during my
              <strong> T-Level in Digital Production, Design and Development</strong> at City of
              Oxford College, where I achieved a <strong>Merit</strong>. The course suited me
              because it was graded through real projects rather than paper exams — I learn by
              building, not by reading.
            </p>
            <p className="about-body">
              Outside of university I run my own server stack on{" "}
              <strong>bigfluffy.monster</strong> — hosting services like Coolify, MinIO S3, and
              databases — and I'm active in the <strong>NN1 Dev community</strong> in Northampton.
            </p>

            <div className="pull-quote">
              <p className="pull-quote-text">
                "I think T Levels are good for anyone who likes to be more interactive and
                hands-on with work-based learning and group work."
              </p>
              <span className="pull-quote-source">
                — Asa Masterson, Activate Learning T Levels Celebration Week 2023
              </span>
            </div>

            <div className="about-tags">
              {["Python", "Django", "React", "TypeScript", "Rust", "Docker",
                "Coolify", "FastAPI", "SQL", "Tailwind CSS", "Self-hosted"].map((t) => (
                <span key={t} className="about-tag">{t}</span>
              ))}
            </div>
          </div>

          {/* Right: photo */}
          <div className="about-hero-img-wrap">
            <img
              alt="Asa Masterson outside City of Oxford College"
              className="about-hero-img"
              src="https://minio-s3.bigfluffy.monster/pigsare-pink/assets/asa-flannel-college.webp"
            />
            <p className="about-hero-img-caption">City of Oxford College · 2023</p>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          HACKATHONS
      ══════════════════════════════════════════ */}
      <div className="section-divider" />
      <div className="section-wrap-about">
        <p className="section-eyebrow">01 · Events &amp; Hackathons</p>
        <h2 className="section-title">
          <span className="section-title-outline">Hackathons </span>
          <span className="section-title-solid">&amp; Events.</span>
        </h2>
        <p className="section-sub">
          Competing, building, and meeting people — in and out of university.
        </p>

        <div className="hack-grid">

          {/* Toru — uni */}
          <div className="hack-card">
            <div className="hack-card-header">
              <img alt="Toru logo" className="hack-card-logo" src={ToruLogoUrl} />
              <span className="hack-card-badge">University · Northampton</span>
            </div>
            <div>
              <p className="hack-card-org">Toru Digital</p>
              <p className="hack-card-title">Toru Challenge Hackathon</p>
            </div>
            <p className="hack-card-desc">
              Built a FastAPI backend during this industry-run challenge event at the University of
              Northampton, handling product reviews and e-commerce queries. The backend was
              containerised with Docker and ran a self-hosted MySQL database.
            </p>
            <div className="hack-card-tags">
              <span className="hack-card-tag">FastAPI</span>
              <span className="hack-card-tag">Python</span>
              <span className="hack-card-tag">Docker</span>
              <span className="hack-card-tag">MySQL</span>
            </div>
          </div>

          {/* Triad — uni */}
          <div className="hack-card">
            <div className="hack-card-header">
              <div className="hack-card-logo-placeholder">⚡</div>
              <span className="hack-card-badge">University · Milton Keynes</span>
            </div>
            <div>
              <p className="hack-card-org">Triad</p>
              <p className="hack-card-title">Triad Hackathon</p>
            </div>
            <p className="hack-card-desc">
              Participated in the Triad hackathon at the University of Northampton — a
              time-pressured team challenge focused on rapid prototyping and collaborative
              problem solving under real competition conditions.
            </p>
            <div className="hack-card-tags">
              <span className="hack-card-tag">Team challenge</span>
              <span className="hack-card-tag">Rapid prototyping</span>
              <span className="hack-card-tag">UoN</span>
            </div>
          </div>

          {/* Met Police + AWS — wide card */}
          <div className="hack-card hack-card-wide">
            <div className="hack-card-header">
              <div style={{ display: "flex", gap: "0.6rem" }}>
                <div className="hack-card-logo-placeholder" title="Metropolitan Police">🚔</div>
                <div className="hack-card-logo-placeholder" title="Amazon Web Services">☁️</div>
              </div>
              <span className="hack-card-badge">College · Experience Haus, London</span>
            </div>
            <div className="hack-card-inner">
              <div>
                <p className="hack-card-org">Metropolitan Police &amp; AWS</p>
                <p className="hack-card-title">Met Police × AWS Innovation Challenge</p>
                <p className="hack-card-desc">
                  Took part in a challenge event hosted at <strong
                    style={{ color: "var(--stroke-color)", fontStyle: "normal" }}>Experience Haus
                  </strong> in London, co-run by the Metropolitan Police and Amazon Web Services
                  during college. The brief involved using AWS tooling to tackle a real-world
                  problem posed by the Met — an early introduction to cloud infrastructure and
                  working with a live industry brief under time pressure.
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div
                  style={{
                    background: "var(--tag-bg)",
                    border: "1px solid rgba(255,84,255,0.15)",
                    borderRadius: "12px",
                    padding: "1rem",
                  }}
                >
                  <p style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "0.65rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--brand)",
                    marginBottom: "0.4rem",
                  }}>Venue</p>
                  <p style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: "0.9rem",
                    color: "var(--muted)",
                  }}>Experience Haus, London</p>
                </div>
                <div
                  style={{
                    background: "var(--tag-bg)",
                    border: "1px solid rgba(255,84,255,0.15)",
                    borderRadius: "12px",
                    padding: "1rem",
                  }}
                >
                  <p style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "0.65rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--brand)",
                    marginBottom: "0.4rem",
                  }}>Hosts</p>
                  <p style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: "0.9rem",
                    color: "var(--muted)",
                  }}>Metropolitan Police · Amazon Web Services</p>
                </div>
                <div className="hack-card-tags" style={{ marginTop: 0 }}>
                  <span className="hack-card-tag">AWS</span>
                  <span className="hack-card-tag">Cloud</span>
                  <span className="hack-card-tag">Industry brief</span>
                  <span className="hack-card-tag">London</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ══════════════════════════════════════════
          APPROACH
      ══════════════════════════════════════════ */}
      <div className="section-divider" />
      <div className="section-wrap-about">
        <p className="section-eyebrow">02 · Approach</p>
        <h2 className="section-title">
          <span className="section-title-solid">How I </span>
          <span className="section-title-outline">Work.</span>
        </h2>
        <p className="section-sub">A few principles I keep coming back to.</p>

        <div className="values-grid">
          <div className="value-card">
            <span className="value-icon">🏗️</span>
            <p className="value-title">Build to learn</p>
            <p className="value-desc">
              I learn fastest by shipping something real. Every side project — from a view counter
              to a full Django e-commerce site — teaches me more than any tutorial.
            </p>
          </div>
          <div className="value-card">
            <span className="value-icon">🐷</span>
            <p className="value-title">Own your stack</p>
            <p className="value-desc">
              I self-host wherever it makes sense. Running Coolify, MinIO, and databases on my own
              VPS means I understand every layer — not just the part I wrote.
            </p>
          </div>
          <div className="value-card">
            <span className="value-icon">🤝</span>
            <p className="value-title">Community first</p>
            <p className="value-desc">
              The NN1 Dev community in Northampton showed me how much you learn from other
              developers. Hackathons, meetups, and Slack threads are just as valuable as
              documentation.
            </p>
          </div>
        </div>
      </div>

      <div className="section-divider" style={{ marginBottom: "3rem" }} />
    </DefaultLayout>
  );
}