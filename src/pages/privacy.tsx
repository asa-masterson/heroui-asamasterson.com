import DefaultLayout from "@/layouts/default";
import SEOHead from "@/seo/SEOHead";

const pageStyles = `
  .legal-wrap {
    max-width: 720px;
    margin: 0 auto;
    padding: 3rem 1.5rem 5rem;
  }
  .legal-eyebrow {
    font-family: 'DM Mono', monospace;
    font-size: 0.7rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #ff54ff;
    margin-bottom: 1rem;
  }
  .legal-title {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(2rem, 6vw, 3.5rem);
    line-height: 1;
    letter-spacing: -0.02em;
    margin: 0 0 0.5rem;
  }
  .legal-updated {
    font-family: 'DM Mono', monospace;
    font-size: 0.68rem;
    letter-spacing: 0.06em;
    color: var(--muted);
    margin-bottom: 3rem;
  }
  .legal-section { margin-bottom: 2.5rem; }
  .legal-section h2 {
    font-family: 'DM Serif Display', serif;
    font-size: 1.2rem;
    margin: 0 0 0.75rem;
  }
  .legal-section p, .legal-section li {
    font-family: 'DM Mono', monospace;
    font-size: 0.78rem;
    letter-spacing: 0.02em;
    line-height: 1.8;
    color: var(--muted);
  }
  .legal-section ul { padding-left: 1.25rem; margin: 0.5rem 0; }
  .legal-section a { color: #ff54ff; text-decoration: none; }
  .legal-section a:hover { text-decoration: underline; }
`;

const privacyMeta = {
  title: "Privacy Policy — Asa Masterson",
  description: "How asamasterson.com handles your data — analytics, cookies, and third-party services.",
  canonical: "https://asamasterson.com/privacy/",
  ogTitle: "Privacy Policy — Asa Masterson",
  ogDescription: "How asamasterson.com handles your data.",
  ogType: "website" as const,
  ogUrl: "https://asamasterson.com/privacy/",
};

export default function PrivacyPage() {
  return (
    <DefaultLayout>
      <SEOHead meta={privacyMeta} />
      <style>{pageStyles}</style>
      <div className="legal-wrap">
        <p className="legal-eyebrow">Legal</p>
        <h1 className="legal-title">Privacy Policy</h1>
        <p className="legal-updated">Last updated: June 2025</p>

        <div className="legal-section">
          <h2>Overview</h2>
          <p>
            asamasterson.com is a personal portfolio site. I take privacy seriously
            and aim to collect as little data as possible. This page explains what
            is collected and why.
          </p>
        </div>

        <div className="legal-section">
          <h2>Analytics</h2>
          <p>
            This site uses two self-hosted analytics tools, both running on my
            own infrastructure — no data is sent to third-party analytics clouds.
          </p>
          <ul>
            <li>
              <strong>Swetrix</strong> — an open-source, privacy-focused analytics
              platform self-hosted on my own server. It tracks page views and
              custom interaction events (e.g. which links are clicked). Swetrix
              does not fingerprint users, does not use cookies, and does not share
              data with anyone. All data stays on my infrastructure.
            </li>
            <li>
              <strong>Page-view counter</strong> — a lightweight self-hosted
              counter that tallies total site visits. No personal data or IP
              addresses are stored.
            </li>
          </ul>
          <p>
            No Google Analytics, Meta Pixel, or similar third-party tracking is
            used on this site.
          </p>
        </div>

        <div className="legal-section">
          <h2>Fonts</h2>
          <p>
            Fonts are loaded via{" "}
            <a href="https://fonts.coollabs.io" rel="noopener noreferrer" target="_blank">
              Coolify's privacy-friendly Google Fonts proxy
            </a>
            . Your IP address is not sent to Google.
          </p>
        </div>

        <div className="legal-section">
          <h2>Search</h2>
          <p>
            The site search widget is powered by Cloudflare AI Search. When you
            use search, your query is processed by Cloudflare in accordance with
            their{" "}
            <a href="https://www.cloudflare.com/privacypolicy/" rel="noopener noreferrer" target="_blank">
              privacy policy
            </a>
            .
          </p>
        </div>

        <div className="legal-section">
          <h2>Site Status</h2>
          <p>
            The status widget in the footer is served by BetterStack. Loading this
            widget may result in a request to BetterStack's servers. See their{" "}
            <a href="https://betterstack.com/privacy" rel="noopener noreferrer" target="_blank">
              privacy policy
            </a>{" "}
            for details.
          </p>
        </div>

        <div className="legal-section">
          <h2>Cookies</h2>
          <p>This site does not use cookies for tracking or advertising.</p>
        </div>

        <div className="legal-section">
          <h2>CAPTCHA (Cloudflare Turnstile)</h2>
          <p>
            When submitting a score to a game leaderboard, a{" "}
            <a href="https://www.cloudflare.com/products/turnstile/" rel="noopener noreferrer" target="_blank">
              Cloudflare Turnstile
            </a>{" "}
            challenge is used to verify you are human and prevent spam. Turnstile
            is a privacy-preserving alternative to traditional CAPTCHAs — it does
            not track you across sites or serve ads. The challenge script is loaded
            from Cloudflare and processed according to their{" "}
            <a href="https://www.cloudflare.com/privacypolicy/" rel="noopener noreferrer" target="_blank">
              privacy policy
            </a>
            . It is only active on pages where you choose to submit a leaderboard
            score; it is not loaded anywhere else on the site.
          </p>
        </div>

        <div className="legal-section">
          <h2>Game Leaderboards</h2>
          <p>
            Some games feature optional global leaderboards. If you submit a score
            you provide a display name of your choice. No account is required, and
            no personal information beyond the name you enter is stored.
          </p>
        </div>

        <div className="legal-section">
          <h2>Contact</h2>
          <p>
            Questions about privacy? Email{" "}
            <a href="mailto:contact@asamasterson.com">contact@asamasterson.com</a>.
          </p>
        </div>
      </div>
    </DefaultLayout>
  );
}
