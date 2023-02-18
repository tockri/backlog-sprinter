import { BoardEnv } from "@/content/board/types"
import { atom } from "jotai"

export const EnvState = {
  atom: atom<BoardEnv>({
    projectKey: "",
    selectedMilestoneId: 0,
    lang: "en"
  })
} as const
