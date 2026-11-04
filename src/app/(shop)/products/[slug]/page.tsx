import type { Metadata } from "next";
import { ProductDetail } from "@/components/catalog/product-detail";
import { seedProductIndex } from "@/lib/data/catalog";
import { SITE } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return seedProductIndex.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = seedProductIndex.find((x) => x.slug === slug);
  if (!p) return { title: "Бараа" };
  const url = `/products/${slug}`;
  return {
    title: p.name,
    description: p.short,
    alternates: { canonical: url },
    openGraph: { title: `${p.name} · ${SITE.name}`, description: p.short, url, type: "website" },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const p = seedProductIndex.find((x) => x.slug === slug);
  const jsonLd = p && {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.short,
    offers: { "@type": "Offer", priceCurrency: "MNT", price: p.price, availability: "https://schema.org/InStock" },
  };
  return (
    <>
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
      <ProductDetail slug={slug} />
    </>
  );
}
