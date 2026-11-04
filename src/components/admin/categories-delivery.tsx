"use client";
import { useEffect, useState, type FormEvent } from "react";
import { Pencil, Plus, Save, Trash2, Truck } from "lucide-react";
import { useStore } from "@/lib/store";
import { mnt } from "@/lib/pricing";
import { slugify } from "@/lib/slug";
import { RepositoryError } from "@/lib/data/repository";
import type { ArtKind, Category, DeliverySettings } from "@/lib/types";
import { Field } from "../ui/bits";
import { Confirm, Modal, PageHeader } from "./admin-ui";

function CategoryForm({ initial, onClose, count }: { initial: Category | null; onClose: () => void; count: number }) {
  const { repo, toast } = useStore();
  const [c, setC] = useState<Category>(initial ?? { id: "", slug: "", name: "", description: "", tone: "#E9E1D6", art: "sweater", sort: count + 1 });
  const [er, setEr] = useState<Record<string, string>>({});
  async function submit(e: FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (c.name.trim().length < 2) errs.name = "Нэр оруулна уу.";
    const slug = c.slug || slugify(c.name);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) errs.slug = "Холбоос зөвхөн жижиг латин үсэг, тоо, зураасаас бүрдэнэ.";
    setEr(errs);
    if (Object.keys(errs).length) return;
    try { await repo.saveCategory({ ...c, slug, name: c.name.trim() }); toast("Ангилал хадгалагдлаа."); onClose(); }
    catch (err) { setEr({ slug: err instanceof RepositoryError ? err.message : "Алдаа гарлаа." }); }
  }
  return (
    <Modal title={initial ? "Ангилал засах" : "Шинэ ангилал"} onClose={onClose}>
      <form onSubmit={submit} noValidate className="grid gap-4" data-testid="category-form">
        <Field label="Нэр" error={er.name} htmlFor="ct-name"><input id="ct-name" className="input" value={c.name} onChange={(e) => setC({ ...c, name: e.target.value, slug: initial ? c.slug : slugify(e.target.value) })} aria-invalid={!!er.name} data-testid="ct-name" /></Field>
        <Field label="Холбоос (slug)" error={er.slug} htmlFor="ct-slug"><input id="ct-slug" className="input" value={c.slug} onChange={(e) => setC({ ...c, slug: e.target.value.toLowerCase() })} aria-invalid={!!er.slug} /></Field>
        <Field label="Тайлбар" htmlFor="ct-desc"><input id="ct-desc" className="input" value={c.description} onChange={(e) => setC({ ...c, description: e.target.value })} /></Field>
        <div className="grid gap-4 sm:grid-cols-2"><Field label="Дэвсгэр өнгө" htmlFor="ct-tone"><input id="ct-tone" type="color" className="input !p-1" value={c.tone} onChange={(e) => setC({ ...c, tone: e.target.value })} /></Field><Field label="Дүрс" htmlFor="ct-art"><select id="ct-art" className="select" value={c.art} onChange={(e) => setC({ ...c, art: e.target.value as ArtKind })}>{(["sweater", "jacket", "tote", "vase", "dropper", "honey", "bracelet", "cup", "boots"] as ArtKind[]).map((a) => <option key={a}>{a}</option>)}</select></Field></div>
        <div className="flex justify-end gap-2"><button type="button" className="btn btn-ghost" onClick={onClose}>Болих</button><button className="btn btn-primary" data-testid="ct-save">Хадгалах</button></div>
      </form>
    </Modal>
  );
}

export function AdminCategories() {
  const { categories, products, repo, toast, ready } = useStore();
  const [edit, setEdit] = useState<Category | null | undefined>(undefined);
  const [del, setDel] = useState<Category | null>(null);
  if (!ready) return <div className="skeleton h-80" />;
  return (
    <>
      <PageHeader title="Ангилал" actions={<button className="btn btn-primary btn-sm" onClick={() => setEdit(null)} data-testid="new-category"><Plus className="size-4" />Ангилал нэмэх</button>} />
      <div className="card divide-y divide-[var(--line)]" data-testid="categories-list">
        {categories.map((c) => (
          <div key={c.id} className="flex items-center gap-4 p-4" data-testid="category-row"><span className="size-10 shrink-0 rounded-lg" style={{ background: c.tone }} /><div className="min-w-0 flex-1"><p className="font-semibold">{c.name}</p><p className="truncate text-sm text-[var(--text-2)]">{c.description}</p></div><span className="badge badge-muted">{`${products.filter((p) => p.categoryId === c.id).length} бараа`}</span><div className="flex gap-1.5"><button className="btn btn-ghost btn-sm" onClick={() => setEdit(c)} aria-label={`${c.name} засах`}><Pencil className="size-3.5" /></button><button className="btn btn-danger btn-sm" onClick={() => setDel(c)} aria-label={`${c.name} устгах`}><Trash2 className="size-3.5" /></button></div></div>
        ))}
      </div>
      {edit !== undefined && <CategoryForm initial={edit} onClose={() => setEdit(undefined)} count={categories.length} />}
      {del && <Confirm title="Ангилал устгах" text={`"${del.name}" ангиллыг устгах уу? Бүтээгдэхүүнтэй ангиллыг устгах боломжгүй.`} onConfirm={async () => { try { await repo.deleteCategory(del.id); toast("Ангилал устгагдлаа.", "info"); } catch (e) { toast(e instanceof RepositoryError ? e.message : "Алдаа гарлаа.", "error"); } setDel(null); }} onClose={() => setDel(null)} />}
    </>
  );
}

