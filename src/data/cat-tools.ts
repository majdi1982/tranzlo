export interface CatTool {
  id: string;
  name: string;
  vendor: "microsoft" | "adobe" | "trados" | "memoq" | "cloud" | "oss" | "other";
}

export const CAT_TOOLS: CatTool[] = [
  // ── Microsoft ──
  { id: "word", name: "Microsoft Word", vendor: "microsoft" },
  { id: "excel", name: "Microsoft Excel", vendor: "microsoft" },
  { id: "powerpoint", name: "Microsoft PowerPoint", vendor: "microsoft" },
  { id: "locstudio", name: "Microsoft Localization Studio", vendor: "microsoft" },
  { id: "microsoft-translator", name: "Microsoft Translator (Azure AI)", vendor: "microsoft" },
  { id: "vs-code", name: "VS Code", vendor: "microsoft" },

  // ── Adobe ──
  { id: "indesign", name: "Adobe InDesign", vendor: "adobe" },
  { id: "illustrator", name: "Adobe Illustrator", vendor: "adobe" },
  { id: "photoshop", name: "Adobe Photoshop", vendor: "adobe" },
  { id: "framemaker", name: "Adobe FrameMaker", vendor: "adobe" },
  { id: "acrobat", name: "Adobe Acrobat Pro", vendor: "adobe" },

  // ── CAT Suites ──
  { id: "trados", name: "Trados Studio", vendor: "trados" },
  { id: "trados-groupware", name: "Trados GroupShare", vendor: "trados" },
  { id: "memoq", name: "memoQ", vendor: "memoq" },
  { id: "memoq-server", name: "memoQ Server", vendor: "memoq" },
  { id: "wordfast", name: "Wordfast", vendor: "other" },
  { id: "dejavu", name: "Déjà Vu X3", vendor: "other" },
  { id: "across", name: "Across", vendor: "other" },
  { id: "transit", name: "Transit NXT", vendor: "other" },

  // ── Cloud CAT ──
  { id: "phrase", name: "Phrase (Memsource)", vendor: "cloud" },
  { id: "smartcat", name: "Smartcat", vendor: "cloud" },
  { id: "crowdin", name: "Crowdin", vendor: "cloud" },
  { id: "lokalise", name: "Lokalise", vendor: "cloud" },
  { id: "matecat", name: "MateCat", vendor: "cloud" },

  // ── Open Source ──
  { id: "omegat", name: "OmegaT", vendor: "oss" },
  { id: "poedit", name: "POEdit", vendor: "oss" },
  { id: "virtaal", name: "Virtaal", vendor: "oss" },

  // ── QA & Tools ──
  { id: "xbench", name: "Xbench", vendor: "other" },
  { id: "passolo", name: "SDL Passolo", vendor: "other" },
  { id: "alchemy", name: "Alchemy Catalyst", vendor: "other" },
];

export const CAT_TOOL_VENDORS = [
  { id: "microsoft", name: "Microsoft", color: "bg-blue-100 text-blue-800" },
  { id: "adobe", name: "Adobe", color: "bg-red-100 text-red-800" },
  { id: "trados", name: "Trados", color: "bg-green-100 text-green-800" },
  { id: "memoq", name: "memoQ", color: "bg-purple-100 text-purple-800" },
  { id: "cloud", name: "Cloud-based", color: "bg-cyan-100 text-cyan-800" },
  { id: "oss", name: "Open Source", color: "bg-orange-100 text-orange-800" },
  { id: "other", name: "Other", color: "bg-gray-100 text-gray-800" },
] as const;
