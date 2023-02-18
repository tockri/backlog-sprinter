import { BacklogApi } from "@/content/backlog/BacklogApiForReact"
import { Issue } from "@/content/backlog/IssueApi"
import { Version } from "@/content/backlog/ProjectInfoApi"
import { Wiki } from "@/content/backlog/WikiApi"
import { ProjectState } from "@/content/board/state/ProjectInfoState"
import { ApiState } from "@/content/state/ApiState"
import { VelocityData, VelocityUtil } from "@/content/state/SprintVelocity"
import { DateUtil } from "@/util/DateUtil"
import { Immutable } from "immer"
import { atom } from "jotai"

type Record = Immutable<{
  type: "Record"
  milestone: Version
  onSuccess?: (saved: Wiki) => void
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
      const [wiki, data] = await loadData(api, project.id)
      const issues = await api.issue.searchClosed(project.id, startDate, DateUtil.addDays(endDate, 1))
      const saved = await saveSprint(api, project.id, wiki, data, issues, milestone)
      action.onSuccess && action.onSuccess(saved)
    }
  }
)

const loadData = async (api: BacklogApi, projectId: number): Promise<[Wiki | null, VelocityData]> => {
  const pages = await api.wiki.search(projectId, "(backlog-sprinter-velocity-record)")
  return pages.length > 0 ? [pages[0], VelocityUtil.parseAll(pages[0].content)] : [null, []]
}

const saveSprint = async (
  api: BacklogApi,
  projectId: number,
  wiki: Wiki | null,
  existing: VelocityData,
  issues: ReadonlyArray<Issue>,
  milestone: Version
): Promise<Wiki> => {
  const toSave = VelocityUtil.appendRecord(milestone, issues, 0, existing)
  const content = `${VelocityUtil.toStringAll(toSave)}

!!DO NOT EDIT (backlog-sprinter-velocity-record) DO NOT EDIT!!
`
  if (wiki) {
    return await api.wiki.edit(wiki, wiki.name, content)
  } else {
    return await api.wiki.add(projectId, "backlog-sprinter-velocity", content)
  }
}

export const VelocityState = {
  atom: mainAtom,
  Action: {
    Record: (milestone: Version, onSuccess?: (saved: Wiki) => void): Record => ({
      type: "Record",
      milestone,
      onSuccess
    })
  }
}