export function AdminDelivery() {
  const { delivery, repo, toast, ready } = useStore();
  const [s, setS] = useState<DeliverySettings | null>(null);
  useEffect(() => { if (delivery && !s) setS(structuredClone(delivery)); }, [delivery, s]);
  if (!ready || !s) return <div className="skeleton h-96" />;
  const num = (v: string) => Math.max(0, Math.round(Number(v.replace(/[\s,]/g, "")) || 0));

  async function save() {
    if (!s) return;
    await repo.saveDelivery(s);
    toast("Хүргэлтийн тохиргоо хадгалагдлаа.");
  }
  return (
    <>
      <PageHeader title="Хүргэлтийн тохиргоо" subtitle="Дүүрэг бүрийн хүргэлтийн үнэ, хугацааг энд тохируулна. Захиалгын тооцоонд шууд нөлөөлнө." actions={<button className="btn btn-primary btn-sm" onClick={save} data-testid="save-delivery"><Save className="size-4" />Хадгалах</button>} />
      <section className="card mb-6 p-5">
        <h2 className="mb-4 flex items-center gap-2 font-semibold"><Truck className="size-4 text-[var(--accent)]" />Ерөнхий</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Үнэгүй хүргэлтийн босго (₮)" htmlFor="d-free" hint="0 бол идэвхгүй"><input id="d-free" inputMode="numeric" className="input" value={s.freeShippingThreshold} onChange={(e) => setS({ ...s, freeShippingThreshold: num(e.target.value) })} data-testid="d-free" /></Field>
          <Field label="Орон нутгийн хүргэлт (₮)" htmlFor="d-prov"><input id="d-prov" inputMode="numeric" className="input" value={s.provinceFee} onChange={(e) => setS({ ...s, provinceFee: num(e.target.value) })} /></Field>
          <Field label="Орон нутгийн хугацаа (өдөр)" htmlFor="d-pd"><input id="d-pd" inputMode="numeric" className="input" value={s.provinceDays} onChange={(e) => setS({ ...s, provinceDays: num(e.target.value) })} /></Field>
          <Field label="Шуурхай захиалгын цаг (хүртэл)" htmlFor="d-cut"><input id="d-cut" inputMode="numeric" className="input" value={s.expressCutoffHour} onChange={(e) => setS({ ...s, expressCutoffHour: Math.min(23, num(e.target.value)) })} /></Field>
        </div>
      </section>
      <section className="card overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm" data-testid="district-table">
          <thead className="border-b border-[var(--line)] bg-[var(--surface-2)] text-xs text-[var(--text-2)]"><tr><th className="p-3 font-semibold">Дүүрэг</th><th className="p-3 font-semibold">Энгийн (₮)</th><th className="p-3 font-semibold">Шуурхай (₮)</th><th className="p-3 font-semibold">Хугацаа (өдөр)</th></tr></thead>
          <tbody className="divide-y divide-[var(--line)]">{s.districts.map((d, i) => (
            <tr key={d.id}><td className="p-3 font-medium">{d.name}</td>
              <td className="p-3"><input aria-label={`${d.name} энгийн хүргэлт`} inputMode="numeric" className="input !min-h-10 !w-32" value={d.standardFee} onChange={(e) => setS({ ...s, districts: s.districts.map((x, j) => (j === i ? { ...x, standardFee: num(e.target.value) } : x)) })} data-testid={`fee-${d.name}`} /></td>
              <td className="p-3"><input aria-label={`${d.name} шуурхай хүргэлт`} inputMode="numeric" className="input !min-h-10 !w-32" placeholder="Байхгүй" value={d.expressFee ?? ""} onChange={(e) => setS({ ...s, districts: s.districts.map((x, j) => (j === i ? { ...x, expressFee: e.target.value.trim() === "" ? null : num(e.target.value) } : x)) })} /></td>
              <td className="p-3"><input aria-label={`${d.name} хугацаа`} inputMode="numeric" className="input !min-h-10 !w-24" value={d.standardDays} onChange={(e) => setS({ ...s, districts: s.districts.map((x, j) => (j === i ? { ...x, standardDays: Math.max(1, num(e.target.value)) } : x)) })} /></td></tr>))}</tbody>
        </table></div>
      </section>
      <p className="mt-3 text-xs text-[var(--text-3)]">{`Жишээ: ${s.districts[0].name} дүүрэгт энгийн хүргэлт ${mnt(s.districts[0].standardFee)}.`}</p>
    </>
  );
}
