import type { Metadata } from "next";
import { CartPage } from "@/components/cart/cart-page";

export const metadata: Metadata = { title: "Сагс", robots: { index: false } };
export default function Page() {
  return <CartPage />;
}
