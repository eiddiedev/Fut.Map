export const NATIONAL_COUNTRY_CODE_OVERRIDES: Record<string, string> = {
  England: "gb-eng",
  Scotland: "gb-sct",
  Wales: "gb-wls",
  "Northern Ireland": "gb-nir",
  France: "fr",
  Spain: "es",
  Germany: "de",
  Italy: "it",
  Portugal: "pt",
  Netherlands: "nl",
  Croatia: "hr",
  Brazil: "br",
  Argentina: "ar",
  Uruguay: "uy",
  Colombia: "co",
  Morocco: "ma",
  Japan: "jp",
  "United States": "us",
  Mexico: "mx",
  "Saudi Arabia": "sa",
  Australia: "au",
  China: "cn"
};

const SPECIAL_FLAG_CODE_URLS: Record<string, string> = {
  "gb-eng": "https://media.api-sports.io/flags/gb-eng.svg",
  "gb-sct": "https://media.api-sports.io/flags/gb-sct.svg",
  "gb-wls": "https://media.api-sports.io/flags/gb-wls.svg",
  "gb-nir": "https://media.api-sports.io/flags/gb-nir.svg"
};

export function normalizeCountryCode(countryCode: string | null | undefined) {
  if (!countryCode) {
    return null;
  }

  return countryCode.toLowerCase();
}

export function getFlagUrlForCountryCode(countryCode: string | null | undefined, upstreamFlagUrl?: string | null) {
  if (upstreamFlagUrl) {
    return upstreamFlagUrl;
  }

  const normalized = normalizeCountryCode(countryCode);

  if (!normalized) {
    return null;
  }

  const special = SPECIAL_FLAG_CODE_URLS[normalized];

  if (special) {
    return special;
  }

  const baseCode = normalized.includes("-") ? normalized.split("-")[0] : normalized;

  return baseCode ? `https://flagcdn.com/w80/${baseCode}.png` : null;
}

export function getNationalFlagUrl(country: string) {
  return getFlagUrlForCountryCode(NATIONAL_COUNTRY_CODE_OVERRIDES[country]);
}
