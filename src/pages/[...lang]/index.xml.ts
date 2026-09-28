import type { APIRoute } from "astro"
import { type Language, languagePaths } from "@/lib/i18n"
import { feed } from "@/lib/feed"

// Feed URL of the Hugo site: feed readers do not follow meta refresh, so it serves a copy of rss.xml
export const getStaticPaths = languagePaths

export const GET: APIRoute = ({ props }) => feed(props.lang as Language)
