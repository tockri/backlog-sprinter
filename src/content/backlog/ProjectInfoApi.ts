import { DateUtil } from "@/util/DateUtil"
import { Immutable } from "immer"
import { BacklogApiRequest, ParamsType } from "./BacklogApiRequest"

export type Status = Immutable<{
  id: number
  projectId: number
  name: string
  color: string
  displayOrder: number
}>

export type Version = Immutable<{
  id: number
  projectId: number
  name: string
  description: string | null
  releaseDueDate: string | null
  archived: boolean
  displayOrder: number
  startDate: string | null
}>

export type Project = Immutable<{
  id: number
  projectKey: string
  name: string
  textFormattingRule: "markdown" | "backlog"
  chartEnabled: boolean
  useDevAttributes: boolean
}>

const getProject = (projectKey: string): Promise<Project> =>
  BacklogApiRequest.get<Project>(`/api/v2/projects/${projectKey}`)

const getMilestones = (projectKey: string): Promise<ReadonlyArray<Version>> =>
  BacklogApiRequest.get<Version[]>(`/api/v2/projects/${projectKey}/versions`)

const getStatuses = (projectKey: string): Promise<ReadonlyArray<Status>> =>
  BacklogApiRequest.get<Status[]>(`/api/v2/projects/${projectKey}/statuses`)

const getCustomFields = (projectKey: string): Promise<ReadonlyArray<CustomField>> =>
  BacklogApiRequest.get<ReadonlyArray<CustomField>>(`/api/v2/projects/${projectKey}/customFields`)

const getIssueTypes = (projectKey: string): Promise<ReadonlyArray<IssueType>> =>
  BacklogApiRequest.get<IssueType[]>(`/api/v2/projects/${projectKey}/issueTypes`)

// noinspection JSUnusedGlobalSymbols
export enum IssueTypeColor {
  pill__issue_type_1 = "#e30000",
  pill__issue_type_2 = "#990000",
  pill__issue_type_3 = "#934981",
  pill__issue_type_4 = "#814fbc",
  pill__issue_type_5 = "#2779ca",
  pill__issue_type_6 = "#007e9a",
  pill__issue_type_7 = "#7ea800",
  pill__issue_type_8 = "#ff9200",
  pill__issue_type_9 = "#ff3265",
  pill__issue_type_10 = "#666665"
}

const classNameMap: Map<IssueTypeColor, string> = new Map()
Object.entries(IssueTypeColor).forEach(([cls, hex]) => {
  classNameMap.set(hex, cls.replace(/_/g, "-"))
})

export const issueTypeColorClass = (color: IssueTypeColor): string => classNameMap.get(color) || ""

export type IssueType = Immutable<{
  id: number
  projectId: number
  name: string
  color: IssueTypeColor
  displayOrder: number
  templateSummary: string | null
  templateDescription: string | null
}>

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

// noinspection JSUnusedGlobalSymbols
export const isTextField = (cf: CustomField): cf is CustomTextField =>
  cf.typeId in [CustomFieldTypes.Text, CustomFieldTypes.LongText]

export const isNumberField = (cf: CustomField): cf is CustomNumberField => cf.typeId === CustomFieldTypes.Number

// noinspection JSUnusedGlobalSymbols
export const isDateField = (cf: CustomField): cf is CustomDateField => cf.typeId === CustomFieldTypes.Date

// noinspection JSUnusedGlobalSymbols
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

export type AddCustomFieldInput = Immutable<{
  typeId: CustomFieldTypes
  name: string
  applicableIssueTypes: number[]
  description: string
  required: boolean
  initialValue?: number
}>

const addCustomField = async (projectKey: string, input: AddCustomFieldInput): Promise<CustomField> => {
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

export type AddMilestoneInput = Immutable<{
  name: string
  startDate: Date | null
  releaseDueDate: Date | null
  description: string
}>

const addMilestone = async (projectId: number, input: AddMilestoneInput): Promise<Version> => {
  return await BacklogApiRequest.post<Version>(`/api/v2/projects/${projectId}/versions`, {
    name: input.name,
    startDate: DateUtil.dateString(input.startDate),
    releaseDueDate: DateUtil.dateString(input.releaseDueDate),
    description: input.description
  })
}

export type EditMilestoneInput = Immutable<{
  name?: string
  startDate?: Date | null
  releaseDueDate?: Date | null
  description?: string
}>

const editMilestone = async (projectId: number, milestoneId: number, input: EditMilestoneInput): Promise<Version> => {
  const { name, startDate, releaseDueDate, description } = input
  const params: Record<string, string> = {}
  if (name !== undefined) {
    params["name"] = name
  }
  if (startDate !== undefined) {
    params["startDate"] = DateUtil.dateString(startDate)
  }
  if (releaseDueDate !== undefined) {
    params["releaseDueDate"] = DateUtil.dateString(releaseDueDate)
  }
  if (description !== undefined) {
    params["description"] = description
  }
  return await BacklogApiRequest.patch<Version>(`/api/v2/projects/${projectId}/versions/${milestoneId}`, params)
}

const archiveMilestone = async (projectId: number, milestone: Version): Promise<Version> => {
  return await BacklogApiRequest.patch<Version>(`/api/v2/projects/${projectId}/versions/${milestone.id}`, {
    name: milestone.name,
    archived: "true"
  })
}

export type IssueTypeInput = Immutable<{
  projectId: number
  name: string
  color: IssueTypeColor
}>

const addIssueType = async (input: IssueTypeInput): Promise<IssueType> => {
  return await BacklogApiRequest.post<IssueType>(`/api/v2/projects/${input.projectId}/issueTypes`, {
    name: input.name,
    color: input.color
  })
}

export const RealProjectInfoApi = {
  getProject,
  getMilestones,
  getStatuses,
  getIssueTypes,
  getCustomFields,
  addCustomField,
  deleteCustomField,
  addMilestone,
  editMilestone,
  archiveMilestone,
  addIssueType
} as const

export type ProjectInfoApi = typeof RealProjectInfoApi
