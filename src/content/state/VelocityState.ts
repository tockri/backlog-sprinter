import { Version } from "@/content/backlog/ProjectInfoApi"
import { ProjectState } from "@/content/board/state/ProjectInfoState"
import { ApiState } from "@/content/state/ApiState"
import { DateUtil } from "@/util/DateUtil"
import { Immutable } from "immer"
import { atom } from "jotai"

type Record = Immutable<{
  type: "Record"
  milestone: Version
}>

const mainAtom = atom(
  (get) => ({}),
  async (get, set, action: Record) => {
    const milestone = action.milestone
    const startDate = DateUtil.parseDate(milestone.startDate)
    if (startDate) {
      const api = get(ApiState.atom)
      const project = await get(ProjectState.atom)
      const issues = await api.issue.searchClosed(project.id, startDate)
      const pages = await api.wiki.searchWiki(project.id, "(backlog-sprinter-velocity-record)")
      if (pages[0]) {
        pages[0].content
      }
    }
  }
)

export const VelocityState = {
  atom: mainAtom,
  Action: {
    Record: (): Record => ({ type: "Record" })
  }
}
