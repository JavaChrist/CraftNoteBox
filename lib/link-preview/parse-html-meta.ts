import { resolveUrlMaybeRelative } from "@/lib/link-preview/is-url-safe";

function decodeBasicEntities(s: string): string {
  return s
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'");
}

function readAttr(tag: string, name: string): string | undefined {
  const re = new RegExp(
    `\\b${name}=["']([^"']*)["']`,
    "i",
  );
  return tag.match(re)?.[1];
}

export type LinkPreviewMeta = {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
};

/**
 * Extraction légère og/twitter/<title> sans parseur HTML complet (MVP).
 */
export function parseLinkPreviewMeta(
  html: string,
  pageUrl: string,
): LinkPreviewMeta {
  const meta: LinkPreviewMeta = {};
  const tags = html.match(/<meta[^>]+>/gi) ?? [];
  const props: Record<string, string> = {};

  for (const tag of tags) {
    const property =
      readAttr(tag, "property") ?? readAttr(tag, "name");
    const content = readAttr(tag, "content");
    if (property && content !== undefined) {
      props[property.toLowerCase().trim()] = decodeBasicEntities(content);
    }
  }

  const ogTitle = props["og:title"] ?? props["twitter:title"];
  const ogDesc =
    props["og:description"] ?? props["twitter:description"] ?? props["description"];
  const ogImageRaw =
    props["og:image"] ?? props["twitter:image"] ?? props["twitter:image:src"];
  const ogSite = props["og:site_name"];

  if (ogTitle) meta.title = ogTitle.trim();
  if (ogDesc) meta.description = ogDesc.trim();
  if (ogSite) meta.siteName = ogSite.trim();

  if (ogImageRaw) {
    const abs = resolveUrlMaybeRelative(ogImageRaw, pageUrl);
    if (abs) meta.image = abs;
  }

  if (!meta.title) {
    const m = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    if (m?.[1]) meta.title = decodeBasicEntities(m[1]).trim();
  }

  if (!meta.siteName) {
    try {
      meta.siteName = new URL(pageUrl).hostname.replace(/^www\./, "");
    } catch {
      /* ignore */
    }
  }

  return meta;
}
