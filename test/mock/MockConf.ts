import { BoardConf } from "@/content/board/state/BoardConfState"
import { ProjectConf } from "@/content/project/state/ProjectConfState"
import { BspConf } from "@/content/state/BspConfState"

export const MockProjectConf: ProjectConf = {
  selectedTab: 0
}

export const MockBoardConf: BoardConf = {
  sprintDays: 6,
  moveUnclosed: false,
  archiveCurrent: false,
  recordVelocity: false
}

export const MockBspConf: BspConf = {
  pbiIssueTypeId: 389286
}
