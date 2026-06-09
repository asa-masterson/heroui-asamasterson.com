import SEOHead from "@/seo/SEOHead";
import { pageMeta } from "@/seo/meta";
import { useTrackPageReadBottom, trackCustomEvent } from "@/lib/analytics";
import DefaultLayout from "@/layouts/default";

import PinkScreenshotUrl from "../images/pink-screenshot.png";
import ToruLogoUrl from "../images/toru_digital_logo.jpg";

const pageStyles = `
  /* ════════════════════════════════════════════════
     PAGE HERO
  ════════════════════════════════════════════════ */
  .proj-hub-hero {
    max-width: 900px;
    margin: 0 auto;
    width: 100%;
    padding: 2.5rem 2rem 0;
  }
  @media (max-width: 640px) { .proj-hub-hero { padding: 1.75rem 1.25rem 0; } }

  .proj-hub-eyebrow {
    font-family: 'DM Mono', monospace;
    font-size: 0.7rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--brand);
    margin-bottom: 1rem;
  }
  .proj-hub-title {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(2.4rem, 7vw, 5.5rem);
    line-height: 0.95;
    letter-spacing: -0.02em;
    margin: 0 0 1.25rem;
  }
  .proj-hub-title-outline {
    display: block;
    -webkit-text-stroke: 2px var(--stroke-color);
    color: transparent;
  }
  .proj-hub-title-solid {
    display: block;
    color: var(--brand);
  }
  .proj-hub-sub {
    font-family: 'DM Serif Display', serif;
    font-style: italic;
    font-size: 1.05rem;
    line-height: 1.7;
    color: var(--muted);
    max-width: 520px;
  }

  /* ════════════════════════════════════════════════
     SQUARE CARD GRID
  ════════════════════════════════════════════════ */
  .sq-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }
  @media (max-width: 700px) { .sq-grid { grid-template-columns: 1fr 1fr; } }
  @media (max-width: 400px) { .sq-grid { grid-template-columns: 1fr; } }

  .sq-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 16px;
    overflow: hidden;
    transition: border-color 0.2s, transform 0.2s;
    display: flex;
    flex-direction: column;
    text-decoration: none;
    color: inherit;
    position: relative;
  }
  .sq-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--brand), rgba(255,84,255,0.2));
    opacity: 0;
    transition: opacity 0.2s;
    z-index: 1;
  }
  .sq-card:hover { border-color: var(--brand); transform: translateY(-3px); }
  .sq-card:hover::before { opacity: 1; }

  /* Square thumbnail */
  .sq-card-thumb {
    width: 100%;
    aspect-ratio: 1 / 1;
    object-fit: cover;
    display: block;
  }

  /* Square icon placeholder */
  .sq-card-icon {
    width: 100%;
    aspect-ratio: 1 / 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--tag-bg);
    font-size: 3rem;
  }

  .sq-card-body {
    padding: 0.85rem 1rem 0.5rem;
    flex: 1;
  }
  .sq-card-name {
    font-family: 'DM Serif Display', serif;
    font-size: 0.95rem;
    margin-bottom: 0.3rem;
    line-height: 1.25;
  }
  .sq-card-desc {
    font-size: 0.76rem;
    color: var(--muted);
    line-height: 1.5;
  }
  .sq-card-footer {
    padding: 0.55rem 1rem;
    border-top: 1px solid var(--card-border);
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    margin-top: auto;
  }
  .sq-card-tag {
    font-family: 'DM Mono', monospace;
    font-size: 0.58rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--brand);
    background: var(--tag-bg);
    padding: 0.15rem 0.45rem;
    border-radius: 3px;
  }
  .sq-card-tag-leaderboard {
    color: #ffd700;
    background: rgba(255, 215, 0, 0.1);
    border: 1px solid rgba(255, 215, 0, 0.25);
  }

  /* Status badge — top-right corner */
  .sq-card-badge {
    position: absolute;
    top: 0.6rem;
    right: 0.6rem;
    font-family: 'DM Mono', monospace;
    font-size: 0.55rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    backdrop-filter: blur(6px);
    z-index: 2;
  }
  .sq-card-badge-wip {
    background: rgba(0,0,0,0.5);
    color: rgba(255,255,255,0.75);
    border: 1px solid rgba(255,255,255,0.1);
  }
  .sq-card-badge-live {
    background: rgba(0,200,100,0.18);
    color: #00c864;
    border: 1px solid rgba(0,200,100,0.3);
  }
  .sq-card-badge-oss {
    background: rgba(255,84,255,0.12);
    color: var(--brand);
    border: 1px solid rgba(255,84,255,0.3);
  }

  /* Dim WIP cards slightly */
  .sq-card-wip .sq-card-icon { opacity: 0.55; }
  .sq-card-wip .sq-card-name { opacity: 0.65; }
  .sq-card-wip .sq-card-desc { opacity: 0.55; }
`;

