import { AdminOrderDetail } from "@/components/admin/orders";
export default async function Page({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  return <AdminOrderDetail number={decodeURIComponent(number).toUpperCase()} />;
}
