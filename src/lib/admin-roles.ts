/** Клиент болон server хоёрт аюулгүй: нууц утга агуулахгүй. */
export type AdminRole = "admin" | "staff";

/** Нийтэд мэдэгдэх ДЕМО бүртгэл. Production-д ADMIN_EMAIL, ADMIN_PASSWORD тохируулбал эдгээр ажиллахгүй. */
export const DEMO_ADMIN = { email: "admin@niislel.mn", password: "Admin#2026demo" };
export const DEMO_STAFF = { email: "staff@niislel.mn", password: "Staff#2026demo" };

/** Эрхийн матриц: UI болон route хоёулаа үүнийг ашиглана. */
export const PERMISSIONS: Record<string, AdminRole[]> = {
  "dashboard": ["admin", "staff"],
  "orders": ["admin", "staff"],
  "inventory": ["admin", "staff"],
  "customers": ["admin", "staff"],
  "products.write": ["admin"],
  "categories": ["admin"],
  "marketing": ["admin"],
  "delivery": ["admin"],
};
export const can = (role: AdminRole | undefined, perm: keyof typeof PERMISSIONS) => !!role && PERMISSIONS[perm].includes(role);
