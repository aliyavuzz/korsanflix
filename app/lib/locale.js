/**
 * Shared locale utility.
 * Maps Cloudflare CF-IPCountry to TMDB language + Vidsrc ds_lang.
 * Used by all API routes server-side.
 */

const COUNTRY_MAP = {
  TR: { tmdbLang: "tr-TR", dsLang: "tr" },
  DE: { tmdbLang: "de-DE", dsLang: "de" },
  FR: { tmdbLang: "fr-FR", dsLang: "fr" },
  RU: { tmdbLang: "ru-RU", dsLang: "ru" },
  ES: { tmdbLang: "es-ES", dsLang: "es" },
  IT: { tmdbLang: "it-IT", dsLang: "it" },
  PT: { tmdbLang: "pt-PT", dsLang: "pt" },
  AR: { tmdbLang: "ar-SA", dsLang: "ar" },
  JP: { tmdbLang: "ja-JP", dsLang: "ja" },
  KR: { tmdbLang: "ko-KR", dsLang: "ko" },
  CN: { tmdbLang: "zh-CN", dsLang: "zh" },
};

const FALLBACK = { tmdbLang: "en-US", dsLang: "en" };

/**
 * Extract locale from a Request object using CF-IPCountry header.
 * @param {Request} request
 * @returns {{ tmdbLang: string, dsLang: string }}
 */
export function getLocaleFromRequest(request) {
  const country = request.headers.get("cf-ipcountry") || "";
  return COUNTRY_MAP[country.toUpperCase()] || FALLBACK;
}

/**
 * Build the TMDB language query param string fragment.
 * e.g. "&language=tr-TR"
 */
export function tmdbLangParam(request) {
  const { tmdbLang } = getLocaleFromRequest(request);
  return `&language=${tmdbLang}`;
}
