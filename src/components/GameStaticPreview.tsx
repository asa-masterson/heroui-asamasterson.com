import type { PageMeta } from "@/seo/meta";
import SEOHead from "@/seo/SEOHead";
import { Navbar } from "@/components/navbar";

interface Props {
  meta: PageMeta;
  title: string;
  description: string;
  tags?: string[];
}

// sr-only: content present in DOM for crawlers/AI search, invisible to sighted users.
const srOnly: React.CSSProperties = {
  position: "absolute",
  width: 1, height: 1,
  padding: 0, margin: -1,
  overflow: "hidden",
  clip: "rect(0,0,0,0)",
  whiteSpace: "nowrap",
  border: 0,
};

export default function GameStaticPreview({ meta, title, description, tags }: Props) {
  return (
    <>
      <SEOHead meta={meta} />
      {/* Dark background matching game pages — no visible flash for users */}
      <div style={{ minHeight: "100vh", background: "#0d0d0d", display: "flex", flexDirection: "column" }}>
        <Navbar />
        {/* Visually hidden but DOM-present for crawlers and AI search indexing */}
        <span style={srOnly}>
          {title}. {description}{tags && tags.length > 0 ? ` Tags: ${tags.join(", ")}.` : ""}
          {" "}A browser game by Asa Masterson — asamasterson.com.
        </span>
      </div>
    </>
  );
}
