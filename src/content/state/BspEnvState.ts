import { Immutable } from "immer"
import { atom } from "jotai"

export type UserLang = "en" | "ja"

export type BspEnv = Immutable<{
  projectKey: string
  lang: UserLang
}>

export const BspEnvState = {
  atom: atom<BspEnv>({
    lang: "en",
    projectKey: ""
  })
} as const
