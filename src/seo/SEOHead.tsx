import { Helmet } from "react-helmet-async";
import { type PageMeta } from "./meta";

interface SEOHeadProps {
  meta: PageMeta;
}

/**
 * Drop <SEOHead meta={pageMeta.home} /> at the top of any page component.
 * react-helmet-async hoists all tags into <head> — fully crawlable after
 * pre-rendering (vite-plugin-ssg) or SSR.
 */
export default function SEOHead({ meta }: SEOHeadProps) {
  return (
    <Helmet>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <link rel="canonical" href={meta.canonical} />

      {/* Open Graph */}
      <meta property="og:type"        content={meta.ogType ?? "website"} />
      <meta property="og:url"         content={meta.canonical} />
      <meta property="og:title"       content={meta.ogTitle ?? meta.title} />
      <meta property="og:description" content={meta.ogDescription ?? meta.description} />
      {meta.ogImage && <meta property="og:image" content={meta.ogImage} />}

      {/* Twitter */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:url"         content={meta.canonical} />
      <meta name="twitter:title"       content={meta.ogTitle ?? meta.title} />
      <meta name="twitter:description" content={meta.ogDescription ?? meta.description} />
      {meta.ogImage && <meta name="twitter:image" content={meta.ogImage} />}
    </Helmet>
  );
}
