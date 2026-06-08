import type { PageMeta } from "@/seo/meta";

import { Head } from "vite-react-ssg";

type SEOHeadProps = {
  meta: PageMeta;
  schema?: Record<string, unknown>;
};

export default function SEOHead({ meta, schema }: SEOHeadProps) {
  const {
    title,
    description,
    canonical,
    ogTitle,
    ogDescription,
    ogImage,
    ogType = "website",
    schema: metaSchema,
  } = meta;

  const resolvedSchema = schema ?? metaSchema;

  return (
    <Head>
      <title>{title}</title>
      <meta content={description} name="description" />
      <meta content="index, follow" name="robots" />
      <link href={canonical} rel="canonical" />

      <meta content={ogTitle ?? title} property="og:title" />
      <meta content={ogDescription ?? description} property="og:description" />
      <meta content={canonical} property="og:url" />
      <meta content={ogType} property="og:type" />
      <meta content="Asa Masterson" property="og:site_name" />
      {ogImage ? <meta content={ogImage} property="og:image" /> : null}

      <meta content="summary_large_image" name="twitter:card" />
      <meta content="@pigsarepinkk" name="twitter:site" />
      <meta content={ogTitle ?? title} name="twitter:title" />
      <meta content={ogDescription ?? description} name="twitter:description" />
      {ogImage ? <meta content={ogImage} name="twitter:image" /> : null}

      {resolvedSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(resolvedSchema) }}
        />
      )}
    </Head>
  );
}