// ─── project data ─────────────────────────────────────────────────────────────

type Status = "live" | "wip" | "oss";

interface Project {
  name: string;
  desc: string;
  tags: string[];
  icon?: string;
  img?: string;
  href?: string;
  status: Status;
  analyticsKey?: string;
}

const webProjects: Project[] = [
  {
    name: "pigsare.pink",
    desc: "Personality-first portfolio built with vanilla HTML, CSS & JS — self-hosted on Coolify.",
    tags: ["HTML", "CSS", "JS", "Coolify"],
    img: PinkScreenshotUrl,
    href: "https://pigsare.pink/",
    status: "live",
    analyticsKey: "pigsarepink_link_click",
  },
  {
    name: "asamasterson.com",
    desc: "This site — React + HeroUI, vite-react-ssg for static generation, deployed via Docker on my VPS.",
    tags: ["React", "Vite", "HeroUI", "Docker"],
    icon: "🐷",
    href: "https://github.com/asa-masterson/heroui-asamasterson.com",
    status: "oss",
    analyticsKey: "github_link_click",
  },
  {
    name: "PageViews Counter",
    desc: "FastAPI + Redis backend tracking page views across projects, with a live increment endpoint.",
    tags: ["Python", "FastAPI", "Redis"],
    icon: "📊",
    href: "https://github.com/asa-masterson/fastapi-redis-counter",
    status: "oss",
    analyticsKey: "github_link_click",
  },
  {
    name: "Lotto Number Picker",
    desc: "Cross-platform lottery number generator — configure number range, generate picks, and view stats. Built with Flutter & C++.",
    tags: ["Flutter", "Dart", "C++"],
    icon: "🎱",
    href: "https://lotto.pigsare.pink",
    status: "live",
    analyticsKey: "lotto_picker_link_click",
  },
  {
    name: "Toru Challenge",
    desc: "Hackathon FastAPI backend for jewellery e-commerce — product reviews & queries, Docker + MySQL.",
    tags: ["FastAPI", "Docker", "MySQL"],
    img: ToruLogoUrl,
    href: "https://github.com/asa-masterson/toru-backend",
    status: "oss",
    analyticsKey: "github_link_click",
  },
];

const browserGames: Project[] = [
  {
    name: "Dot Chomper",
    desc: "Eat all the dots, grab power pellets to chase ghosts. Keyboard on desktop, d-pad on mobile. Submit your score to the global leaderboard.",
    tags: ["React", "Canvas API", "Leaderboard"],
    icon: "👻",
    href: "/pacman/",
    status: "live",
    analyticsKey: "pacman_link_click",
  },
  {
    name: "Paddle Battle",
    desc: "1 player vs AI or 2 player local. Keyboard on desktop, touch on mobile.",
    tags: ["React", "Canvas API"],
    icon: "🏓",
    href: "/pong/",
    status: "live",
    analyticsKey: "pong_link_click",
  },
  {
    name: "2048",
    desc: "Slide tiles to reach 2048. Arrow keys or WASD on desktop, swipe on mobile. Submit your score to the global leaderboard.",
    tags: ["React", "TypeScript", "Leaderboard"],
    icon: "🟪",
    href: "/2048/",
    status: "live",
    analyticsKey: "game2048_link_click",
  },
];

