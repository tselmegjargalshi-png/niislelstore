/**
 * Демо өгөгдлийн анхны төлөв. Хөтчийн localStorage хоосон үед ачаалагдана.
 * Хугацаанууд "одоо"-гоос хамааран үүсдэг тул хяналтын самбарын графикууд үргэлж амьд харагдана.
 */
import type {
  Banner, Coupon, Customer, DeliverySettings, InventoryMovement, Order, OrderStatus, PaymentMethod, Product,
} from "../types";
import { buildProducts, categories } from "./catalog";
import { quoteOrder } from "../pricing";

export const UB_DISTRICTS = [
  "Баянзүрх", "Сүхбаатар", "Чингэлтэй", "Хан Уул", "Баянгол", "Сонгинохайрхан", "Налайх", "Багануур", "Багахангай",
];

export const PROVINCES = [
  "Архангай", "Баян Өлгий", "Баянхонгор", "Булган", "Говь Алтай", "Говьсүмбэр", "Дархан Уул", "Дорноговь", "Дорнод",
  "Дундговь", "Завхан", "Орхон", "Өвөрхангай", "Өмнөговь", "Сүхбаатар", "Сэлэнгэ", "Төв", "Увс", "Ховд", "Хөвсгөл", "Хэнтий",
];

export const defaultDelivery: DeliverySettings = {
  districts: [
    { id: "d1", name: "Сүхбаатар", standardFee: 5000, expressFee: 10000, standardDays: 1 },
    { id: "d2", name: "Чингэлтэй", standardFee: 5000, expressFee: 10000, standardDays: 1 },
    { id: "d3", name: "Баянзүрх", standardFee: 6000, expressFee: 12000, standardDays: 1 },
    { id: "d4", name: "Хан Уул", standardFee: 6000, expressFee: 12000, standardDays: 1 },
    { id: "d5", name: "Баянгол", standardFee: 6000, expressFee: 12000, standardDays: 1 },
    { id: "d6", name: "Сонгинохайрхан", standardFee: 7000, expressFee: 14000, standardDays: 2 },
    { id: "d7", name: "Налайх", standardFee: 12000, expressFee: null, standardDays: 2 },
    { id: "d8", name: "Багануур", standardFee: 20000, expressFee: null, standardDays: 3 },
    { id: "d9", name: "Багахангай", standardFee: 20000, expressFee: null, standardDays: 3 },
  ],
  provinceFee: 15000,
  provinceDays: 4,
  freeShippingThreshold: 200000,
  expressCutoffHour: 15,
  pickupPoints: [
    { id: "pk1", name: "Нийслэл Стор, Төв салбар", address: "Сүхбаатар дүүрэг, 1 дүгээр хороо, Олимпийн гудамж 12", hours: "Өдөр бүр 10:00 цагаас 21:00 цаг хүртэл" },
    { id: "pk2", name: "Нийслэл Стор, Зайсан салбар", address: "Хан Уул дүүрэг, 11 дүгээр хороо, Зайсангийн гудамж 7", hours: "Даваа гарагаас Бямба гараг хүртэл 11:00 цагаас 20:00 цаг хүртэл" },
  ],
};

export function buildCoupons(now = new Date()): Coupon[] {
  const iso = now.toISOString();
  const inDays = (d: number) => new Date(now.getTime() + d * 86400000).toISOString();
  return [
    { id: "c1", code: "NIISLEL10", type: "percent", value: 10, minSubtotal: 50000, maxDiscount: 100000, description: "Бүх барааны 10% хөнгөлөлт", active: true, usageLimit: 0, usedCount: 38, expiresAt: inDays(60), createdAt: iso },
    { id: "c2", code: "SHINE20000", type: "fixed", value: 20000, minSubtotal: 150000, maxDiscount: 0, description: "Анхны худалдан авалтад 20 000₮", active: true, usageLimit: 500, usedCount: 112, expiresAt: inDays(30), createdAt: iso },
    { id: "c3", code: "HURGELT0", type: "freeship", value: 0, minSubtotal: 30000, maxDiscount: 0, description: "Үнэгүй хүргэлт", active: true, usageLimit: 0, usedCount: 64, expiresAt: null, createdAt: iso },
    { id: "c4", code: "UVUL25", type: "percent", value: 25, minSubtotal: 300000, maxDiscount: 150000, description: "Өвлийн цуглуулга 25%", active: true, usageLimit: 200, usedCount: 41, expiresAt: inDays(14), createdAt: iso },
    { id: "c5", code: "ZUN15", type: "percent", value: 15, minSubtotal: 0, maxDiscount: 0, description: "Зуны урамшуулал (дууссан)", active: false, usageLimit: 0, usedCount: 220, expiresAt: inDays(-40), createdAt: iso },
  ];
}

