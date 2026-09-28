import type { APIRoute } from "astro"
import { logsFeed } from "@/lib/feed"
import { type Language, languagePaths } from "@/lib/i18n"

export const getStaticPaths = languagePaths

export const GET: APIRoute = ({ props }) => logsFeed(props.lang as Language)
