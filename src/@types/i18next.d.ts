import "i18next"

// Matches `returnNull: false` in gatsby-config.ts: t() always returns a string
declare module "i18next" {
  interface CustomTypeOptions {
    returnNull: false
  }
}
