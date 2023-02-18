import { Immutable, produce } from "immer"
import { WritableDraft } from "immer/dist/types/types-external"
import { atom } from "jotai"

import {
  AddCustomFieldInput,
  AddMilestoneInput,
  EditMilestoneInput,
  IssueType,
  IssueTypeColor,
  Version
} from "../backlog/ProjectInfoApi"
import { JotaiUtil } from "../util/JotaiUtil"

import { ApiState } from "@/content/state/ApiState"
import { BspConfState } from "@/content/state/BspConfState"
import { EnvState } from "./EnvState"

const projectAtom = atom(async (get) => {
  const env = get(EnvState.atom)
  const api = get(ApiState.atom)
  return await api.projectInfo.getProject(env.projectKey)
})

const statusesAtom = atom(async (get) => {
  const env = get(EnvState.atom)
  const api = get(ApiState.atom)
  return await api.projectInfo.getStatuses(env.projectKey)
})

type AddMilestone = Immutable<{
  type: "AddMilestone"
  input: AddMilestoneInput
  onSuccess: (created: Version) => void
}>

type ArchiveMilestone = Immutable<{
  type: "ArchiveMilestone"
  id: number
}>

type EditMilestone = Immutable<{
  type: "EditMilestone"
  id: number
  input: EditMilestoneInput
  onSuccess: (updated: Version) => void
}>

type MilestoneAction = AddMilestone | ArchiveMilestone | EditMilestone

const milestonesAtom = JotaiUtil.asyncAtomWithAction(
  async (get) => {
    const env = get(EnvState.atom)
    const api = get(ApiState.atom)
    return await api.projectInfo.getMilestones(env.projectKey)
  },
  () => async (curr, get, set, action: MilestoneAction) => {
    if (action.type === "AddMilestone") {
      const api = get(ApiState.atom)
      const project = await get(ProjectState.atom)
      const created = await api.projectInfo.addMilestone(project.id, action.input)
      action.onSuccess(created)
      return produce(curr, (d) => {
        d.push(created as WritableDraft<Version>)
      })
    } else if (action.type === "EditMilestone") {
      const api = get(ApiState.atom)
      const project = await get(ProjectState.atom)
      const updated = await api.projectInfo.editMilestone(project.id, action.id, action.input)
      action.onSuccess(updated)
      return produce(curr, (d) => {
        const idx = d.findIndex((ms) => ms.id === updated.id)
        if (idx >= 0) {
          d.splice(idx, 1, updated as WritableDraft<Version>)
        }
      })
    } else if (action.type === "ArchiveMilestone") {
      console.error("Not impl")
    }
    return curr
  }
)

type AddCustomField = Immutable<{
  type: "AddCustomField"
  input: AddCustomFieldInput
}>

type DeleteCustomField = Immutable<{
  type: "DeleteCustomField"
  id: number
}>

type CustomFieldAction = AddCustomField | DeleteCustomField

const customFieldsAtom = JotaiUtil.asyncAtomWithAction(
  async (get) => {
    const env = get(EnvState.atom)
    const api = get(ApiState.atom)
    return await api.projectInfo.getCustomFields(env.projectKey)
  },
  () => async (curr, get, set, action: CustomFieldAction) => {
    if (action.type === "AddCustomField") {
      const api = get(ApiState.atom)
      const env = get(EnvState.atom)
      const created = await api.projectInfo.addCustomField(env.projectKey, action.input)
      return [...curr, created]
    } else if (action.type === "DeleteCustomField") {
      const api = get(ApiState.atom)
      const env = get(EnvState.atom)
      const deleted = await api.projectInfo.deleteCustomField(env.projectKey, action.id)
      return produce(curr, (draft) => {
        const idx = draft.findIndex((cf) => cf.id === deleted.id)
        if (idx >= 0) {
          draft.splice(idx, 1)
        }
      })
    }
    return curr
  }
)

//JotaiUtil.asyncAtomFromParent(projectInfoAtom, (pi) => pi.customFields)

type IssueTypeCreate = Immutable<{
  type: "Create"
  name: string
  color: IssueTypeColor
}>

export type IssueTypesAction = IssueTypeCreate

const issueTypesAtom = JotaiUtil.asyncAtomWithAction(
  async (get) => {
    const env = get(EnvState.atom)
    const api = get(ApiState.atom)
    return await api.projectInfo.getIssueTypes(env.projectKey)
  },
  () => async (curr, get, set, action: IssueTypesAction) => {
    if (action.type === "Create") {
      const api = get(ApiState.atom)
      const project = await get(projectAtom)
      const created = await api.projectInfo.addIssueType({
        projectId: project.id,
        name: action.name,
        color: action.color
      })
      set(BspConfState.atom, (conf) =>
        produce(conf, (c) => {
          c.pbiIssueTypeId = created.id
        })
      )

      return produce(curr, (draft) => {
        draft.splice(0, 0, created as WritableDraft<IssueType>)
      })
    }
    return curr
  }
)

export const ProjectState = {
  atom: projectAtom
} as const

export const StatusesState = {
  atom: statusesAtom
} as const

export const MilestonesState = {
  atom: milestonesAtom,
  Action: {
    Add: (input: AddMilestoneInput, onSuccess: (created: Version) => void): AddMilestone => ({
      type: "AddMilestone",
      input,
      onSuccess
    }),
    Edit: (id: number, input: EditMilestoneInput, onSuccess: (updated: Version) => void): EditMilestone => ({
      type: "EditMilestone",
      id,
      input,
      onSuccess
    })
  }
} as const

export const CustomFieldsState = {
  atom: customFieldsAtom,
  Action: {
    Add: (input: AddCustomFieldInput): AddCustomField => ({
      type: "AddCustomField",
      input
    }),
    Delete: (id: number): DeleteCustomField => ({
      type: "DeleteCustomField",
      id
    })
  }
} as const

export const IssueTypesState = {
  atom: issueTypesAtom,
  Action: {
    Create: (name: string, color: IssueTypeColor): IssueTypeCreate => ({
      type: "Create",
      name,
      color
    })
  }
} as const
