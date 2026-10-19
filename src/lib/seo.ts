import type { DetailedHTMLProps, LinkHTMLAttributes, MetaHTMLAttributes } from "react";

/** Meta tag shape accepted by a route's `head` callback. */
export type HeadMeta = DetailedHTMLProps<MetaHTMLAttributes<HTMLMetaElement>, HTMLMetaElement>;

/** Link tag shape accepted by a route's `head` callback. */
export type HeadLink = DetailedHTMLProps<LinkHTMLAttributes<HTMLLinkElement>, HTMLLinkElement>;

/**
 * Canonical origin used to build absolute URLs for `og:url`, `twitter:url`
 * and the canonical link. Override it per environment with `VITE_SITE_URL`.
 */
const SITE_URL = (import.meta.env.VITE_SITE_URL ?? "https://coss-ui-playground.vercel.app").replace(
  /\/+$/,
  "",
);

export interface SeoOptions {
  /** Used for `<title>`, `og:title` and `twitter:title`. */
  title: string;
  /** Used for `meta[name=description]`, `og:description` and `twitter:description`. */
  description: string;
  /** Route path (e.g. `/about`). Defaults to the matched route's pathname. */
  path?: string;
  /** Absolute or root-relative share image. Adds `og:image`/`twitter:image` and upgrades the card to `summary_large_image`. */
  image?: string;
  /** `og:type`, defaults to `website`. */
  type?: string;
}

function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

/** Builds the full list of SEO `meta` tags for a page. */
export function seoMeta({
  title,
  description,
  path = "/",
  image,
  type = "website",
}: SeoOptions): HeadMeta[] {
  const url = absoluteUrl(path);
  const imageUrl = image ? absoluteUrl(image) : undefined;

  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:type", content: type },
    ...(imageUrl ? [{ property: "og:image", content: imageUrl }] : []),
    { name: "twitter:card", content: imageUrl ? "summary_large_image" : "summary" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    ...(imageUrl ? [{ name: "twitter:image", content: imageUrl }] : []),
  ];
}

/**
 * Returns a route `head` callback, so a page only declares its title and
 * description:
 *
 * ```tsx
 * export const Route = createFileRoute("/about")({
 *   component: About,
 *   head: seo({ title: "About", description: "..." }),
 * });
 * ```
 *
 * `og:url` and the canonical link are derived from the matched pathname
 * automatically unless `path` is given explicitly.
 */
export function seo(options: SeoOptions) {
  return ({ match }: { match: { pathname: string } }) => {
    const path = options.path ?? match.pathname;

    return {
      meta: seoMeta({ ...options, path }),
      links: [{ rel: "canonical", href: absoluteUrl(path) }] satisfies HeadLink[],
    };
  };
}
