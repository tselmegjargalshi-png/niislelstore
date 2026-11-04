"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Check, Heart, Minus, PackageX, Plus, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { useStore } from "@/lib/store";
import { ProductPicture } from "../product-art";
import { ProductCard, ProductCardSkeleton } from "../product-card";
import { DiscountBadge, EmptyState, Price, SectionHeading, Stars } from "../ui/bits";
import { mnt } from "@/lib/pricing";

export function ProductDetail({ slug }: { slug: string }) {
  const { ready, products, categories, visibleProducts, addToCart, setCartOpen, wishlist, toggleWishlist, cart } = useStore();
  const router = useRouter();
  const p = products.find((x) => x.slug === slug && x.visible);
  const [view, setView] = useState(0);
  const [color, setColor] = useState<string | undefined>();
  const [size, setSize] = useState<string | undefined>();
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"desc" | "specs" | "delivery">("desc");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (p) { setColor(p.colors.length === 1 ? p.colors[0].name : undefined); setSize(undefined); setQty(1); setView(0); setTouched(false); }
  }, [p?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!ready) {
    return <div className="container-x grid gap-10 py-10 md:grid-cols-2"><div className="skeleton aspect-[4/5] rounded-3xl" /><div className="grid content-start gap-4"><div className="skeleton h-10 w-3/4" /><div className="skeleton h-6 w-1/3" /><div className="skeleton h-40 w-full" /></div></div>;
  }
  if (!p) {
    return <div className="container-x py-16"><EmptyState icon={<PackageX className="size-7" />} title="Бараа олдсонгүй" text="Энэ бараа худалдаанаас хасагдсан эсвэл холбоос буруу байна." action={<Link href="/products" className="btn btn-primary mt-2">Бүх бараа үзэх</Link>} /></div>;
  }

  const cat = categories.find((c) => c.id === p.categoryId);
  const inCart = cart.filter((l) => l.productId === p.id).reduce((s, l) => s + l.quantity, 0);
  const available = Math.max(0, p.stock - inCart);
  const soldOut = p.stock <= 0;
  const liked = wishlist.includes(p.id);
  const activeColor = p.colors.find((c) => c.name === color)?.hex ?? p.colors[0]?.hex;
  const related = visibleProducts.filter((x) => x.categoryId === p.categoryId && x.id !== p.id).sort((a, b) => b.soldCount - a.soldCount).slice(0, 4);
  const missing = (p.colors.length > 1 && !color) ? "Өнгөө сонгоно уу." : (p.sizes.length > 0 && !size) ? "Хэмжээгээ сонгоно уу." : "";

  const add = (go: boolean) => {
    setTouched(true);
    if (missing) return;
    if (addToCart(p.id, { quantity: qty, color: color ?? p.colors[0]?.name, size })) {
      if (go) router.push("/checkout"); else setCartOpen(true);
    }
  };

  return (
    <div className="container-x py-6 md:py-10">
      <nav aria-label="Замын мэдээлэл" className="mb-5 text-sm text-[var(--text-3)]">
        <Link href="/" className="hover:text-[var(--text)]">Нүүр</Link> / <Link href="/products" className="hover:text-[var(--text)]">Бараа</Link>
        {cat && <> / <Link href={`/products?category=${cat.slug}`} className="hover:text-[var(--text)]">{cat.name}</Link></>}
      </nav>

      <div className="grid gap-8 md:grid-cols-2 lg:gap-14">
        {/* Зургийн галерей */}
        <div className="grid gap-3 md:sticky md:top-24 md:self-start lg:grid-cols-[84px_1fr]">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-[var(--surface-2)] lg:order-2" data-testid="gallery-main">
            <ProductPicture image={p.images[view] ?? p.images[0]} kind={p.art} color={activeColor} alt={`${p.name}, зураг ${view + 1}`} className="size-full" />
            <div className="absolute left-4 top-4 flex flex-col gap-1.5"><DiscountBadge price={p.price} compareAt={p.compareAtPrice} />{p.tags.includes("new") && <span className="badge badge-ink">Шинэ</span>}</div>
          </div>
          <div className="flex gap-2 lg:order-1 lg:flex-col" role="tablist" aria-label="Зургууд">
            {p.images.map((img, i) => (
              <button key={i} role="tab" aria-selected={view === i} aria-label={`Зураг ${i + 1}`} onClick={() => setView(i)}
                className={`aspect-[4/5] w-16 shrink-0 overflow-hidden rounded-xl border-2 lg:w-full ${view === i ? "border-[var(--ink)]" : "border-transparent opacity-70 hover:opacity-100"}`}>
                <ProductPicture image={img} kind={p.art} color={activeColor} className="size-full" />
              </button>
            ))}
          </div>
        </div>

        {/* Мэдээлэл */}
        <div>
          {cat && <p className="eyebrow">{cat.name}</p>}
          <h1 className="mt-2 text-3xl md:text-4xl" data-testid="product-title">{p.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1"><Stars rating={p.rating} count={p.reviewCount} /><span className="text-xs text-[var(--text-3)]">{`Код: ${p.sku}`}</span></div>
          <div className="mt-5"><Price price={p.price} compareAt={p.compareAtPrice} size="lg" /></div>
          <p className="mt-4 text-[var(--text-2)]">{p.short}</p>

          {p.colors.length > 0 && (
            <fieldset className="mt-7">
              <legend className="mb-2 text-sm font-semibold">Өнгө: <span className="font-normal text-[var(--text-2)]">{color ?? "сонгоогүй"}</span></legend>
              <div className="flex flex-wrap gap-2.5">
                {p.colors.map((c) => (
                  <button key={c.name} type="button" onClick={() => setColor(c.name)} aria-pressed={color === c.name} aria-label={c.name} title={c.name}
                    className={`grid size-11 place-items-center rounded-full border-2 ${color === c.name ? "border-[var(--ink)]" : "border-[var(--line-strong)]"}`}>
                    <span className="size-8 rounded-full border border-black/10" style={{ background: c.hex }}>{color === c.name && <Check className="m-auto mt-1.5 size-5 text-white mix-blend-difference" />}</span>
                  </button>
                ))}
              </div>
            </fieldset>
          )}
          {p.sizes.length > 0 && (
            <fieldset className="mt-6">
              <legend className="mb-2 text-sm font-semibold">Хэмжээ: <span className="font-normal text-[var(--text-2)]">{size ?? "сонгоогүй"}</span></legend>
              <div className="flex flex-wrap gap-2">
                {p.sizes.map((s) => <button key={s} type="button" onClick={() => setSize(s)} aria-pressed={size === s} className={`min-h-11 min-w-12 rounded-xl border px-4 text-sm font-medium ${size === s ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--on-ink)]" : "border-[var(--line-strong)] hover:border-[var(--ink)]"}`}>{s}</button>)}
              </div>
            </fieldset>
          )}

          <p className={`mt-6 flex items-center gap-2 text-sm font-medium ${soldOut ? "text-[var(--danger)]" : p.stock <= p.lowStockThreshold ? "text-[var(--warn)]" : "text-[var(--success)]"}`} data-testid="stock-status">
            <span className={`size-2 rounded-full ${soldOut ? "bg-[var(--danger)]" : p.stock <= p.lowStockThreshold ? "bg-[var(--warn)]" : "bg-[var(--success)]"}`} />
            {soldOut ? "Дууссан" : p.stock <= p.lowStockThreshold ? `Цөөхөн үлдсэн: ${p.stock} ширхэг` : `Нөөцөд байна (${p.stock} ширхэг)`}
          </p>

          <div className="mt-5 flex flex-wrap items-stretch gap-3">
            <div className="inline-flex items-center rounded-full border border-[var(--line-strong)]">
              <button className="grid size-12 place-items-center disabled:opacity-40" aria-label="Нэгээр хасах" disabled={qty <= 1} onClick={() => setQty((q) => Math.max(1, q - 1))}><Minus className="size-4" /></button>
              <span className="tabular w-8 text-center font-semibold" data-testid="qty">{qty}</span>
              <button className="grid size-12 place-items-center disabled:opacity-40" aria-label="Нэгээр нэмэх" disabled={qty >= available} onClick={() => setQty((q) => Math.min(available, q + 1))}><Plus className="size-4" /></button>
            </div>
            <button className="btn btn-accent !min-h-12 flex-1" disabled={soldOut || available === 0} onClick={() => add(false)} data-testid="add-to-cart">{soldOut ? "Дууссан" : available === 0 ? "Бүгд сагсанд байна" : "Сагсанд нэмэх"}</button>
            <button className={`btn btn-ghost !size-12 !p-0 ${liked ? "!border-[var(--accent)]" : ""}`} aria-pressed={liked} aria-label={liked ? "Хадгалсан жагсаалтаас хасах" : "Хадгалах"} onClick={() => toggleWishlist(p.id)} data-testid="wishlist-toggle"><Heart className={`size-5 ${liked ? "fill-[var(--accent)] text-[var(--accent)]" : ""}`} /></button>
          </div>
          {touched && missing && <p role="alert" className="mt-2 text-sm font-medium text-[var(--danger)]">{missing}</p>}
          <button className="btn btn-primary btn-block mt-3 !min-h-12" disabled={soldOut || available === 0} onClick={() => add(true)}>Шууд захиалах</button>

          <ul className="mt-7 grid gap-3 rounded-2xl bg-[var(--surface-2)] p-4 text-sm">
            <li className="flex items-center gap-3"><Truck className="size-5 text-[var(--accent)]" />Улаанбаатарт маргааш хүргэнэ, 200 000₮ дээш бол үнэгүй</li>
            <li className="flex items-center gap-3"><ShieldCheck className="size-5 text-[var(--accent)]" />Жинхэнэ Монгол бүтээгдэхүүн, чанарын баталгаатай</li>
            <li className="flex items-center gap-3"><RotateCcw className="size-5 text-[var(--accent)]" />14 хоногийн дотор буцаах боломжтой</li>
          </ul>

          <div className="mt-8">
            <div role="tablist" className="flex gap-1 border-b border-[var(--line)]">
              {([["desc", "Тайлбар"], ["specs", "Үзүүлэлт"], ["delivery", "Хүргэлт"]] as const).map(([k, l]) => (
                <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`-mb-px border-b-2 px-4 py-3 text-sm font-semibold ${tab === k ? "border-[var(--accent)] text-[var(--text)]" : "border-transparent text-[var(--text-3)] hover:text-[var(--text)]"}`}>{l}</button>
              ))}
            </div>
            <div className="pt-5 text-[0.95rem] leading-relaxed text-[var(--text-2)]" role="tabpanel">
              {tab === "desc" && (<><p>{p.description}</p><ul className="mt-4 grid gap-2">{p.highlights.map((h) => <li key={h} className="flex gap-2"><Check className="mt-1 size-4 shrink-0 text-[var(--accent)]" />{h}</li>)}</ul></>)}
              {tab === "specs" && (<dl className="divide-y divide-[var(--line)]">{p.specs.map((s) => <div key={s.label} className="grid grid-cols-[1fr_2fr] gap-4 py-2.5"><dt className="text-[var(--text-3)]">{s.label}</dt><dd className="font-medium text-[var(--text)]">{s.value}</dd></div>)}</dl>)}
              {tab === "delivery" && (<ul className="grid gap-2"><li>Энгийн хүргэлт: дүүргээс хамаарч 5 000₮ ба 20 000₮ хооронд, 1 ба 3 ажлын хоногт.</li><li>Шуурхай хүргэлт: тусгай дүүргүүдэд 3 цагийн дотор.</li><li>Салбараас очиж авбал үнэгүй.</li><li>{`${mnt(200000)} дээш захиалгад Улаанбаатарт энгийн хүргэлт үнэгүй.`}</li></ul>)}
            </div>
          </div>
        </div>
      </div>

      <section className="pt-16 md:pt-24">
        <SectionHeading eyebrow="Танд санал болгох" title="Төстэй бараа" />
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-x-6">
          {related.length ? related.map((r) => <ProductCard key={r.id} product={r} />) : Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      </section>
    </div>
  );
}
