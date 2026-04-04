import { getFlagUrlForCountryCode } from "@/lib/football/flags";

function svgToDataUri(svg: string) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function shieldPath() {
  return "M32 5 C20 5 12 10 12 22 v14 c0 13 8 20 20 24 c12-4 20-11 20-24 V22 C52 10 44 5 32 5 Z";
}

function createClubBadgeSvg(shortName: string, accent: string) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <defs>
        <radialGradient id="clubGlow" cx="50%" cy="36%" r="74%">
          <stop offset="0%" stop-color="${accent}" stop-opacity="0.95"/>
          <stop offset="100%" stop-color="#0b1116" stop-opacity="1"/>
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="29" fill="url(#clubGlow)" stroke="rgba(255,255,255,0.42)" stroke-width="2.2"/>
      <circle cx="32" cy="32" r="23" fill="#071015" stroke="rgba(255,255,255,0.16)" stroke-width="1.4"/>
      <circle cx="32" cy="17" r="6.5" fill="rgba(255,255,255,0.08)"/>
      <text x="32" y="39" text-anchor="middle" font-size="17" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-weight="700" letter-spacing="1.5" fill="#f9fffe">${shortName}</text>
    </svg>
  `;
}

function createNationalCrestSvg(shortName: string, primary: string, secondary: string, tertiary = "#ffffff") {
  const path = shieldPath();

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <defs>
        <clipPath id="shieldClip">
          <path d="${path}" />
        </clipPath>
      </defs>
      <path d="${path}" fill="#081118" stroke="rgba(255,255,255,0.32)" stroke-width="2.2"/>
      <g clip-path="url(#shieldClip)">
        <rect x="8" y="8" width="48" height="48" fill="#081118"/>
        <rect x="8" y="8" width="48" height="16" fill="${primary}"/>
        <rect x="8" y="24" width="48" height="16" fill="${secondary}"/>
        <rect x="8" y="40" width="48" height="16" fill="${tertiary}"/>
      </g>
      <circle cx="32" cy="28" r="9.5" fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.24)" stroke-width="1.2"/>
      <text x="32" y="48" text-anchor="middle" font-size="13" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-weight="700" letter-spacing="1.3" fill="#f9fffe">${shortName}</text>
    </svg>
  `;
}

function createAssociationBadgeSvg(
  acronym: string,
  primary: string,
  secondary: string,
  glow = "#ffffff"
) {
  const path = shieldPath();
  const lines = acronym.length > 4 ? [acronym.slice(0, 4), acronym.slice(4)] : [acronym];
  const textBlocks = lines
    .map((line, index) => {
      const y = lines.length === 1 ? 40 : 34 + index * 12;
      const size = lines.length === 1 ? 16 : 12;
      return `<text x="32" y="${y}" text-anchor="middle" font-size="${size}" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-weight="800" letter-spacing="1.2" fill="#f9fffe">${line}</text>`;
    })
    .join("");

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <defs>
        <radialGradient id="badgeGlow" cx="50%" cy="34%" r="78%">
          <stop offset="0%" stop-color="${glow}" stop-opacity="0.22"/>
          <stop offset="100%" stop-color="#091117" stop-opacity="1"/>
        </radialGradient>
      </defs>
      <path d="${path}" fill="url(#badgeGlow)" stroke="rgba(255,255,255,0.28)" stroke-width="2.2"/>
      <path d="${path}" fill="rgba(7,16,21,0.92)" transform="translate(0 1.2) scale(0.95 0.93) translate(1.7 1.9)"/>
      <rect x="15" y="12" width="34" height="9" rx="4.5" fill="${primary}" opacity="0.96"/>
      <rect x="15" y="22.5" width="34" height="5" rx="2.5" fill="${secondary}" opacity="0.92"/>
      <circle cx="32" cy="31" r="9.8" fill="rgba(255,255,255,0.08)" stroke="${secondary}" stroke-opacity="0.42" stroke-width="1.2"/>
      ${textBlocks}
    </svg>
  `;
}

function createEnglandFlag() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <defs>
        <clipPath id="clip"><circle cx="32" cy="32" r="30"/></clipPath>
      </defs>
      <g clip-path="url(#clip)">
        <rect width="64" height="64" fill="#ffffff"/>
        <rect x="26" width="12" height="64" fill="#d71f34"/>
        <rect y="26" width="64" height="12" fill="#d71f34"/>
      </g>
      <circle cx="32" cy="32" r="30" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
    </svg>
  `;
}

