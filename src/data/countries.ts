export interface Country {
  code: string;
  name: string;
  region: string;
}

export const COUNTRIES: Country[] = [
  { code: "US", name: "United States", region: "Americas" },
  { code: "GB", name: "United Kingdom", region: "Europe" },
  { code: "CA", name: "Canada", region: "Americas" },
  { code: "AU", name: "Australia", region: "Oceania" },
  { code: "DE", name: "Germany", region: "Europe" },
  { code: "FR", name: "France", region: "Europe" },
  { code: "ES", name: "Spain", region: "Europe" },
  { code: "IT", name: "Italy", region: "Europe" },
  { code: "PT", name: "Portugal", region: "Europe" },
  { code: "NL", name: "Netherlands", region: "Europe" },
  { code: "SE", name: "Sweden", region: "Europe" },
  { code: "NO", name: "Norway", region: "Europe" },
  { code: "DK", name: "Denmark", region: "Europe" },
  { code: "FI", name: "Finland", region: "Europe" },
  { code: "JP", name: "Japan", region: "Asia" },
  { code: "KR", name: "South Korea", region: "Asia" },
  { code: "CN", name: "China", region: "Asia" },
  { code: "IN", name: "India", region: "Asia" },
  { code: "AE", name: "United Arab Emirates", region: "Middle East" },
  { code: "SA", name: "Saudi Arabia", region: "Middle East" },
  { code: "BR", name: "Brazil", region: "Americas" },
  { code: "MX", name: "Mexico", region: "Americas" },
  { code: "ZA", name: "South Africa", region: "Africa" },
  { code: "NG", name: "Nigeria", region: "Africa" },
  { code: "EG", name: "Egypt", region: "Africa" },
  { code: "TR", name: "Turkey", region: "Europe/Asia" },
  { code: "RU", name: "Russia", region: "Europe/Asia" },
  { code: "SG", name: "Singapore", region: "Asia" },
  { code: "HK", name: "Hong Kong", region: "Asia" },
  { code: "IL", name: "Israel", region: "Middle East" },
];

export function getCountry(code: string): Country | undefined {
  return COUNTRIES.find((c) => c.code === code);
}

export function getCountryName(code: string): string {
  return getCountry(code)?.name ?? code;
}
