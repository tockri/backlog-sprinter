import { BoardEnv } from "@/content/board/types"
import { atom } from "jotai"

export const BoardEnvState = {
  atom: atom<BoardEnv>({
    selectedMilestoneId: 0,
    lang: "en",
    projectKey: ""
  })
} as const
