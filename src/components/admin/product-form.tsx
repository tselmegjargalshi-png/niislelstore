"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ImagePlus, Plus, Trash2, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { can } from "@/lib/admin-roles";
import { productSchema, fieldErrors, type FieldErrors } from "@/lib/validation";
import { slugify } from "@/lib/slug";
import { RepositoryError } from "@/lib/data/repository";
import type { ArtKind, ColorOption, Product, ProductImage, ProductTag } from "@/lib/types";
import { ProductPicture } from "../product-art";
import { Field, Spinner } from "../ui/bits";
import { PageHeader, Toggle, useAdmin } from "./admin-ui";

const ART_OPTIONS: [ArtKind, string][] = [
  ["sweater", "Цамц, ноолуур"], ["coat", "Пальто"], ["jacket", "Хүрэм"], ["shirt", "Цамц"], ["scarf", "Ороолт"], ["beanie", "Малгай"], ["blanket", "Хөнжил"], ["socks", "Оймс"], ["gloves", "Бээлий"],
  ["tote", "Цүнх"], ["crossbody", "Мөрөвчтэй цүнх"], ["wallet", "Түрийвч"], ["belt", "Бүс"], ["boots", "Гутал"], ["slippers", "Шаахай"], ["cup", "Аяга"], ["vase", "Ваар"], ["cushion", "Дэр"],
  ["candle", "Лаа"], ["bowl", "Таваг"], ["jar", "Тос, лонх"], ["bottle", "Лонх"], ["dropper", "Серум"], ["soap", "Саван"], ["tube", "Гуурс"], ["teabox", "Цайны хайрцаг"],
  ["honey", "Бал"], ["chocolate", "Шоколад"], ["giftbox", "Бэлгийн хайрцаг"], ["juice", "Шүүс"], ["bracelet", "Бугуйвч"], ["earrings", "Ээмэг"], ["notebook", "Дэвтэр"],
];

async function fileToDataUrl(file: File, max = 900): Promise<string> {
  const bmp = await createImageBitmap(file);
  const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.8);
}

const blank = (categoryId: string): Product => ({
  id: "", slug: "", sku: "", name: "", categoryId, short: "", description: "", highlights: [], specs: [], price: 0, compareAtPrice: null,
  colors: [{ name: "Үндсэн", hex: "#B98A5A" }], sizes: [], stock: 0, lowStockThreshold: 5, art: "sweater",
  images: [{ kind: "art", view: 0 }, { kind: "art", view: 1 }, { kind: "art", view: 2 }, { kind: "art", view: 3 }],
  tags: [], visible: true, rating: 0, reviewCount: 0, soldCount: 0, createdAt: "", updatedAt: "",
});

