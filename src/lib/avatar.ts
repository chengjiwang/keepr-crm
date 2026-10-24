// 必須是完整靜態字串：Tailwind 只掃描字面值，拼接出來的 class 會被 purge
const AVATAR_COLORS = [
  "bg-avatar-1",
  "bg-avatar-2",
  "bg-avatar-3",
  "bg-avatar-4",
  "bg-avatar-5",
] as const;

export type AvatarColor = (typeof AVATAR_COLORS)[number];

// FNV-1a 32-bit：純函式，同一 id 永遠同色；Math.imul 確保 32-bit 乘法在各引擎一致
export function getAvatarColor(id: string): AvatarColor {
  let hash = 0x811c9dc5;
  for (let i = 0; i < id.length; i++) {
    hash ^= id.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return AVATAR_COLORS[(hash >>> 0) % AVATAR_COLORS.length];
}

// Array.from 依 code point 切，避免 emoji / surrogate pair 被切半
export function getInitial(name: string): string {
  return Array.from(name.trim())[0] ?? "?";
}
