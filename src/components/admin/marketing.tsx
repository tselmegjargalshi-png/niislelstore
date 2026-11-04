"use client";
import { useState, type FormEvent } from "react";
import { Megaphone, Pencil, Plus, Star, Tag, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { mnt } from "@/lib/pricing";
import { couponSchema, fieldErrors, type FieldErrors } from "@/lib/validation";
import { RepositoryError } from "@/lib/data/repository";
import type { ArtKind, Banner, Coupon, CouponType } from "@/lib/types";
import { EmptyState, Field } from "../ui/bits";
import { Confirm, Modal, PageHeader, Toggle } from "./admin-ui";

const TYPE_LABEL: Record<CouponType, string> = { percent: "Хувиар", fixed: "Тогтмол дүн", freeship: "Үнэгүй хүргэлт" };

function CouponForm({ initial, onClose }: { initial: Coupon | null; onClose: () => void }) {
  const { repo, toast } = useStore();
  const [v, setV] = useState({ code: initial?.code ?? "", type: (initial?.type ?? "percent") as CouponType, value: String(initial?.value ?? 10), min: String(initial?.minSubtotal ?? 0), max: String(initial?.maxDiscount ?? 0), desc: initial?.description ?? "", limit: String(initial?.usageLimit ?? 0), expires: initial?.expiresAt?.slice(0, 10) ?? "" });
  const [er, setEr] = useState<FieldErrors>({});
  async function submit(e: FormEvent) {
    e.preventDefault();
    const n = (s: string) => (s.trim() === "" ? NaN : Number(s.replace(/[\s,]/g, "")));
    const r = couponSchema.safeParse({ code: v.code, type: v.type, value: v.type === "freeship" ? 0 : n(v.value), minSubtotal: n(v.min), maxDiscount: n(v.max), description: v.desc, usageLimit: n(v.limit) });
    if (!r.success) return setEr(fieldErrors(r.error));
    try {
      await repo.saveCoupon({ id: initial?.id ?? "", ...r.data, active: initial?.active ?? true, usedCount: initial?.usedCount ?? 0, expiresAt: v.expires ? new Date(`${v.expires}T23:59:59`).toISOString() : null, createdAt: initial?.createdAt ?? new Date().toISOString() });
      toast(initial ? "Купон шинэчлэгдлээ." : "Купон нэмэгдлээ."); onClose();
    } catch (err) { setEr({ code: err instanceof RepositoryError ? err.message : "Хадгалах үед алдаа гарлаа." }); }
  }
  const f = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { setV({ ...v, [k]: e.target.value }); setEr({}); };
  return (
    <Modal title={initial ? "Купон засах" : "Шинэ купон"} onClose={onClose}>
      <form onSubmit={submit} noValidate className="grid gap-4" data-testid="coupon-form">
        <Field label="Купон код" error={er.code} htmlFor="cp-code"><input id="cp-code" className="input uppercase" value={v.code} onChange={f("code")} aria-invalid={!!er.code} data-testid="cp-code" /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Төрөл" htmlFor="cp-type"><select id="cp-type" className="select" value={v.type} onChange={f("type")}>{(Object.keys(TYPE_LABEL) as CouponType[]).map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}</select></Field>
          {v.type !== "freeship" && <Field label={v.type === "percent" ? "Хувь (%)" : "Дүн (₮)"} error={er.value} htmlFor="cp-val"><input id="cp-val" inputMode="numeric" className="input" value={v.value} onChange={f("value")} aria-invalid={!!er.value} data-testid="cp-value" /></Field>}
          <Field label="Доод дүн (₮)" htmlFor="cp-min"><input id="cp-min" inputMode="numeric" className="input" value={v.min} onChange={f("min")} /></Field>
          {v.type === "percent" && <Field label="Дээд хөнгөлөлт (₮)" htmlFor="cp-max" hint="0 бол хязгааргүй"><input id="cp-max" inputMode="numeric" className="input" value={v.max} onChange={f("max")} /></Field>}
          <Field label="Ашиглах эрхийн тоо" htmlFor="cp-lim" hint="0 бол хязгааргүй"><input id="cp-lim" inputMode="numeric" className="input" value={v.limit} onChange={f("limit")} /></Field>
          <Field label="Дуусах огноо" htmlFor="cp-exp"><input id="cp-exp" type="date" className="input" value={v.expires} onChange={f("expires")} /></Field>
        </div>
        <Field label="Тайлбар" error={er.description} htmlFor="cp-desc"><input id="cp-desc" className="input" value={v.desc} onChange={f("desc")} aria-invalid={!!er.description} /></Field>
        <div className="flex justify-end gap-2"><button type="button" className="btn btn-ghost" onClick={onClose}>Болих</button><button className="btn btn-primary" data-testid="cp-save">Хадгалах</button></div>
      </form>
    </Modal>
  );
}

const ARTS: ArtKind[] = ["coat", "sweater", "giftbox", "tote", "vase", "honey", "bracelet", "jacket", "scarf"];
function BannerForm({ initial, onClose }: { initial: Banner | null; onClose: () => void }) {
  const { repo, toast } = useStore();
  const [b, setB] = useState<Banner>(initial ?? { id: "", placement: "promo", eyebrow: "", title: "", subtitle: "", cta: "Дэлгэрэнгүй", href: "/products", theme: "dark", art: "coat", active: true, sort: 9 });
  const [er, setEr] = useState("");
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (b.title.trim().length < 3) return setEr("Гарчиг оруулна уу.");
    if (!b.href.startsWith("/")) return setEr("Холбоос «/» тэмдэгтээр эхлэх ёстой (дотоод хуудас).");
    await repo.saveBanner(b); toast("Баннер хадгалагдлаа."); onClose();
  }
  const s = <K extends keyof Banner>(k: K, v: Banner[K]) => { setB({ ...b, [k]: v }); setEr(""); };
  return (
    <Modal title={initial ? "Баннер засах" : "Шинэ баннер"} onClose={onClose}>
      <form onSubmit={submit} noValidate className="grid gap-4" data-testid="banner-form">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Байршил" htmlFor="bn-pl"><select id="bn-pl" className="select" value={b.placement} onChange={(e) => s("placement", e.target.value as Banner["placement"])}><option value="hero">Нүүрний гол баннер</option><option value="promo">Урамшууллын карт</option><option value="strip">Дээд мөр</option></select></Field>
          <Field label="Өнгөний загвар" htmlFor="bn-th"><select id="bn-th" className="select" value={b.theme} onChange={(e) => s("theme", e.target.value as Banner["theme"])}><option value="dark">Харанхуй</option><option value="light">Цайвар</option><option value="accent">Онцлох</option></select></Field>
        </div>
        <Field label="Дээд бичвэр" htmlFor="bn-ey"><input id="bn-ey" className="input" value={b.eyebrow} onChange={(e) => s("eyebrow", e.target.value)} /></Field>
        <Field label="Гарчиг" error={er} htmlFor="bn-ti"><input id="bn-ti" className="input" value={b.title} onChange={(e) => s("title", e.target.value)} aria-invalid={!!er} data-testid="bn-title" /></Field>
        <Field label="Дэд бичвэр" htmlFor="bn-su"><input id="bn-su" className="input" value={b.subtitle} onChange={(e) => s("subtitle", e.target.value)} /></Field>
        <div className="grid gap-4 sm:grid-cols-2"><Field label="Товчны бичиг" htmlFor="bn-cta"><input id="bn-cta" className="input" value={b.cta} onChange={(e) => s("cta", e.target.value)} /></Field><Field label="Холбоос" htmlFor="bn-href"><input id="bn-href" className="input" value={b.href} onChange={(e) => s("href", e.target.value)} /></Field></div>
        <Field label="Зураг" htmlFor="bn-art"><select id="bn-art" className="select" value={b.art} onChange={(e) => s("art", e.target.value as ArtKind)}>{ARTS.map((a) => <option key={a}>{a}</option>)}</select></Field>
        <div className="flex justify-end gap-2"><button type="button" className="btn btn-ghost" onClick={onClose}>Болих</button><button className="btn btn-primary" data-testid="bn-save">Хадгалах</button></div>
      </form>
    </Modal>
  );
}

