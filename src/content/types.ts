import { Immutable } from "immer"

export type UserLang = "en" | "ja"

export type ProjectEnv = Immutable<{
  readonly projectKey: string
  readonly lang: UserLang
}>