// ─── sub-components ───────────────────────────────────────────────────────────

const statusLabel: Record<Status, string> = {
  live: "Live",
  wip: "WIP",
  oss: "Open source",
};

function ProjectCard({ p }: { p: Project }) {
  const badgeClass =
    p.status === "live"
      ? "sq-card-badge sq-card-badge-live"
      : p.status === "oss"
        ? "sq-card-badge sq-card-badge-oss"
        : "sq-card-badge sq-card-badge-wip";

  const inner = (
    <>
      {p.img ? (
        <img alt={p.name} className="sq-card-thumb" src={p.img} />
      ) : (
        <div className="sq-card-icon">{p.icon}</div>
      )}
      <span className={badgeClass}>{statusLabel[p.status]}</span>
      <div className="sq-card-body">
        <p className="sq-card-name">{p.name}</p>
        <p className="sq-card-desc">{p.desc}</p>
      </div>
      {p.tags.length > 0 && (
        <div className="sq-card-footer">
          {p.tags.map((t) => (
            <span key={t} className={`sq-card-tag${t === "Leaderboard" ? " sq-card-tag-leaderboard" : ""}`}>
              {t === "Leaderboard" ? "🏆 " : ""}{t}
            </span>
          ))}
        </div>
      )}
    </>
  );

  const cardClass = `sq-card${p.status === "wip" ? " sq-card-wip" : ""}`;

  if (p.href) {
    return (
      <a
        className={cardClass}
        href={p.href}
        rel="noopener noreferrer"
        target="_blank"
        onClick={() =>
          p.analyticsKey &&
          trackCustomEvent(p.analyticsKey, { location: "projects_page" })
        }
      >
        {inner}
      </a>
    );
  }

  return <div className={cardClass}>{inner}</div>;
}

function Section({
  id,
  eyebrow,
  titleOutline,
  titleSolid,
  sub,
  projects,
}: {
  id?: string;
  eyebrow: string;
  titleOutline: string;
  titleSolid: string;
  sub: string;
  projects: Project[];
}) {
  return (
    <>
      <div className="section-divider" />
      {id && <div id={id} style={{ scrollMarginTop: "80px" }} />}
      <div className="section-wrap">
        <div className="section-header">
          <p className="section-eyebrow">{eyebrow}</p>
          <h2 className="section-title">
            <span className="section-title-outline">{titleOutline} </span>
            <span className="section-title-solid">{titleSolid}</span>
          </h2>
          <p className="section-sub">{sub}</p>
        </div>
        <div className="sq-grid">
          {projects.map((p) => (
            <ProjectCard key={p.name} p={p} />
          ))}
        </div>
      </div>
    </>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function ProjectsPage() {
  useTrackPageReadBottom("projects");

  return (
    <DefaultLayout>
      <SEOHead meta={pageMeta.projects} />
      <style>{pageStyles}</style>

      <div className="proj-hub-hero">
        <p className="proj-hub-eyebrow">Projects & Games</p>
        <h1 className="proj-hub-title">
          <span className="proj-hub-title-outline">What I've</span>
          <span className="proj-hub-title-solid">Built.</span>
        </h1>
        <p className="proj-hub-sub">
          A hub for everything I've shipped — web apps, browser games, tools,
          and experiments. Most things live on GitHub; some are self-hosted on
          my own infrastructure.
        </p>
      </div>

      <Section
        id="web"
        eyebrow="01 · Web"
        projects={webProjects}
        sub="Full-stack web apps, APIs, and sites."
        titleOutline="Web"
        titleSolid="Projects."
      />

      <Section
        id="games"
        eyebrow="02 · Games"
        projects={browserGames}
        sub="Browser games — playable on mobile & desktop."
        titleOutline="Mobile &"
        titleSolid="Desktop Games."
      />

      <div className="section-divider" style={{ marginBottom: "3rem" }} />
    </DefaultLayout>
  );
}
