import { Immutable } from "immer"
import { WritableDraft } from "immer/dist/types/types-external"
import { atom } from "jotai"
import { withImmer } from "jotai-immer"

import { IssueType, IssueTypeColor } from "../../../backlog/ProjectInfo"
import { JotaiUtil } from "../../../util/JotaiUtil"
import { Api } from "./Api"
import { AppConfig } from "./AppConfig"
import { Environment } from "./Environment"

const projectInfoAtom = atom(async (get) => {
  const env = get(Environment.atom)
  const api = get(Api.atom)
  return await api.projectInfo.getProjectInfoWithCustomFields(env.projectKey)
})
const projectAtom = JotaiUtil.atomFromParent(projectInfoAtom, (pi) => pi.project)
const statusesAtom = JotaiUtil.atomFromParent(projectInfoAtom, (pi) => pi.statuses)
const milestonesAtom = withImmer(JotaiUtil.atomFromParent(projectInfoAtom, (pi) => pi.milestones))
const customFieldsAtom = withImmer(JotaiUtil.atomFromParent(projectInfoAtom, (pi) => pi.customFields))

type IssueTypeCreate = Immutable<{
  type: "Create"
  name: string
  color: IssueTypeColor
}>

export type IssueTypesAction = IssueTypeCreate

const issueTypesStoreAtom = withImmer(JotaiUtil.atomFromParent(projectInfoAtom, (pi) => pi.issueTypes))

const issueTypesAtom = atom(
  (get) => get(issueTypesStoreAtom),
  async (get, set, action: IssueTypesAction) => {
    if (action.type === "Create") {
      const api = get(Api.atom)
      const project = get(projectAtom)
      const created = await api.projectInfo.createIssueType({
        projectId: project.id,
        name: action.name,
        color: action.color
      })
      set(AppConfig.atom, (c) => {
        c.pbiIssueTypeId = created.id
      })
      set(issueTypesStoreAtom, (draft) => {
        draft.splice(0, 0, created as WritableDraft<IssueType>)
      })
    }
  }
)

export const ProjectAtom = {
  atom: projectAtom
}

export const Statuses = {
  atom: statusesAtom
}

export const Milestones = {
  atom: milestonesAtom
}

export const CustomFields = {
  atom: customFieldsAtom
}

export const IssueTypes = {
  atom: issueTypesAtom,
  Action: {
    Create: (name: string, color: IssueTypeColor): IssueTypeCreate => ({
      type: "Create",
      name,
      color
    })
  }
}
