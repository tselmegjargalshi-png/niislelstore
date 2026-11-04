"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Eye, EyeOff, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { can } from "@/lib/admin-roles";
import { mnt } from "@/lib/pricing";
import { RepositoryError } from "@/lib/data/repository";
import { ProductPicture } from "../product-art";
import { EmptyState, Spinner } from "../ui/bits";
import { Confirm, PageHeader, Toggle, useAdmin } from "./admin-ui";
import type { Product } from "@/lib/types";

export function AdminProducts() {
  const { products, categories, repo, toast, ready } = useStore();
  const { role } = useAdmin();
  const write = can(role, "products.write");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [vis, setVis] = useState<"" | "visible" | "hidden" | "low">("");
  const [del, setDel] = useState<Product | null>(null);

  const list = useMemo(() => products.filter((p) => {
    if (cat && p.categoryId !== cat) return false;
    if (vis === "visible" && !p.visible) return false;
    if (vis === "hidden" && p.visible) return false;
    if (vis === "low" && p.stock > p.lowStockThreshold) return false;
    const s = q.trim().toLocaleLowerCase("mn");
    return !s || `${p.name} ${p.sku}`.toLocaleLowerCase("mn").includes(s);
  }), [products, q, cat, vis]);

  async function toggle(p: Product, visible: boolean) {
    try { await repo.saveProduct({ ...p, visible }); toast(visible ? `${p.name} харагдаж байна.` : `${p.name} нуугдлаа.`, "info"); }
    catch (e) { toast(e instanceof RepositoryError ? e.message : "Хадгалах үед алдаа гарлаа.", "error"); }
  }
  async function remove(p: Product) {
    try { await repo.deleteProduct(p.id); toast(`${p.name} устгагдлаа.`, "info"); } catch { toast("Устгах үед алдаа гарлаа.", "error"); }
    setDel(null);
  }

  return (
    <>
      <PageHeader title="Бүтээгдэхүүн" subtitle={`Нийт ${products.length} бүтээгдэхүүн`} actions={write ? <Link href="/admin/products/new" className="btn btn-primary btn-sm" data-testid="new-product"><Plus className="size-4" />Бүтээгдэхүүн нэмэх</Link> : <span className="badge badge-muted">Зөвхөн харах эрхтэй</span>} />
      <div className="mb-4 grid gap-2 sm:grid-cols-[1fr_200px_200px]">
        <label className="relative"><span className="sr-only">Хайх</span><Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--text-3)]" /><input className="input !pl-10" placeholder="Нэр эсвэл SKU кодоор хайх" value={q} onChange={(e) => setQ(e.target.value)} data-testid="admin-product-search" /></label>
        <select className="select" aria-label="Ангилал" value={cat} onChange={(e) => setCat(e.target.value)}><option value="">Бүх ангилал</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <select className="select" aria-label="Төлөв" value={vis} onChange={(e) => setVis(e.target.value as typeof vis)}><option value="">Бүх төлөв</option><option value="visible">Харагдаж буй</option><option value="hidden">Нуугдсан</option><option value="low">Нөөц багатай</option></select>
      </div>
      {!ready ? <div className="skeleton h-80" /> : list.length === 0 ? <EmptyState icon={<Search className="size-7" />} title="Бүтээгдэхүүн олдсонгүй" text="Хайлт, шүүлтүүрээ өөрчилнө үү." /> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm" data-testid="products-table">
              <thead className="border-b border-[var(--line)] bg-[var(--surface-2)] text-xs text-[var(--text-2)]"><tr><th className="p-3 font-semibold">Бүтээгдэхүүн</th><th className="p-3 font-semibold">Ангилал</th><th className="p-3 text-right font-semibold">Үнэ</th><th className="p-3 text-right font-semibold">Нөөц</th><th className="p-3 font-semibold">Харагдах</th><th className="p-3" /></tr></thead>
              <tbody className="divide-y divide-[var(--line)]">
                {list.map((p) => (
                  <tr key={p.id} className="hover:bg-[var(--surface-2)]/60" data-testid="product-row">
                    <td className="p-3"><div className="flex items-center gap-3"><div className="size-12 shrink-0 overflow-hidden rounded-lg"><ProductPicture image={p.images[0]} kind={p.art} color={p.colors[0]?.hex} className="size-full" /></div><div className="min-w-0"><p className="truncate font-medium">{p.name}</p><p className="text-xs text-[var(--text-3)]">{p.sku}</p></div></div></td>
                    <td className="p-3 text-[var(--text-2)]">{categories.find((c) => c.id === p.categoryId)?.name ?? "-"}</td>
                    <td className="tabular p-3 text-right"><p className="font-semibold">{mnt(p.price)}</p>{p.compareAtPrice ? <p className="text-xs text-[var(--text-3)] line-through">{mnt(p.compareAtPrice)}</p> : null}</td>
                    <td className="p-3 text-right"><span className={`badge ${p.stock === 0 ? "badge-danger" : p.stock <= p.lowStockThreshold ? "badge-warn" : "badge-success"}`}>{p.stock}</span></td>
                    <td className="p-3"><div className="flex items-center gap-2"><Toggle checked={p.visible} onChange={(v) => toggle(p, v)} label={`${p.name} харагдах`} disabled={!write} />{p.visible ? <Eye className="size-4 text-[var(--text-3)]" /> : <EyeOff className="size-4 text-[var(--text-3)]" />}</div></td>
                    <td className="p-3"><div className="flex justify-end gap-1.5">{write ? <><Link href={`/admin/products/${p.id}`} className="btn btn-ghost btn-sm" aria-label={`${p.name} засах`} data-testid="edit-product"><Pencil className="size-3.5" />Засах</Link><button className="btn btn-danger btn-sm" aria-label={`${p.name} устгах`} onClick={() => setDel(p)} data-testid="delete-product"><Trash2 className="size-3.5" /></button></> : <Link href={`/products/${p.slug}`} target="_blank" className="btn btn-ghost btn-sm">Харах</Link>}</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {del && <Confirm title="Бүтээгдэхүүн устгах" text={`"${del.name}" бүтээгдэхүүнийг бүр мөсөн устгах уу? Өмнөх захиалгын түүх хэвээр үлдэнэ.`} onConfirm={() => remove(del)} onClose={() => setDel(null)} />}
      <span className="hidden"><Spinner /></span>
    </>
  );
}
