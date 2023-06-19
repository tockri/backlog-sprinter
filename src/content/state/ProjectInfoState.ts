import { Draft, Immutable, produce } from "immer"
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
import { ApiState } from "./ApiState"
import { BspConfState } from "./BspConfState"
import { BspEnvState } from "./BspEnvState"

const projectAtom = atom(async (get) => {
  const env = get(BspEnvState.atom)
  const api = get(ApiState.atom)
  if (env.projectKey) {
    return await api.projectInfo.getProject(env.projectKey)
  } else {
    console.error("projectKey is empty")
    throw new Error()
  }
})

const statusesAtom = atom(async (get) => {
  const env = get(BspEnvState.atom)
  const api = get(ApiState.atom)
  return env.projectKey ? await api.projectInfo.getStatuses(env.projectKey) : []
})

type AddMilestone = Immutable<{
  type: "AddMilestone"
  input: AddMilestoneInput
  onSuccess: (created: Version) => void
}>

type ArchiveMilestone = Immutable<{
  type: "ArchiveMilestone"
  milestone: Version
  onSuccess: (archived: Version) => void
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
    const env = get(BspEnvState.atom)
    const api = get(ApiState.atom)
    return env.projectKey ? await api.projectInfo.getMilestones(env.projectKey) : []
  },
  async (curr, get, set, action: MilestoneAction) => {
    if (action.type === "AddMilestone") {
      const api = get(ApiState.atom)
      const project = await get(ProjectState.atom)
      const created = await api.projectInfo.addMilestone(project.id, action.input)
      action.onSuccess(created)
      return produce(curr, (d) => {
        d.push(created as Draft<Version>)
      })
    } else if (action.type === "EditMilestone") {
      const api = get(ApiState.atom)
      const project = await get(ProjectState.atom)
      const updated = await api.projectInfo.editMilestone(project.id, action.id, action.input)
      action.onSuccess(updated)
      return produce(curr, (d) => {
        const idx = d.findIndex((ms) => ms.id === updated.id)
        if (idx >= 0) {
          d.splice(idx, 1, updated as Draft<Version>)
        }
      })
    } else if (action.type === "ArchiveMilestone") {
      const api = get(ApiState.atom)
      const archived = await api.projectInfo.archiveMilestone(action.milestone.projectId, action.milestone)
      action.onSuccess(archived)
      return produce(curr, (d) => {
        const idx = d.findIndex((ms) => ms.id === archived.id)
        if (idx >= 0) {
          d.splice(idx, 1, archived as Draft<Version>)
        }
      })
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
    const env = get(BspEnvState.atom)
    const api = get(ApiState.atom)
    return env.projectKey ? await api.projectInfo.getCustomFields(env.projectKey) : []
  },
  async (curr, get, set, action: CustomFieldAction) => {
    if (action.type === "AddCustomField") {
      const api = get(ApiState.atom)
      const env = get(BspEnvState.atom)
      const created = await api.projectInfo.addCustomField(env.projectKey, action.input)
      return [...curr, created]
    } else if (action.type === "DeleteCustomField") {
      const api = get(ApiState.atom)
      const env = get(BspEnvState.atom)
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
    const env = get(BspEnvState.atom)
    const api = get(ApiState.atom)
    return env.projectKey ? await api.projectInfo.getIssueTypes(env.projectKey) : []
  },
  async (curr, get, set, action: IssueTypesAction) => {
    if (action.type === "Create") {
      const api = get(ApiState.atom)
      const project = await get(projectAtom)
      const created = await api.projectInfo.addIssueType({
        projectId: project.id,
        name: action.name,
        color: action.color
      })
      set(BspConfState.atom, { pbiIssueTypeId: created.id })

      return produce(curr, (draft) => {
        draft.splice(0, 0, created as Draft<IssueType>)
      })
    }
    return curr
  }
)

const pbiIssueTypeAtom = atom(async (get) => {
  const env = get(BspEnvState.atom)
  if (env.projectKey) {
    const conf = get(BspConfState.atom)
    const issueTypeId = conf.pbiIssueTypeId
    if (issueTypeId) {
      const issueTypes = await get(issueTypesAtom)
      return issueTypes.find((it) => it.id === issueTypeId) || null
    }
  }
  return null
})

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
    }),
    Archive: (milestone: Version, onSuccess: (archived: Version) => void): ArchiveMilestone => ({
      type: "ArchiveMilestone",
      milestone,
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
  pbiIssueTypeAtom,
  Action: {
    Create: (name: string, color: IssueTypeColor): IssueTypeCreate => ({
      type: "Create",
      name,
      color
    })
  }
} as const
