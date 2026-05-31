export interface ServiceType {
  id: string;
  name: string;
  description: string;
  unit: "word" | "hour" | "page" | "project" | "minute" | "session";
  icon: string;
}

export const SERVICE_TYPES: ServiceType[] = [
  {
    id: "translation",
    name: "Translation",
    description: "Standard text translation from source to target language",
    unit: "word",
    icon: "FileText",
  },
  {
    id: "review",
    name: "Review / Revision",
    description: "Bilingual review comparing source and target for accuracy and completeness",
    unit: "word",
    icon: "SearchCheck",
  },
  {
    id: "editing",
    name: "Editing",
    description: "Monolingual editing to improve style, flow, and readability",
    unit: "word",
    icon: "PenLine",
  },
  {
    id: "proofreading",
    name: "Proofreading",
    description: "Final check for typos, grammar, punctuation, and formatting",
    unit: "word",
    icon: "CheckCircle2",
  },
  {
    id: "mtpe",
    name: "MTPE (Machine Translation Post-Editing)",
    description: "Post-editing of machine-translated output to meet quality standards",
    unit: "word",
    icon: "Bot",
  },
  {
    id: "subtitling",
    name: "Subtitling",
    description: "Subtitle creation with time-coded text in video/audio content",
    unit: "minute",
    icon: "Captions",
  },
  {
    id: "transcription",
    name: "Transcription",
    description: "Converting audio/video speech into written text in the same language",
    unit: "minute",
    icon: "Mic",
  },
  {
    id: "localization",
    name: "Localization",
    description: "Full adaptation of content (UI, marketing, documentation) for target locale",
    unit: "word",
    icon: "Globe",
  },
  {
    id: "interpretation",
    name: "Interpretation",
    description: "Real-time oral interpretation (consecutive or simultaneous)",
    unit: "session",
    icon: "Headphones",
  },
  {
    id: "dtp",
    name: "DTP (Desktop Publishing)",
    description: "Formatting and layout of translated documents (InDesign, Word, etc.)",
    unit: "page",
    icon: "Layout",
  },
  {
    id: "sworn",
    name: "Sworn / Certified Translation",
    description: "Officially certified translation with stamp/seal for legal/official use",
    unit: "word",
    icon: "Stamp",
  },
  {
    id: "transcreation",
    name: "Transcreation",
    description: "Creative adaptation of marketing/advertising content preserving intent and emotion",
    unit: "word",
    icon: "Sparkles",
  },
  {
    id: "terminology",
    name: "Terminology Management",
    description: "Creation and management of glossaries and terminology databases",
    unit: "project",
    icon: "BookOpen",
  },
  {
    id: "consulting",
    name: "Consulting",
    description: "Language and localization strategy consulting",
    unit: "hour",
    icon: "MessageCircle",
  },
];

export const SERVICE_UNITS = [
  { id: "word", name: "Per Word" },
  { id: "hour", name: "Per Hour" },
  { id: "page", name: "Per Page" },
  { id: "project", name: "Per Project" },
  { id: "minute", name: "Per Minute" },
  { id: "session", name: "Per Session" },
] as const;
