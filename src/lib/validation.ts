/**
 * Нэгдсэн баталгаажуулалт (zod). Хөтөч дээрх маягт болон server талын API ижил схем ашиглана.
 */
import { z } from "zod";

const trim = (s: string) => s.trim();

export const phoneSchema = z
  .string()
  .transform((s) => s.replace(/[\s()]/g, "").replace(/^\+?976/, "").replace(/-/g, ""))
  .refine((s) => /^[5-9]\d{7}$/.test(s), "Утасны дугаар 8 оронтой байх ёстой (жишээ: 99112233).");

export const emailSchema = z
  .string()
  .transform(trim)
  .pipe(z.string().min(1, "Имэйл хаягаа оруулна уу.").email("Имэйл хаяг буруу байна."));

export const nameSchema = z.string().transform(trim).pipe(z.string().min(2, "Нэрээ оруулна уу.").max(80, "Нэр хэт урт байна."));

export const checkoutSchema = z
  .object({
    name: nameSchema,
    phone: phoneSchema,
    email: emailSchema,
    city: z.string().min(1, "Хот, аймгаа сонгоно уу."),
    district: z.string(),
    khoroo: z.string().transform(trim),
    detail: z.string().transform(trim),
    notes: z.string().max(300, "Тэмдэглэл 300 тэмдэгтээс бага байх ёстой.").transform(trim),
    method: z.enum(["standard", "express", "pickup"]),
    pickupPointId: z.string().optional(),
    payment: z.enum(["qpay", "socialpay", "bank", "cod"]),
  })
  .superRefine((v, ctx) => {
    if (v.method !== "pickup") {
      if (v.city === "Улаанбаатар" && !v.district) ctx.addIssue({ code: "custom", path: ["district"], message: "Дүүргээ сонгоно уу." });
      if (v.detail.length < 6) ctx.addIssue({ code: "custom", path: ["detail"], message: "Дэлгэрэнгүй хаягаа бичнэ үү (байр, орц, тоот)." });
    } else if (!v.pickupPointId) {
      ctx.addIssue({ code: "custom", path: ["pickupPointId"], message: "Очиж авах салбараа сонгоно уу." });
    }
  });
export type CheckoutInput = z.input<typeof checkoutSchema>;

export const registerSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    phone: phoneSchema,
    password: z.string().min(8, "Нууц үг дор хаяж 8 тэмдэгт байх ёстой.").max(72),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Нууц үг таарахгүй байна." });

export const loginSchema = z.object({ email: emailSchema, password: z.string().min(1, "Нууц үгээ оруулна уу.") });

export const addressSchema = z.object({
  label: z.string().transform(trim).pipe(z.string().min(1, "Нэр өгнө үү (жишээ: Гэр).").max(30)),
  city: z.string().min(1, "Хот сонгоно уу."),
  district: z.string(),
  khoroo: z.string().transform(trim),
  detail: z.string().transform(trim).pipe(z.string().min(6, "Дэлгэрэнгүй хаяг бичнэ үү.")),
});

export const productSchema = z.object({
  name: z.string().transform(trim).pipe(z.string().min(2, "Нэр оруулна уу.").max(120)),
  slug: z.string().transform(trim).pipe(z.string().min(2, "Холбоос (slug) оруулна уу.").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Холбоос зөвхөн жижиг латин үсэг, тоо, зураасаас бүрдэнэ.")),
  sku: z.string().transform(trim).pipe(z.string().min(2, "SKU оруулна уу.").max(30)),
  categoryId: z.string().min(1, "Ангилал сонгоно уу."),
  short: z.string().transform(trim).pipe(z.string().min(5, "Товч тайлбар бичнэ үү.").max(160)),
  description: z.string().transform(trim).pipe(z.string().min(10, "Тайлбар бичнэ үү.")),
  price: z.number({ message: "Үнэ оруулна уу." }).int("Үнэ бүхэл тоо байх ёстой.").min(100, "Үнэ 100₮ ба түүнээс дээш байх ёстой.").max(100_000_000),
  compareAtPrice: z.number().int().nullable(),
  stock: z.number({ message: "Үлдэгдэл оруулна уу." }).int().min(0, "Үлдэгдэл сөрөг байж болохгүй."),
  lowStockThreshold: z.number().int().min(0),
}).superRefine((v, ctx) => {
  if (v.compareAtPrice != null && v.compareAtPrice <= v.price)
    ctx.addIssue({ code: "custom", path: ["compareAtPrice"], message: "Хямдралаас өмнөх үнэ нь борлуулах үнээс их байх ёстой." });
});

export const couponSchema = z.object({
  code: z.string().transform((s) => s.trim().toUpperCase()).pipe(z.string().min(3, "Код 3 ба түүнээс дээш тэмдэгт.").max(20).regex(/^[A-Z0-9]+$/, "Код зөвхөн латин том үсэг, тооноос бүрдэнэ.")),
  type: z.enum(["percent", "fixed", "freeship"]),
  value: z.number().min(0),
  minSubtotal: z.number().min(0),
  maxDiscount: z.number().min(0),
  description: z.string().transform(trim).pipe(z.string().min(3, "Тайлбар бичнэ үү.")),
  usageLimit: z.number().int().min(0),
}).superRefine((v, ctx) => {
  if (v.type === "percent" && (v.value < 1 || v.value > 90)) ctx.addIssue({ code: "custom", path: ["value"], message: "Хувь 1 ба 90 хооронд байна." });
  if (v.type === "fixed" && v.value < 100) ctx.addIssue({ code: "custom", path: ["value"], message: "Дүн 100₮ ба түүнээс дээш байна." });
});

export const newsletterSchema = z.object({ email: emailSchema });

export type FieldErrors = Record<string, string>;

/** zod алдааг { талбар: мессеж } болгоно. */
export function fieldErrors(err: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of err.issues) {
    const k = issue.path.join(".") || "_";
    if (!out[k]) out[k] = issue.message;
  }
  return out;
}
