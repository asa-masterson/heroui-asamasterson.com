import { Link } from "@heroui/link";
import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
} from "@heroui/navbar";
import { link as linkStyles } from "@heroui/theme";
import clsx from "clsx";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { GithubIcon } from "@/components/icons";
import PigSvg from "../images/nathan-pig.svg";

const navbarStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&display=swap');
  .nav-brand-name {
    font-family: 'DM Serif Display', serif;
    font-size: 1.15rem;
    letter-spacing: -0.01em;
    line-height: 1;
  }
  .nav-brand-last { color: #ff54ff; }
`;

// All icons accept className so currentColor / text-default-500 flows through
const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" height="22" viewBox="0 0 24 24" width="22">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" fill="currentColor" />
    <rect fill="currentColor" height="12" width="4" x="2" y="9" />
    <circle cx="4" cy="4" fill="currentColor" r="2" />
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" height="22" viewBox="0 0 24 24" width="22">
    <rect height="18" rx="5" ry="5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" width="18" x="3" y="3" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    <line stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const MailIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" height="22" viewBox="0 0 24 24" width="22">
    <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4.7-8 5.334L4 8.7V6.297l8 5.333 8-5.333V8.7z" />
  </svg>
);

export const Navbar = () => {
  return (
    <>
      <style>{navbarStyles}</style>
      <HeroUINavbar maxWidth="xl" position="sticky">

        {/* ── Brand + nav links ── */}
        <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
          <NavbarBrand className="gap-2 max-w-fit">
            <Link className="flex justify-start items-center gap-2" color="foreground" href="/">
              <img alt="pig mascot" src={PigSvg} style={{ width: 28, height: 28 }} />
              <span className="nav-brand-name">
                Asa <span className="nav-brand-last">Masterson</span>
              </span>
            </Link>
          </NavbarBrand>

          <div className="hidden lg:flex gap-4 justify-start ml-4">
            {siteConfig.navItems.map((item) => (
              <NavbarItem key={item.href}>
                <Link
                  className={clsx(
                    linkStyles({ color: "foreground" }),
                    "data-[active=true]:text-primary data-[active=true]:font-medium text-sm",
                  )}
                  color="foreground"
                  href={item.href}
                >
                  {item.label}
                </Link>
              </NavbarItem>
            ))}
          </div>
        </NavbarContent>

        {/* ── Social icons (desktop) ── */}
        <NavbarContent className="hidden sm:flex basis-1/5 sm:basis-full" justify="end">
          <NavbarItem className="hidden sm:flex gap-3 items-center">
            <Link isExternal aria-label="Mail" href={siteConfig.links.email}>
              <MailIcon className="text-default-500 hover:text-default-800 transition-colors" />
            </Link>
            <Link isExternal aria-label="LinkedIn" href={siteConfig.links.linkedin}>
              <LinkedInIcon className="text-default-500 hover:text-default-800 transition-colors" />
            </Link>
            <Link isExternal aria-label="GitHub" href={siteConfig.links.github}>
              <GithubIcon className="text-default-500 hover:text-default-800 transition-colors" />
            </Link>
            <Link isExternal aria-label="Instagram" href={siteConfig.links.instagram}>
              <InstagramIcon className="text-default-500 hover:text-default-800 transition-colors" />
            </Link>
            <ThemeSwitch />
          </NavbarItem>
        </NavbarContent>

        {/* ── Mobile ── */}
        <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
          <Link isExternal href={siteConfig.links.github}>
            <GithubIcon className="text-default-500" />
          </Link>
          <ThemeSwitch />
          <NavbarMenuToggle />
        </NavbarContent>

        <NavbarMenu>
          <div className="mx-4 mt-2 flex flex-col gap-2">
            {siteConfig.navMenuItems.map((item, index) => (
              <NavbarMenuItem key={`${item.label}-${index}`}>
                <Link color="foreground" href={item.href} size="lg">
                  {item.label}
                </Link>
              </NavbarMenuItem>
            ))}
          </div>
        </NavbarMenu>

      </HeroUINavbar>
    </>
  );
};