import { AdminCustomerDetail } from "@/components/admin/customers-inventory";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminCustomerDetail id={decodeURIComponent(id)} />;
}
