export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Asa Masterson",
  description:
    "University student & aspiring software developer based in Oxford, UK.",
  navItems: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about/" },
    { label: "Projects", href: "/projects/#web" },
    { label: "Games", href: "/projects/#games" },
  ],
  navMenuItems: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about/" },
    { label: "Projects", href: "/projects/#web" },
    { label: "Games", href: "/projects/#games" },
  ],
  links: {
    email: "mailto:contact@asamasterson.com",
    github: "https://github.com/asa-masterson",
    twitter: "https://twitter.com/pigsarepinkk",
    linkedin: "https://www.linkedin.com/in/asa-masterson/",
    instagram: "https://www.instagram.com/asa_the_apricot/",
    pigsarepink:
      "https://pigsare.pink/?utm_source=asamasterson.com&utm_medium=referral&utm_campaign=hero",
  },
};
