# 技術決策紀錄

- 2026-10-13：以 `pnpm patch` 修補 expo-router@57.0.26 的 `fork/NavigationContainer.js`，mount 前暫存 unhandled link、mount 後再 setState，消除 Android 啟動時的 "hasn't mounted yet" 警告（[expo#50282](https://github.com/expo/expo/issues/50282)）。升級 expo-router 時需重做或移除此 patch。
- 2026-10-14：auth 狀態放 Zustand（`useAuthStore`），React 外（`signOut`、之後的 query helper）可直接 `getState()`，元件用 selector 避免 TOKEN_REFRESHED 造成不必要 re-render；`onAuthStateChange` 在 root layout 的 `useEffect` 註冊而非模組層，避免 Fast Refresh 重複訂閱。
- 2026-10-14：auth 守衛用 `Stack.Protected` 而非 `<Redirect>`；以 `INITIAL_SESSION` 事件作為「session 讀取完成」訊號，判定前 root 回傳 null 並保留原生 splash，避免閃現登入頁。登出不手動導頁，guard 翻轉後自動導回並清除受保護頁的 history。
- 2026-10-14：Tabs 改從 `expo-router/js-tabs` 匯入（v57 起 `expo-router` 的 `Tabs` 已 deprecated）；不用 `unstable-native-tabs`，因為之後要自訂浮動毛玻璃 Tab Bar。
- 2026-10-14：`global.css` 加 `:root { font-size: 16px }`。react-native-css 預設 1rem = 14px，會讓 Tailwind 間距／字級比設計稿（web 16px 基準）小約 12%；編譯器會讀 `:root` 的 font-size 作為 rem 內聯值。這與 dark mode 的 `:root` 變數機制無關。
- 2026-10-16：`getAvatarColor` 用 FNV-1a 32-bit 雜湊 `customers.id` 後取模，從靜態 class 陣列取值（不拼接，避免被 purge）。擴充色數時 `% length` 改變，既有客戶顏色會整批重排一次。
- 2026-10-16：Supabase 產生的 view 型別全為 nullable；`customer_list_view` 查詢以 `.overrideTypes<CustomerListItem[], { merge: false }>()` 收斂成 `Tables<"customers">` + `last_interaction_*`（仍 nullable），不改 SQL 或產生的型別檔。
- 2026-10-16：客戶列表用 offset（`.range`）分頁，排序 `created_at desc, id`（id 為 tie-breaker）；兩次載入間有新增時頁首會與上一頁重疊，在 `select` 依 id 去重。下拉刷新用本地 state 控制 `RefreshControl`，不用 `isRefetching`，避免背景 refetch 也出現刷新動畫。
- 2026-10-18：客戶列表篩選 Tab 以 FlatList `key={status}` 重新掛載達成切換後回到頂端（不用 `scrollToOffset`，避免舊列表先跳動再換資料）；status 變更不使用 `placeholderData`，首次載入的 Tab 顯示 loading 而非上一個 Tab 的資料。篩選元件做成客戶列表專用的 `CustomerStatusFilter`，不泛化。
- 2026-10-18：客戶搜尋用 `.or(name.ilike, company.ilike)`，使用者輸入經兩層跳脫（`src/lib/search.ts`）：先跳 LIKE（`\` → `\\`、`%`/`_` 加 `\`），再整段包 PostgREST 雙引號（引號內跳 `\`、`"`），`, ( ) . :` 因此視為一般字元。PostgREST 會把 ilike 值裡的 `*` 無條件換成 `%` 且無法跳脫，故 `*` 改成單字元萬用字元 `_`。`placeholderData` 只在前一個 queryKey 的 status 相同時回傳舊資料（即只有 search 變動），切 Tab 仍顯示 loading。RN 沒有 compositionend，iOS 注音選字中 `onChangeText` 會收到注音符號，含注音時不更新搜尋值；清空搜尋時跳過 debounce 立即回到快取。
- 2026-10-18：測試採 jest-expo（`pnpm test`），純函式測試放 `src/**/__tests__/`。
