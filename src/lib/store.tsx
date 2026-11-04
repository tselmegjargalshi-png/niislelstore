"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { getRepository } from "./data";
import type { Banner, CartLine, Category, Coupon, Customer, DeliverySettings, Product } from "./types";
import type { StoreRepository } from "./data/repository";

const CART_KEY = "niislel:cart";
const WISH_KEY = "niislel:wishlist";
const COUPON_KEY = "niislel:coupon";

export type ToastKind = "success" | "error" | "info";
export interface Toast { id: number; kind: ToastKind; message: string }

interface Snapshot {
  products: Product[];
  categories: Category[];
  banners: Banner[];
  coupons: Coupon[];
  delivery: DeliverySettings | null;
}

interface StoreCtx extends Snapshot {
  repo: StoreRepository;
  ready: boolean;
  customer: Customer | null;
  cart: CartLine[];
  wishlist: string[];
  appliedCoupon: string | null;
  toasts: Toast[];
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  visibleProducts: Product[];
  getProductById: (id: string) => Product | undefined;
  addToCart: (productId: string, opts?: { quantity?: number; color?: string; size?: string }) => boolean;
  setQuantity: (key: string, quantity: number) => void;
  removeFromCart: (key: string) => void;
  clearCart: () => void;
  setAppliedCoupon: (code: string | null) => void;
  toggleWishlist: (productId: string) => void;
  toast: (message: string, kind?: ToastKind) => void;
  dismissToast: (id: number) => void;
  refresh: () => Promise<void>;
  cartCount: number;
}

const Ctx = createContext<StoreCtx | null>(null);

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function writeJSON(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* хөтөч хадгалахыг хориглосон: чимээгүй алгасна */
  }
}

export const cartKey = (productId: string, color?: string, size?: string) => `${productId}|${color ?? ""}|${size ?? ""}`;

