import en from "../../locales/en/translation.json"
import fr from "../../locales/fr/translation.json"

const labels: Record<string, Record<string, string>> = { en: en.categories, fr: fr.categories }

/** Display name of a category. Front matter keeps the English name, which also drives the slug. */
export function categoryLabel(category: string, language: string): string {
  return labels[language]?.[category] ?? category
}
