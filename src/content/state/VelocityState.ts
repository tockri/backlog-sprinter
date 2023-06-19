import { Immutable } from "immer"
import { DateUtil } from "../../util/DateUtil"
import { BacklogApi } from "../backlog/BacklogApi"
import { Version } from "../backlog/ProjectInfoApi"
import { Wiki } from "../backlog/WikiApi"
import { JotaiUtil } from "../util/JotaiUtil"
import { ApiState } from "./ApiState"
import { BspConfState } from "./BspConfState"
import { ProjectState } from "./ProjectInfoState"
import { VelocityFunc, VelocityRecords } from "./SprintVelocity"

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

type Action = Record | Init

const mainAtom = JotaiUtil.asyncAtomWithAction<WikiVelocity, Action>(
  async (get) => {
    const api = get(ApiState.atom)
    const project = await get(ProjectState.atom)
    const conf = get(BspConfState.atom)
    return loadVelocity(api, project.id, conf.pbiIssueTypeId)
  },
  async (curr, get, set, action) => {
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

const loadVelocity = async (api: BacklogApi, projectId: number, pbiIssueTypeId: number): Promise<WikiVelocity> => {
  const find = async (): Promise<Wiki | undefined> => {
    const keyword = "(backlog-sprinter-velocity-record)"
    const strictKeyword = `${keyword}(${pbiIssueTypeId})`
    const pages = await api.wiki.search(projectId, keyword)
    if (pages.length === 1) {
      return pages[0]
    } else {
      return pages.find((wiki) => wiki.content.includes(strictKeyword))
    }
  }

  const wiki = await find()
  if (wiki) {
    return { wiki, velocity: VelocityFunc.parseAll(wiki.content) }
  } else {
    return { wiki: null, velocity: [] }
  }
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

!!DO NOT EDIT (backlog-sprinter-velocity-record)(${pbiIssueTypeId}) DO NOT EDIT!!
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
