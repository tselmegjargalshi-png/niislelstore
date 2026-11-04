import type { Metadata } from "next";
import { OrderView } from "@/components/order/order-view";

export const metadata: Metadata = { title: "Захиалга", robots: { index: false } };

export default async function Page({ params, searchParams }: { params: Promise<{ number: string }>; searchParams: Promise<{ new?: string }> }) {
  const { number } = await params;
  const sp = await searchParams;
  return <OrderView number={decodeURIComponent(number).toUpperCase()} isNew={sp.new === "1"} />;
}