function createFranceFlag() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <defs><clipPath id="clip"><circle cx="32" cy="32" r="30"/></clipPath></defs>
      <g clip-path="url(#clip)">
        <rect width="21.34" height="64" x="0" fill="#1f5eff"/>
        <rect width="21.34" height="64" x="21.33" fill="#ffffff"/>
        <rect width="21.34" height="64" x="42.66" fill="#ef3340"/>
      </g>
      <circle cx="32" cy="32" r="30" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
    </svg>
  `;
}

function createSpainFlag() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <defs><clipPath id="clip"><circle cx="32" cy="32" r="30"/></clipPath></defs>
      <g clip-path="url(#clip)">
        <rect width="64" height="64" fill="#aa151b"/>
        <rect y="16" width="64" height="32" fill="#f1bf00"/>
        <rect x="17" y="24" width="8" height="14" rx="2" fill="#aa151b"/>
      </g>
      <circle cx="32" cy="32" r="30" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
    </svg>
  `;
}

function createBrazilFlag() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <defs><clipPath id="clip"><circle cx="32" cy="32" r="30"/></clipPath></defs>
      <g clip-path="url(#clip)">
        <rect width="64" height="64" fill="#009b3a"/>
        <polygon points="32,12 52,32 32,52 12,32" fill="#ffdf00"/>
        <circle cx="32" cy="32" r="10" fill="#002776"/>
        <path d="M22 31 C28 27, 36 27, 42 31" fill="none" stroke="#ffffff" stroke-width="2"/>
      </g>
      <circle cx="32" cy="32" r="30" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
    </svg>
  `;
}

function createArgentinaFlag() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <defs><clipPath id="clip"><circle cx="32" cy="32" r="30"/></clipPath></defs>
      <g clip-path="url(#clip)">
        <rect width="64" height="64" fill="#74acdf"/>
        <rect y="21.33" width="64" height="21.34" fill="#ffffff"/>
        <circle cx="32" cy="32" r="4.8" fill="#f6b40e"/>
      </g>
      <circle cx="32" cy="32" r="30" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
    </svg>
  `;
}

function createMoroccoFlag() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <defs><clipPath id="clip"><circle cx="32" cy="32" r="30"/></clipPath></defs>
      <g clip-path="url(#clip)">
        <rect width="64" height="64" fill="#c1272d"/>
        <polygon points="32,20 35.2,29.8 45.6,29.8 37.2,35.9 40.4,45.8 32,39.6 23.6,45.8 26.8,35.9 18.4,29.8 28.8,29.8" fill="none" stroke="#006233" stroke-width="2.6" stroke-linejoin="round"/>
      </g>
      <circle cx="32" cy="32" r="30" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
    </svg>
  `;
}

function createJapanFlag() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <defs><clipPath id="clip"><circle cx="32" cy="32" r="30"/></clipPath></defs>
      <g clip-path="url(#clip)">
        <rect width="64" height="64" fill="#ffffff"/>
        <circle cx="32" cy="32" r="11" fill="#bc002d"/>
      </g>
      <circle cx="32" cy="32" r="30" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
    </svg>
  `;
}

