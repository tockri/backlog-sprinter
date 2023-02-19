import { ProjectEnv } from "@/content/types"
import { Immutable } from "immer"

export type BoardEnv = ProjectEnv &
  Immutable<{
    selectedMilestoneId: number
  }>
