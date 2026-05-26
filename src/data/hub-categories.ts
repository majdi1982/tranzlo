export const HUB_CATEGORIES = [
  "General Discussion",
  "Translation Tips",
  "Tools & Software",
  "Career Advice",
  "Industry News",
  "Language Learning",
  "Business Talk",
  "Community Projects",
] as const;

export type HubCategory = (typeof HUB_CATEGORIES)[number];
