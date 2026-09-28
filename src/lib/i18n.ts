import en from "../../locales/en/translation.json"
import fr from "../../locales/fr/translation.json"
import { createTranslator, type Translations } from "@/lib/translate"

export const LANGUAGES = ["en", "fr"] as const
export type Language = (typeof LANGUAGES)[number]
export const DEFAULT_LANGUAGE: Language = "en"

const resources: Record<Language, unknown> = { en, fr }

/** Prefix a path with its language, except for the default one: localizedPath("/blog/", "fr") → "/fr/blog/" */
export function localizedPath(path: string, language: string): string {
  return language === DEFAULT_LANGUAGE ? path : `/${language}${path}`
}

/** Path without its language prefix: unlocalizedPath("/fr/blog/") → "/blog/" */
export function unlocalizedPath(path: string): string {
  const [, first, ...rest] = path.split("/")
  return LANGUAGES.includes(first as Language) && first !== DEFAULT_LANGUAGE ? `/${rest.join("/")}` : path
}

export const otherLanguage = (language: Language): Language => (language === "en" ? "fr" : "en")

/** getStaticPaths entries for pages under src/pages/[...lang]/: no prefix for the default language */
export const languagePaths = () =>
  LANGUAGES.map((lang) => ({ params: { lang: lang === DEFAULT_LANGUAGE ? undefined : lang }, props: { lang } }))

/** `lang` route param (undefined for the default language) → language */
export const languageParam = (lang: Language) => (lang === DEFAULT_LANGUAGE ? undefined : lang)

/** Translation function of `language`, see createTranslator for the conventions */
export const getTranslations = (language: Language) => createTranslator(language, resources[language])

/**
 * Only the given top-level sections of the translations, for React islands: passing them as props keeps
 * the full locale files out of the client bundle. Use with createTranslator from "@/lib/translate".
 */
export const pickTranslations = (language: Language, ...sections: string[]): Translations =>
  Object.fromEntries(sections.map((section) => [section, (resources[language] as Translations)[section]]))

/** Long date in the page language: "March 10, 2025" / "10 mars 2025" */
export const formatDate = (date: Date, language: Language) =>
  new Intl.DateTimeFormat(language, { dateStyle: "long", timeZone: "UTC" }).format(date)
