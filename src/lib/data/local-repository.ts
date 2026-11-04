"use client";
/**
 * Демо хэрэгжүүлэлт: бүх өгөгдлийг хөтчийн localStorage дээр хадгална.
 * Нэг "транзакц" дотор (mutate) уншиж, өөрчилж, бичдэг тул захиалга үүсгэх үед
 * нөөцийн хасалт, купоны тоолуур, захиалга гурав хамт хадгалагдана.
 */
import type {
  Banner, Category, Coupon, Customer, DeliverySettings, InventoryMovement, Order, OrderStatus, PaymentStatus, Product,
} from "../types";
import { buildSeed, DB_VERSION, DEMO_CUSTOMER_EMAIL, DEMO_CUSTOMER_PASSWORD, type Database } from "./seed";
import { computePricing, evaluateCoupon, quoteDelivery } from "../pricing";
import { RepositoryError, type PlaceOrderInput, type RegisterInput, type StoreRepository } from "./repository";

const DB_KEY = "niislel:db";
const SESSION_KEY = "niislel:session";

const uid = (p: string) => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function hashPassword(password: string, salt: string) {
  return sha256(`${salt}:${password}`);
}

function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export class LocalRepository implements StoreRepository {
  readonly mode = "demo" as const;
  private db: Database | null = null;
  private listeners = new Set<() => void>();
  private ready: Promise<void> | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("storage", (e) => {
        if (e.key === DB_KEY) {
          this.db = null;
          this.ready = null;
          this.emit();
        }
      });
    }
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  private emit() {
    this.listeners.forEach((l) => l());
  }

  private async load(): Promise<Database> {
    if (this.db) return this.db;
    if (!this.ready) {
      this.ready = (async () => {
        const raw = safeGet(DB_KEY);
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as Database;
            if (parsed.version === DB_VERSION) {
              this.db = parsed;
              return;
            }
          } catch {
            /* эвдэрсэн өгөгдөл: дахин seed хийнэ */
          }
        }
        const seed = buildSeed();
        const salt = "demo";
        seed.customers.unshift({
          id: "u000",
          name: "Демо Хэрэглэгч",
          email: DEMO_CUSTOMER_EMAIL,
          phone: "99001122",
          salt,
          passwordHash: await hashPassword(DEMO_CUSTOMER_PASSWORD, salt),
          addresses: [
            { id: "a0", label: "Гэр", city: "Улаанбаатар", district: "Сүхбаатар", khoroo: "1 дүгээр хороо", detail: "Энхтайвны өргөн чөлөө 15, 4 давхар, 41 тоот", isDefault: true },
          ],
          marketingOptIn: true,
          createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
        });
        // Демо хэрэглэгчид хэдэн жишээ захиалга оноох
        seed.orders.slice(2, 6).forEach((o) => {
          o.customerId = "u000";
          o.contact = { name: "Демо Хэрэглэгч", phone: "99001122", email: DEMO_CUSTOMER_EMAIL };
        });
        this.db = seed;
        this.persist();
      })();
    }
    await this.ready;
    return this.db!;
  }

  private persist() {
    try {
      window.localStorage.setItem(DB_KEY, JSON.stringify(this.db));
    } catch {
      throw new RepositoryError("Хөтчийн санах ой дүүрсэн байна. Том зургуудаа устгаад дахин оролдоно уу.", "quota");
    }
  }

  private async mutate<T>(fn: (db: Database) => T): Promise<T> {
    const db = await this.load();
    const snapshot = JSON.stringify(db);
    try {
      const result = fn(db);
      this.persist();
      this.emit();
      return structuredClone(result);
    } catch (e) {
      this.db = JSON.parse(snapshot); // rollback
      throw e;
    }
  }

  private async read<T>(fn: (db: Database) => T): Promise<T> {
    const db = await this.load();
    return structuredClone(fn(db));
  }

  /* ── Каталог ── */
  listProducts(opts?: { includeHidden?: boolean }) {
    return this.read((db) => db.products.filter((p) => opts?.includeHidden || p.visible));
  }
  getProductBySlug(slug: string) {
    return this.read((db) => db.products.find((p) => p.slug === slug) ?? null);
  }
  getProduct(id: string) {
    return this.read((db) => db.products.find((p) => p.id === id) ?? null);
  }
  saveProduct(p: Product, by = "Админ") {
    return this.mutate((db) => {
      if (db.products.some((x) => x.slug === p.slug && x.id !== p.id)) throw new RepositoryError("Ийм холбоостой (slug) бүтээгдэхүүн аль хэдийн байна.", "conflict");
      if (db.products.some((x) => x.sku === p.sku && x.id !== p.id)) throw new RepositoryError("SKU код давхардаж байна.", "conflict");
      const now = new Date().toISOString();
      const idx = db.products.findIndex((x) => x.id === p.id);
      if (idx === -1) {
        const created = { ...p, id: p.id || uid("p"), createdAt: now, updatedAt: now };
        db.products.unshift(created);
        db.inventory.unshift({ id: uid("m"), productId: created.id, delta: created.stock, reason: "create", stockAfter: created.stock, at: now, by });
        return created;
      }
      const prev = db.products[idx];
      if (prev.stock !== p.stock) {
        db.inventory.unshift({ id: uid("m"), productId: p.id, delta: p.stock - prev.stock, reason: "manual", stockAfter: p.stock, at: now, by });
      }
      db.products[idx] = { ...p, updatedAt: now };
      return db.products[idx];
    });
  }
  deleteProduct(id: string) {
    return this.mutate((db) => {
      db.products = db.products.filter((p) => p.id !== id);
    });
  }
  listCategories() {
    return this.read((db) => [...db.categories].sort((a, b) => a.sort - b.sort));
  }
  saveCategory(c: Category) {
    return this.mutate((db) => {
      if (db.categories.some((x) => x.slug === c.slug && x.id !== c.id)) throw new RepositoryError("Ийм холбоостой ангилал байна.", "conflict");
      const idx = db.categories.findIndex((x) => x.id === c.id);
      const saved = { ...c, id: c.id || uid("cat") };
      if (idx === -1) db.categories.push(saved);
      else db.categories[idx] = saved;
      return saved;
    });
  }
  deleteCategory(id: string) {
    return this.mutate((db) => {
      const used = db.products.filter((p) => p.categoryId === id).length;
      if (used) throw new RepositoryError(`Энэ ангилалд ${used} бүтээгдэхүүн байгаа тул устгах боломжгүй.`, "conflict");
      db.categories = db.categories.filter((c) => c.id !== id);
    });
  }

  /* ── Нөөц ── */
  adjustStock(productId: string, delta: number, reason: InventoryMovement["reason"], reference?: string, by = "Админ") {
    return this.mutate((db) => {
      const p = db.products.find((x) => x.id === productId);
      if (!p) throw new RepositoryError("Бүтээгдэхүүн олдсонгүй.", "not_found");
      if (p.stock + delta < 0) throw new RepositoryError("Үлдэгдэл хасах утгатай болох боломжгүй.", "stock");
      p.stock += delta;
      p.updatedAt = new Date().toISOString();
      db.inventory.unshift({ id: uid("m"), productId, delta, reason, reference, stockAfter: p.stock, at: p.updatedAt, by });
      return p;
    });
  }
  listInventory(productId?: string) {
    return this.read((db) => db.inventory.filter((m) => !productId || m.productId === productId).slice(0, 300));
  }

  /* ── Маркетинг ── */
  listCoupons() {
    return this.read((db) => db.coupons);
  }
  findCoupon(code: string) {
    const c = code.trim().toUpperCase();
    return this.read((db) => db.coupons.find((x) => x.code === c) ?? null);
  }
  saveCoupon(c: Coupon) {
    return this.mutate((db) => {
      const code = c.code.trim().toUpperCase();
      if (db.coupons.some((x) => x.code === code && x.id !== c.id)) throw new RepositoryError("Ийм купон код аль хэдийн байна.", "conflict");
      const saved = { ...c, code, id: c.id || uid("c") };
      const idx = db.coupons.findIndex((x) => x.id === saved.id);
      if (idx === -1) db.coupons.unshift(saved);
      else db.coupons[idx] = saved;
      return saved;
    });
  }
  deleteCoupon(id: string) {
    return this.mutate((db) => {
      db.coupons = db.coupons.filter((c) => c.id !== id);
    });
  }
  listBanners() {
    return this.read((db) => [...db.banners].sort((a, b) => a.sort - b.sort));
  }
  saveBanner(b: Banner) {
    return this.mutate((db) => {
      const saved = { ...b, id: b.id || uid("b") };
      const idx = db.banners.findIndex((x) => x.id === saved.id);
      if (idx === -1) db.banners.push(saved);
      else db.banners[idx] = saved;
      return saved;
    });
  }
  deleteBanner(id: string) {
    return this.mutate((db) => {
      db.banners = db.banners.filter((b) => b.id !== id);
    });
  }
  subscribe_newsletter(email: string) {
    return this.mutate((db) => {
      const e = email.trim().toLowerCase();
      if (db.subscribers.some((s) => s.email === e)) return "exists" as const;
      db.subscribers.push({ email: e, at: new Date().toISOString() });
      return "ok" as const;
    });
  }

  /* ── Хүргэлт ── */
  getDelivery() {
    return this.read((db) => db.delivery);
  }
  saveDelivery(s: DeliverySettings) {
    return this.mutate((db) => {
      db.delivery = s;
      return s;
    });
  }

  /* ── Захиалга ── */
  placeOrder({ order: input }: PlaceOrderInput) {
    let order = input;
    return this.mutate((db) => {
      if (db.orders.some((o) => o.number === order.number)) throw new RepositoryError("Захиалгын дугаар давхардлаа. Дахин оролдоно уу.", "conflict");
      // 1) Нөөц шалгах (бүгдийг нь урьдчилан шалгаад дараа нь хасна)
      const need = new Map<string, number>();
      for (const it of order.items) need.set(it.productId, (need.get(it.productId) ?? 0) + it.quantity);
      for (const [pid, qty] of need) {
        const p = db.products.find((x) => x.id === pid);
        if (!p || !p.visible) throw new RepositoryError("Сагсанд байгаа зарим бараа худалдаанаас хасагдсан байна.", "stock");
        if (p.stock < qty) throw new RepositoryError(`${p.name}: үлдэгдэл ${p.stock} ширхэг байна.`, "stock");
      }
      // 1б) Үнийг ЭХ ӨГӨГДЛӨӨС дахин тооцоолж, клиентийн илгээсэн дүнтэй тулгана (үнэ хуурч өөрчлөхөөс сэргийлнэ)
      const lines = order.items.map((it) => {
        const p = db.products.find((x) => x.id === it.productId)!;
        return { unitPrice: p.price, compareAtPrice: p.compareAtPrice, quantity: it.quantity };
      });
      const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
      const cpn = order.couponCode ? db.coupons.find((c) => c.code === order.couponCode) : null;
      const cres = order.couponCode ? evaluateCoupon(cpn, subtotal) : null;
      if (cres && !cres.ok) throw new RepositoryError(cres.error, "invalid");
      const disc = cres?.ok ? cres.discount : 0;
      const dq = quoteDelivery(db.delivery, {
        method: order.shipping.method, city: order.shipping.city, district: order.shipping.district,
        subtotalAfterDiscount: subtotal - disc, freeShipping: cres?.ok ? cres.freeShipping : false,
      });
      if (!dq.available) throw new RepositoryError(dq.reason ?? "Хүргэлтийн сонголт боломжгүй байна.", "invalid");
      const truth = computePricing(lines, disc, dq.fee);
      if (truth.total !== order.pricing.total) throw new RepositoryError("Үнэ шинэчлэгдсэн байна. Сагсаа дахин шалгаад захиалгаа давтан өгнө үү.", "conflict");
      order = { ...order, pricing: truth, shipping: { ...order.shipping, fee: dq.fee } };
      const now = new Date().toISOString();
      for (const [pid, qty] of need) {
        const p = db.products.find((x) => x.id === pid)!;
        p.stock -= qty;
        p.soldCount += qty;
        p.updatedAt = now;
        db.inventory.unshift({ id: uid("m"), productId: pid, delta: -qty, reason: "order", reference: order.number, stockAfter: p.stock, at: now, by: "Захиалга" });
      }
      // 2) Купоны тоолуур
      if (order.couponCode) {
        const c = db.coupons.find((x) => x.code === order.couponCode);
        if (c) c.usedCount += 1;
      }
      const created: Order = {
        ...order,
        id: uid("o"),
        status: "pending",
        history: [{ status: "pending", at: now, note: "Захиалга хүлээн авлаа" }],
        createdAt: now,
        updatedAt: now,
      };
      db.orders.unshift(created);
      return created;
    });
  }
  listOrders(filter?: { customerId?: string }) {
    return this.read((db) => db.orders.filter((o) => !filter?.customerId || o.customerId === filter.customerId));
  }
  getOrder(number: string) {
    const n = number.trim().toUpperCase();
    return this.read((db) => db.orders.find((o) => o.number === n) ?? null);
  }
  updateOrderStatus(number: string, status: OrderStatus, note?: string, by = "Админ") {
    return this.mutate((db) => {
      const o = db.orders.find((x) => x.number === number);
      if (!o) throw new RepositoryError("Захиалга олдсонгүй.", "not_found");
      if (o.status === status) return o;
      if (o.status === "cancelled") throw new RepositoryError("Цуцлагдсан захиалгын төлөвийг өөрчлөх боломжгүй.", "invalid");
      if (o.status === "delivered" && status !== "cancelled") throw new RepositoryError("Хүргэгдсэн захиалгыг буцааж өөрчлөх боломжгүй.", "invalid");
      const now = new Date().toISOString();
      if (status === "cancelled") {
        // Нөөцийг буцаан нэмнэ
        for (const it of o.items) {
          const p = db.products.find((x) => x.id === it.productId);
          if (!p) continue;
          p.stock += it.quantity;
          p.soldCount = Math.max(0, p.soldCount - it.quantity);
          db.inventory.unshift({ id: uid("m"), productId: p.id, delta: it.quantity, reason: "cancel", reference: o.number, stockAfter: p.stock, at: now, by });
        }
        o.cancelReason = note || "Цуцлагдсан";
        if (o.payment.status === "paid") o.payment.status = "refunded";
      }
      if (status === "delivered" && o.payment.method === "cod") {
        o.payment.status = "paid";
        o.payment.paidAt = now;
      }
      o.status = status;
      o.updatedAt = now;
      o.history.push({ status, at: now, note, by });
      return o;
    });
  }
  updatePaymentStatus(number: string, status: PaymentStatus) {
    return this.mutate((db) => {
      const o = db.orders.find((x) => x.number === number);
      if (!o) throw new RepositoryError("Захиалга олдсонгүй.", "not_found");
      o.payment.status = status;
      if (status === "paid") o.payment.paidAt = new Date().toISOString();
      o.updatedAt = new Date().toISOString();
      return o;
    });
  }

  /* ── Харилцагч ── */
  listCustomers() {
    return this.read((db) => db.customers.map(({ passwordHash: _h, salt: _s, ...c }) => c as Customer));
  }
  getCustomer(id: string) {
    return this.read((db) => {
      const c = db.customers.find((x) => x.id === id);
      if (!c) return null;
      const { passwordHash: _h, salt: _s, ...rest } = c;
      return rest as Customer;
    });
  }
  async register(input: RegisterInput) {
    const salt = Math.random().toString(36).slice(2, 12);
    const hash = await hashPassword(input.password, salt);
    const c = await this.mutate((db) => {
      const email = input.email.trim().toLowerCase();
      if (db.customers.some((x) => x.email === email)) throw new RepositoryError("Энэ имэйл хаягаар бүртгэл үүссэн байна.", "conflict");
      const customer: Customer = {
        id: uid("u"), name: input.name.trim(), email, phone: input.phone, salt, passwordHash: hash,
        addresses: [], marketingOptIn: false, createdAt: new Date().toISOString(),
      };
      db.customers.unshift(customer);
      return customer;
    });
    this.setSession(c.id);
    return (await this.getCustomer(c.id))!;
  }
  async login(email: string, password: string) {
    const db = await this.load();
    const c = db.customers.find((x) => x.email === email.trim().toLowerCase());
    if (!c || !c.passwordHash || !c.salt || (await hashPassword(password, c.salt)) !== c.passwordHash)
      throw new RepositoryError("Имэйл эсвэл нууц үг буруу байна.", "auth");
    this.setSession(c.id);
    return (await this.getCustomer(c.id))!;
  }
  async logout() {
    this.setSession(null);
  }
  private setSession(id: string | null) {
    try {
      if (id) window.localStorage.setItem(SESSION_KEY, id);
      else window.localStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
    this.emit();
  }
  currentCustomerId() {
    return typeof window === "undefined" ? null : safeGet(SESSION_KEY);
  }
  updateCustomer(c: Customer) {
    return this.mutate((db) => {
      const idx = db.customers.findIndex((x) => x.id === c.id);
      if (idx === -1) throw new RepositoryError("Хэрэглэгч олдсонгүй.", "not_found");
      const email = c.email.trim().toLowerCase();
      if (db.customers.some((x) => x.email === email && x.id !== c.id)) throw new RepositoryError("Энэ имэйл өөр бүртгэлд ашиглагдаж байна.", "conflict");
      const prev = db.customers[idx];
      db.customers[idx] = { ...prev, ...c, email, passwordHash: prev.passwordHash, salt: prev.salt };
      const { passwordHash: _h, salt: _s, ...rest } = db.customers[idx];
      return rest as Customer;
    });
  }
  async changePassword(id: string, current: string, next: string) {
    const db = await this.load();
    const c = db.customers.find((x) => x.id === id);
    if (!c || !c.salt || (await hashPassword(current, c.salt)) !== c.passwordHash) throw new RepositoryError("Одоогийн нууц үг буруу байна.", "auth");
    const salt = Math.random().toString(36).slice(2, 12);
    const hash = await hashPassword(next, salt);
    await this.mutate((d) => {
      const x = d.customers.find((y) => y.id === id)!;
      x.salt = salt;
      x.passwordHash = hash;
    });
  }

  async resetDemo() {
    try {
      window.localStorage.removeItem(DB_KEY);
    } catch {
      /* ignore */
    }
    this.db = null;
    this.ready = null;
    await this.load();
    this.emit();
  }
}
