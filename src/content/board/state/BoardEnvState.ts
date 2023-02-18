import { BoardEnv } from "@/content/board/types"
import { MilestonesState } from "@/content/state/ProjectInfoState"
import { atom } from "jotai"

const mainAtom = atom<BoardEnv>({
  selectedMilestoneId: 0,
  lang: "en",
  projectKey: ""
})

const selectedMilestoneAtom = atom(async (get) => {
  const env = get(mainAtom)
  const milestones = await get(MilestonesState.atom)
  return milestones.find((ms) => ms.id === env.selectedMilestoneId) || null
})
export const BoardEnvState = {
  atom: mainAtom,
  selectedMilestoneAtom
} as const