function createUsaFlag() {
  const stripes = Array.from({ length: 13 }, (_, index) => {
    const y = index * (64 / 13);
    const fill = index % 2 === 0 ? "#b22234" : "#ffffff";
    return `<rect x="0" y="${y}" width="64" height="${64 / 13 + 0.2}" fill="${fill}"/>`;
  }).join("");

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <defs><clipPath id="clip"><circle cx="32" cy="32" r="30"/></clipPath></defs>
      <g clip-path="url(#clip)">
        ${stripes}
        <rect x="0" y="0" width="28" height="28" fill="#3c3b6e"/>
        ${Array.from({ length: 3 }, (_, row) =>
          Array.from({ length: 4 }, (_, col) => {
            const cx = 5 + col * 6;
            const cy = 5 + row * 7;
            return `<circle cx="${cx}" cy="${cy}" r="1" fill="#ffffff"/>`;
          }).join("")
        ).join("")}
      </g>
      <circle cx="32" cy="32" r="30" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
    </svg>
  `;
}

function createSaudiFlag() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <defs><clipPath id="clip"><circle cx="32" cy="32" r="30"/></clipPath></defs>
      <g clip-path="url(#clip)">
        <rect width="64" height="64" fill="#006c35"/>
        <rect x="15" y="24" width="34" height="4" rx="2" fill="#ffffff" opacity="0.88"/>
        <rect x="20" y="36" width="24" height="3" rx="1.5" fill="#ffffff"/>
      </g>
      <circle cx="32" cy="32" r="30" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
    </svg>
  `;
}

