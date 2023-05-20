import { BacklogApi } from "@/content/backlog/BacklogApi"
import { Version } from "@/content/backlog/ProjectInfoApi"
import { Wiki } from "@/content/backlog/WikiApi"
import { ApiState } from "@/content/state/ApiState"
import { BspConfState } from "@/content/state/BspConfState"
import { ProjectState } from "@/content/state/ProjectInfoState"
import { VelocityFunc, VelocityRecords } from "@/content/state/SprintVelocity"
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
    return loadVelocity(api, project.id)
  },
  () => async (curr, get, set, action: Record | Init) => {
    if (action.type === "Init") {
      return curr
    } else if (action.type === "Record") {
      const api = get(ApiState.atom)
      const project = await get(ProjectState.atom)
      const conf = get(BspConfState.atom)
      return recordVelocity(api, project.id, conf.pbiIssueTypeId, curr, action)
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
    ? { wiki: pages[0], velocity: VelocityFunc.parseAll(pages[0].content) }
    : { wiki: null, velocity: [] }
}

const recordVelocity = async (
  api: BacklogApi,
  projectId: number,
  pbiIssueTypeId: number,
  existing: WikiVelocity,
  action: Record
): Promise<WikiVelocity> => {
  console.log("recordVelocity")
  const { milestone, onSuccess } = action
  const startDate = DateUtil.parseDate(milestone.startDate)
  const endDate = DateUtil.parseDate(milestone.releaseDueDate)
  if (startDate && endDate) {
    const issues = await api.issue.searchClosed(projectId, startDate, DateUtil.addDays(endDate, 1))
    const { wiki: existingWiki, velocity: existingRecords } = existing
    const velocity = VelocityFunc.appendRecord(milestone, issues, pbiIssueTypeId, existingRecords)
    const content = `# Velocity

(You can change title as you like)
  
|ID|Date|PBI|Others|PBI Issues|Other Issues|
|--|--|--|--|--|--|
${VelocityFunc.toStringAll(velocity)}

!!DO NOT EDIT (backlog-sprinter-velocity-record) DO NOT EDIT!!
`
    const wiki = existingWiki
      ? await api.wiki.edit(existingWiki, existingWiki.name, content)
      : await api.wiki.add(projectId, "backlog-sprinter-velocity", content)
    const updated = { wiki, velocity }
    onSuccess && onSuccess(updated)
    return updated
  } else {
    return existing
  }
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
