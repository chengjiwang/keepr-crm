This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

This project uses **pnpm** (`pnpm-lock.yaml`). Never use npm, yarn, bun, or `npx`.

```bash
pnpm expo install <package>   # ALWAYS use instead of `pnpm add` — resolves SDK-compatible versions
pnpm expo start               # start the dev server
pnpm expo lint                # lint
pnpm tsc --noEmit             # typecheck
pnpm dlx expo-doctor          # diagnose dependency and config issues
pnpm expo install --fix       # fix incompatible package versions
```

Dev-only tools that are not SDK-bound (types, lint plugins) may use `pnpm add -D <package>`.

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `pnpm dlx eas-cli@latest <command>`; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `pnpm expo run:ios|android` locally, or `pnpm dlx eas-cli@latest build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

---

# Keepr — 專案規則

Social CRM 作品集專案。單一 workspace、多人協作：所有登入者共享同一份客戶資料。

## 參考資料（實作某功能前先讀相關段落）

- `resources/spec.md` — 完整規格：頁面、互動、產品定義、決策紀錄
- `resources/design/` — 視覺依據（預覽稿 HTML 與各頁截圖）。刻 UI 時對照截圖
- `resources/schema_v2.sql` — 資料表、trigger、RLS、view 的唯一真相
- `src/types/database.ts` — Supabase 產生的型別，查詢一律使用它

## 技術棧

Expo Router、Supabase（Auth / Database / Realtime）、React Query（server state）、Zustand（client state）、NativeWind v5、expo-blur、react-native-reanimated、expo-haptics、expo-notifications（本地推播、react-hook-form。

## NativeWind v5（pre-release）— 不要照 v4 的寫法

- 採 Tailwind v4 CSS-first 設定：色票定義在 `global.css` 的 `@theme`。**禁止建立 `tailwind.config.js`**
- 設定前先查 NativeWind v5 官方文件，不要憑記憶套用 v4 的 babel / metro 設定
- 每個顏色變體各自宣告 `--color-*`，沒有巢狀 `DEFAULT`
- class 名稱必須是完整靜態字串，**禁止字串拼接組 class**（會被 purge）
- 不做 dark mode：只用靜態 `@theme`，不使用 `:root` + `VariableContextProvider`

## 資料層規則

- **Schema 已定案。修改任何 SQL、新增欄位或 policy 之前先問我**
- 客戶列表查 `customer_list_view`（含最新互動摘要），用 `useInfiniteQuery`，每頁 20 筆；搜尋 debounce 300ms + `ilike`
- Realtime 收到事件**只做 `invalidateQueries`**，不手動 patch cache
- `activities` 與 `notifications` 的寫入全由 DB trigger 負責，前端不 insert
- 前端狀態切換只開放 `following` / `won`；**永遠不要把狀態設成 `new`**（`new → following` 由 trigger 處理）
- 「待回覆數」= `status = 'new'` 的客戶數
- 「今日 / 本週」邊界以 Asia/Taipei 計算，再轉 ISO 帶入查詢
- 「本週成交數」用 `won_at`，不用 `updated_at`
- 通知查詢連 `customers(name)`；`customer_id` 可能為 null，必須處理
- 登出流程：`signOut()` → 清 session → `queryClient.clear()` → 取消所有 Realtime 訂閱 → 回登入頁
- 型別更新：`pnpm dlx supabase gen types typescript --project-id <id> > src/types/database.ts`

## 環境變數與安全

- 只用 `EXPO_PUBLIC_SUPABASE_URL` 與 `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- **service role key 絕不出現在前端程式碼或 repo**；`.env` 不進 git

## UI 規則

- 色彩語意：橘色（`warn`）只代表「待跟進」與「提醒」；綠色（`accent`）只代表「已成交」與「未讀」；紅色（`danger`）只用於表單錯誤訊息
- 毛玻璃（expo-blur）**只用在四處**：浮動 Tab Bar、底部面板、詳情頁吸頂標題列、客戶列表搜尋框。內容卡片一律實心。Android 需有半透明實心底色降級
- 頭像：`getAvatarColor(id)` 回傳靜態陣列 `['bg-avatar-1', …, 'bg-avatar-5']` 其中一項，依 `customers.id` 雜湊，不存 DB。使用者本人頭像用 `accent`
- 微互動：按壓用 Reanimated `withSpring` 縮放 + haptics；新項目進列表用 `FadeInDown.springify()`
- 底部面板（新增互動、新增標籤、帳號面板）用 modal route + `presentation: 'formSheet'`
- 標籤只在編輯頁增刪，詳情頁唯讀；加入前去重

## 工作方式

- 一次只做目前 Phase 的一個子項，不要超出範圍
- 遇到 RN 與 web 不同的做法（FlatList、worklet、formSheet、平台差異），簡短說明原因
- 做了非顯而易見的技術決策時，在 `docs/decisions.md` 加一行紀錄
- 踩到的坑與解法補進本檔案

## 踩過的坑

- **Android 啟動出現 "Can't perform a React state update on a component that hasn't mounted yet"**：expo-router bug（[expo#50282](https://github.com/expo/expo/issues/50282)），Android 的 `getInitialURL()` 為 async，resolve 時 NavigationContainer 尚未 commit 就呼叫 `setLastUnhandledLink`。已用 `patches/expo-router@57.0.26.patch` 修補。升級 expo-router 時 `pnpm install` 若因版本不符報錯，先確認上游是否已修，已修就刪除 patch 與 `pnpm-workspace.yaml` 的 `patchedDependencies`，否則用 `pnpm patch` 對新版本重做。
- **`SafeAreaView`（react-native-safe-area-context）寫 `className` 無效**：NativeWind v5 底下的 react-native-css 只包裝了 `SafeAreaProvider`，`SafeAreaView` 是原樣 re-export，`className="flex-1"` 被忽略 → 容器高度塌陷，內容往上溢出、文字被壓成 0 高。改用 `View` + `useSafeAreaInsets()` 以 `style` 補 padding。
