import { BspEnv } from "@/content/types"
import { Immutable } from "immer"

export type BoardEnv = BspEnv &
  Immutable<{
    selectedMilestoneId: number
  }>
