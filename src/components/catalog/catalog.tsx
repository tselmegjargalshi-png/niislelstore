"use client";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, PackageSearch, SlidersHorizontal, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { PAGE_SIZE, SORTS, filterProducts, parseFilters, toQuery, type CatalogFilters } from "@/lib/catalog-query";
import { ProductCard, ProductCardSkeleton } from "../product-card";
import { EmptyState } from "../ui/bits";

const PRICE_PRESETS: { label: string; min: number | null; max: number | null }[] = [
  { label: "50 000₮ хүртэл", min: null, max: 50000 },
  { label: "50 000₮ ба 150 000₮ хооронд", min: 50000, max: 150000 },
  { label: "150 000₮ ба 400 000₮ хооронд", min: 150000, max: 400000 },
  { label: "400 000₮ дээш", min: 400000, max: null },
];

export function Catalog() {
  const { ready, visibleProducts, categories } = useStore();
  const sp = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const f = useMemo(() => parseFilters(new URLSearchParams(sp.toString())), [sp]);
  const [sheet, setSheet] = useState(false);
  const [minTxt, setMinTxt] = useState("");
  const [maxTxt, setMaxTxt] = useState("");

  useEffect(() => { setMinTxt(f.min != null ? String(f.min) : ""); setMaxTxt(f.max != null ? String(f.max) : ""); }, [f.min, f.max]);
  useEffect(() => {
    document.body.style.overflow = sheet ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sheet]);

  const apply = (patch: Partial<CatalogFilters>) => router.replace(`${path}${toQuery({ ...f, page: 1, ...patch })}`, { scroll: false });
  const all = useMemo(() => filterProducts(visibleProducts, categories, f), [visibleProducts, categories, f]);
  const pages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const page = Math.min(f.page, pages);
  const items = all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const currentCat = categories.find((c) => c.slug === f.category);
  const activeCount = [f.category, f.min != null || f.max != null, f.stock === "in", f.sale].filter(Boolean).length;

  const Filters = (
    <div className="grid gap-7">
      <section aria-labelledby="f-cat">
        <h3 id="f-cat" className="mb-3 text-sm font-semibold">Ангилал</h3>
        <ul className="grid gap-1">
          <li><button onClick={() => apply({ category: "" })} className={`w-full rounded-lg px-3 py-2 text-left text-sm ${!f.category ? "bg-[var(--ink)] text-[var(--on-ink)]" : "hover:bg-[var(--surface-2)]"}`}>Бүгд</button></li>
          {categories.map((c) => {
            const n = visibleProducts.filter((p) => p.categoryId === c.id).length;
            return <li key={c.id}><button onClick={() => apply({ category: c.slug })} aria-pressed={f.category === c.slug} className={`flex w-full justify-between rounded-lg px-3 py-2 text-left text-sm ${f.category === c.slug ? "bg-[var(--ink)] text-[var(--on-ink)]" : "hover:bg-[var(--surface-2)]"}`}><span>{c.name}</span><span className="opacity-60">{n}</span></button></li>;
          })}
        </ul>
      </section>
      <section aria-labelledby="f-price">
        <h3 id="f-price" className="mb-3 text-sm font-semibold">Үнэ</h3>
        <div className="mb-3 grid gap-1.5">
          {PRICE_PRESETS.map((p) => {
            const on = f.min === p.min && f.max === p.max;
            return <button key={p.label} aria-pressed={on} onClick={() => apply(on ? { min: null, max: null } : { min: p.min, max: p.max })} className={`rounded-lg px-3 py-2 text-left text-sm ${on ? "bg-[var(--ink)] text-[var(--on-ink)]" : "hover:bg-[var(--surface-2)]"}`}>{p.label}</button>;
          })}
        </div>
        <form className="flex items-center gap-2" onSubmit={(e) => { e.preventDefault(); apply({ min: minTxt ? Number(minTxt) : null, max: maxTxt ? Number(maxTxt) : null }); }}>
          <input aria-label="Доод үнэ" inputMode="numeric" value={minTxt} onChange={(e) => setMinTxt(e.target.value.replace(/\D/g, ""))} placeholder="Доод" className="input !min-h-10 !px-3 text-sm" />
          <span className="text-[var(--text-3)]">ба</span>
          <input aria-label="Дээд үнэ" inputMode="numeric" value={maxTxt} onChange={(e) => setMaxTxt(e.target.value.replace(/\D/g, ""))} placeholder="Дээд" className="input !min-h-10 !px-3 text-sm" />
          <button className="btn btn-ghost btn-sm" type="submit">Хэрэглэх</button>
        </form>
      </section>
      <section aria-labelledby="f-av" className="grid gap-3">
        <h3 id="f-av" className="text-sm font-semibold">Бусад</h3>
        <label className="flex cursor-pointer items-center gap-3 text-sm"><input type="checkbox" className="size-5 accent-[var(--accent)]" checked={f.stock === "in"} onChange={(e) => apply({ stock: e.target.checked ? "in" : "all" })} /> Зөвхөн байгаа бараа</label>
        <label className="flex cursor-pointer items-center gap-3 text-sm"><input type="checkbox" className="size-5 accent-[var(--accent)]" checked={f.sale} onChange={(e) => apply({ sale: e.target.checked })} /> Зөвхөн хямдралтай</label>
      </section>
      {(activeCount > 0 || f.q) && <button className="btn btn-ghost btn-sm" onClick={() => router.replace(path)}>Шүүлтүүр цэвэрлэх</button>}
    </div>
  );

  return (
    <div className="container-x py-8 md:py-12">
      <nav aria-label="Замын мэдээлэл" className="mb-4 text-sm text-[var(--text-3)]"><Link href="/" className="hover:text-[var(--text)]">Нүүр</Link> / <span className="text-[var(--text)]">Бараа</span>{currentCat && <> / <span className="text-[var(--text)]">{currentCat.name}</span></>}</nav>
      <header className="mb-8 max-w-2xl">
        <h1 className="text-3xl md:text-5xl">{f.q ? `«${f.q}» хайлтын үр дүн` : currentCat?.name ?? (f.sale ? "Хямдралтай бараа" : "Бүх бараа")}</h1>
        <p className="mt-3 text-[var(--text-2)]">{currentCat?.description ?? "Монгол чанарын шилдэг бүтээгдэхүүнүүд."}</p>
      </header>

      <div className="sticky top-16 z-30 -mx-4 mb-6 flex items-center justify-between gap-3 border-b border-[var(--line)] bg-[var(--bg)]/95 px-4 py-3 backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:px-0 md:py-0 md:backdrop-blur-none">
        <p className="min-w-0 truncate text-sm text-[var(--text-2)]" aria-live="polite" data-testid="result-count">{ready ? `${all.length} бараа олдлоо` : "Ачаалж байна"}</p>
        <div className="flex shrink-0 items-center gap-2">
          <button className="btn btn-ghost btn-sm lg:hidden" onClick={() => setSheet(true)}><SlidersHorizontal className="size-4" /> Шүүлтүүр{activeCount > 0 && <span className="badge badge-accent">{activeCount}</span>}</button>
          <label className="sr-only" htmlFor="sort">Эрэмбэлэх</label>
          <select id="sort" value={f.sort} onChange={(e) => apply({ sort: e.target.value as CatalogFilters["sort"] })} className="select !min-h-9 !w-auto !max-w-[9.5rem] !rounded-full !py-1 text-sm" data-testid="sort">
            {SORTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[250px_1fr]">
        <aside className="hidden lg:block" aria-label="Шүүлтүүр"><div className="sticky top-28">{Filters}</div></aside>
        <div>
          {!ready ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6">{Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}</div>
          ) : all.length === 0 ? (
            <EmptyState icon={<PackageSearch className="size-7" />} title="Тохирох бараа олдсонгүй" text="Хайлтын үгээ өөрчилж эсвэл шүүлтүүрээ цэвэрлээд дахин үзнэ үү."
              action={<button className="btn btn-primary mt-2" onClick={() => router.replace(path)}>Шүүлтүүр цэвэрлэх</button>} />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6" data-testid="product-grid">
                {items.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
              {pages > 1 && (
                <nav aria-label="Хуудаслалт" className="mt-12 flex items-center justify-center gap-1.5">
                  <button className="btn btn-ghost btn-sm !px-3" disabled={page <= 1} onClick={() => apply({ page: page - 1 })} aria-label="Өмнөх хуудас"><ChevronLeft className="size-4" /></button>
                  {Array.from({ length: pages }).map((_, i) => (
                    <button key={i} onClick={() => apply({ page: i + 1 })} aria-current={page === i + 1 ? "page" : undefined} className={`grid size-9 place-items-center rounded-full text-sm font-medium ${page === i + 1 ? "bg-[var(--ink)] text-[var(--on-ink)]" : "hover:bg-[var(--surface-2)]"}`}>{i + 1}</button>
                  ))}
                  <button className="btn btn-ghost btn-sm !px-3" disabled={page >= pages} onClick={() => apply({ page: page + 1 })} aria-label="Дараагийн хуудас"><ChevronRight className="size-4" /></button>
                </nav>
              )}
            </>
          )}
        </div>
      </div>

      {sheet && (
        <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label="Шүүлтүүр">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSheet(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto rounded-t-3xl bg-[var(--bg)] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]" style={{ animation: "rise .3s both" }}>
            <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold">Шүүлтүүр</h2><button onClick={() => setSheet(false)} aria-label="Хаах" className="grid size-10 place-items-center rounded-full hover:bg-[var(--surface-2)]"><X className="size-5" /></button></div>
            {Filters}
            <button className="btn btn-primary btn-block mt-6" onClick={() => setSheet(false)}>{`${all.length} бараа харах`}</button>
          </div>
        </div>
      )}
    </div>
  );
}
