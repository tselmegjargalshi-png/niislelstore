/**
 * Нийслэл Стор: домэйн төрлүүд.
 * Эдгээр нь supabase/schema.sql доторх хүснэгтүүдтэй нэг бүрчлэн тохирно
 * (camelCase ↔ snake_case хөрвүүлэлтийг src/lib/data/supabase-repository.ts хийнэ).
 */

export type ID = string;

export type ArtKind =
  | "sweater" | "scarf" | "beanie" | "coat" | "blanket" | "socks"
  | "shirt" | "jacket" | "tote" | "crossbody" | "wallet" | "belt" | "boots"
  | "slippers" | "cup" | "vase" | "cushion" | "candle" | "bowl"
  | "jar" | "bottle" | "dropper" | "soap" | "tube"
  | "teabox" | "honey" | "chocolate" | "giftbox" | "juice"
  | "bracelet" | "earrings" | "notebook" | "gloves";

/** Бүтээгдэхүүний зураг: брэндийн студи зураг (SVG) эсвэл админаас байршуулсан зураг. */
export type ProductImage =
  | { kind: "art"; view: 0 | 1 | 2 | 3 }
  | { kind: "upload"; src: string; alt?: string };

export interface Category {
  id: ID;
  slug: string;
  name: string;
  description: string;
  /** Ангиллын карт дээрх өнгө ба дүрс */
  tone: string;
  art: ArtKind;
  sort: number;
}

export interface ColorOption {
  name: string;
  hex: string;
}

export interface Spec {
  label: string;
  value: string;
}

export type ProductTag = "new" | "bestseller" | "featured";

export interface Product {
  id: ID;
  slug: string;
  sku: string;
  name: string;
  categoryId: ID;
  short: string;
  description: string;
  highlights: string[];
  specs: Spec[];
  /** Борлуулах үнэ (₮) */
  price: number;
  /** Хямдралаас өмнөх үнэ (₮). Хоосон бол хямдралгүй. */
  compareAtPrice?: number | null;
  colors: ColorOption[];
  sizes: string[];
  stock: number;
  lowStockThreshold: number;
  art: ArtKind;
  images: ProductImage[];
  tags: ProductTag[];
  visible: boolean;
  rating: number;
  reviewCount: number;
  soldCount: number;
  createdAt: string;
  updatedAt: string;
}

export type CouponType = "percent" | "fixed" | "freeship";

export interface Coupon {
  id: ID;
  code: string;
  type: CouponType;
  /** percent: 1..90, fixed: ₮, freeship: 0 */
  value: number;
  minSubtotal: number;
  /** Хувийн хөнгөлөлтийн дээд хязгаар (₮). 0 бол хязгааргүй. */
  maxDiscount: number;
  description: string;
  active: boolean;
  usageLimit: number; // 0 = хязгааргүй
  usedCount: number;
  expiresAt?: string | null;
  createdAt: string;
}

export type BannerPlacement = "hero" | "promo" | "strip";

export interface Banner {
  id: ID;
  placement: BannerPlacement;
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  theme: "dark" | "light" | "accent";
  art: ArtKind;
  active: boolean;
  sort: number;
}

/* ───────────── Хүргэлт ───────────── */

export type DeliveryMethod = "standard" | "express" | "pickup";

export interface DistrictRate {
  id: string;
  name: string;
  standardFee: number;
  expressFee: number | null; // null = шуурхай хүргэлтгүй
  standardDays: number;
  note?: string;
}

export interface PickupPoint {
  id: string;
  name: string;
  address: string;
  hours: string;
}

export interface DeliverySettings {
  districts: DistrictRate[];
  /** Хот хоорондын (орон нутгийн) хүргэлтийн суурь үнэ */
  provinceFee: number;
  provinceDays: number;
  /** Энэ дүнгээс дээш бол энгийн хүргэлт үнэгүй (0 = идэвхгүй) */
  freeShippingThreshold: number;
  expressCutoffHour: number; // энэ цагаас өмнө захиалбал өдөртөө
  pickupPoints: PickupPoint[];
}

/* ───────────── Хэрэглэгч ───────────── */

export interface Address {
  id: ID;
  label: string;
  city: string;
  district: string;
  khoroo: string;
  detail: string;
  notes?: string;
  isDefault: boolean;
}

export interface Customer {
  id: ID;
  name: string;
  email: string;
  phone: string;
  /** Демо горимд л: SHA256(salt + password). Supabase горимд Supabase Auth хариуцна. */
  passwordHash?: string;
  salt?: string;
  addresses: Address[];
  marketingOptIn: boolean;
  createdAt: string;
  note?: string;
}

/* ───────────── Захиалга ───────────── */

export type OrderStatus =
  | "pending"      // Шинэ, баталгаажаагүй
  | "confirmed"    // Баталгаажсан
  | "processing"   // Бэлтгэж байна
  | "shipped"      // Хүргэлтэд гарсан
  | "ready"        // Очиж авахад бэлэн
  | "delivered"    // Хүргэгдсэн
  | "cancelled";   // Цуцлагдсан

export type PaymentMethod = "qpay" | "socialpay" | "bank" | "cod";
export type PaymentStatus = "unpaid" | "awaiting" | "paid" | "failed" | "refunded";

export interface OrderItem {
  productId: ID;
  name: string;
  sku: string;
  art: ArtKind;
  image?: ProductImage;
  color?: string;
  size?: string;
  unitPrice: number;
  compareAtPrice?: number | null;
  quantity: number;
}

export interface Pricing {
  subtotal: number;
  /** Барааны хямдралаар хэмнэсэн дүн (мэдээллийн) */
  itemSavings: number;
  couponDiscount: number;
  deliveryFee: number;
  total: number;
}

export interface Payment {
  method: PaymentMethod;
  status: PaymentStatus;
  provider: string;
  reference: string;
  /** Демо төлбөр бол true. Бодит гүйлгээ хийгдээгүй гэдгийг илэрхийлнэ. */
  simulated: boolean;
  paidAt?: string | null;
}

export interface StatusEvent {
  status: OrderStatus;
  at: string;
  note?: string;
  by?: string;
}

export interface Order {
  id: ID;
  number: string;
  customerId: ID | null;
  contact: { name: string; phone: string; email: string };
  shipping: {
    method: DeliveryMethod;
    city: string;
    district: string;
    khoroo: string;
    detail: string;
    notes: string;
    pickupPointId?: string;
    estimate: string;
    fee: number;
  };
  items: OrderItem[];
  pricing: Pricing;
  couponCode: string | null;
  payment: Payment;
  status: OrderStatus;
  history: StatusEvent[];
  createdAt: string;
  updatedAt: string;
  cancelReason?: string;
}

export interface InventoryMovement {
  id: ID;
  productId: ID;
  delta: number;
  reason: "order" | "cancel" | "manual" | "restock" | "create";
  reference?: string;
  stockAfter: number;
  at: string;
  by?: string;
}

export interface Subscriber {
  email: string;
  at: string;
}

export interface CartLine {
  key: string; // productId|color|size
  productId: ID;
  quantity: number;
  color?: string;
  size?: string;
}
