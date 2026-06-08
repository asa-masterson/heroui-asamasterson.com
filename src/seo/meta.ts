/**
 * Central SEO configuration for asamasterson.com.
 * Drop <SEOHead meta={pageMeta.home} /> at the top of each page component.
 */

export interface PageMeta {
  title: string;
  description: string;
  canonical: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  schema?: Record<string, unknown>;
  cfType?: string;
  cfSection?: string;
  cfSlug?: string;
}

const BASE_URL = "https://asamasterson.com";

// Home page — pig OG image (brand-forward, memorable share card)
const HOME_IMAGE =
  "https://minio-s3.bigfluffy.monster/pigsare-pink/assets/og-image.png";

// About page — college photo (personal, context-relevant share card)
const ABOUT_IMAGE =
  "https://minio-s3.bigfluffy.monster/pigsare-pink/assets/asa-about-og.png";

const AUTHOR = {
  "@type": "Person",
  name: "Asa Masterson",
  url: BASE_URL,
  sameAs: [
    "https://github.com/asa-masterson",
    "https://www.linkedin.com/in/asa-masterson/",
    "https://twitter.com/pigsarepinkk",
    "https://pigsare.pink",
  ],
};

export const pageMeta: Record<string, PageMeta> = {
  home: {
    title: "Asa Masterson — Software Developer",
    description:
      "Asa Masterson is a BSc Business Computing student at the University of Northampton and a full-stack software developer based in Oxford, UK. Experienced in Python, React, Docker, and self-hosted infrastructure.",
    canonical: `${BASE_URL}/`,
    ogTitle: "Asa Masterson — Software Developer",
    ogDescription:
      "BSc Business Computing student and full-stack developer. Python, React, Docker, self-hosted infrastructure.",
    ogImage: HOME_IMAGE,
    ogType: "website",
    cfType: "portfolio",
    cfSection: "home",
    cfSlug: "home",
    schema: {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Asa Masterson",
      url: BASE_URL,
      description:
        "BSc Business Computing student and full-stack software developer based in Oxford, UK. Experienced in Python, React, Docker, and self-hosted infrastructure.",
      jobTitle: "Software Developer",
      alumniOf: { "@type": "EducationalOrganization", name: "University of Northampton" },
      knowsAbout: ["Python", "React", "Docker", "FastAPI", "Flutter", "TypeScript", "Rust"],
      sameAs: AUTHOR.sameAs,
    },
  },
  about: {
    title: "About Asa Masterson — Background & Skills",
    description:
      "Learn more about Asa Masterson: his education at the University of Northampton, T-Level studies at Activate Learning, work history, and technical skills as a full-stack developer based in Oxford, UK.",
    canonical: `${BASE_URL}/about/`,
    ogTitle: "About Asa Masterson — Background & Skills",
    ogDescription:
      "Education, work experience, and technical skills of Asa Masterson — full-stack developer and BSc Business Computing student.",
    ogImage: ABOUT_IMAGE,
    ogType: "profile",
    cfType: "about",
    cfSection: "about",
    cfSlug: "about",
    schema: {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      name: "About Asa Masterson",
      url: `${BASE_URL}/about/`,
      description:
        "Background, education, work history, and technical skills of Asa Masterson — full-stack developer and BSc Business Computing student.",
      mainEntity: {
        ...AUTHOR,
        jobTitle: "Software Developer",
        alumniOf: { "@type": "EducationalOrganization", name: "University of Northampton" },
      },
    },
  },
  projects: {
    title: "Projects & Games — Asa Masterson",
    description:
      "A hub for everything Asa Masterson has shipped — web apps, browser games, tools, and experiments. Python, React, FastAPI, Docker, and more.",
    canonical: `${BASE_URL}/projects/`,
    ogTitle: "Projects & Games — Asa Masterson",
    ogDescription:
      "Web apps, browser games, tools, and experiments by Asa Masterson — full-stack developer and BSc Business Computing student.",
    ogImage: HOME_IMAGE,
    ogType: "website",
    cfType: "projects",
    cfSection: "projects",
    cfSlug: "projects",
    schema: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Projects & Games — Asa Masterson",
      url: `${BASE_URL}/projects/`,
      description:
        "Web apps, browser games, tools, and open-source experiments by Asa Masterson.",
      author: AUTHOR,
      hasPart: [
        { "@type": "WebSite", name: "pigsare.pink", url: "https://pigsare.pink" },
        { "@type": "WebSite", name: "asamasterson.com", url: BASE_URL },
        { "@type": "SoftwareApplication", name: "PageViews Counter", url: "https://github.com/asa-masterson/fastapi-redis-counter", applicationCategory: "DeveloperApplication" },
        { "@type": "SoftwareApplication", name: "Lotto Number Picker", url: "https://lotto.pigsare.pink", applicationCategory: "UtilitiesApplication" },
        { "@type": "SoftwareApplication", name: "Toru Challenge", url: "https://github.com/asa-masterson/toru-backend", applicationCategory: "DeveloperApplication" },
        { "@type": "VideoGame", name: "Dot Chomper", url: `${BASE_URL}/pacman/` },
        { "@type": "VideoGame", name: "Paddle Battle", url: `${BASE_URL}/pong/` },
        { "@type": "VideoGame", name: "2048", url: `${BASE_URL}/2048/` },
      ],
    },
  },
  pacman: {
    title: "Dot Chomper — Asa Masterson",
    description:
      "Play Dot Chomper! Eat all the dots, avoid ghosts, and grab power pellets to turn the tables. Arrow keys or WASD on desktop, d-pad on mobile.",
    canonical: `${BASE_URL}/pacman/`,
    ogTitle: "Dot Chomper — Play in your browser",
    ogDescription:
      "Dot Chomper — dots, power pellets, and four ghosts. Desktop keyboard + mobile d-pad.",
    ogImage: HOME_IMAGE,
    ogType: "website",
    cfType: "game",
    cfSection: "games",
    cfSlug: "pacman",
    schema: {
      "@context": "https://schema.org",
      "@type": "VideoGame",
      name: "Dot Chomper",
      url: `${BASE_URL}/pacman/`,
      description:
        "Browser-based maze game — eat all the dots, grab power pellets to chase ghosts. Playable on desktop (keyboard/WASD) and mobile (d-pad).",
      applicationCategory: "GameApplication",
      operatingSystem: "Web Browser",
      playMode: "SinglePlayer",
      genre: "Arcade",
      gamePlatform: ["Desktop", "Mobile"],
      author: AUTHOR,
    },
  },
  pong: {
    title: "Paddle Battle — Asa Masterson",
    description:
      "Play Paddle Battle! 1-player vs AI or 2-player local mode. Works on desktop (keyboard) and mobile (touch).",
    canonical: `${BASE_URL}/pong/`,
    ogTitle: "Paddle Battle — Play in your browser",
    ogDescription:
      "Paddle Battle with 1P AI and 2P modes. Desktop keyboard + mobile touch controls.",
    ogImage: HOME_IMAGE,
    ogType: "website",
    cfType: "game",
    cfSection: "games",
    cfSlug: "pong",
    schema: {
      "@context": "https://schema.org",
      "@type": "VideoGame",
      name: "Paddle Battle",
      url: `${BASE_URL}/pong/`,
      description:
        "Browser-based paddle game — 1 player vs AI or 2-player local. Desktop keyboard and mobile touch controls.",
      applicationCategory: "GameApplication",
      operatingSystem: "Web Browser",
      playMode: ["SinglePlayer", "MultiPlayer"],
      numberOfPlayers: { "@type": "QuantitativeValue", minValue: 1, maxValue: 2 },
      genre: "Arcade",
      gamePlatform: ["Desktop", "Mobile"],
      author: AUTHOR,
    },
  },
  game2048: {
    title: "2048 — Asa Masterson",
    description:
      "Play 2048! Slide tiles to reach the 2048 tile. Works on desktop (arrow keys / WASD) and mobile (swipe).",
    canonical: `${BASE_URL}/2048/`,
    ogTitle: "2048 — Play in your browser",
    ogDescription: "2048 puzzle game. Arrow keys on desktop, swipe on mobile. Scores saved locally.",
    ogImage: HOME_IMAGE,
    ogType: "website",
    cfType: "game",
    cfSection: "games",
    cfSlug: "2048",
    schema: {
      "@context": "https://schema.org",
      "@type": "VideoGame",
      name: "2048",
      url: `${BASE_URL}/2048/`,
      description:
        "Browser-based tile puzzle game — slide tiles to combine them and reach 2048. Arrow keys or WASD on desktop, swipe on mobile. Best score saved locally.",
      applicationCategory: "GameApplication",
      operatingSystem: "Web Browser",
      playMode: "SinglePlayer",
      genre: "Puzzle",
      gamePlatform: ["Desktop", "Mobile"],
      author: AUTHOR,
    },
  },
};
