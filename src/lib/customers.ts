import { supabase } from "@/lib/supabase";
import type { Database, Enums, Tables } from "@/types/database";
import { type InfiniteData, useInfiniteQuery } from "@tanstack/react-query";

type ViewRow = Database["public"]["Views"]["customer_list_view"]["Row"];

// view 產生的型別全部 nullable；實際上 c.* 來自 customers 的 NOT NULL 欄位，改用 table 型別收斂
export type CustomerListItem = Tables<"customers"> &
  Pick<ViewRow, "last_interaction_content" | "last_interaction_at">;

export type CustomerListFilters = {
  status: "all" | Enums<"customer_status">;
  search: string;
};

export const STATUS_FILTERS = [
  { value: "all", label: "全部" },
  { value: "new", label: "新客戶" },
  { value: "following", label: "待跟進" },
  { value: "won", label: "已成交" },
] as const satisfies readonly {
  value: CustomerListFilters["status"];
  label: string;
}[];

export const customerKeys = {
  all: ["customers"] as const,
  list: (filters: CustomerListFilters) => ["customers", filters] as const,
};

export const PAGE_SIZE = 20;

// search 先只進 queryKey；2-4 補 ilike
export async function fetchCustomerPage({
  filters,
  page,
}: {
  filters: CustomerListFilters;
  page: number;
}) {
  const from = page * PAGE_SIZE;
  let query = supabase.from("customer_list_view").select("*");
  if (filters.status !== "all") query = query.eq("status", filters.status);

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .order("id") // created_at 相同時的 tie-breaker，分頁邊界才穩定
    .range(from, from + PAGE_SIZE - 1)
    .overrideTypes<CustomerListItem[], { merge: false }>();
  if (error) throw error;
  return data;
}

// offset 分頁在兩次載入之間若有新增，下一頁開頭會與上一頁重疊，攤平時依 id 去重
// 放模組層保持參考穩定，select 才不會每次 render 都重算
function flattenPages(data: InfiniteData<CustomerListItem[], number>) {
  const seen = new Set<string>();
  return data.pages.flat().filter((c) => {
    if (seen.has(c.id)) return false;
    seen.add(c.id);
    return true;
  });
}

export function useCustomerList(
  filters: CustomerListFilters = { status: "all", search: "" },
) {
  return useInfiniteQuery({
    queryKey: customerKeys.list(filters),
    queryFn: ({ pageParam }) => fetchCustomerPage({ filters, page: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.length < PAGE_SIZE ? undefined : lastPageParam + 1,
    select: flattenPages,
  });
}
