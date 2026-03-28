import { Head } from "vite-react-ssg";
import type { PageMeta } from "@/seo/meta";

type SEOHeadProps = {
  meta: PageMeta;
};

export default function SEOHead({ meta }: SEOHeadProps) {
  const {
    title,
    description,
    canonical,
    ogTitle,
    ogDescription,
    ogImage,
    ogType = "website",
  } = meta;

  return (
    <Head>
      <title>{title}</title>
      <meta content={description} name="description" />
      <link href={canonical} rel="canonical" />

      <meta content={ogTitle ?? title} property="og:title" />
      <meta content={ogDescription ?? description} property="og:description" />
      <meta content={canonical} property="og:url" />
      <meta content={ogType} property="og:type" />
      {ogImage ? <meta content={ogImage} property="og:image" /> : null}

      <meta content="summary_large_image" name="twitter:card" />
      <meta content={ogTitle ?? title} name="twitter:title" />
      <meta content={ogDescription ?? description} name="twitter:description" />
      {ogImage ? <meta content={ogImage} name="twitter:image" /> : null}
    </Head>
  );
}
