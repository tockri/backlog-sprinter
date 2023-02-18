import { BacklogApi } from "@/content/backlog/BacklogApiForReact"
import { Issue } from "@/content/backlog/IssueApi"
import { Version } from "@/content/backlog/ProjectInfoApi"
import { Wiki } from "@/content/backlog/WikiApi"
import { ProjectState } from "@/content/board/state/ProjectInfoState"
import { ApiState } from "@/content/state/ApiState"
import { VelocityData, VelocityUtil } from "@/content/state/SprintVelocity"
import { JotaiUtil } from "@/content/util/JotaiUtil"
import { DateUtil } from "@/util/DateUtil"
import { Immutable } from "immer"

type Record = Immutable<{
  type: "Record"
  milestone: Version
  onSuccess?: (saved: Wiki, updated: VelocityData) => void
}>

type Init = Immutable<{ type: "Init" }>

const mainAtom = JotaiUtil.asyncAtomWithAction(
  async (get) => {
    const api = get(ApiState.atom)
    const project = await get(ProjectState.atom)
    const [, data] = await loadVelocity(api, project.id)
    return data
  },
  () => async (curr, get, set, action: Record | Init) => {
    if (action.type === "Init") {
      return curr
    } else if (action.type === "Record") {
      const milestone = action.milestone
      const startDate = DateUtil.parseDate(milestone.startDate)
      const endDate = DateUtil.parseDate(milestone.releaseDueDate)
      if (startDate && endDate) {
        const api = get(ApiState.atom)
        const project = await get(ProjectState.atom)
        const [wiki, data] = await loadVelocity(api, project.id)
        const issues = await api.issue.searchClosed(project.id, startDate, DateUtil.addDays(endDate, 1))
        const [saved, updated] = await saveVelocity(api, project.id, wiki, data, issues, milestone)
        action.onSuccess && action.onSuccess(saved, updated)
        return updated
      }
    }
    return curr
  }
).onMount((setAtom) => setAtom({ type: "Init" }))

const loadVelocity = async (api: BacklogApi, projectId: number): Promise<[Wiki | null, VelocityData]> => {
  const pages = await api.wiki.search(projectId, "(backlog-sprinter-velocity-record)")
  return pages.length > 0 ? [pages[0], VelocityUtil.parseAll(pages[0].content)] : [null, []]
}

const saveVelocity = async (
  api: BacklogApi,
  projectId: number,
  wiki: Wiki | null,
  existing: VelocityData,
  issues: ReadonlyArray<Issue>,
  milestone: Version
): Promise<[Wiki, VelocityData]> => {
  const toSave = VelocityUtil.appendRecord(milestone, issues, 0, existing)
  const content = `${VelocityUtil.toStringAll(toSave)}

!!DO NOT EDIT (backlog-sprinter-velocity-record) DO NOT EDIT!!
`
  if (wiki) {
    return [await api.wiki.edit(wiki, wiki.name, content), toSave]
  } else {
    return [await api.wiki.add(projectId, "backlog-sprinter-velocity", content), toSave]
  }
}

export const VelocityState = {
  atom: mainAtom,
  Action: {
    Record: (milestone: Version, onSuccess?: (saved: Wiki, updated: VelocityData) => void): Record => ({
      type: "Record",
      milestone,
      onSuccess
    })
  }
}
