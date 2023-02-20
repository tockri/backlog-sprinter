import { Immutable } from "immer"
import { atom } from "jotai"

export type UserLang = "en" | "ja"

export type BspEnv = Immutable<{
  projectKey: string
  lang: UserLang
  selectedMilestoneId: number
}>

export const BspEnvState = {
  atom: atom<BspEnv>({
    lang: "en",
    projectKey: "",
    selectedMilestoneId: 0
  })
} as const
