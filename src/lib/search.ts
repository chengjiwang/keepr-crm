// 客戶搜尋字串處理。純函式、不 import RN／Supabase，方便單獨測試

// 注音符號（含擴充）與聲調；iOS 注音選字中 onChangeText 會收到這些未選字的符號
const BOPOMOFO = /[㄀-ㄯㆠ-ㆿˊˇˋ˙]/;

// trim 後回傳實際搜尋值；含注音代表仍在選字，回傳 null 讓呼叫端沿用上一次的值
export function normalizeSearch(raw: string): string | null {
  const s = raw.trim();
  return BOPOMOFO.test(s) ? null : s;
}

// 第 1 層：LIKE pattern。Postgres 預設 escape 字元是 \，必須先跳 \ 本身，
// 否則後面補上的 \ 會被再跳一次。PostgREST 會把 ilike 值裡所有 * 換成 % 且無法跳脫，
// 改成單字元萬用字元 _，避免使用者輸入 * 變成「回傳全部」
export function escapeLikePattern(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/[%_]/g, "\\$&")
    .replace(/\*/g, "_");
}

// 第 2 層：PostgREST 邏輯運算子內的值。整段用雙引號包住後 , ( ) . : 都是一般字元，
// 引號內只需再跳 \ 與 "
export function quotePostgrestValue(s: string): string {
  return `"${s.replace(/[\\"]/g, "\\$&")}"`;
}

// 給 .or() 用：name 或 company 部分比對（不分大小寫）
export function buildCustomerSearchFilter(search: string): string {
  const value = quotePostgrestValue(`%${escapeLikePattern(search)}%`);
  return `name.ilike.${value},company.ilike.${value}`;
}
