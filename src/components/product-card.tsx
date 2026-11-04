"use client";
import Link from "next/link";
import { Heart, Plus } from "lucide-react";
import type { Product } from "@/lib/types";
import { useStore } from "@/lib/store";
import { ProductPicture } from "./product-art";
import { DiscountBadge, Price, Stars } from "./ui/bits";

export function ProductCard({ product: p, priority = false }: { product: Product; priority?: boolean }) {
  const { wishlist, toggleWishlist, addToCart, setCartOpen } = useStore();
  const liked = wishlist.includes(p.id);
  const soldOut = p.stock <= 0;
  const needsChoice = p.colors.length > 1 || p.sizes.length > 0;
  void priority;

  return (
    <article className="product-card group relative flex flex-col">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[var(--surface-2)]">
        <Link href={`/products/${p.slug}`} className="absolute inset-0" aria-label={p.name}>
          <ProductPicture image={p.images[0]} kind={p.art} color={p.colors[0]?.hex} alt={p.name} className="art size-full" />
        </Link>
        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
          <DiscountBadge price={p.price} compareAt={p.compareAtPrice} />
          {p.tags.includes("new") && <span className="badge badge-ink">Шинэ</span>}
          {!soldOut && p.stock <= p.lowStockThreshold && <span className="badge badge-warn">{`Сүүлийн ${p.stock} ширхэг`}</span>}
        </div>
        <button
          type="button"
          onClick={() => toggleWishlist(p.id)}
          aria-pressed={liked}
          aria-label={liked ? "Хадгалсан жагсаалтаас хасах" : "Хадгалах"}
          className="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-[var(--surface)]/90 shadow-[var(--shadow-sm)] backdrop-blur transition hover:scale-105"
        >
          <Heart className={`size-[18px] ${liked ? "fill-[var(--accent)] text-[var(--accent)]" : ""}`} />
        </button>
        {soldOut ? (
          <div className="absolute inset-x-3 bottom-3 rounded-full bg-[var(--ink)]/85 py-2 text-center text-xs font-semibold text-[var(--on-ink)]">Дууссан</div>
        ) : needsChoice ? (
          <Link href={`/products/${p.slug}`} className="absolute inset-x-3 bottom-3 rounded-full bg-[var(--surface)]/95 py-2.5 text-center text-sm font-semibold opacity-100 shadow-[var(--shadow-sm)] backdrop-blur transition md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100">
            Сонголт хийх
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => { if (addToCart(p.id, { color: p.colors[0]?.name })) setCartOpen(true); }}
            className="absolute inset-x-3 bottom-3 inline-flex items-center justify-center gap-1.5 rounded-full bg-[var(--surface)]/95 py-2.5 text-sm font-semibold shadow-[var(--shadow-sm)] backdrop-blur transition md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100"
          >
            <Plus className="size-4" /> Сагсанд нэмэх
          </button>
        )}
      </div>
      <div className="mt-3 grid gap-1 px-0.5">
        <Link href={`/products/${p.slug}`} className="line-clamp-2 py-1 text-[0.95rem] font-medium leading-snug hover:text-[var(--accent)]">{p.name}</Link>
        {p.reviewCount > 0 ? <Stars rating={p.rating} count={p.reviewCount} /> : <span className="text-xs text-[var(--text-3)]">Шинэ бүтээгдэхүүн</span>}
        <Price price={p.price} compareAt={p.compareAtPrice} />
        {p.colors.length > 1 && (
          <span className="mt-1 flex items-center gap-1" aria-label={`${p.colors.length} өнгө`}>
            {p.colors.slice(0, 5).map((c) => <span key={c.name} title={c.name} className="size-3.5 rounded-full border border-black/10" style={{ background: c.hex }} />)}
          </span>
        )}
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div>
      <div className="skeleton aspect-[4/5] rounded-2xl" />
      <div className="skeleton mt-3 h-4 w-4/5" />
      <div className="skeleton mt-2 h-3 w-1/3" />
      <div className="skeleton mt-2 h-4 w-1/2" />
    </div>
  );
}
