import { UserLang } from "@/content/types"
import { Immutable } from "immer"

export type BoardEnv = Immutable<{
  projectKey: string
  selectedMilestoneId: number
  lang: UserLang
}>
