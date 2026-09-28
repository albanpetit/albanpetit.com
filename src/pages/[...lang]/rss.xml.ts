import type { APIRoute } from "astro"
import { type Language, languagePaths } from "@/lib/i18n"
import { feed } from "@/lib/feed"

export const getStaticPaths = languagePaths

export const GET: APIRoute = ({ props }) => feed(props.lang as Language)
