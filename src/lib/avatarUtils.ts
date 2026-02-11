import { cartoonAvatars } from "@/assets/avatars-cartoon";

// Avatar categories for selection
export const avatarOptions = [
  // Female avatars
  { key: "cartoon:01", label: "female", src: cartoonAvatars.avatar01 },
  { key: "cartoon:02", label: "female", src: cartoonAvatars.avatar02 },
  { key: "cartoon:03", label: "female", src: cartoonAvatars.avatar03 },
  { key: "cartoon:04", label: "female", src: cartoonAvatars.avatar04 },
  { key: "cartoon:05", label: "female", src: cartoonAvatars.avatar05 },
  { key: "cartoon:06", label: "female", src: cartoonAvatars.avatar06 },
  { key: "cartoon:07", label: "female", src: cartoonAvatars.avatar07 },
  // Male avatars
  { key: "cartoon:08", label: "male", src: cartoonAvatars.avatar08 },
  { key: "cartoon:09", label: "male", src: cartoonAvatars.avatar09 },
  { key: "cartoon:10", label: "male", src: cartoonAvatars.avatar10 },
  { key: "cartoon:11", label: "male", src: cartoonAvatars.avatar11 },
  { key: "cartoon:12", label: "male", src: cartoonAvatars.avatar12 },
  { key: "cartoon:13", label: "male", src: cartoonAvatars.avatar13 },
  { key: "cartoon:14", label: "male", src: cartoonAvatars.avatar14 },
  // Elderly avatars
  { key: "cartoon:15", label: "elderly", src: cartoonAvatars.avatar15 },
  { key: "cartoon:16", label: "elderly", src: cartoonAvatars.avatar16 },
  { key: "cartoon:17", label: "elderly", src: cartoonAvatars.avatar17 },
  { key: "cartoon:18", label: "elderly", src: cartoonAvatars.avatar18 },
  { key: "cartoon:19", label: "elderly", src: cartoonAvatars.avatar19 },
  { key: "cartoon:20", label: "elderly", src: cartoonAvatars.avatar20 },
];

// Map from stored key to image source
const avatarMap: Record<string, string> = {};
avatarOptions.forEach((a) => {
  avatarMap[a.key] = a.src;
});

/**
 * Resolve an author_avatar value (stored in DB) to an actual image URL.
 * Supports:
 *  - "cartoon:XX" keys → bundled cartoon avatar
 *  - Full URLs (https://...) → pass through
 *  - null/undefined → returns undefined
 */
export function resolveAvatar(avatarValue: string | null | undefined): string | undefined {
  if (!avatarValue) return undefined;
  if (avatarValue.startsWith("cartoon:")) {
    return avatarMap[avatarValue];
  }
  // Legacy or external URL
  return avatarValue;
}
