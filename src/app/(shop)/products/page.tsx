import { Suspense } from "react";
import type { Metadata } from "next";
import { Catalog } from "@/components/catalog/catalog";

export const metadata: Metadata = {
  title: "Бүх бараа",
  description: "Ноолуур, арьс шир, гэр ахуй, гоо сайхан, байгалийн хүнсний 35 гаруй бүтээгдэхүүн. Хайх, шүүх, эрэмбэлэх боломжтой.",
};

export default function Page() {
  return (
    <Suspense fallback={<div className="container-x py-16"><div className="skeleton h-10 w-64" /></div>}>
      <Catalog />
    </Suspense>
  );
}
