// No locale import here: React islands use this module with only the translations they receive as props

type Values = Record<string, string | number>
export type Translations = Record<string, unknown>

const lookup = (resource: unknown, key: string): unknown =>
  key.split(".").reduce<unknown>((node, part) => (node as Translations | undefined)?.[part], resource)

/**
 * Translation function for locales/<language>/translation.json, with the i18next conventions the files use:
 * `{{name}}` interpolation and `_one`/`_other` plural suffixes picked from `count`.
 */
export function createTranslator(language: string, resource: unknown) {
  const plurals = new Intl.PluralRules(language)

  function t(key: string, values?: Values): string {
    const count = values?.count
    const value =
      (typeof count === "number" && lookup(resource, `${key}_${plurals.select(count)}`)) || lookup(resource, key)
    if (typeof value !== "string") return key
    return value.replace(/\{\{(\w+)\}\}/g, (_, name: string) => String(values?.[name] ?? ""))
  }

  /** Array values (skill lists…) */
  t.list = (key: string): string[] => {
    const value = lookup(resource, key)
    return Array.isArray(value) ? value : []
  }

  return t
}
