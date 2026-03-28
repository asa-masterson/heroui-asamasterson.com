import { Link } from "@heroui/link";
import { useEffect, useState } from "react";
import { button as buttonStyles } from "@heroui/theme";

import PinkLogoUrl from "../images/nathan-pig.svg";
import PinkScreenshotUrl from "../images/pink-screenshot.png";
import ToruLogoUrl from "../images/toru_digital_logo.jpg";

import { GithubIcon } from "@/components/icons";
import { trackCustomEvent, useTrackPageReadBottom } from "@/lib/analytics";
import DefaultLayout from "@/layouts/default";
import SEOHead from "@/seo/SEOHead";
import { pageMeta } from "@/seo/meta";

// ─── Page-specific styles only.
//     Design tokens, .section-*, .section-divider live in globals.css
// ──────────────────────────────────────────────────────────────────────────────
const pageStyles = `
  /* ════════════════════════════════════════════════
     HERO
  ════════════════════════════════════════════════ */
  .hero-root {
    position: relative;
    min-height: 100svh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
    padding: 0 1.5rem;
    margin-top: -4rem; /* bleed under sticky navbar */
  }

  /* pink grid overlay */
  .hero-root::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,84,255,.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,84,255,.05) 1px, transparent 1px);
    background-size: 48px 48px;
    z-index: 0;
  }

  /* glow blob */
  .hero-root::after {
    content: '';
    position: absolute;
    width: 600px; height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255,84,255,.18) 0%, transparent 70%);
    top: -120px; right: -100px;
    z-index: 0;
    animation: blobDrift 8s ease-in-out infinite alternate;
  }
  @keyframes blobDrift {
    from { transform: translate(0,0) scale(1); }
    to   { transform: translate(-40px,60px) scale(1.1); }
  }

  .hero-inner {
    position: relative;
    z-index: 1;
    max-width: 900px;
    margin: 0 auto;
    width: 100%;
    padding-top: 3rem;
    padding-bottom: 3rem;
  }

  .hero-eyebrow {
    font-family: 'DM Mono', monospace;
    font-size: 0.75rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--brand);
    margin-bottom: 1.5rem;
    opacity: 0;
    animation: fadeUp 0.6s 0.1s forwards;
  }

  .hero-name {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(2.4rem, 10vw, 8rem);
    line-height: 0.95;
    letter-spacing: -0.02em;
    margin: 0;
    opacity: 0;
    animation: fadeUp 0.7s 0.25s forwards;
  }

  .hero-name-line1 {
    display: block;
    -webkit-text-stroke: 2px var(--stroke-color);
    color: transparent;
  }
  .hero-name-line2 {
    display: block;
    color: var(--brand);
  }

  .hero-descriptor {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(1rem, 3vw, 1.6rem);
    font-style: italic;
    margin-top: 1.5rem;
    color: var(--muted);
    opacity: 0;
    animation: fadeUp 0.7s 0.45s forwards;
  }

  .hero-meta {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-top: 2rem;
    flex-wrap: wrap;
    opacity: 0;
    animation: fadeUp 0.7s 0.6s forwards;
  }
  .hero-meta-item {
    font-family: 'DM Mono', monospace;
    font-size: 0.78rem;
    letter-spacing: 0.08em;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    color: var(--muted);
  }
  .hero-meta-item::before {
    content: '◆';
    color: var(--brand);
    font-size: 0.45rem;
  }

  .hero-actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 2.5rem;
    flex-wrap: wrap;
    opacity: 0;
    animation: fadeUp 0.7s 0.75s forwards;
  }

  .hero-divider {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,84,255,.4), transparent);
    z-index: 1;
  }

  .hero-pig {
    position: absolute;
    right: 6vw;
    top: 50%;
    transform: translateY(-50%);
    width: clamp(80px, 16vw, 200px);
    opacity: 0;
    animation: fadeUp 0.9s 0.9s forwards, pigBob 4s 1.8s ease-in-out infinite;
    z-index: 1;
    filter: drop-shadow(0 0 40px rgba(255,84,255,.35));
  }
  @media (max-width: 700px) { .hero-pig { display: none; } }

  @keyframes pigBob {
    0%,100% { transform: translateY(-50%) rotate(-4deg); }
    50%     { transform: translateY(calc(-50% - 14px)) rotate(4deg); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ════════════════════════════════════════════════
     ABOUT CARDS
  ════════════════════════════════════════════════ */
  .about-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
  @media (max-width: 640px) { .about-grid { grid-template-columns: 1fr; } }

  /* display:block + text-decoration reset so <a> renders like the old <div> */
  .about-card {
    position: relative;
    border-radius: 16px;
    overflow: hidden;
    height: 260px;
    border: 1px solid var(--card-border);
    cursor: pointer;
    display: block;
    text-decoration: none;
    color: inherit;
  }
  .about-card img.about-card-img {
    width: 100%; height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.4s ease;
  }
  .about-card:hover img.about-card-img { transform: scale(1.04); }

  .about-card-footer {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    padding: 0.75rem 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    backdrop-filter: blur(12px);
    background: rgba(0,0,0,0.5);
    border-top: 1px solid rgba(255,255,255,0.08);
  }
  .about-card-label {
    font-family: 'DM Mono', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.5);
  }
  .about-card-text {
    font-size: 0.8rem;
    color: rgba(255,255,255,0.8);
    margin-top: 2px;
  }
  /* span replacing button — entire card is already the link */
  .about-card-btn {
    font-family: 'DM Mono', monospace;
    font-size: 0.7rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    background: var(--brand);
    color: white;
    padding: 0.4rem 0.9rem;
    border-radius: 999px;
    white-space: nowrap;
    flex-shrink: 0;
    transition: opacity 0.2s;
  }
  .about-card:hover .about-card-btn { opacity: 0.85; }

  /* ════════════════════════════════════════════════
     ABOUT PAGE CTA BANNER
  ════════════════════════════════════════════════ */
  .about-cta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    flex-wrap: wrap;
    background: var(--tag-bg);
    border: 1px solid rgba(255,84,255,0.2);
    border-radius: 20px;
    padding: 1.75rem 2rem;
    margin-top: 1rem;
    transition: border-color 0.2s, transform 0.2s;
    cursor: pointer;
    text-decoration: none;
    color: inherit;
  }
  .about-cta:hover {
    border-color: var(--brand);
    transform: translateY(-2px);
  }
  .about-cta-eyebrow {
    font-family: 'DM Mono', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--brand);
    margin-bottom: 0.4rem;
  }
  .about-cta-heading {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(1.2rem, 3vw, 1.8rem);
    line-height: 1.1;
    margin-bottom: 0.4rem;
  }
  .about-cta-heading-outline {
    -webkit-text-stroke: 1.5px var(--stroke-color);
    color: transparent;
  }
  .about-cta-heading-solid { color: var(--brand); }
  .about-cta-sub {
    font-family: 'DM Serif Display', serif;
    font-style: italic;
    font-size: 0.9rem;
    color: var(--muted);
  }
  .about-cta-arrow {
    font-family: 'DM Mono', monospace;
    font-size: 0.72rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--brand);
    background: rgba(255,84,255,0.12);
    border: 1px solid rgba(255,84,255,0.3);
    padding: 0.6rem 1.2rem;
    border-radius: 999px;
    white-space: nowrap;
    flex-shrink: 0;
    transition: background 0.2s, color 0.2s;
  }
  .about-cta:hover .about-cta-arrow {
    background: var(--brand);
    color: white;
  }

  /* ════════════════════════════════════════════════
     PROJECT CARDS
  ════════════════════════════════════════════════ */
  .projects-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }
  @media (max-width: 640px) { .projects-grid { grid-template-columns: 1fr; } }
  @media (min-width: 641px) and (max-width: 800px) {
    .projects-grid { grid-template-columns: 1fr 1fr; }
  }

  /* text-decoration + color reset so <a> renders like the old <div> */
  .proj-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 16px;
    overflow: hidden;
    cursor: pointer;
    transition: border-color 0.2s, transform 0.2s;
    display: flex;
    flex-direction: column;
    text-decoration: none;
    color: inherit;
  }
  .proj-card:hover {
    border-color: var(--brand);
    transform: translateY(-3px);
  }
  .proj-card-img { width: 100%; height: 140px; object-fit: cover; display: block; }
  .proj-card-counter {
    width: 100%; height: 140px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    background: var(--tag-bg);
  }
  .proj-card-counter-num {
    font-family: 'DM Serif Display', serif;
    font-size: 2.5rem;
    color: var(--brand);
    line-height: 1;
  }
  .proj-card-counter-label {
    font-family: 'DM Mono', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .proj-card-counter-btn {
    font-family: 'DM Mono', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.1em;
    border: 1px solid var(--brand);
    color: var(--brand);
    background: transparent;
    padding: 0.3rem 0.75rem;
    border-radius: 999px;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
  }
  .proj-card-counter-btn:hover { background: var(--brand); color: white; }
  .proj-card-body { padding: 1rem; flex: 1; }
  .proj-card-title {
    font-family: 'DM Serif Display', serif;
    font-size: 1.05rem;
    margin-bottom: 0.35rem;
  }
  .proj-card-desc { font-size: 0.8rem; color: var(--muted); line-height: 1.5; }
  .proj-card-footer {
    padding: 0.6rem 1rem;
    border-top: 1px solid var(--card-border);
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.4rem;
  }
  .proj-card-tag {
    font-family: 'DM Mono', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--brand);
    background: var(--tag-bg);
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
  }

  /* ════════════════════════════════════════════════
     SKILLS
  ════════════════════════════════════════════════ */
  .skills-cats { display: flex; flex-direction: column; gap: 1.75rem; }
  .skills-cat-label {
    font-family: 'DM Mono', monospace;
    font-size: 0.68rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--brand);
    margin-bottom: 0.75rem;
  }
  .skills-chip-row { display: flex; flex-wrap: wrap; gap: 0.5rem; }
  .skills-chip {
    font-family: 'DM Mono', monospace;
    font-size: 0.72rem;
    letter-spacing: 0.05em;
    color: var(--stroke-color);
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    padding: 0.38rem 0.9rem;
    border-radius: 6px;
    transition: border-color 0.2s, color 0.2s;
    cursor: default;
  }
  .skills-chip:hover { border-color: var(--brand); color: var(--brand); }

  /* ════════════════════════════════════════════════
     WORK EXPERIENCE
  ════════════════════════════════════════════════ */
  .work-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
  @media (max-width: 640px) { .work-grid { grid-template-columns: 1fr; } }

  .work-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 16px;
    padding: 1.25rem;
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    transition: border-color 0.2s;
  }
  .work-card:hover { border-color: var(--brand); }
  .work-logo {
    width: 48px; height: 48px;
    border-radius: 10px;
    object-fit: contain;
    flex-shrink: 0;
    background: var(--tag-bg);
    padding: 4px;
  }
  .work-title { font-family: 'DM Serif Display', serif; font-size: 1rem; margin-bottom: 0.2rem; }
  .work-role { font-size: 0.82rem; color: var(--muted); }
  .work-period {
    font-family: 'DM Mono', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--brand);
    margin-top: 0.4rem;
  }

  /* ════════════════════════════════════════════════
     EDUCATION
  ════════════════════════════════════════════════ */
  .edu-list { display: flex; flex-direction: column; }
  .edu-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 1.25rem 0;
    border-bottom: 1px solid var(--card-border);
    gap: 1rem;
  }
  .edu-item:first-child { border-top: 1px solid var(--card-border); }
  .edu-institution { font-family: 'DM Serif Display', serif; font-size: 1.05rem; margin-bottom: 0.2rem; }
  .edu-detail { font-size: 0.82rem; color: var(--muted); }
  .edu-period {
    font-family: 'DM Mono', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--brand);
    white-space: nowrap;
    flex-shrink: 0;
    padding-top: 4px;
    text-align: right;
  }
  @media (max-width: 480px) {
    .edu-item { flex-direction: column; gap: 0.4rem; }
    .edu-period { text-align: left; }
  }
`;

