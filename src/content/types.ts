import { Immutable } from "immer"

export type UserLang = "en" | "ja"

export type BspEnv = Immutable<{
  readonly projectKey: string
  readonly lang: UserLang
}>
