# 技術決策紀錄

- 2026-10-13：以 `pnpm patch` 修補 expo-router@57.0.26 的 `fork/NavigationContainer.js`，mount 前暫存 unhandled link、mount 後再 setState，消除 Android 啟動時的 "hasn't mounted yet" 警告（[expo#50282](https://github.com/expo/expo/issues/50282)）。升級 expo-router 時需重做或移除此 patch。
- 2026-10-14：auth 狀態放 Zustand（`useAuthStore`），React 外（`signOut`、之後的 query helper）可直接 `getState()`，元件用 selector 避免 TOKEN_REFRESHED 造成不必要 re-render；`onAuthStateChange` 在 root layout 的 `useEffect` 註冊而非模組層，避免 Fast Refresh 重複訂閱。
- 2026-10-14：auth 守衛用 `Stack.Protected` 而非 `<Redirect>`；以 `INITIAL_SESSION` 事件作為「session 讀取完成」訊號，判定前 root 回傳 null 並保留原生 splash，避免閃現登入頁。登出不手動導頁，guard 翻轉後自動導回並清除受保護頁的 history。
- 2026-10-14：Tabs 改從 `expo-router/js-tabs` 匯入（v57 起 `expo-router` 的 `Tabs` 已 deprecated）；不用 `unstable-native-tabs`，因為之後要自訂浮動毛玻璃 Tab Bar。
- 2026-10-14：`global.css` 加 `:root { font-size: 16px }`。react-native-css 預設 1rem = 14px，會讓 Tailwind 間距／字級比設計稿（web 16px 基準）小約 12%；編譯器會讀 `:root` 的 font-size 作為 rem 內聯值。這與 dark mode 的 `:root` 變數機制無關。