export function AdminMarketing() {
  const { coupons, banners, products, repo, toast, ready } = useStore();
  const [tab, setTab] = useState<"coupons" | "banners" | "featured">("coupons");
  const [cp, setCp] = useState<Coupon | null | undefined>(undefined);
  const [bn, setBn] = useState<Banner | null | undefined>(undefined);
  const [del, setDel] = useState<{ kind: "c" | "b"; id: string; label: string } | null>(null);
  if (!ready) return <div className="skeleton h-96" />;

  return (
    <>
      <PageHeader title="Маркетинг" subtitle="Купон, баннер болон онцлох бараа." actions={tab === "coupons" ? <button className="btn btn-primary btn-sm" onClick={() => setCp(null)} data-testid="new-coupon"><Plus className="size-4" />Купон нэмэх</button> : tab === "banners" ? <button className="btn btn-primary btn-sm" onClick={() => setBn(null)} data-testid="new-banner"><Plus className="size-4" />Баннер нэмэх</button> : null} />
      <div className="mb-5 flex gap-2" role="tablist">
        {([["coupons", "Купон", Tag], ["banners", "Баннер", Megaphone], ["featured", "Онцлох бараа", Star]] as const).map(([k, l, I]) => <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${tab === k ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--on-ink)]" : "border-[var(--line-strong)] bg-[var(--surface)]"}`}><I className="size-4" />{l}</button>)}
      </div>

      {tab === "coupons" && (coupons.length === 0 ? <EmptyState icon={<Tag className="size-7" />} title="Купон алга" /> : (
        <div className="card overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm" data-testid="coupons-table">
          <thead className="border-b border-[var(--line)] bg-[var(--surface-2)] text-xs text-[var(--text-2)]"><tr><th className="p-3 font-semibold">Код</th><th className="p-3 font-semibold">Хөнгөлөлт</th><th className="p-3 font-semibold">Доод дүн</th><th className="p-3 text-right font-semibold">Ашигласан</th><th className="p-3 font-semibold">Идэвхтэй</th><th className="p-3" /></tr></thead>
          <tbody className="divide-y divide-[var(--line)]">{coupons.map((c) => (
            <tr key={c.id} data-testid="coupon-row"><td className="p-3"><b className="tabular">{c.code}</b><p className="text-xs text-[var(--text-3)]">{c.description}</p></td>
              <td className="p-3">{c.type === "percent" ? `${c.value}%${c.maxDiscount ? `, дээд ${mnt(c.maxDiscount)}` : ""}` : c.type === "fixed" ? mnt(c.value) : "Үнэгүй хүргэлт"}</td>
              <td className="tabular p-3 text-[var(--text-2)]">{c.minSubtotal ? mnt(c.minSubtotal) : "-"}</td>
              <td className="tabular p-3 text-right">{c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ""}</td>
              <td className="p-3"><Toggle checked={c.active} onChange={async (v) => { await repo.saveCoupon({ ...c, active: v }); toast(v ? "Купон идэвхжлээ." : "Купон идэвхгүй боллоо.", "info"); }} label={`${c.code} идэвхтэй`} /></td>
              <td className="p-3"><div className="flex justify-end gap-1.5"><button className="btn btn-ghost btn-sm" onClick={() => setCp(c)} aria-label={`${c.code} засах`}><Pencil className="size-3.5" /></button><button className="btn btn-danger btn-sm" onClick={() => setDel({ kind: "c", id: c.id, label: c.code })} aria-label={`${c.code} устгах`}><Trash2 className="size-3.5" /></button></div></td></tr>))}</tbody>
        </table></div></div>
      ))}

      {tab === "banners" && (
        <div className="grid gap-3" data-testid="banners-list">{banners.map((b) => (
          <div key={b.id} className="card flex flex-wrap items-center gap-4 p-4">
            <div className="min-w-0 flex-1"><div className="mb-1 flex flex-wrap items-center gap-2"><span className="badge badge-muted">{{ hero: "Гол баннер", promo: "Урамшуулал", strip: "Дээд мөр" }[b.placement]}</span><span className="text-xs text-[var(--text-3)]">{b.href}</span></div><p className="font-semibold">{b.title.replace(/\n/g, " ")}</p><p className="truncate text-sm text-[var(--text-2)]">{b.subtitle}</p></div>
            <Toggle checked={b.active} onChange={async (v) => { await repo.saveBanner({ ...b, active: v }); toast(v ? "Баннер идэвхжлээ." : "Баннер нуугдлаа.", "info"); }} label={`${b.title} идэвхтэй`} />
            <div className="flex gap-1.5"><button className="btn btn-ghost btn-sm" onClick={() => setBn(b)} aria-label="Засах"><Pencil className="size-3.5" /></button><button className="btn btn-danger btn-sm" onClick={() => setDel({ kind: "b", id: b.id, label: b.title })} aria-label="Устгах"><Trash2 className="size-3.5" /></button></div>
          </div>))}</div>
      )}

      {tab === "featured" && (
        <div className="card divide-y divide-[var(--line)]" data-testid="featured-list">{products.map((p) => { const on = p.tags.includes("featured"); return (
          <div key={p.id} className="flex items-center justify-between gap-3 p-3 text-sm"><div className="min-w-0"><p className="truncate font-medium">{p.name}</p><p className="text-xs text-[var(--text-3)]">{mnt(p.price)}</p></div><Toggle checked={on} onChange={async (v) => { await repo.saveProduct({ ...p, tags: v ? [...p.tags, "featured"] : p.tags.filter((t) => t !== "featured") }); toast(v ? `${p.name} онцлох боллоо.` : `${p.name} онцлохоос хасагдлаа.`, "info"); }} label={`${p.name} онцлох`} /></div>); })}</div>
      )}

      {cp !== undefined && <CouponForm initial={cp} onClose={() => setCp(undefined)} />}
      {bn !== undefined && <BannerForm initial={bn} onClose={() => setBn(undefined)} />}
      {del && <Confirm title="Устгах" text={`"${del.label.replace(/\n/g, " ")}" устгах уу?`} onConfirm={async () => { if (del.kind === "c") await repo.deleteCoupon(del.id); else await repo.deleteBanner(del.id); toast("Устгагдлаа.", "info"); setDel(null); }} onClose={() => setDel(null)} />}
    </>
  );
}
