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
    color: rgba(255,255,255,0.35);
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
    color: rgba(255,255,255,0.6);
  }
  .legal-section ul { padding-left: 1.25rem; margin: 0.5rem 0; }
  .legal-section a { color: #ff54ff; text-decoration: none; }
  .legal-section a:hover { text-decoration: underline; }
`;

const termsMeta = {
  title: "Terms of Use — Asa Masterson",
  description: "Terms governing use of asamasterson.com — personal portfolio and browser games.",
  canonical: "https://asamasterson.com/terms/",
  ogTitle: "Terms of Use — Asa Masterson",
  ogDescription: "Terms governing use of asamasterson.com.",
  ogType: "website" as const,
  ogUrl: "https://asamasterson.com/terms/",
};

export default function TermsPage() {
  return (
    <DefaultLayout>
      <SEOHead meta={termsMeta} />
      <style>{pageStyles}</style>
      <div className="legal-wrap">
        <p className="legal-eyebrow">Legal</p>
        <h1 className="legal-title">Terms of Use</h1>
        <p className="legal-updated">Last updated: June 2025</p>

        <div className="legal-section">
          <h2>About This Site</h2>
          <p>
            asamasterson.com is the personal portfolio of Asa Masterson. By
            accessing or using this site you agree to these terms.
          </p>
        </div>

        <div className="legal-section">
          <h2>Permitted Use</h2>
          <p>You may:</p>
          <ul>
            <li>Browse and read content for personal, non-commercial purposes.</li>
            <li>Play the browser games hosted on this site.</li>
            <li>Link to this site from your own content.</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>Intellectual Property</h2>
          <p>
            All content on this site — code, writing, designs, game logic — is the
            work of Asa Masterson unless otherwise noted. Open-source projects
            linked from this site carry their own licences; check the relevant
            repository.
          </p>
        </div>

        <div className="legal-section">
          <h2>Game Leaderboards</h2>
          <p>
            Leaderboard submissions are voluntary. Submitted display names are
            visible publicly. Do not submit offensive, defamatory, or
            impersonating names — entries may be removed without notice.
          </p>
        </div>

        <div className="legal-section">
          <h2>Disclaimer</h2>
          <p>
            This site is provided as-is for informational and entertainment
            purposes. No warranties of any kind are made regarding availability,
            accuracy, or fitness for any purpose. Asa Masterson is not liable for
            any damages arising from your use of this site.
          </p>
        </div>

        <div className="legal-section">
          <h2>External Links</h2>
          <p>
            Links to third-party sites (GitHub, LinkedIn, etc.) are provided for
            convenience. I have no control over and take no responsibility for
            their content or policies.
          </p>
        </div>

        <div className="legal-section">
          <h2>Changes</h2>
          <p>
            These terms may be updated at any time. Continued use of the site
            after changes constitutes acceptance of the revised terms.
          </p>
        </div>

        <div className="legal-section">
          <h2>Contact</h2>
          <p>
            Questions?{" "}
            <a href="mailto:contact@asamasterson.com">contact@asamasterson.com</a>
          </p>
        </div>
      </div>
    </DefaultLayout>
  );
}
