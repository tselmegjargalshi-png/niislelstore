/**
 * Өгөгдлийн давхаргын гэрээ (interface).
 * UI зөвхөн энэ interface-ээр дамжиж өгөгдөлтэй ажиллана. Иймд демо (localStorage)
 * болон Supabase хэрэгжүүлэлтийг UI өөрчлөхгүйгээр сольж болно.
 */
import type {
  Banner, Category, Coupon, Customer, DeliverySettings, InventoryMovement, Order, OrderStatus, PaymentStatus, Product,
} from "../types";

export interface PlaceOrderInput {
  order: Omit<Order, "id" | "history" | "status" | "createdAt" | "updatedAt">;
}

export interface RegisterInput {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export class RepositoryError extends Error {
  constructor(message: string, public code: "not_found" | "conflict" | "stock" | "auth" | "quota" | "invalid" | "unknown" = "unknown") {
    super(message);
  }
}

export interface StoreRepository {
  readonly mode: "demo" | "supabase";
  subscribe(listener: () => void): () => void;

  // Каталог
  listProducts(opts?: { includeHidden?: boolean }): Promise<Product[]>;
  getProductBySlug(slug: string): Promise<Product | null>;
  getProduct(id: string): Promise<Product | null>;
  saveProduct(p: Product, by?: string): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  listCategories(): Promise<Category[]>;
  saveCategory(c: Category): Promise<Category>;
  deleteCategory(id: string): Promise<void>;

  // Нөөц
  adjustStock(productId: string, delta: number, reason: InventoryMovement["reason"], reference?: string, by?: string): Promise<Product>;
  listInventory(productId?: string): Promise<InventoryMovement[]>;

  // Маркетинг
  listCoupons(): Promise<Coupon[]>;
  findCoupon(code: string): Promise<Coupon | null>;
  saveCoupon(c: Coupon): Promise<Coupon>;
  deleteCoupon(id: string): Promise<void>;
  listBanners(): Promise<Banner[]>;
  saveBanner(b: Banner): Promise<Banner>;
  deleteBanner(id: string): Promise<void>;
  subscribe_newsletter(email: string): Promise<"ok" | "exists">;

  // Хүргэлт
  getDelivery(): Promise<DeliverySettings>;
  saveDelivery(s: DeliverySettings): Promise<DeliverySettings>;

  // Захиалга
  placeOrder(input: PlaceOrderInput): Promise<Order>;
  listOrders(filter?: { customerId?: string }): Promise<Order[]>;
  getOrder(number: string): Promise<Order | null>;
  updateOrderStatus(number: string, status: OrderStatus, note?: string, by?: string): Promise<Order>;
  updatePaymentStatus(number: string, status: PaymentStatus): Promise<Order>;

  // Харилцагч
  listCustomers(): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer | null>;
  register(input: RegisterInput): Promise<Customer>;
  login(email: string, password: string): Promise<Customer>;
  logout(): Promise<void>;
  currentCustomerId(): string | null;
  updateCustomer(c: Customer): Promise<Customer>;
  changePassword(id: string, current: string, next: string): Promise<void>;

  resetDemo(): Promise<void>;
}
