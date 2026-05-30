export interface ServiceType {
  id: string;
  name: string;
  nameAr: string | null;
  description: string;
  unit: "word" | "hour" | "page" | "project" | "minute" | "session";
  icon: string;
}

export const SERVICE_TYPES: ServiceType[] = [
  {
    id: "translation",
    name: "Translation",
    nameAr: "ترجمة",
    description: "Standard text translation from source to target language",
    unit: "word",
    icon: "FileText",
  },
  {
    id: "review",
    name: "Review / Revision",
    nameAr: "مراجعة وتدقيق",
    description: "Bilingual review comparing source and target for accuracy and completeness",
    unit: "word",
    icon: "SearchCheck",
  },
  {
    id: "editing",
    name: "Editing",
    nameAr: "تحرير",
    description: "Monolingual editing to improve style, flow, and readability",
    unit: "word",
    icon: "PenLine",
  },
  {
    id: "proofreading",
    name: "Proofreading",
    nameAr: "مراجعة نهائية",
    description: "Final check for typos, grammar, punctuation, and formatting",
    unit: "word",
    icon: "CheckCircle2",
  },
  {
    id: "mtpe",
    name: "MTPE (Machine Translation Post-Editing)",
    nameAr: "تحرير الترجمة الآلية",
    description: "Post-editing of machine-translated output to meet quality standards",
    unit: "word",
    icon: "Bot",
  },
  {
    id: "subtitling",
    name: "Subtitling",
    nameAr: "ترجمة الأفلام والفيديو",
    description: "Subtitle creation with time-coded text in video/audio content",
    unit: "minute",
    icon: "Captions",
  },
  {
    id: "transcription",
    name: "Transcription",
    nameAr: "تفريغ صوتي",
    description: "Converting audio/video speech into written text in the same language",
    unit: "minute",
    icon: "Mic",
  },
  {
    id: "localization",
    name: "Localization",
    nameAr: "توطين وتعريب",
    description: "Full adaptation of content (UI, marketing, documentation) for target locale",
    unit: "word",
    icon: "Globe",
  },
  {
    id: "interpretation",
    name: "Interpretation",
    nameAr: "ترجمة فورية / شفوية",
    description: "Real-time oral interpretation (consecutive or simultaneous)",
    unit: "session",
    icon: "Headphones",
  },
  {
    id: "dtp",
    name: "DTP (Desktop Publishing)",
    nameAr: "تنضيد وإخراج فني",
    description: "Formatting and layout of translated documents (InDesign, Word, etc.)",
    unit: "page",
    icon: "Layout",
  },
  {
    id: "sworn",
    name: "Sworn / Certified Translation",
    nameAr: "ترجمة معتمدة",
    description: "Officially certified translation with stamp/seal for legal/official use",
    unit: "word",
    icon: "Stamp",
  },
  {
    id: "transcreation",
    name: "Transcreation",
    nameAr: "ترجمة إبداعية",
    description: "Creative adaptation of marketing/advertising content preserving intent and emotion",
    unit: "word",
    icon: "Sparkles",
  },
  {
    id: "terminology",
    name: "Terminology Management",
    nameAr: "إدارة المصطلحات",
    description: "Creation and management of glossaries and terminology databases",
    unit: "project",
    icon: "BookOpen",
  },
  {
    id: "consulting",
    name: "Consulting",
    nameAr: "استشارات لغوية",
    description: "Language and localization strategy consulting",
    unit: "hour",
    icon: "MessageCircle",
  },
];

export const SERVICE_UNITS = [
  { id: "word", name: "Per Word", nameAr: "بالكلمة" },
  { id: "hour", name: "Per Hour", nameAr: "بالساعة" },
  { id: "page", name: "Per Page", nameAr: "بالصفحة" },
  { id: "project", name: "Per Project", nameAr: "بالمشروع" },
  { id: "minute", name: "Per Minute", nameAr: "بالدقيقة" },
  { id: "session", name: "Per Session", nameAr: "بالجلسة" },
] as const;
