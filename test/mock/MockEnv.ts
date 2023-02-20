import { BoardEnv } from "@/content/board/types"
import { BspEnv } from "@/content/types"

export const MockEnv: BspEnv = {
  projectKey: "BT",
  lang: "ja"
}

export const MockBoardEnv: BoardEnv = {
  ...MockEnv,
  selectedMilestoneId: 0
}
