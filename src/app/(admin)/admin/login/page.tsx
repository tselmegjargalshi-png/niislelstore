import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminLogin } from "@/components/admin/admin-login";

export const metadata: Metadata = { title: "Админ нэвтрэх", robots: { index: false, follow: false } };
export default function Page() {
  return <Suspense><AdminLogin /></Suspense>;
}