function createFallbackNationalFlag(shortName: string, accent = "#7ad7ff") {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <defs>
        <radialGradient id="flagGlow" cx="50%" cy="35%" r="74%">
          <stop offset="0%" stop-color="${accent}" stop-opacity="0.72"/>
          <stop offset="100%" stop-color="#091117" stop-opacity="1"/>
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#flagGlow)" stroke="rgba(255,255,255,0.28)" stroke-width="2"/>
      <circle cx="32" cy="32" r="22" fill="#071015" stroke="rgba(255,255,255,0.14)" stroke-width="1.2"/>
      <text x="32" y="38" text-anchor="middle" font-size="15" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-weight="700" letter-spacing="1.4" fill="#f8fffe">${shortName}</text>
    </svg>
  `;
}

const NATIONAL_FLAG_SVGS: Record<string, string> = {
  eng_nt: createEnglandFlag(),
  fra_nt: createFranceFlag(),
  esp_nt: createSpainFlag(),
  bra_nt: createBrazilFlag(),
  arg_nt: createArgentinaFlag(),
  mar_nt: createMoroccoFlag(),
  jpn_nt: createJapanFlag(),
  usa_nt: createUsaFlag(),
  ksa_nt: createSaudiFlag()
};

const NATIONAL_CREST_SVGS: Record<string, string> = {
  eng_nt: createAssociationBadgeSvg("FA", "#ffffff", "#1d4ed8", "#dbeafe"),
  fra_nt: createAssociationBadgeSvg("FFF", "#1f5eff", "#ef3340", "#dbeafe"),
  esp_nt: createAssociationBadgeSvg("RFEF", "#aa151b", "#f1bf00", "#fde68a"),
  ger_nt: createAssociationBadgeSvg("DFB", "#111111", "#c9a227", "#f8fafc"),
  ita_nt: createAssociationBadgeSvg("FIGC", "#2563eb", "#16a34a", "#dbeafe"),
  por_nt: createAssociationBadgeSvg("FPF", "#c62828", "#f59e0b", "#fee2e2"),
  ned_nt: createAssociationBadgeSvg("KNVB", "#ea580c", "#ffffff", "#fed7aa"),
  cro_nt: createAssociationBadgeSvg("HNS", "#ef4444", "#ffffff", "#fee2e2"),
  bra_nt: createAssociationBadgeSvg("CBF", "#009b3a", "#ffdf00", "#dcfce7"),
  arg_nt: createAssociationBadgeSvg("AFA", "#74acdf", "#ffffff", "#e0f2fe"),
  uru_nt: createAssociationBadgeSvg("AUF", "#38bdf8", "#ffffff", "#e0f2fe"),
  col_nt: createAssociationBadgeSvg("FCF", "#facc15", "#dc2626", "#fef9c3"),
  mar_nt: createAssociationBadgeSvg("FRMF", "#c1272d", "#006233", "#fee2e2"),
  jpn_nt: createAssociationBadgeSvg("JFA", "#ffffff", "#bc002d", "#fce7f3"),
  usa_nt: createAssociationBadgeSvg("USSF", "#1d4ed8", "#ef4444", "#dbeafe"),
  mex_nt: createAssociationBadgeSvg("FMF", "#16a34a", "#dc2626", "#dcfce7"),
  ksa_nt: createAssociationBadgeSvg("SAFF", "#006c35", "#ffffff", "#dcfce7"),
  aus_nt: createAssociationBadgeSvg("FFA", "#f1c40f", "#0f766e", "#fef3c7"),
  chn_nt: createAssociationBadgeSvg("CFA", "#dc2626", "#f59e0b", "#fee2e2")
};

const NATIONAL_ASSOCIATION_CREST_ASSETS: Record<string, string> = {
  eng_nt: "/associations/eng_nt.svg",
  sco_nt: "/associations/sco_nt.svg",
  wal_nt: "/associations/wal_nt.svg",
  nir_nt: "/associations/nir_nt.svg",
  fra_nt: "/associations/fra_nt.svg",
  esp_nt: "/associations/esp_nt.svg",
  ger_nt: "/associations/ger_nt.svg",
  ita_nt: "/associations/ita_nt.svg",
  por_nt: "/associations/por_nt.svg",
  ned_nt: "/associations/ned_nt.svg",
  cro_nt: "/associations/cro_nt.svg",
  bra_nt: "/associations/bra_nt.svg",
  arg_nt: "/associations/arg_nt.svg",
  uru_nt: "/associations/uru_nt.png",
  col_nt: "/associations/col_nt.svg",
  mar_nt: "/associations/mar_nt.svg",
  jpn_nt: "/associations/jpn_nt.svg",
  usa_nt: "/associations/usa_nt.svg"
  ,
  mex_nt: "/associations/mex_nt.svg",
  aus_nt: "/associations/aus_nt.svg",
  chn_nt: "/associations/chn_nt.svg",
  ksa_nt: "/associations/ksa_nt.svg"
};

export function getClubBadgeIcon(shortName: string, accent: string) {
  return svgToDataUri(createClubBadgeSvg(shortName, accent));
}

export function getNationalFlagIcon(
  teamId: string,
  shortName: string,
  accent: string,
  countryCode?: string | null,
  countryFlagUrl?: string | null
) {
  const resolvedFlagUrl = getFlagUrlForCountryCode(countryCode, countryFlagUrl);

  if (resolvedFlagUrl) {
    return resolvedFlagUrl;
  }

  return svgToDataUri(createFallbackNationalFlag(shortName, accent));
}

export function getNationalCrestIcon(teamId: string, shortName: string, accent: string) {
  const asset = NATIONAL_ASSOCIATION_CREST_ASSETS[teamId];

  if (asset) {
    return asset;
  }

  return null;
}

export function getTeamMarkerIcon(
  teamId: string,
  shortName: string,
  accent: string,
  isNational: boolean,
  countryCode?: string | null,
  countryFlagUrl?: string | null
) {
  return isNational
    ? getNationalFlagIcon(teamId, shortName, accent, countryCode, countryFlagUrl)
    : getClubBadgeIcon(shortName, accent);
}

export function getTeamHeaderIcon(teamId: string, shortName: string, accent: string, isNational: boolean) {
  return isNational ? getNationalCrestIcon(teamId, shortName, accent) : getClubBadgeIcon(shortName, accent);
}
