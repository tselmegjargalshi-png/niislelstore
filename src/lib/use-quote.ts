"use client";
import { useMemo } from "react";
import { useCartLines, useStore } from "./store";
import { quoteOrder } from "./pricing";
import type { DeliveryMethod } from "./types";

/** Сагс, checkout хоёрт нийтлэг тооцоо. Үнэ, купоныг ЗАВАЛ репозиторийн одоогийн өгөгдлөөс авна (сагсанд хадгалсан үнээс биш). */
export function useQuote(opts: { method: DeliveryMethod; city: string; district: string }) {
  const lines = useCartLines();
  const { coupons, appliedCoupon, delivery } = useStore();
  return useMemo(() => {
    if (!delivery) return null;
    const coupon = appliedCoupon ? coupons.find((c) => c.code === appliedCoupon) ?? null : null;
    const priced = lines.map(({ line, product }) => ({ unitPrice: product.price, compareAtPrice: product.compareAtPrice, quantity: line.quantity }));
    const q = quoteOrder({ lines: priced, coupon, settings: delivery, method: opts.method, city: opts.city, district: opts.district });
    return { ...q, lines, couponMissing: !!appliedCoupon && !coupon };
  }, [lines, coupons, appliedCoupon, delivery, opts.method, opts.city, opts.district]);
}
