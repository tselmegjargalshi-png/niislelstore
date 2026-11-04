"use client";
import { useCallback, useEffect, useState } from "react";
import { useStore } from "./store";
import type { Customer, InventoryMovement, Order } from "./types";

export function useAdminData() {
  const { repo, ready } = useStore();
  const [d, setD] = useState<{ orders: Order[]; customers: Customer[]; inventory: InventoryMovement[] } | null>(null);
  const load = useCallback(async () => {
    const [orders, customers, inventory] = await Promise.all([repo.listOrders(), repo.listCustomers(), repo.listInventory()]);
    setD({ orders, customers, inventory });
  }, [repo]);
  useEffect(() => {
    if (!ready) return;
    void load();
    return repo.subscribe(() => void load());
  }, [repo, ready, load]);
  return d;
}
