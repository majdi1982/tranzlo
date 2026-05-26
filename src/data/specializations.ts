export const SPECIALIZATIONS = [
  "Legal",
  "Medical",
  "Technical",
  "Financial",
  "Literary",
  "Academic",
  "Marketing",
  "Website/App",
  "Game Localization",
  "Subtitling",
  "Audio/Video",
  "Software",
  "Scientific",
  "Business",
  "Government",
  "Patent",
] as const;

export type Specialization = (typeof SPECIALIZATIONS)[number];
