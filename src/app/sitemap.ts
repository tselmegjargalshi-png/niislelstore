import type { MetadataRoute } from "next";
import { categories, seedProductIndex } from "@/lib/data/catalog";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: SITE.url, lastModified: now, priority: 1 },
    { url: `${SITE.url}/products`, lastModified: now, priority: 0.9 },
    { url: `${SITE.url}/help`, lastModified: now, priority: 0.4 },
    { url: `${SITE.url}/track`, lastModified: now, priority: 0.3 },
    ...categories.map((c) => ({ url: `${SITE.url}/products?category=${c.slug}`, lastModified: now, priority: 0.7 })),
    ...seedProductIndex.map((p) => ({ url: `${SITE.url}/products/${p.slug}`, lastModified: now, priority: 0.8 })),
  ];
}