export function StoreProvider({ children }: { children: ReactNode }) {
  const repo = useMemo(() => getRepository(), []);
  const [snap, setSnap] = useState<Snapshot>({ products: [], categories: [], banners: [], coupons: [], delivery: null });
  const [ready, setReady] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [appliedCoupon, setAppliedCouponState] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const toastId = useRef(0);
  const productsRef = useRef<Product[]>([]);

  const refresh = useCallback(async () => {
    const [products, categories, banners, coupons, delivery] = await Promise.all([
      repo.listProducts({ includeHidden: true }), repo.listCategories(), repo.listBanners(), repo.listCoupons(), repo.getDelivery(),
    ]);
    productsRef.current = products;
    setSnap({ products, categories, banners, coupons, delivery });
    const cid = repo.currentCustomerId();
    setCustomer(cid ? await repo.getCustomer(cid) : null);
    setReady(true);
  }, [repo]);

  useEffect(() => {
    setCart(readJSON<CartLine[]>(CART_KEY, []));
    setWishlist(readJSON<string[]>(WISH_KEY, []));
    setAppliedCouponState(readJSON<string | null>(COUPON_KEY, null));
    void refresh();
    return repo.subscribe(() => void refresh());
  }, [repo, refresh]);

  const toast = useCallback((message: string, kind: ToastKind = "success") => {
    const id = ++toastId.current;
    setToasts((t) => [...t.slice(-3), { id, kind, message }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === "error" ? 6000 : 3800);
  }, []);
  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const persistCart = (next: CartLine[]) => {
    setCart(next);
    writeJSON(CART_KEY, next);
  };

  const addToCart: StoreCtx["addToCart"] = useCallback((productId, opts = {}) => {
    const p = productsRef.current.find((x) => x.id === productId);
    if (!p || !p.visible) {
      toast("Энэ бараа худалдаанд байхгүй байна.", "error");
      return false;
    }
    if (p.colors.length && !opts.color) {
      toast("Өнгөө сонгоно уу.", "error");
      return false;
    }
    if (p.sizes.length && !opts.size) {
      toast("Хэмжээгээ сонгоно уу.", "error");
      return false;
    }
    const qty = Math.max(1, Math.floor(opts.quantity ?? 1));
    const key = cartKey(productId, opts.color, opts.size);
    setCart((prev) => {
      const inCart = prev.reduce((s, l) => (l.productId === productId ? s + l.quantity : s), 0);
      const room = p.stock - inCart;
      if (room <= 0) {
        toast(p.stock === 0 ? "Энэ бараа дууссан байна." : `Үлдэгдэл ${p.stock} ширхэг байгаа бөгөөд бүгд сагсанд байна.`, "error");
        return prev;
      }
      const add = Math.min(qty, room);
      const existing = prev.find((l) => l.key === key);
      const next = existing
        ? prev.map((l) => (l.key === key ? { ...l, quantity: l.quantity + add } : l))
        : [...prev, { key, productId, quantity: add, color: opts.color, size: opts.size }];
      writeJSON(CART_KEY, next);
      toast(add < qty ? `Үлдэгдлийн хязгаарт хүрлээ. ${add} ширхэг нэмлээ.` : `${p.name} сагсанд нэмэгдлээ.`, add < qty ? "info" : "success");
      return next;
    });
    return true;
  }, [toast]);

  const setQuantity = useCallback((key: string, quantity: number) => {
    setCart((prev) => {
      const line = prev.find((l) => l.key === key);
      if (!line) return prev;
      const p = productsRef.current.find((x) => x.id === line.productId);
      const others = prev.reduce((s, l) => (l.productId === line.productId && l.key !== key ? s + l.quantity : s), 0);
      const max = p ? Math.max(0, p.stock - others) : quantity;
      const q = Math.min(Math.max(1, Math.floor(quantity) || 1), Math.max(max, 1));
      if (p && quantity > max) toast(`Үлдэгдэл хязгаарлагдмал: дээд тал нь ${max} ширхэг.`, "info");
      const next = prev.map((l) => (l.key === key ? { ...l, quantity: q } : l));
      writeJSON(CART_KEY, next);
      return next;
    });
  }, [toast]);

  const removeFromCart = useCallback((key: string) => {
    setCart((prev) => {
      const next = prev.filter((l) => l.key !== key);
      writeJSON(CART_KEY, next);
      return next;
    });
  }, []);

  const clearCart = useCallback(() => {
    persistCart([]);
    setAppliedCouponState(null);
    writeJSON(COUPON_KEY, null);
  }, []);

  const setAppliedCoupon = useCallback((code: string | null) => {
    setAppliedCouponState(code);
    writeJSON(COUPON_KEY, code);
  }, []);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist((prev) => {
      const has = prev.includes(productId);
      const next = has ? prev.filter((x) => x !== productId) : [...prev, productId];
      writeJSON(WISH_KEY, next);
      toast(has ? "Хадгалсан жагсаалтаас хаслаа." : "Хадгалсан жагсаалтад нэмлээ.", has ? "info" : "success");
      return next;
    });
  }, [toast]);

  const value: StoreCtx = {
    ...snap,
    repo, ready, customer, cart, wishlist, appliedCoupon, toasts, cartOpen, setCartOpen,
    visibleProducts: useMemo(() => snap.products.filter((p) => p.visible), [snap.products]),
    getProductById: (id) => snap.products.find((p) => p.id === id),
    addToCart, setQuantity, removeFromCart, clearCart, setAppliedCoupon, toggleWishlist, toast, dismissToast, refresh,
    cartCount: cart.reduce((s, l) => s + l.quantity, 0),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStore must be used inside StoreProvider");
  return c;
}

/** Сагсны мөрүүдийг бүтээгдэхүүний одоогийн үнээр тооцоолж, байхгүй барааг шүүнэ. */
export function useCartLines() {
  const { cart, products } = useStore();
  return useMemo(
    () =>
      cart
        .map((l) => {
          const p = products.find((x) => x.id === l.productId);
          return p && p.visible ? { line: l, product: p } : null;
        })
        .filter((x): x is { line: CartLine; product: Product } => !!x),
    [cart, products],
  );
}
