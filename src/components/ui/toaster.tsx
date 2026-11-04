"use client";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useStore } from "@/lib/store";

export function Toaster() {
  const { toasts, dismissToast } = useStore();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[100] flex flex-col items-center gap-2 px-4 md:bottom-6 md:items-end md:pr-6" aria-live="polite" role="status">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3.5 shadow-[var(--shadow-lg)]"
          style={{ animation: "toast-in .3s cubic-bezier(.2,.8,.3,1) both" }}
        >
          {t.kind === "success" ? <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[var(--success)]" /> : t.kind === "error" ? <XCircle className="mt-0.5 size-5 shrink-0 text-[var(--danger)]" /> : <Info className="mt-0.5 size-5 shrink-0 text-[var(--info)]" />}
          <p className="flex-1 text-sm leading-snug">{t.message}</p>
          <button onClick={() => dismissToast(t.id)} aria-label="Хаах" className="text-[var(--text-3)] hover:text-[var(--text)]"><X className="size-4" /></button>
        </div>
      ))}
    </div>
  );
}
