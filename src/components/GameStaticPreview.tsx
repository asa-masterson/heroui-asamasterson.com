import type { PageMeta } from "@/seo/meta";
import SEOHead from "@/seo/SEOHead";
import { Navbar } from "@/components/navbar";

interface Props {
  meta: PageMeta;
  title: string;
  description: string;
  tags?: string[];
}

export default function GameStaticPreview({ meta, title, description, tags }: Props) {
  return (
    <>
      <SEOHead meta={meta} />
      <div style={{ minHeight: "100vh", background: "#0d0d0d", color: "#fff", display: "flex", flexDirection: "column" }}>
        <Navbar />
        <main style={{ maxWidth: "640px", margin: "0 auto", padding: "4rem 1.5rem 3rem", width: "100%" }}>
          <p style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "0.65rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#ff54ff",
            marginBottom: "0.75rem",
          }}>
            Browser Game · asamasterson.com
          </p>
          <h1 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: "clamp(2rem, 7vw, 3.5rem)",
            lineHeight: 1.05,
            marginBottom: "1.25rem",
            color: "#fff",
          }}>
            {title}
          </h1>
          <p style={{
            lineHeight: 1.75,
            color: "rgba(255,255,255,0.65)",
            fontSize: "1rem",
            marginBottom: "1.5rem",
            maxWidth: "520px",
          }}>
            {description}
          </p>
          {tags && tags.length > 0 && (
            <p style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.62rem",
              color: "rgba(255,84,255,0.55)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: "2.5rem",
            }}>
              {tags.join(" · ")}
            </p>
          )}
          <a href="/projects/" style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "0.6rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "rgba(255,84,255,0.45)",
            textDecoration: "none",
          }}>
            ← Back to Projects
          </a>
        </main>
      </div>
    </>
  );
}
