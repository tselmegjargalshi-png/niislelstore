"use client";
import Link from "next/link";
import { ArrowRight, Gift, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { useStore } from "@/lib/store";
import { ProductArt } from "@/components/product-art";
import { ProductCard, ProductCardSkeleton } from "@/components/product-card";
import { SectionHeading } from "@/components/ui/bits";
import { Newsletter } from "@/components/newsletter";
import type { Banner, Product } from "@/lib/types";

function Row({ title, eyebrow, items, href, ready }: { title: string; eyebrow: string; items: Product[]; href: string; ready: boolean }) {
  return (
    <section className="container-x pt-16 md:pt-24">
      <SectionHeading eyebrow={eyebrow} title={title} action={<Link href={href} className="hidden items-center gap-1 text-sm font-semibold hover:text-[var(--accent)] sm:inline-flex">Бүгдийг үзэх <ArrowRight className="size-4" /></Link>} />
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-x-6">
        {!ready ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />) : items.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
      <Link href={href} className="btn btn-ghost mt-8 w-full sm:hidden">Бүгдийг үзэх</Link>
    </section>
  );
}

function PromoCard({ b }: { b: Banner }) {
  const cls = b.theme === "accent" ? "bg-[var(--accent)] text-[var(--on-accent)]" : b.theme === "dark" ? "bg-[var(--ink)] text-[var(--on-ink)]" : "bg-[var(--surface-3)] text-[var(--text)]";
  return (
    <Link href={b.href} className={`group relative isolate flex min-h-[260px] flex-col justify-end overflow-hidden rounded-3xl p-7 md:min-h-[340px] md:p-9 ${cls}`}>
      <div className="absolute -right-10 top-0 -z-10 h-full w-1/2 opacity-95 transition-transform duration-700 group-hover:scale-105">
        <ProductArt kind={b.art} color={b.theme === "accent" ? "#E9D3B0" : "#B98A5A"} view={2} className="size-full" />
      </div>
      <p className="text-xs font-bold uppercase tracking-[0.14em] opacity-80">{b.eyebrow}</p>
      <h3 className="mt-2 max-w-[14ch] text-2xl md:text-3xl">{b.title}</h3>
      <p className="mt-2 max-w-[28ch] text-sm opacity-80">{b.subtitle}</p>
      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold">{b.cta} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></span>
    </Link>
  );
}

export function Home() {
  const { ready, visibleProducts, categories, banners, delivery } = useStore();
  const hero = banners.find((b) => b.placement === "hero" && b.active) ?? null;
  const promos = banners.filter((b) => b.placement === "promo" && b.active);
  const inStock = (p: Product) => p.stock > 0;
  const featured = visibleProducts.filter((p) => p.tags.includes("featured") && inStock(p)).slice(0, 4);
  const fresh = [...visibleProducts].filter(inStock).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4);
  const best = [...visibleProducts].filter(inStock).sort((a, b) => b.soldCount - a.soldCount).slice(0, 4);
  const offers = visibleProducts.filter((p) => p.compareAtPrice && p.compareAtPrice > p.price && inStock(p)).slice(0, 4);
  const threshold = delivery?.freeShippingThreshold ?? 200000;

  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-[var(--ink)] text-[var(--on-ink)]">
        <div className="container-x grid min-h-[560px] items-center gap-8 py-14 md:min-h-[640px] md:grid-cols-2 md:py-20">
          <div className="anim-rise relative z-10">
            {hero ? (
              <>
                <p className="eyebrow !text-[var(--gold)]">{hero.eyebrow}</p>
                <h1 className="mt-4 whitespace-pre-line text-[2.6rem] leading-[1.05] md:text-6xl">{hero.title}</h1>
                <p className="mt-5 max-w-md text-base text-[var(--on-ink)]/75 md:text-lg">{hero.subtitle}</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href={hero.href} className="btn btn-accent !min-h-12 !px-7">{hero.cta} <ArrowRight className="size-4" /></Link>
                  <Link href="/products?sort=new" className="btn !min-h-12 border border-white/25 text-[var(--on-ink)] hover:bg-white/10">Шинэ бараа</Link>
                </div>
              </>
            ) : (
              <>
                <div className="skeleton h-4 w-40 !bg-white/10" /><div className="skeleton mt-6 h-16 w-4/5 !bg-white/10" /><div className="skeleton mt-4 h-16 w-3/5 !bg-white/10" />
              </>
            )}
            <dl className="mt-12 grid max-w-md grid-cols-3 gap-4 border-t border-white/15 pt-6 text-sm">
              {[["35+", "бүтээгдэхүүн"], ["100%", "Монгол түүхий эд"], ["1 өдөр", "хотод хүргэнэ"]].map(([a, b]) => (
                <div key={b}><dt className="display text-xl font-semibold text-[var(--gold)]">{a}</dt><dd className="text-[var(--on-ink)]/65">{b}</dd></div>
              ))}
            </dl>
          </div>
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md md:max-w-none">
            <div className="absolute inset-4 rounded-[2rem] bg-[var(--gold)]/15 blur-3xl" />
            <div className="relative size-full overflow-hidden rounded-[2rem] border border-white/10 shadow-[var(--shadow-lg)]">
              <ProductArt kind={hero?.art ?? "coat"} color="#B98A5A" view={0} className="size-full" title="Өвлийн цуглуулга" />
            </div>
            <div className="absolute -bottom-4 left-4 right-4 flex items-center gap-3 rounded-2xl bg-[var(--surface)] p-3 text-[var(--text)] shadow-[var(--shadow-lg)] md:left-auto md:right-6 md:w-72">
              <Truck className="size-9 shrink-0 text-[var(--accent)]" />
              <p className="text-sm leading-snug"><b className="block">Үнэгүй хүргэлт</b>{`Улаанбаатарт ${(threshold / 1000).toLocaleString("en-US")} мянган төгрөгөөс дээш`}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ТҮЛХҮҮР ДАВУУ ТАЛ */}
      <section className="border-b border-[var(--line)] bg-[var(--surface)]">
        <ul className="container-x grid grid-cols-2 gap-5 py-6 text-sm md:grid-cols-4">
          {[[Truck, "Түргэн хүргэлт", "Хотод 1 өдөр, шуурхай 3 цаг"], [ShieldCheck, "Баталгаат чанар", "Бүх бараанд 14 хоногийн буцаалт"], [Gift, "Бэлгийн сав баглаа", "Хүссэн бүтээгдэхүүнд үнэгүй"], [RotateCcw, "Хялбар буцаалт", "Утсаар холбогдоход л хангалттай"]].map(([Icon, t, d]) => {
            const I = Icon as typeof Truck;
            return <li key={t as string} className="flex items-center gap-3"><I className="size-6 shrink-0 text-[var(--accent)]" /><span><b className="block">{t as string}</b><span className="text-[var(--text-2)]">{d as string}</span></span></li>;
          })}
        </ul>
      </section>

      {/* АНГИЛАЛ */}
      <section className="container-x pt-16 md:pt-24">
        <SectionHeading eyebrow="Ангилал" title="Сонирхсон ангиллаа сонго" />
        <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-7 md:gap-4 md:overflow-visible md:px-0">
          {categories.map((c) => (
            <Link key={c.id} href={`/products?category=${c.slug}`} className="group w-36 shrink-0 snap-start md:w-auto">
              <div className="aspect-square overflow-hidden rounded-2xl" style={{ background: c.tone }}>
                <ProductArt kind={c.art} color="#8A6B48" view={1} className="size-full transition-transform duration-500 group-hover:scale-110" />
              </div>
              <p className="mt-2.5 text-center text-sm font-semibold group-hover:text-[var(--accent)]">{c.name}</p>
            </Link>
          ))}
        </div>
      </section>

      <Row ready={ready} eyebrow="Редакцийн сонголт" title="Онцлох бараа" items={featured} href="/products?sort=featured" />

      {promos.length > 0 && (
        <section className="container-x grid gap-4 pt-16 md:grid-cols-2 md:gap-6 md:pt-24">
          {promos.slice(0, 2).map((b) => <PromoCard key={b.id} b={b} />)}
        </section>
      )}

      <Row ready={ready} eyebrow="Шинээр ирсэн" title="Шинэ бараа" items={fresh} href="/products?sort=new" />
      <Row ready={ready} eyebrow="Хамгийн их захиалагдсан" title="Эрэлттэй бараа" items={best} href="/products?sort=popular" />

      {/* ОНЦГОЙ САНАЛ */}
      <section className="mt-16 bg-[var(--surface-2)] py-16 md:mt-24 md:py-24">
        <div className="container-x">
          <SectionHeading eyebrow="Хязгаартай хугацаанд" title="Онцгой санал" action={<Link href="/products?sale=1" className="hidden items-center gap-1 text-sm font-semibold hover:text-[var(--accent)] sm:inline-flex">Бүх хямдрал <ArrowRight className="size-4" /></Link>} />
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-x-6">
            {!ready ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />) : offers.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      <Newsletter />
    </>
  );
}
