import en from "../../locales/en/translation.json"
import fr from "../../locales/fr/translation.json"

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

type Values = Record<string, string | number>

const lookup = (language: Language, key: string): unknown =>
  key
    .split(".")
    .reduce<unknown>((node, part) => (node as Record<string, unknown> | undefined)?.[part], resources[language])

/**
 * Translation function for locales/<language>/translation.json, with the i18next conventions the files use:
 * `{{name}}` interpolation and `_one`/`_other` plural suffixes picked from `count`.
 */
export function getTranslations(language: Language) {
  const plurals = new Intl.PluralRules(language)

  function t(key: string, values?: Values): string {
    const count = values?.count
    const value =
      (typeof count === "number" && lookup(language, `${key}_${plurals.select(count)}`)) || lookup(language, key)
    if (typeof value !== "string") return key
    return value.replace(/\{\{(\w+)\}\}/g, (_, name: string) => String(values?.[name] ?? ""))
  }

  /** Array values (skill lists…) */
  t.list = (key: string): string[] => {
    const value = lookup(language, key)
    return Array.isArray(value) ? value : []
  }

  return t
}

/** Long date in the page language: "March 10, 2025" / "10 mars 2025" */
export const formatDate = (date: Date, language: Language) =>
  new Intl.DateTimeFormat(language, { dateStyle: "long", timeZone: "UTC" }).format(date)
