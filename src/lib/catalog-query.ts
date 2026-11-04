import type { Category, Product } from "./types";

export type SortKey = "featured" | "new" | "popular" | "price_asc" | "price_desc" | "discount";

export const SORTS: { key: SortKey; label: string }[] = [
  { key: "featured", label: "Онцлох" },
  { key: "new", label: "Шинэ нь эхэндээ" },
  { key: "popular", label: "Эрэлттэй" },
  { key: "price_asc", label: "Үнэ: багаас их" },
  { key: "price_desc", label: "Үнэ: ихээс бага" },
  { key: "discount", label: "Хямдрал ихтэй" },
];

export interface CatalogFilters {
  q: string;
  category: string; // slug
  min: number | null;
  max: number | null;
  stock: "all" | "in";
  sale: boolean;
  sort: SortKey;
  page: number;
}

export const PAGE_SIZE = 12;

const norm = (s: string) => s.toLocaleLowerCase("mn").normalize("NFC").trim();

export function filterProducts(products: Product[], cats: Category[], f: CatalogFilters): Product[] {
  const q = norm(f.q);
  const tokens = q ? q.split(/\s+/) : [];
  const catId = f.category ? cats.find((c) => c.slug === f.category)?.id : undefined;
  const catName = (id: string) => norm(cats.find((c) => c.id === id)?.name ?? "");
  let list = products.filter((p) => {
    if (catId && p.categoryId !== catId) return false;
    if (f.category && !catId) return false;
    if (f.min != null && p.price < f.min) return false;
    if (f.max != null && p.price > f.max) return false;
    if (f.stock === "in" && p.stock <= 0) return false;
    if (f.sale && !(p.compareAtPrice && p.compareAtPrice > p.price)) return false;
    if (tokens.length) {
      const hay = norm(`${p.name} ${p.short} ${p.sku} ${catName(p.categoryId)} ${p.colors.map((c) => c.name).join(" ")}`);
      if (!tokens.every((t) => hay.includes(t))) return false;
    }
    return true;
  });
  const disc = (p: Product) => (p.compareAtPrice && p.compareAtPrice > p.price ? (p.compareAtPrice - p.price) / p.compareAtPrice : 0);
  const sorters: Record<SortKey, (a: Product, b: Product) => number> = {
    featured: (a, b) => Number(b.tags.includes("featured")) - Number(a.tags.includes("featured")) || b.soldCount - a.soldCount,
    new: (a, b) => b.createdAt.localeCompare(a.createdAt),
    popular: (a, b) => b.soldCount - a.soldCount,
    price_asc: (a, b) => a.price - b.price,
    price_desc: (a, b) => b.price - a.price,
    discount: (a, b) => disc(b) - disc(a),
  };
  list = [...list].sort((a, b) => Number(b.stock > 0) - Number(a.stock > 0) || sorters[f.sort](a, b));
  return list;
}

export function parseFilters(sp: URLSearchParams): CatalogFilters {
  const num = (k: string) => {
    const v = sp.get(k);
    if (v == null || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? n : null;
  };
  const sort = sp.get("sort") as SortKey | null;
  return {
    q: sp.get("q") ?? "",
    category: sp.get("category") ?? "",
    min: num("min"),
    max: num("max"),
    stock: sp.get("stock") === "in" ? "in" : "all",
    sale: sp.get("sale") === "1",
    sort: sort && SORTS.some((s) => s.key === sort) ? sort : "featured",
    page: Math.max(1, Math.floor(Number(sp.get("page")) || 1)),
  };
}

export function toQuery(f: Partial<CatalogFilters>): string {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.category) p.set("category", f.category);
  if (f.min != null) p.set("min", String(f.min));
  if (f.max != null) p.set("max", String(f.max));
  if (f.stock === "in") p.set("stock", "in");
  if (f.sale) p.set("sale", "1");
  if (f.sort && f.sort !== "featured") p.set("sort", f.sort);
  if (f.page && f.page > 1) p.set("page", String(f.page));
  const s = p.toString();
  return s ? `?${s}` : "";
}