const LinkedInIcon = ({ size = 18 }: { size?: number }) => (
  <svg fill="none" height={size} viewBox="0 0 24 24" width={size}>
    <path
      d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"
      fill="currentColor"
    />
    <rect fill="currentColor" height="12" width="4" x="2" y="9" />
    <circle cx="4" cy="4" fill="currentColor" r="2" />
  </svg>
);

export default function IndexPage() {
  const [viewCount, setViewCount] = useState<string | null>(null);

  useTrackPageReadBottom("home");

  const fetchViewCount = () => {
    fetch(
      "https://a.bigfluffy.monster/counter/id/asamastersoncom-button?ttl=3600",
    )
      .then((r) => r.json())
      .then((d) => setViewCount("" + d.Users))
      .catch(() => setViewCount(null));
  };

  useEffect(() => {
    fetchViewCount();
  }, []);

  const skillGroups = [
    {
      label: "Languages",
      skills: ["Python", "HTML / CSS", "JavaScript", "PHP", "Rust", "SQL"],
    },
    {
      label: "Frameworks & Libraries",
      skills: ["Django", "React", "FastAPI", "Tailwind CSS", "Flutter"],
    },
    {
      label: "Infrastructure & Tools",
      skills: ["Docker", "Coolify", "Linux", "Git", "MinIO S3", "Neo4j"],
    },
  ];

  return (
    <DefaultLayout>
      <SEOHead meta={pageMeta.home} />
      <style>{pageStyles}</style>

      {/* ══════════════════════════════════════════ HERO */}
      <section className="hero-root">
        <div className="hero-inner">
          <p className="hero-eyebrow">Portfolio · asamasterson.com</p>
          <h1 className="hero-name">
            <span className="hero-name-line1">Asa</span>
            <span className="hero-name-line2">Masterson.</span>
          </h1>
          <p className="hero-descriptor">
            University student &amp; full-stack software developer.
          </p>
          <div className="hero-meta">
            <span className="hero-meta-item">Oxford, UK</span>
            <span className="hero-meta-item">BSc Business Computing</span>
            <span className="hero-meta-item">University of Northampton</span>
          </div>
          <div className="hero-actions">
            <Link
              isExternal
              className={buttonStyles({
                color: "primary",
                radius: "full",
                variant: "shadow",
                size: "md",
              })}
              href="https://pigsare.pink/"
              onPress={() => {
                trackCustomEvent("pigsarepink_link_click", { location: "hero_button" });
              }}
            >
              🐷 pigsare.pink
            </Link>
            <Link
              isExternal
              className={buttonStyles({
                variant: "bordered",
                radius: "full",
                size: "md",
              })}
              href="https://github.com/asa-masterson"
            >
              <GithubIcon size={18} /> GitHub
            </Link>
            <Link
              isExternal
              className={buttonStyles({
                variant: "flat",
                radius: "full",
                size: "md",
              })}
              href="https://www.linkedin.com/in/asa-masterson/"
            >
              <LinkedInIcon size={18} /> LinkedIn
            </Link>
            <Link
              isExternal
              className={buttonStyles({
                color: "success",
                radius: "full",
                variant: "shadow",
                size: "md",
              })}
              href="https://minio-s3.bigfluffy.monster/pigsare-pink/assets/asa-masterson-cv.pdf"
              onPress={() => {
                trackCustomEvent("download_cv_link_click", { location: "hero_button" });
              }}
            >
              📄 Download CV
            </Link>
          </div>
        </div>
        <img alt="Pig mascot" className="hero-pig" src={PinkLogoUrl} />
        <div className="hero-divider" />
      </section>

      {/* ══════════════════════════════════════════ ABOUT ME */}
      <div className="section-divider" />
      <div className="section-wrap">
        <div className="section-header">
          <p className="section-eyebrow">01 · About</p>
          <h2 className="section-title">
            <span className="section-title-outline">About </span>
            <span className="section-title-solid">Me.</span>
          </h2>
          <p className="section-sub">
            A few things I've written — check one out.
          </p>
        </div>

        <div className="about-grid">
          {/* Real <a href> — crawlable backlink to NN1 Dev spotlight */}
          <a
            className="about-card"
            href="https://nn1.dev/spotlight/asa-masterson/"
            rel="noopener noreferrer"
            target="_blank"
            onClick={() =>
              trackCustomEvent("nn1_link_click", { location: "about_card" })
            }
          >
            <img
              alt="Asa Masterson"
              className="about-card-img"
              src="https://minio-s3.bigfluffy.monster/pigsare-pink/assets/mobileasaturkey.jpg"
            />
            <div className="about-card-footer">
              <div>
                <p className="about-card-label">NN1.dev · Spotlight</p>
                <p className="about-card-text">
                  A short interview about me &amp; tech.
                </p>
              </div>
              <span className="about-card-btn">Read →</span>
            </div>
          </a>

          {/* Real <a href> — crawlable link to Medium article */}
          <a
            className="about-card"
            href="https://medium.com/@asa.masterson/what-are-t-levels-from-a-student-6beed40b95ee"
            rel="noopener noreferrer"
            target="_blank"
            onClick={() =>
              trackCustomEvent("medium_link_click", { location: "about_card" })
            }
          >
            <img
              alt="Asa Masterson outside college"
              className="about-card-img"
              src="https://minio-s3.bigfluffy.monster/pigsare-pink/assets/asa-flannel-college.webp"
            />
            <div className="about-card-footer">
              <div>
                <p className="about-card-label">Medium.com</p>
                <p className="about-card-text">
                  What are T-Levels? From a student.
                </p>
              </div>
              <span className="about-card-btn">Read →</span>
            </div>
          </a>
        </div>

        <a
          className="about-cta"
          href="/about/"
          onClick={() => {
            trackCustomEvent("about_cta_link_click", { location: "home_about_section" });
          }}
        >
          <div>
            <p className="about-cta-eyebrow">There's more ↓</p>
            <p className="about-cta-heading">
              <span className="about-cta-heading-outline">About </span>
              <span className="about-cta-heading-solid">Asa.</span>
            </p>
            <p className="about-cta-sub">
              Hackathons, work philosophy, the Met Police × AWS challenge in
              London, and more.
            </p>
          </div>
          <span className="about-cta-arrow">Read about me →</span>
        </a>
      </div>

      {/* ══════════════════════════════════════════ PROJECTS */}
      <div className="section-divider" />
      <div className="section-wrap">
        <div className="section-header">
          <p className="section-eyebrow">02 · Projects</p>
          <h2 className="section-title">
            <span className="section-title-solid">My </span>
            <span className="section-title-outline">Projects.</span>
          </h2>
          <p className="section-sub">
            A small overview of what I've been working on.
          </p>
        </div>
        <div className="projects-grid">
          <a
            className="proj-card"
            href="https://pigsare.pink/"
            rel="noopener noreferrer"
            target="_blank"
            onClick={() =>
              trackCustomEvent("pigsarepink_link_click", { location: "project_card" })
            }
          >
            <img
              alt="pigsare.pink"
              className="proj-card-img"
              src={PinkScreenshotUrl}
            />
            <div className="proj-card-body">
              <p className="proj-card-title">pigsare.pink</p>
              <p className="proj-card-desc">
                Personality-first portfolio built with vanilla HTML, CSS &amp;
                JS — self-hosted on Coolify.
              </p>
            </div>
            <div className="proj-card-footer">
              <span className="proj-card-tag">HTML</span>
              <span className="proj-card-tag">CSS</span>
              <span className="proj-card-tag">Coolify</span>
            </div>
          </a>

          <a
            className="proj-card"
            href="https://github.com/asa-masterson/fastapi-redis-counter/tree/master"
            rel="noopener noreferrer"
            target="_blank"
          >
            <div className="proj-card-counter">
              <span className="proj-card-counter-num">{viewCount ?? "—"}</span>
              <span className="proj-card-counter-label">page views</span>
              <button
                className="proj-card-counter-btn"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  fetchViewCount();
                }}
              >
                + Increment
              </button>
            </div>
            <div className="proj-card-body">
              <p className="proj-card-title">PageViews Counter</p>
              <p className="proj-card-desc">
                FastAPI + Python with a Redis backend tracking views across any
                project.
              </p>
            </div>
            <div className="proj-card-footer">
              <span className="proj-card-tag">Python</span>
              <span className="proj-card-tag">FastAPI</span>
              <span className="proj-card-tag">Redis</span>
            </div>
          </a>

          <a
            className="proj-card"
            href="https://github.com/asa-masterson/toru-backend"
            rel="noopener noreferrer"
            target="_blank"
          >
            <img
              alt="Toru Challenge"
              className="proj-card-img"
              src={ToruLogoUrl}
            />
            <div className="proj-card-body">
              <p className="proj-card-title">Toru Challenge</p>
              <p className="proj-card-desc">
                Hackathon FastAPI backend for reviews &amp; e-commerce queries,
                containerised with Docker + MySQL.
              </p>
            </div>
            <div className="proj-card-footer">
              <span className="proj-card-tag">FastAPI</span>
              <span className="proj-card-tag">Docker</span>
              <span className="proj-card-tag">MySQL</span>
            </div>
          </a>
        </div>
      </div>

      {/* ══════════════════════════════════════════ SKILLS */}
      <div className="section-divider" />
      <div className="section-wrap">
        <div className="section-header">
          <p className="section-eyebrow">03 · Skills</p>
          <h2 className="section-title">
            <span className="section-title-outline">My </span>
            <span className="section-title-solid">Skills.</span>
          </h2>
          <p className="section-sub">A quick rundown.</p>
        </div>
        <div className="skills-cats">
          {skillGroups.map(({ label, skills }) => (
            <div key={label}>
              <p className="skills-cat-label">{label}</p>
              <div className="skills-chip-row">
                {skills.map((s) => (
                  <span key={s} className="skills-chip">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════ WORK */}
      <div className="section-divider" />
      <div className="section-wrap">
        <div className="section-header">
          <p className="section-eyebrow">04 · Experience</p>
          <h2 className="section-title">
            <span className="section-title-solid">Work </span>
            <span className="section-title-outline">Experience.</span>
          </h2>
          <p className="section-sub">Where I've been in the real world.</p>
        </div>
        <div className="work-grid">
          <div className="work-card">
            <img
              alt="Oxfordshire County Council"
              className="work-logo"
              src="https://imgproxy.bigfluffy.monster/YnX3ViM9fY-kT0p9Z9GKmWx0UBW8LAjnFCnPzKq05Wo/rs:fill:400:400/g:sm/q:85/f:webp/strip_metadata:1/aHR0cHM6Ly9taW5pby1zMy5iaWdmbHVmZnkubW9uc3Rlci9waWdzYXJlLXBpbmsvYXNzZXRzL09DQy53ZWJw"
            />
            <div>
              <p className="work-title">Oxfordshire County Council</p>
              <p className="work-role">Customer Support Engineer</p>
              <p className="work-period">Apr '22 – Jun '23</p>
            </div>
          </div>
          <div className="work-card">
            <img
              alt="Vue Cinemas"
              className="work-logo"
              src="https://imgproxy.bigfluffy.monster/nrbtdj0y7Ansq-H2N_bHCKtKw69hO1iDUr2nsiaKsY0/rs:fill:400:400/g:sm/q:85/f:webp/strip_metadata:1/aHR0cHM6Ly9taW5pby1zMy5iaWdmbHVmZnkubW9uc3Rlci9waWdzYXJlLXBpbmsvYXNzZXRzL1ZVRS53ZWJw"
            />
            <div>
              <p className="work-title">Vue Cinemas</p>
              <p className="work-role">
                Customer Assistant · Oxford &amp; Northampton
              </p>
              <p className="work-period">Oct '21 – Present</p>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════ EDUCATION */}
      <div className="section-divider" />
      <div className="section-wrap">
        <div className="section-header">
          <p className="section-eyebrow">05 · Education</p>
          <h2 className="section-title">
            <span className="section-title-outline">My </span>
            <span className="section-title-solid">Education.</span>
          </h2>
          <p className="section-sub">The academic side of things.</p>
        </div>
        <div className="edu-list">
          {[
            {
              institution: "University of Northampton",
              detail: "BSc Business Computing · Current",
              period: "2023 – Present",
            },
            {
              institution: "City of Oxford College (Activate Learning)",
              detail:
                "Merit · T-Level in Digital Production, Design and Development",
              period: "2021 – 2023",
            },
            {
              institution: "Gosford Hill School",
              detail: "8 · GCSE Computer Science   ·   6 · GCSE Mathematics",
              period: "2016 – 2021",
            },
          ].map(({ institution, detail, period }) => (
            <div key={institution} className="edu-item">
              <div>
                <p className="edu-institution">{institution}</p>
                <p className="edu-detail">{detail}</p>
              </div>
              <span className="edu-period">{period}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="section-divider" style={{ marginBottom: "3rem" }} />
    </DefaultLayout>
  );
}