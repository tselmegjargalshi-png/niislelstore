"use client";
import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { createContext, useContext } from "react";
import type { AdminRole } from "@/lib/admin-roles";

export const AdminCtx = createContext<{ email: string; role: AdminRole } | null>(null);
export const useAdmin = () => {
  const c = useContext(AdminCtx);
  if (!c) throw new Error("useAdmin outside AdminShell");
  return c;
};

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div><h1 className="text-2xl md:text-3xl">{title}</h1>{subtitle && <p className="mt-1 text-sm text-[var(--text-2)]">{subtitle}</p>}</div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[80] grid place-items-end sm:place-items-center" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/55" onClick={onClose} style={{ animation: "fade-in .2s both" }} />
      <div className={`relative max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl bg-[var(--surface)] p-5 shadow-[var(--shadow-lg)] sm:rounded-3xl sm:p-7 ${wide ? "sm:max-w-3xl" : "sm:max-w-lg"}`} style={{ animation: "rise .25s both" }}>
        <div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-semibold">{title}</h2><button onClick={onClose} aria-label="Хаах" className="grid size-9 place-items-center rounded-full hover:bg-[var(--surface-2)]"><X className="size-5" /></button></div>
        {children}
      </div>
    </div>
  );
}

export function Confirm({ title, text, confirmLabel = "Устгах", onConfirm, onClose, danger = true }: { title: string; text: string; confirmLabel?: string; onConfirm: () => void; onClose: () => void; danger?: boolean }) {
  return (
    <Modal title={title} onClose={onClose}>
      <p className="text-sm text-[var(--text-2)]">{text}</p>
      <div className="mt-6 flex justify-end gap-2"><button className="btn btn-ghost" onClick={onClose}>Болих</button><button className={`btn ${danger ? "btn-danger !bg-[var(--danger)] !text-white" : "btn-primary"}`} onClick={onConfirm} data-testid="confirm-yes">{confirmLabel}</button></div>
    </Modal>
  );
}

export function Stat({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: string }) {
  return (
    <div className="card p-4 md:p-5">
      <p className="text-xs font-medium text-[var(--text-2)] md:text-sm">{label}</p>
      <p className={`display tabular mt-1.5 text-xl font-semibold md:text-2xl ${tone ?? ""}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-[var(--text-3)]">{hint}</p>}
    </div>
  );
}

export function Toggle({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} disabled={disabled} onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition disabled:opacity-50 ${checked ? "bg-[var(--success)]" : "bg-[var(--line-strong)]"}`}>
      <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${checked ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}
