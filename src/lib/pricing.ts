/**
 * Үнийн тооцоолол: сагс, checkout, server талын баталгаажуулалт гурвуулаа
 * энэ нэг цэвэр функцийг ашиглана. Бүх дүн бүхэл төгрөгөөр.
 */
import type { Coupon, DeliveryMethod, DeliverySettings, Pricing } from "./types";

export interface PricedLine {
  unitPrice: number;
  compareAtPrice?: number | null;
  quantity: number;
}

export type CouponResult =
  | { ok: true; coupon: Coupon; discount: number; freeShipping: boolean; message: string }
  | { ok: false; error: string };

/** 1 234 567₮ хэлбэр (нарийн зай). */
export function mnt(n: number): string {
  const s = Math.round(Math.abs(n))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${n < 0 ? "−" : ""}${s}₮`;
}

export function lineSubtotal(lines: PricedLine[]): number {
  return lines.reduce((sum, l) => sum + Math.round(l.unitPrice) * l.quantity, 0);
}

export function itemSavings(lines: PricedLine[]): number {
  return lines.reduce((sum, l) => {
    const c = l.compareAtPrice ?? 0;
    return c > l.unitPrice ? sum + (c - l.unitPrice) * l.quantity : sum;
  }, 0);
}

export function discountPercent(price: number, compareAt?: number | null): number {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export function evaluateCoupon(coupon: Coupon | undefined | null, subtotal: number, now = new Date()): CouponResult {
  if (!coupon) return { ok: false, error: "Ийм купон код олдсонгүй." };
  if (!coupon.active) return { ok: false, error: "Энэ купон идэвхгүй байна." };
  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < now.getTime())
    return { ok: false, error: "Купоны хугацаа дууссан байна." };
  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit)
    return { ok: false, error: "Купоны ашиглах эрх дууссан байна." };
  if (subtotal < coupon.minSubtotal)
    return { ok: false, error: `Энэ купон ${mnt(coupon.minSubtotal)} ба түүнээс дээш худалдан авалтад хүчинтэй.` };

  let discount = 0;
  if (coupon.type === "percent") {
    discount = Math.round((subtotal * Math.min(Math.max(coupon.value, 0), 90)) / 100);
    if (coupon.maxDiscount > 0) discount = Math.min(discount, coupon.maxDiscount);
  } else if (coupon.type === "fixed") {
    discount = Math.min(Math.round(coupon.value), subtotal);
  }
  const freeShipping = coupon.type === "freeship";
  const message =
    coupon.type === "percent"
      ? `${coupon.value}% хөнгөлөлт амжилттай хэрэглэгдлээ.`
      : coupon.type === "fixed"
        ? `${mnt(discount)} хөнгөлөлт амжилттай хэрэглэгдлээ.`
        : "Үнэгүй хүргэлт идэвхжлээ.";
  return { ok: true, coupon, discount, freeShipping, message };
}

export interface DeliveryQuote {
  available: boolean;
  fee: number;
  estimate: string;
  reason?: string;
}

export function quoteDelivery(
  settings: DeliverySettings,
  opts: { method: DeliveryMethod; city: string; district: string; subtotalAfterDiscount: number; freeShipping?: boolean; now?: Date },
): DeliveryQuote {
  const now = opts.now ?? new Date();
  if (opts.method === "pickup") {
    return { available: true, fee: 0, estimate: now.getHours() < 16 ? "Өнөөдөр 18:00 цагаас хойш бэлэн" : "Маргааш 12:00 цагаас хойш бэлэн" };
  }
  const isUB = opts.city === "Улаанбаатар";
  if (!isUB) {
    if (opts.method === "express") return { available: false, fee: 0, estimate: "", reason: "Шуурхай хүргэлт зөвхөн Улаанбаатар хотод." };
    const free = opts.freeShipping;
    return { available: true, fee: free ? 0 : settings.provinceFee, estimate: `Ажлын ${settings.provinceDays} хоногт` };
  }
  const d = settings.districts.find((x) => x.name === opts.district);
  if (!d) return { available: false, fee: 0, estimate: "", reason: "Дүүргээ сонгоно уу." };
  if (opts.method === "express") {
    if (d.expressFee == null) return { available: false, fee: 0, estimate: "", reason: `${d.name} дүүрэгт шуурхай хүргэлт хийгдэхгүй.` };
    const sameDay = now.getHours() < settings.expressCutoffHour;
    return { available: true, fee: opts.freeShipping ? 0 : d.expressFee, estimate: sameDay ? "Өнөөдөр 3 цагийн дотор" : "Маргааш 12:00 цагаас өмнө" };
  }
  const free =
    opts.freeShipping || (settings.freeShippingThreshold > 0 && opts.subtotalAfterDiscount >= settings.freeShippingThreshold);
  return {
    available: true,
    fee: free ? 0 : d.standardFee,
    estimate: d.standardDays <= 1 ? "Маргааш хүргэнэ" : `Ажлын ${d.standardDays} хоногт`,
  };
}

/** Захиалгын эцсийн дүн: subtotal − купон + хүргэлт. */
export function computePricing(lines: PricedLine[], couponDiscount: number, deliveryFee: number): Pricing {
  const subtotal = lineSubtotal(lines);
  const discount = Math.min(Math.max(0, Math.round(couponDiscount)), subtotal);
  const fee = Math.max(0, Math.round(deliveryFee));
  return {
    subtotal,
    itemSavings: itemSavings(lines),
    couponDiscount: discount,
    deliveryFee: fee,
    total: subtotal - discount + fee,
  };
}

/** Сагс, checkout хоёулаа ашигладаг бүтэн тооцоо. */
export function quoteOrder(args: {
  lines: PricedLine[];
  coupon?: Coupon | null;
  settings: DeliverySettings;
  method: DeliveryMethod;
  city: string;
  district: string;
  now?: Date;
}) {
  const subtotal = lineSubtotal(args.lines);
  const couponRes = args.coupon ? evaluateCoupon(args.coupon, subtotal, args.now) : null;
  const discount = couponRes?.ok ? couponRes.discount : 0;
  const delivery = quoteDelivery(args.settings, {
    method: args.method,
    city: args.city,
    district: args.district,
    subtotalAfterDiscount: subtotal - discount,
    freeShipping: couponRes?.ok ? couponRes.freeShipping : false,
    now: args.now,
  });
  return { pricing: computePricing(args.lines, discount, delivery.available ? delivery.fee : 0), coupon: couponRes, delivery };
}
