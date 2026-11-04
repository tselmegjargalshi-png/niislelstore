"use client";
import { LocalRepository } from "./local-repository";
import type { StoreRepository } from "./repository";

/**
 * Өгөгдлийн хадгалалтын нэг цэг.
 * Одоогоор демо горим (localStorage). Supabase холбохдоо supabase/schema.sql-ийг ажиллуулж,
 * StoreRepository interface-ийг хэрэгжүүлсэн SupabaseRepository-г энд буцаана
 * (NEXT_PUBLIC_SUPABASE_URL тохируулсан үед). UI-ийн код өөрчлөгдөхгүй.
 */
let repo: StoreRepository | null = null;
export function getRepository(): StoreRepository {
  if (!repo) {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && typeof console !== "undefined") {
      console.warn("[Нийслэл Стор] Supabase тохируулсан ч SupabaseRepository хараахан хэрэгжээгүй тул демо (localStorage) горимоор ажиллаж байна. README: «Supabase руу шилжих».");
    }
    repo = new LocalRepository();
  }
  return repo;
}
