# 技術決策紀錄

- 2026-10-13：以 `pnpm patch` 修補 expo-router@57.0.26 的 `fork/NavigationContainer.js`，mount 前暫存 unhandled link、mount 後再 setState，消除 Android 啟動時的 "hasn't mounted yet" 警告（[expo#50282](https://github.com/expo/expo/issues/50282)）。升級 expo-router 時需重做或移除此 patch。