export const defaultBanners: Banner[] = [
  { id: "b1", placement: "hero", eyebrow: "Өвөл 2026 цуглуулга", title: "Нийслэлийн өвөл,\nноолуурын дулаан", subtitle: "Говийн цэвэр ноолуураар нэхсэн шинэ цуглуулга. 200 000₮ дээш захиалгад хүргэлт үнэгүй.", cta: "Цуглуулга үзэх", href: "/products?category=cashmere", theme: "dark", art: "coat", active: true, sort: 1 },
  { id: "b2", placement: "promo", eyebrow: "Хязгаартай хугацаанд", title: "Өвлийн хямдрал 25%", subtitle: "300 000₮ дээш худалдан авалтад UVUL25 кодыг ашиглаарай.", cta: "Хямдралтай бараа", href: "/products?sale=1", theme: "accent", art: "sweater", active: true, sort: 1 },
  { id: "b3", placement: "promo", eyebrow: "Бэлгийн санаа", title: "Цагаан сарын бэлэг", subtitle: "Цай, бал, лаа багтсан тансаг хайрцаг.", cta: "Бэлэг сонгох", href: "/products/tsagaan-sar-gift-box", theme: "light", art: "giftbox", active: true, sort: 2 },
  { id: "b4", placement: "strip", eyebrow: "", title: "200 000₮ дээш захиалгад Улаанбаатар хотод хүргэлт үнэгүй", subtitle: "", cta: "Дэлгэрэнгүй", href: "/help#delivery", theme: "dark", art: "giftbox", active: true, sort: 1 },
];

/* ───────── Жишээ харилцагч, захиалга (тогтмол санамсаргүй тоогоор) ───────── */

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const sampleCustomers: Array<[string, string, string, string]> = [
  ["Б. Сарангэрэл", "sarangerel@example.mn", "99112233", "Хан Уул"],
  ["Д. Тэмүүлэн", "temuulen@example.mn", "88014567", "Баянзүрх"],
  ["Г. Номин", "nomin.g@example.mn", "95556677", "Сүхбаатар"],
  ["Э. Мөнхбат", "munkhbat@example.mn", "99008811", "Чингэлтэй"],
  ["О. Анужин", "anujin@example.mn", "80112299", "Баянгол"],
  ["Ц. Өлзийбаяр", "ulziibayar@example.mn", "91234567", "Сонгинохайрхан"],
  ["Н. Хулан", "khulan@example.mn", "86605544", "Хан Уул"],
  ["Б. Түвшинжаргал", "tuvshin@example.mn", "99887766", "Баянзүрх"],
  ["С. Үүрцайх", "uurtsaikh@example.mn", "94443322", "Сүхбаатар"],
  ["Ж. Батзориг", "batzorig@example.mn", "88776655", "Налайх"],
  ["А. Энхжин", "enkhjin@example.mn", "99445566", "Чингэлтэй"],
  ["Т. Гантулга", "gantulga@example.mn", "89990011", "Дархан Уул"],
];

export const DEMO_CUSTOMER_EMAIL = "demo@niislel.mn";
export const DEMO_CUSTOMER_PASSWORD = "demo1234";

export function buildCustomers(now = new Date()): Customer[] {
  const list: Customer[] = sampleCustomers.map(([name, email, phone, district], i) => ({
    id: `u${String(i + 1).padStart(3, "0")}`,
    name,
    email,
    phone,
    addresses: [
      {
        id: `a${i + 1}`,
        label: "Гэр",
        city: district === "Дархан Уул" ? "Дархан Уул" : "Улаанбаатар",
        district: district === "Дархан Уул" ? "" : district,
        khoroo: `${(i % 12) + 1} дүгээр хороо`,
        detail: `${10 + i} дугаар байр, ${20 + i * 3} тоот`,
        isDefault: true,
      },
    ],
    marketingOptIn: i % 3 !== 0,
    createdAt: new Date(now.getTime() - (200 - i * 12) * 86400000).toISOString(),
  }));
  return list;
}

const STATUS_FLOW: OrderStatus[] = ["pending", "confirmed", "processing", "shipped", "delivered"];

