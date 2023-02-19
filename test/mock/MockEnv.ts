import { BoardEnv } from "@/content/board/types"
import { ProjectEnv } from "@/content/types"

export const MockEnv: ProjectEnv = {
  projectKey: "BT",
  lang: "ja"
}

export const MockBoardEnv: BoardEnv = {
  ...MockEnv,
  selectedMilestoneId: 0
}
