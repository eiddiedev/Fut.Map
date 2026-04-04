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

const COUNTRY_FLAG_URL_FALLBACKS: Record<string, string> = {
  Afghanistan: "https://flagcdn.com/w80/af.png",
  Aland: "https://flagcdn.com/w80/ax.png",
  "American Samoa": "https://flagcdn.com/w80/as.png",
  "Antigua and Barb.": "https://flagcdn.com/w80/ag.png",
  Bahamas: "https://flagcdn.com/w80/bs.png",
  "Bosnia and Herz.": "https://flagcdn.com/w80/ba.png",
  "Br. Indian Ocean Ter.": "https://flagcdn.com/w80/io.png",
  Brunei: "https://flagcdn.com/w80/bn.png",
  "Cape Verde": "https://flagcdn.com/w80/cv.png",
  "Cayman Is.": "https://flagcdn.com/w80/ky.png",
  "Central African Rep.": "https://flagcdn.com/w80/cf.png",
  Chad: "https://flagcdn.com/w80/td.png",
  Comoros: "https://flagcdn.com/w80/km.png",
  "Côte d'Ivoire": "https://flagcdn.com/w80/ci.png",
  Curaçao: "https://flagcdn.com/w80/cw.png",
  "Czech Rep.": "https://flagcdn.com/w80/cz.png",
  "Dem. Rep. Congo": "https://flagcdn.com/w80/cd.png",
  "Dem. Rep. Korea": "https://flagcdn.com/w80/kp.png",
  Djibouti: "https://flagcdn.com/w80/dj.png",
  Dominica: "https://flagcdn.com/w80/dm.png",
  "Dominican Rep.": "https://flagcdn.com/w80/do.png",
  "Eq. Guinea": "https://flagcdn.com/w80/gq.png",
  Eritrea: "https://flagcdn.com/w80/er.png",
  "Faeroe Is.": "https://flagcdn.com/w80/fo.png",
  "Falkland Is.": "https://flagcdn.com/w80/fk.png",
  "Fr. Polynesia": "https://flagcdn.com/w80/pf.png",
  Greenland: "https://flagcdn.com/w80/gl.png",
  Guam: "https://flagcdn.com/w80/gu.png",
  "Guinea-Bissau": "https://flagcdn.com/w80/gw.png",
  Guyana: "https://flagcdn.com/w80/gy.png",
  "Isle of Man": "https://flagcdn.com/w80/im.png",
  Jersey: "https://flagcdn.com/w80/je.png",
  Kiribati: "https://flagcdn.com/w80/ki.png",
  Korea: "https://flagcdn.com/w80/kr.png",
  "Lao PDR": "https://flagcdn.com/w80/la.png",
  Madagascar: "https://flagcdn.com/w80/mg.png",
  Micronesia: "https://flagcdn.com/w80/fm.png",
  Montserrat: "https://flagcdn.com/w80/ms.png",
  Mozambique: "https://flagcdn.com/w80/mz.png",
  "N. Mariana Is.": "https://flagcdn.com/w80/mp.png",
  "New Caledonia": "https://flagcdn.com/w80/nc.png",
  Niger: "https://flagcdn.com/w80/ne.png",
  Niue: "https://flagcdn.com/w80/nu.png",
  Palau: "https://flagcdn.com/w80/pw.png",
  "Papua New Guinea": "https://flagcdn.com/w80/pg.png",
  "Puerto Rico": "https://flagcdn.com/w80/pr.png",
  "S. Sudan": "https://flagcdn.com/w80/ss.png",
  "Saint Helena": "https://flagcdn.com/w80/sh.png",
  "Saint Lucia": "https://flagcdn.com/w80/lc.png",
  Samoa: "https://flagcdn.com/w80/ws.png",
  "São Tomé and Principe": "https://flagcdn.com/w80/st.png",
  Seychelles: "https://flagcdn.com/w80/sc.png",
  "Sierra Leone": "https://flagcdn.com/w80/sl.png",
  "Solomon Is.": "https://flagcdn.com/w80/sb.png",
  "Sri Lanka": "https://flagcdn.com/w80/lk.png",
  "St. Pierre and Miquelon": "https://flagcdn.com/w80/pm.png",
  "St. Vin. and Gren.": "https://flagcdn.com/w80/vc.png",
  Swaziland: "https://flagcdn.com/w80/sz.png",
  Timor: "https://flagcdn.com/w80/tl.png",
  Togo: "https://flagcdn.com/w80/tg.png",
  Tonga: "https://flagcdn.com/w80/to.png",
  Tunisia: "https://flagcdn.com/w80/tn.png",
  Turkmenistan: "https://flagcdn.com/w80/tm.png",
  Uganda: "https://flagcdn.com/w80/ug.png",
  Uzbekistan: "https://flagcdn.com/w80/uz.png",
  Vanuatu: "https://flagcdn.com/w80/vu.png",
  Yemen: "https://flagcdn.com/w80/ye.png",
  Zambia: "https://flagcdn.com/w80/zm.png",
  Zimbabwe: "https://flagcdn.com/w80/zw.png"
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
  return COUNTRY_FLAG_URL_FALLBACKS[country] ?? getFlagUrlForCountryCode(NATIONAL_COUNTRY_CODE_OVERRIDES[country]);
}
