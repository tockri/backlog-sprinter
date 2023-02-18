import { BacklogApi } from "@/content/backlog/BacklogApiForReact"
import { Issue } from "@/content/backlog/IssueApi"
import { Version } from "@/content/backlog/ProjectInfoApi"
import { Wiki } from "@/content/backlog/WikiApi"
import { ProjectState } from "@/content/board/state/ProjectInfoState"
import { ApiState } from "@/content/state/ApiState"
import { VelocityRecords, VelocityUtil } from "@/content/state/SprintVelocity"
import { JotaiUtil } from "@/content/util/JotaiUtil"
import { DateUtil } from "@/util/DateUtil"
import { Immutable } from "immer"

export type WikiVelocity = {
  wiki: Wiki | null
  velocity: VelocityRecords
}

type Record = Immutable<{
  type: "Record"
  milestone: Version
  onSuccess?: (updated: WikiVelocity) => void
}>

type Init = Immutable<{ type: "Init" }>

const mainAtom = JotaiUtil.asyncAtomWithAction(
  async (get) => {
    const api = get(ApiState.atom)
    const project = await get(ProjectState.atom)
    return await loadVelocity(api, project.id)
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
        const issues = await api.issue.searchClosed(project.id, startDate, DateUtil.addDays(endDate, 1))
        const updated = await saveVelocity(api, project.id, curr, issues, milestone)
        action.onSuccess && action.onSuccess(updated)
        return updated
      }
    }
    return curr
  }
)

mainAtom.onMount = (setAtom) => {
  setAtom({ type: "Init" }).then()
}

const loadVelocity = async (api: BacklogApi, projectId: number): Promise<WikiVelocity> => {
  const pages = await api.wiki.search(projectId, "(backlog-sprinter-velocity-record)")
  return pages.length > 0
    ? { wiki: pages[0], velocity: VelocityUtil.parseAll(pages[0].content) }
    : { wiki: null, velocity: [] }
}

const saveVelocity = async (
  api: BacklogApi,
  projectId: number,
  existing: WikiVelocity,
  issues: ReadonlyArray<Issue>,
  milestone: Version
): Promise<WikiVelocity> => {
  const { wiki: existingWiki, velocity: existingRecords } = existing
  const velocity = VelocityUtil.appendRecord(milestone, issues, 0, existingRecords)
  const content = `# Velocity
|ID|Date|PBI|Others|Issue Ids|
|--|--|--|--|--|
${VelocityUtil.toStringAll(velocity)}

!!DO NOT EDIT (backlog-sprinter-velocity-record) DO NOT EDIT!!
`
  const wiki = existingWiki
    ? await api.wiki.edit(existingWiki, existingWiki.name, content)
    : await api.wiki.add(projectId, "backlog-sprinter-velocity", content)
  return { wiki, velocity }
}

export const VelocityState = {
  atom: mainAtom,
  Action: {
    Record: (milestone: Version, onSuccess?: (updated: WikiVelocity) => void): Record => ({
      type: "Record",
      milestone,
      onSuccess
    })
  }
}
