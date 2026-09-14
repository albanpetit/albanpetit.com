export const LANGUAGES = ["en", "fr"]
export const DEFAULT_LANGUAGE = "en"

/** Prefix a path with its language, except for the default one: localizedPath("/blog/", "fr") → "/fr/blog/" */
export function localizedPath(path: string, language: string): string {
  return language === DEFAULT_LANGUAGE ? path : `/${language}${path}`
}
