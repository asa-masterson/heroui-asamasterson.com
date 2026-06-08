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
}

const BASE_URL = "https://asamasterson.com";

// Home page — pig OG image (brand-forward, memorable share card)
const HOME_IMAGE =
  "https://minio-s3.bigfluffy.monster/pigsare-pink/assets/og-image.png";

// About page — college photo (personal, context-relevant share card)
const ABOUT_IMAGE =
  "https://minio-s3.bigfluffy.monster/pigsare-pink/assets/asa-about-og.png";

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
  },
  game2048: {
    title: "2048 — Asa Masterson",
    description: "Play 2048! Slide tiles to reach the 2048 tile. Works on desktop (arrow keys / WASD) and mobile (swipe).",
    canonical: `${BASE_URL}/2048/`,
    ogTitle: "2048 — Play in your browser",
    ogDescription: "2048 puzzle game. Arrow keys on desktop, swipe on mobile. Scores saved locally.",
    ogImage: HOME_IMAGE,
    ogType: "website",
  },
  pong: {
    title: "Paddle Battle — Asa Masterson",
    description: "Play Paddle Battle! 1-player vs AI or 2-player local mode. Works on desktop (keyboard) and mobile (touch).",
    canonical: `${BASE_URL}/pong/`,
    ogTitle: "Paddle Battle — Play in your browser",
    ogDescription: "Paddle Battle with 1P AI and 2P modes. Desktop keyboard + mobile touch controls.",
    ogImage: HOME_IMAGE,
    ogType: "website",
  },
  pacman: {
    title: "Dot Chomper — Asa Masterson",
    description: "Play Dot Chomper! Eat all the dots, avoid ghosts, and grab power pellets to turn the tables. Arrow keys or WASD on desktop, d-pad on mobile.",
    canonical: `${BASE_URL}/pacman/`,
    ogTitle: "Dot Chomper — Play in your browser",
    ogDescription: "Dot Chomper — dots, power pellets, and four ghosts. Desktop keyboard + mobile d-pad.",
    ogImage: HOME_IMAGE,
    ogType: "website",
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
  },
};
