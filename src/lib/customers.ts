import { supabase } from "@/lib/supabase";
import type { Database, Enums, Tables } from "@/types/database";
import { useQuery } from "@tanstack/react-query";

type ViewRow = Database["public"]["Views"]["customer_list_view"]["Row"];

// view 產生的型別全部 nullable；實際上 c.* 來自 customers 的 NOT NULL 欄位，改用 table 型別收斂
export type CustomerListItem = Tables<"customers"> &
  Pick<ViewRow, "last_interaction_content" | "last_interaction_at">;

export type CustomerListFilters = {
  status: "all" | Enums<"customer_status">;
  search: string;
};

export const customerKeys = {
  all: ["customers"] as const,
  list: (filters: CustomerListFilters) => ["customers", filters] as const,
};

export async function fetchCustomerList() {
  const { data, error } = await supabase
    .from("customer_list_view")
    .select("*")
    .order("created_at", { ascending: false })
    .order("id")
    .limit(20)
    .overrideTypes<CustomerListItem[], { merge: false }>();
  if (error) throw error;
  return data;
}

export function useCustomerList() {
  return useQuery({
    queryKey: customerKeys.list({ status: "all", search: "" }),
    queryFn: fetchCustomerList,
  });
}