export function ProductForm({ id }: { id?: string }) {
  const { products, categories, repo, toast, ready } = useStore();
  const { role } = useAdmin();
  const router = useRouter();
  const [p, setP] = useState<Product | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [txt, setTxt] = useState({ price: "", compare: "", stock: "", low: "5", sizes: "", highlights: "", specs: "" });
  const [er, setEr] = useState<FieldErrors>({});
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!ready || p) return;
    const base = id ? products.find((x) => x.id === id) : blank(categories[0]?.id ?? "");
    if (!base) return;
    setP(base); setSlugTouched(!!id);
    setTxt({ price: String(base.price || ""), compare: base.compareAtPrice ? String(base.compareAtPrice) : "", stock: String(base.stock), low: String(base.lowStockThreshold), sizes: base.sizes.join(", "), highlights: base.highlights.join("\n"), specs: base.specs.map((s) => `${s.label}: ${s.value}`).join("\n") });
  }, [ready, id, products, categories, p]);

  if (!can(role, "products.write")) return <div className="card p-10 text-center"><h1 className="text-2xl">Хандах эрхгүй</h1><p className="mt-2 text-[var(--text-2)]">Бүтээгдэхүүн засах эрх зөвхөн админд байна.</p><Link href="/admin/products" className="btn btn-primary mt-5">Жагсаалт руу</Link></div>;
  if (!ready) return <div className="skeleton h-96" />;
  if (!p) return <div className="card p-10 text-center"><h1 className="text-2xl">Бүтээгдэхүүн олдсонгүй</h1><Link href="/admin/products" className="btn btn-primary mt-5">Жагсаалт руу</Link></div>;

  const set = <K extends keyof Product>(k: K, v: Product[K]) => { setP((x) => (x ? { ...x, [k]: v } : x)); setEr((e) => ({ ...e, [k]: "" })); };
  const t = (k: keyof typeof txt) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { setTxt((s) => ({ ...s, [k]: e.target.value })); setEr((x) => ({ ...x, [k === "compare" ? "compareAtPrice" : k]: "" })); };
  const num = (s: string) => (s.trim() === "" ? NaN : Number(s.replace(/[\s,]/g, "")));
  const toggleTag = (tag: ProductTag) => set("tags", p.tags.includes(tag) ? p.tags.filter((x) => x !== tag) : [...p.tags, tag]);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      const add: ProductImage[] = [];
      for (const f of Array.from(files).slice(0, 5)) {
        if (!f.type.startsWith("image/")) { toast(`${f.name}: зөвхөн зураг оруулна уу.`, "error"); continue; }
        if (f.size > 8 * 1024 * 1024) { toast(`${f.name}: 8 мегабайтаас бага зураг сонгоно уу.`, "error"); continue; }
        add.push({ kind: "upload", src: await fileToDataUrl(f), alt: p!.name });
      }
      const keep = p!.images.filter((i) => i.kind === "upload");
      setP({ ...p!, images: [...keep, ...add].slice(0, 6) });
      if (add.length) toast(`${add.length} зураг нэмэгдлээ.`);
    } catch { toast("Зургийг боловсруулж чадсангүй.", "error"); } finally { setUploading(false); }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!p) return;
    const colors = p.colors.filter((c) => c.name.trim());
    const draft = {
      name: p.name, slug: p.slug || slugify(p.name), sku: p.sku, categoryId: p.categoryId, short: p.short, description: p.description,
      price: num(txt.price), compareAtPrice: txt.compare.trim() === "" ? null : num(txt.compare), stock: num(txt.stock), lowStockThreshold: num(txt.low),
    };
    const r = productSchema.safeParse(draft);
    if (!r.success) { setEr(fieldErrors(r.error)); toast("Маягтын алдааг засна уу.", "error"); requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()); return; }
    if (colors.length === 0) { setEr({ colors: "Дор хаяж нэг өнгө оруулна уу." }); return; }
    setBusy(true);
    try {
      const specs = txt.specs.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => { const i = l.indexOf(":"); return i > 0 ? { label: l.slice(0, i).trim(), value: l.slice(i + 1).trim() } : { label: l, value: "" }; });
      const images = p.images.length ? p.images : [{ kind: "art" as const, view: 0 as const }, { kind: "art" as const, view: 1 as const }];
      const saved = await repo.saveProduct({
        ...p, ...r.data, colors, images, specs,
        sizes: txt.sizes.split(",").map((s) => s.trim()).filter(Boolean),
        highlights: txt.highlights.split("\n").map((s) => s.trim()).filter(Boolean),
      });
      toast(id ? "Бүтээгдэхүүн шинэчлэгдлээ." : "Бүтээгдэхүүн нэмэгдлээ.");
      router.push("/admin/products");
      void saved;
    } catch (err) {
      const msg = err instanceof RepositoryError ? err.message : "Хадгалах үед алдаа гарлаа.";
      setEr(err instanceof RepositoryError && err.code === "conflict" ? { [/SKU/.test(msg) ? "sku" : "slug"]: msg } : { _: msg });
      toast(msg, "error");
    } finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} noValidate data-testid="product-form">
      <PageHeader title={id ? "Бүтээгдэхүүн засах" : "Шинэ бүтээгдэхүүн"} actions={<><Link href="/admin/products" className="btn btn-ghost btn-sm">Болих</Link><button className="btn btn-primary btn-sm" disabled={busy} data-testid="save-product">{busy ? <Spinner className="size-4" /> : "Хадгалах"}</button></>} />
      {er._ && <p role="alert" className="mb-4 rounded-xl bg-[var(--danger-soft)] px-4 py-3 text-sm font-medium text-[var(--danger)]">{er._}</p>}
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="grid gap-6">
          <section className="card grid gap-4 p-5 md:p-6">
            <h2 className="font-semibold">Үндсэн мэдээлэл</h2>
            <Field label="Нэр" error={er.name} htmlFor="pf-name"><input id="pf-name" className="input" value={p.name} onChange={(e) => { set("name", e.target.value); if (!slugTouched) set("slug", slugify(e.target.value)); }} aria-invalid={!!er.name} data-testid="pf-name" /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Холбоос (slug)" error={er.slug} htmlFor="pf-slug" hint="URL: /products/холбоос"><input id="pf-slug" className="input" value={p.slug} onChange={(e) => { setSlugTouched(true); set("slug", e.target.value.toLowerCase()); }} aria-invalid={!!er.slug} data-testid="pf-slug" /></Field>
              <Field label="SKU код" error={er.sku} htmlFor="pf-sku"><input id="pf-sku" className="input" value={p.sku} onChange={(e) => set("sku", e.target.value)} aria-invalid={!!er.sku} data-testid="pf-sku" /></Field>
            </div>
            <Field label="Товч тайлбар" error={er.short} htmlFor="pf-short"><input id="pf-short" className="input" value={p.short} onChange={(e) => set("short", e.target.value)} aria-invalid={!!er.short} data-testid="pf-short" /></Field>
            <Field label="Дэлгэрэнгүй тайлбар" error={er.description} htmlFor="pf-desc"><textarea id="pf-desc" className="textarea !min-h-32" value={p.description} onChange={(e) => set("description", e.target.value)} aria-invalid={!!er.description} data-testid="pf-desc" /></Field>
            <Field label="Онцлох шинж (мөр бүр нэг шинж)" htmlFor="pf-hl"><textarea id="pf-hl" className="textarea" value={txt.highlights} onChange={t("highlights")} /></Field>
            <Field label="Үзүүлэлт (мөр бүр «Нэр: утга» хэлбэртэй)" htmlFor="pf-spec"><textarea id="pf-spec" className="textarea" value={txt.specs} onChange={t("specs")} placeholder="Материал: 100% ноолуур" /></Field>
          </section>

          <section className="card grid gap-4 p-5 md:p-6">
            <h2 className="font-semibold">Үнэ ба нөөц</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Борлуулах үнэ (₮)" error={er.price} htmlFor="pf-price"><input id="pf-price" inputMode="numeric" className="input" value={txt.price} onChange={t("price")} aria-invalid={!!er.price} data-testid="pf-price" /></Field>
              <Field label="Хямдралаас өмнөх үнэ (₮)" error={er.compareAtPrice} htmlFor="pf-compare" hint="Хоосон бол хямдралгүй"><input id="pf-compare" inputMode="numeric" className="input" value={txt.compare} onChange={t("compare")} aria-invalid={!!er.compareAtPrice} data-testid="pf-compare" /></Field>
              <Field label="Нөөцийн үлдэгдэл" error={er.stock} htmlFor="pf-stock"><input id="pf-stock" inputMode="numeric" className="input" value={txt.stock} onChange={t("stock")} aria-invalid={!!er.stock} data-testid="pf-stock" /></Field>
              <Field label="Нөөц багатай гэж үзэх хэмжээ" error={er.lowStockThreshold} htmlFor="pf-low"><input id="pf-low" inputMode="numeric" className="input" value={txt.low} onChange={t("low")} /></Field>
            </div>
          </section>

          <section className="card grid gap-4 p-5 md:p-6">
            <h2 className="font-semibold">Өнгө ба хэмжээ</h2>
            <div className="grid gap-2">
              {p.colors.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="color" aria-label="Өнгө сонгох" value={c.hex} onChange={(e) => set("colors", p.colors.map((x, j): ColorOption => (j === i ? { ...x, hex: e.target.value } : x)))} className="size-11 shrink-0 cursor-pointer rounded-lg border border-[var(--line-strong)] bg-transparent p-1" />
                  <input aria-label="Өнгөний нэр" className="input" value={c.name} onChange={(e) => set("colors", p.colors.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} placeholder="Өнгөний нэр" />
                  <button type="button" className="btn btn-ghost !size-11 !p-0" aria-label="Өнгө хасах" onClick={() => set("colors", p.colors.filter((_, j) => j !== i))}><Trash2 className="size-4" /></button>
                </div>
              ))}
              {er.colors && <span className="field-error" role="alert">{er.colors}</span>}
              <button type="button" className="btn btn-ghost btn-sm w-fit" onClick={() => set("colors", [...p.colors, { name: "", hex: "#999999" }])}><Plus className="size-4" />Өнгө нэмэх</button>
            </div>
            <Field label="Хэмжээ (таслалаар тусгаарлана)" htmlFor="pf-sizes" hint="Жишээ: S, M, L. Хэмжээгүй бол хоосон үлдээнэ"><input id="pf-sizes" className="input" value={txt.sizes} onChange={t("sizes")} /></Field>
          </section>
        </div>

        <div className="grid h-fit gap-6">
          <section className="card grid gap-4 p-5">
            <div className="flex items-center justify-between"><span className="text-sm font-semibold">Дэлгүүрт харагдах</span><Toggle checked={p.visible} onChange={(v) => set("visible", v)} label="Харагдах" /></div>
            <Field label="Ангилал" error={er.categoryId} htmlFor="pf-cat"><select id="pf-cat" className="select" value={p.categoryId} onChange={(e) => set("categoryId", e.target.value)} data-testid="pf-cat">{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
            <Field label="Зургийн хэв (студи дүрс)" htmlFor="pf-art"><select id="pf-art" className="select" value={p.art} onChange={(e) => set("art", e.target.value as ArtKind)}>{ART_OPTIONS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></Field>
            <fieldset><legend className="mb-2 text-sm font-semibold">Шошго</legend><div className="flex flex-wrap gap-2">{(["featured", "new", "bestseller"] as const).map((tag) => <label key={tag} className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm ${p.tags.includes(tag) ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--on-ink)]" : "border-[var(--line-strong)]"}`}><input type="checkbox" className="sr-only" checked={p.tags.includes(tag)} onChange={() => toggleTag(tag)} />{{ featured: "Онцлох", new: "Шинэ", bestseller: "Эрэлттэй" }[tag]}</label>)}</div></fieldset>
          </section>
          <section className="card p-5">
            <h2 className="mb-3 font-semibold">Зураг</h2>
            <div className="grid grid-cols-3 gap-2">
              {p.images.map((img, i) => (
                <div key={i} className="group relative aspect-[4/5] overflow-hidden rounded-lg bg-[var(--surface-2)]">
                  <ProductPicture image={img} kind={p.art} color={p.colors[0]?.hex} className="size-full" />
                  <button type="button" aria-label="Зургийг хасах" onClick={() => set("images", p.images.filter((_, j) => j !== i))} className="absolute right-1 top-1 grid size-7 place-items-center rounded-full bg-black/60 text-white"><X className="size-3.5" /></button>
                </div>
              ))}
              <label className="grid aspect-[4/5] cursor-pointer place-items-center rounded-lg border-2 border-dashed border-[var(--line-strong)] text-center text-xs text-[var(--text-2)] hover:bg-[var(--surface-2)]">
                <span className="grid place-items-center gap-1">{uploading ? <Spinner className="size-5" /> : <ImagePlus className="size-5" />}Зураг оруулах</span>
                <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => { void upload(e.target.files); e.target.value = ""; }} data-testid="pf-upload" />
              </label>
            </div>
            <p className="mt-3 text-xs text-[var(--text-3)]">Оруулсан зураг автоматаар жижигрүүлэгдэн хөтчид хадгалагдана (демо). Бодит орчинд Supabase Storage ашиглана. Зураггүй бол студи дүрс харагдана.</p>
          </section>
        </div>
      </div>
    </form>
  );
}
