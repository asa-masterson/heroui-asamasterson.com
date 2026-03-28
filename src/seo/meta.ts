/**
 * Central SEO configuration for asamasterson.com.
 * Import pageMeta and call useSEO() in each page component.
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
const DEFAULT_IMAGE = "https://minio-s3.bigfluffy.monster/pigsare-pink/assets/og-image.png";

export const pageMeta: Record<string, PageMeta> = {
  home: {
    title: "Asa Masterson — Software Developer",
    description:
      "Asa Masterson is a BSc Business Computing student at the University of Northampton and a full-stack software developer based in the UK. Experienced in Python, React, Docker, and self-hosted infrastructure.",
    canonical: `${BASE_URL}/`,
    ogTitle: "Asa Masterson — Software Developer",
    ogDescription:
      "BSc Business Computing student and full-stack developer. Python, React, Docker, self-hosted infrastructure.",
    ogImage: DEFAULT_IMAGE,
    ogType: "website",
  },
  about: {
    title: "About Asa Masterson — Background & Skills",
    description:
      "Learn more about Asa Masterson: his education at the University of Northampton, T-Level studies at Activate Learning, work history, and technical skills as a full-stack developer.",
    canonical: `${BASE_URL}/about`,
    ogTitle: "About Asa Masterson — Background & Skills",
    ogDescription:
      "Education, work experience, and technical skills of Asa Masterson — full-stack developer and BSc Business Computing student.",
    ogImage: DEFAULT_IMAGE,
    ogType: "profile",
  },
};
