"use client";
import { useCallback, useEffect, useState } from "react";
import { useStore } from "./store";
import type { Order } from "./types";

export function useOrder(number: string) {
  const { repo, ready } = useStore();
  const [order, setOrder] = useState<Order | null | undefined>(undefined);
  const load = useCallback(async () => setOrder(await repo.getOrder(number)), [repo, number]);
  useEffect(() => {
    if (!ready) return;
    void load();
    return repo.subscribe(() => void load());
  }, [repo, ready, load]);
  return order;
}

export const STATUS_LABEL: Record<Order["status"], string> = {
  pending: "Хүлээгдэж буй", confirmed: "Баталгаажсан", processing: "Бэлтгэж байна", shipped: "Хүргэлтэд гарсан",
  ready: "Очиж авахад бэлэн", delivered: "Хүргэгдсэн", cancelled: "Цуцлагдсан",
};
export const STATUS_TONE: Record<Order["status"], string> = {
  pending: "badge-warn", confirmed: "badge-info", processing: "badge-info", shipped: "badge-info", ready: "badge-success", delivered: "badge-success", cancelled: "badge-danger",
};
export const PAYMENT_LABEL: Record<Order["payment"]["status"], string> = {
  unpaid: "Төлөөгүй", awaiting: "Төлбөр хүлээж байна", paid: "Төлөгдсөн", failed: "Амжилтгүй", refunded: "Буцаагдсан",
};
export const PAYMENT_TONE: Record<Order["payment"]["status"], string> = {
  unpaid: "badge-muted", awaiting: "badge-warn", paid: "badge-success", failed: "badge-danger", refunded: "badge-muted",
};
export const METHOD_LABEL = { qpay: "QPay", socialpay: "SocialPay", bank: "Дансаар шилжүүлэх", cod: "Бэлнээр төлөх" } as const;
export const SHIP_LABEL = { standard: "Энгийн хүргэлт", express: "Шуурхай хүргэлт", pickup: "Салбараас очиж авах" } as const;

export function flowFor(method: Order["shipping"]["method"]): Order["status"][] {
  return method === "pickup" ? ["pending", "confirmed", "processing", "ready", "delivered"] : ["pending", "confirmed", "processing", "shipped", "delivered"];
}
export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("mn-MN", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false });