export function buildOrders(products: Product[], customers: Customer[], now = new Date()): Order[] {
  const r = rng(20261104);
  const orders: Order[] = [];
  const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)];
  const methods: PaymentMethod[] = ["qpay", "qpay", "qpay", "socialpay", "bank", "cod"];
  for (let i = 0; i < 46; i++) {
    const daysAgo = Math.floor(r() * 30);
    const created = new Date(now.getTime() - daysAgo * 86400000 - Math.floor(r() * 10) * 3600000);
    const cust = customers[i % customers.length];
    const lineCount = 1 + Math.floor(r() * 3);
    const items = Array.from({ length: lineCount }, () => {
      const p = pick(products);
      return {
        productId: p.id, name: p.name, sku: p.sku, art: p.art, image: p.images[0],
        color: p.colors[0]?.name, size: p.sizes[Math.floor(p.sizes.length / 2)],
        unitPrice: p.price, compareAtPrice: p.compareAtPrice, quantity: 1 + Math.floor(r() * 2),
      };
    });
    const addr = cust.addresses[0];
    const method = r() < 0.12 ? "pickup" : r() < 0.3 ? "express" : "standard";
    const q = quoteOrder({
      lines: items, settings: defaultDelivery, method, city: addr.city, district: addr.district || "", now: created,
    });
    // Хуучин захиалга ихэвчлэн хүргэгдсэн, сүүлийнх нь шинэ
    let stage = daysAgo > 6 ? 4 : daysAgo > 3 ? 2 + Math.floor(r() * 3) : Math.floor(r() * 3);
    const cancelled = r() < 0.06;
    if (method === "pickup" && stage >= 3) stage = 3;
    const history = STATUS_FLOW.slice(0, stage + 1).map((s, k) => ({
      status: (method === "pickup" && s === "shipped" ? "ready" : s) as OrderStatus,
      at: new Date(created.getTime() + k * 6 * 3600000).toISOString(),
    }));
    if (cancelled) history.push({ status: "cancelled", at: new Date(created.getTime() + 3600000).toISOString(), note: "Харилцагчийн хүсэлтээр" } as never);
    const status = history[history.length - 1].status;
    const pm = pick(methods);
    const paid = !cancelled && (pm === "qpay" || pm === "socialpay" || (pm === "bank" && stage > 0) || (pm === "cod" && status === "delivered"));
    const ymd = created.toISOString().slice(2, 10).replace(/-/g, "");
    orders.push({
      id: `o${String(i + 1).padStart(4, "0")}`,
      number: `NS${ymd}${String(1000 + i * 37).slice(-4)}`,
      customerId: cust.id,
      contact: { name: cust.name, phone: cust.phone, email: cust.email },
      shipping: {
        method, city: addr.city, district: addr.district, khoroo: addr.khoroo, detail: addr.detail, notes: "",
        pickupPointId: method === "pickup" ? "pk1" : undefined, estimate: q.delivery.estimate, fee: q.pricing.deliveryFee,
      },
      items,
      pricing: q.pricing,
      couponCode: null,
      payment: {
        method: pm, status: cancelled ? (paid ? "refunded" : "unpaid") : paid ? "paid" : pm === "bank" ? "awaiting" : "unpaid",
        provider: pm === "qpay" ? "QPay (демо)" : pm === "socialpay" ? "SocialPay (демо)" : pm === "bank" ? "Дансаар" : "Бэлнээр",
        reference: `SIM${(i * 7919).toString(36).toUpperCase()}`, simulated: true, paidAt: paid ? created.toISOString() : null,
      },
      status,
      history,
      createdAt: created.toISOString(),
      updatedAt: history[history.length - 1].at,
      cancelReason: cancelled ? "Харилцагчийн хүсэлтээр" : undefined,
    });
  }
  return orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export interface Database {
  version: number;
  seededAt: string;
  products: Product[];
  categories: typeof categories;
  coupons: Coupon[];
  banners: Banner[];
  customers: Customer[];
  orders: Order[];
  inventory: InventoryMovement[];
  delivery: DeliverySettings;
  subscribers: { email: string; at: string }[];
}

export const DB_VERSION = 1;

export function buildSeed(now = new Date()): Database {
  const products = buildProducts(now);
  const customers = buildCustomers(now);
  return {
    version: DB_VERSION,
    seededAt: now.toISOString(),
    products,
    categories: categories.map((c) => ({ ...c })),
    coupons: buildCoupons(now),
    banners: defaultBanners.map((b) => ({ ...b })),
    customers,
    orders: buildOrders(products, customers, now),
    inventory: products.map((p, i) => ({
      id: `m${i + 1}`, productId: p.id, delta: p.stock, reason: "create" as const, stockAfter: p.stock, at: p.createdAt, by: "Систем",
    })),
    delivery: structuredClone(defaultDelivery),
    subscribers: [],
  };
}
