export type UserLang = "ja" | "en"

export type ProjectEnv = {
  readonly projectKey: string
  readonly lang: UserLang
}

export { i18n } from "./i18n"
