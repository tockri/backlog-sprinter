import { Immutable, produce } from "immer"
import { WritableDraft } from "immer/dist/types/types-external"
import { atom } from "jotai"

import { IssueType, IssueTypeColor } from "../../../backlog/ProjectInfoApi"
import { JotaiUtil } from "../../../util/JotaiUtil"

import { ApiState } from "@/content/state/ApiState"
import { AppConfState } from "./AppConfState"
import { EnvState } from "./EnvState"

const projectInfoAtom = atom(async (get) => {
  const env = get(EnvState.atom)
  const api = get(ApiState.atom)
  return await api.projectInfo.getProjectInfoWithCustomFields(env.projectKey)
})
const projectAtom = JotaiUtil.asyncAtomFromParent(projectInfoAtom, (pi) => pi.project)
const statusesAtom = JotaiUtil.asyncAtomFromParent(projectInfoAtom, (pi) => pi.statuses)
const milestonesAtom = JotaiUtil.asyncAtomFromParent(projectInfoAtom, (pi) => pi.milestones)
const customFieldsAtom = JotaiUtil.asyncAtomFromParent(projectInfoAtom, (pi) => pi.customFields)

type IssueTypeCreate = Immutable<{
  type: "Create"
  name: string
  color: IssueTypeColor
}>

export type IssueTypesAction = IssueTypeCreate

const issueTypesStoreAtom = JotaiUtil.asyncAtomFromParent(projectInfoAtom, (pi) => pi.issueTypes)

const issueTypesAtom = atom(
  (get) => get(issueTypesStoreAtom),
  async (get, set, action: IssueTypesAction) => {
    if (action.type === "Create") {
      const api = get(ApiState.atom)
      const project = await get(projectAtom)
      const created = await api.projectInfo.createIssueType({
        projectId: project.id,
        name: action.name,
        color: action.color
      })
      set(AppConfState.atom, (conf) =>
        produce(conf, (c) => {
          c.pbiIssueTypeId = created.id
        })
      )
      await set(issueTypesStoreAtom, (curr) =>
        produce(curr, (draft) => {
          draft.splice(0, 0, created as WritableDraft<IssueType>)
        })
      )
    }
  }
)

export const ProjectState = {
  atom: projectAtom
}

export const StatusesState = {
  atom: statusesAtom
}

export const MilestonesState = {
  atom: milestonesAtom
}

export const CustomFieldsState = {
  atom: customFieldsAtom
}

export const IssueTypesState = {
  atom: issueTypesAtom,
  Action: {
    Create: (name: string, color: IssueTypeColor): IssueTypeCreate => ({
      type: "Create",
      name,
      color
    })
  }
}
