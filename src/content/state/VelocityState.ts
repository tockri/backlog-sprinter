import { Version } from "@/content/backlog/ProjectInfoApi"
import { ProjectState } from "@/content/board/state/ProjectInfoState"
import { ApiState } from "@/content/state/ApiState"
import { SprintUtil } from "@/content/state/Sprint"
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
    const endDate = DateUtil.parseDate(milestone.releaseDueDate)
    if (startDate && endDate) {
      const api = get(ApiState.atom)
      const project = await get(ProjectState.atom)
      const issues = await api.issue.searchClosed(project.id, startDate, DateUtil.addDays(endDate, 1))
      const pages = await api.wiki.searchWiki(project.id, "(backlog-sprinter-velocity-record)")
      const existing = pages[0] ? SprintUtil.parseAll(pages[0].content) : []
      const toSave = SprintUtil.build(milestone, issues, 0, existing)
    }
  }
)

export const VelocityState = {
  atom: mainAtom,
  Action: {
    Record: (milestone: Version): Record => ({ type: "Record", milestone })
  }
}
