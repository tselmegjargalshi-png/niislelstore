import { Check, CircleDashed, XCircle } from "lucide-react";
import type { Order } from "@/lib/types";
import { STATUS_LABEL, fmtDate, flowFor } from "@/lib/use-order";

export function Timeline({ order }: { order: Order }) {
  const flow = flowFor(order.shipping.method);
  const cancelled = order.status === "cancelled";
  const reached = new Map(order.history.map((h) => [h.status, h]));
  const currentIdx = flow.indexOf(order.status);
  return (
    <ol className="grid gap-0" aria-label="Захиалгын явц" data-testid="timeline">
      {flow.map((s, i) => {
        const done = !cancelled && i <= currentIdx;
        const ev = reached.get(s);
        return (
          <li key={s} className="relative flex gap-4 pb-6 last:pb-0" aria-current={!cancelled && i === currentIdx ? "step" : undefined}>
            {i < flow.length - 1 && <span className={`absolute left-[15px] top-8 h-[calc(100%-2rem)] w-0.5 ${done && i < currentIdx ? "bg-[var(--success)]" : "bg-[var(--line)]"}`} />}
            <span className={`z-10 grid size-8 shrink-0 place-items-center rounded-full border-2 ${done ? "border-[var(--success)] bg-[var(--success)] text-white" : "border-[var(--line-strong)] bg-[var(--surface)] text-[var(--text-3)]"}`}>{done ? <Check className="size-4" /> : <CircleDashed className="size-4" />}</span>
            <div className="pt-1"><p className={`text-sm font-semibold ${done ? "" : "text-[var(--text-3)]"}`}>{STATUS_LABEL[s]}</p>{ev && <p className="text-xs text-[var(--text-3)]">{fmtDate(ev.at)}{ev.note ? ` · ${ev.note}` : ""}</p>}</div>
          </li>
        );
      })}
      {cancelled && (
        <li className="flex gap-4 pt-6"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--danger)] text-white"><XCircle className="size-4" /></span><div className="pt-1"><p className="text-sm font-semibold text-[var(--danger)]">Цуцлагдсан</p><p className="text-xs text-[var(--text-3)]">{order.cancelReason}</p></div></li>
      )}
    </ol>
  );
}
