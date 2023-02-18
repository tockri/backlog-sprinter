import { UserLang } from "@/content/types"
import { Immutable } from "immer"

export type ProjectEnv = Immutable<{
  readonly projectKey: string
  readonly lang: UserLang
}>

export { i18n } from "./i18n"
