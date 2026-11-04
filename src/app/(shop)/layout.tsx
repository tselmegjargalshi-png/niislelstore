import type { ReactNode } from "react";
import { Header, MobileTabBar } from "@/components/header";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";

export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-[var(--ink)] focus:px-4 focus:py-2 focus:text-[var(--on-ink)]">Агуулга руу алгасах</a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <MobileTabBar />
      <CartDrawer />
    </>
  );
}
