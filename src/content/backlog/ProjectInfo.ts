import { Immutable } from "immer"
import { DateUtil } from "../../util/DateUtil"
import { BacklogApiRequest, ParamsType } from "./BacklogApiRequest"

export type Status = {
  readonly id: number
  readonly name: string
  readonly color: string
}

export type Version = {
  readonly id: number
  readonly name: string
  readonly description: string | null
  readonly startDate: string | null
  readonly releaseDueDate: string | null
  readonly archived: boolean
  readonly displayOrder: number
}

export type Project = {
  readonly id: number
  readonly projectKey: string
  readonly name: string
  readonly textFormattingRule: "markdown" | "backlog"
  readonly chartEnabled: boolean
  readonly useDevAttributes: boolean
}

export type ProjectInfoWithMilestones = {
  readonly project: Project
  readonly versions: ReadonlyArray<Version>
  readonly statuses: ReadonlyArray<Status>
}

const getProjectInfoWithMilestones = async (projectKey: string): Promise<ProjectInfoWithMilestones> => {
  const project = await BacklogApiRequest.get<Project>(`/api/v2/projects/${projectKey}`)
  const versionsP = BacklogApiRequest.get<Version[]>(`/api/v2/projects/${projectKey}/versions`)
  const statusesP = BacklogApiRequest.get<Status[]>(`/api/v2/projects/${projectKey}/statuses`)
  const [versions, statuses] = await Promise.all([versionsP, statusesP])
  return {
    project,
    versions,
    statuses
  }
}

export type IssueType = {
  id: number
  projectId: number
  name: string
  color: string
  displayOrder: number
  templateSummary: string
  templateDescription: string
}

export enum CustomFieldTypes {
  Text = 1,
  LongText = 2,
  Number = 3,
  Date = 4,
  SingleSelect = 5,
  MultiSelect = 6,
  Checkbox = 7,
  Radio = 8
}

export type CustomFieldBase = Immutable<{
  id: number
  typeId: CustomFieldTypes
  name: string
  description: string
  required: boolean
  applicableIssueTypes: number[]
}>

export type CustomTextField = CustomFieldBase

export type CustomNumberField = CustomFieldBase &
  Immutable<{
    min: number
    max: number
    initialValue: number | null
    unit: string
  }>

export type CustomDateField = CustomFieldBase &
  Immutable<{
    min: string
    max: string
    initialValueType: 1 | 2 | 3
    initialDate: string
    initialShift: number
  }>

export type CustomListField = CustomFieldBase &
  Immutable<{
    items: string[]
    allowInput: boolean
    allowAddItem: boolean
  }>

export type CustomField = CustomTextField | CustomNumberField | CustomDateField | CustomListField

export const isTextField = (cf: CustomField): cf is CustomTextField =>
  cf.typeId in [CustomFieldTypes.Text, CustomFieldTypes.LongText]

export const isNumberField = (cf: CustomField): cf is CustomNumberField => cf.typeId === CustomFieldTypes.Number

export const isDateField = (cf: CustomField): cf is CustomDateField => cf.typeId === CustomFieldTypes.Date

export const isListField = (cf: CustomField): cf is CustomListField =>
  cf.typeId in
  [CustomFieldTypes.SingleSelect, CustomFieldTypes.MultiSelect, CustomFieldTypes.Radio, CustomFieldTypes.Checkbox]

export type ProjectInfoWithCustomFields = Immutable<{
  project: Project
  issueTypes: IssueType[]
  customFields: CustomField[]
  milestones: Version[]
  statuses: Status[]
}>

const getProjectInfoWithCustomFields = async (projectKey: string): Promise<ProjectInfoWithCustomFields> => {
  const project = await BacklogApiRequest.get<Project>(`/api/v2/projects/${projectKey}`)
  const customFieldsP = BacklogApiRequest.get<ReadonlyArray<CustomField>>(`/api/v2/projects/${projectKey}/customFields`)
  const statusesP = BacklogApiRequest.get<Status[]>(`/api/v2/projects/${projectKey}/statuses`)
  const milestonesP = BacklogApiRequest.get<Version[]>(`/api/v2/projects/${projectKey}/versions`)
  const issueTypesP = BacklogApiRequest.get<IssueType[]>(`/api/v2/projects/${projectKey}/issueTypes`)
  const [customFields, statuses, milestones, issueTypes] = await Promise.all([
    customFieldsP,
    statusesP,
    milestonesP,
    issueTypesP
  ])
  return {
    project,
    issueTypes,
    customFields,
    milestones,
    statuses
  }
}

export type CustomFieldInput = Immutable<{
  typeId: CustomFieldTypes
  name: string
  applicableIssueTypes: number[]
  description: string
  required: boolean
  initialValue?: number
}>

const createCustomField = async (projectKey: string, input: CustomFieldInput): Promise<CustomField> => {
  const postData: ParamsType = [
    {
      typeId: `${input.typeId}`,
      name: input.name,
      description: input.description,
      required: input.required ? "true" : "false"
    } as Record<string, string>
  ]
    .concat(input.applicableIssueTypes.map((i) => ({ "applicableIssueTypes[]": `${i}` })))
    .concat(
      input.initialValue !== undefined ? [{ initialValue: `${input.initialValue}` } as Record<string, string>] : []
    )
  return await BacklogApiRequest.post<CustomField>(`/api/v2/projects/${projectKey}/customFields`, postData)
}

const deleteCustomField = async (projectKey: string, customFieldId: number): Promise<CustomField> => {
  return await BacklogApiRequest.delete<CustomField>(`/api/v2/projects/${projectKey}/customFields/${customFieldId}`)
}

export type MilestoneInput = Immutable<{
  projectId: number
  name: string
  startDate: Date | null
  endDate: Date | null
  description: string
}>

const createMilestone = async (input: MilestoneInput): Promise<number> => {
  const created = await BacklogApiRequest.post<Version>(`/api/v2/projects/${input.projectId}/versions`, {
    name: input.name,
    startDate: DateUtil.dateString(input.startDate),
    releaseDueDate: DateUtil.dateString(input.endDate),
    description: input.description
  })
  return created.id
}

const archiveMilestone = async (projectId: number, milestone: Version) => {
  await BacklogApiRequest.patch<Version>(`/api/v2/projects/${projectId}/versions/${milestone.id}`, {
    name: milestone.name,
    archived: "true"
  })
}

const ProjectInfo = {
  getProjectInfoWithMilestones,
  getProjectInfoWithCustomFields,
  createCustomField,
  deleteCustomField,
  createMilestone,
  archiveMilestone
}

export type ProjectInfoApi = typeof ProjectInfo

export const RealProjectInfo = ProjectInfo
