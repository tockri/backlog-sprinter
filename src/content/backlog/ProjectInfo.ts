import { DateUtil } from "../../util/DateUtil"
import { BacklogApi, ParamsType } from "./BacklogApi"

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
  readonly name: string
}

export type ProjectInfoWithMilestones = {
  readonly project: Project
  readonly versions: ReadonlyArray<Version>
  readonly statuses: ReadonlyArray<Status>
}

const getMilestones = async (projectKey: string): Promise<ProjectInfoWithMilestones> => {
  const project = await BacklogApi.get<Project>(`/api/v2/projects/${projectKey}`)
  const versionsP = BacklogApi.get<Version[]>(`/api/v2/projects/${projectKey}/versions`)
  const statusesP = BacklogApi.get<Status[]>(`/api/v2/projects/${projectKey}/statuses`)
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

type CustomFieldBase = {
  readonly id: number
  readonly typeId: CustomFieldTypes
  readonly name: string
  readonly description: string
  readonly required: boolean
  readonly applicableIssueTypes: ReadonlyArray<number>
}

export type CustomTextField = CustomFieldBase

export type CustomNumberField = {
  readonly min: number
  readonly max: number
  readonly initialValue: number | null
  readonly unit: string
} & CustomFieldBase

export type CustomDateField = {
  readonly min: string
  readonly max: string
  readonly initialValueType: 1 | 2 | 3
  readonly initialDate: string
  readonly initialShift: number
} & CustomFieldBase

export type CustomListField = {
  readonly items: ReadonlyArray<string>
  readonly allowInput: boolean
  readonly allowAddItem: boolean
} & CustomFieldBase

export type CustomField = CustomTextField | CustomNumberField | CustomDateField | CustomListField

export const isTextField = (cf: CustomField): cf is CustomTextField =>
  cf.typeId in [CustomFieldTypes.Text, CustomFieldTypes.LongText]

export const isNumberField = (cf: CustomField): cf is CustomNumberField => cf.typeId === CustomFieldTypes.Number

export const isDateField = (cf: CustomField): cf is CustomDateField => cf.typeId === CustomFieldTypes.Date

export const isListField = (cf: CustomField): cf is CustomListField =>
  cf.typeId in
  [CustomFieldTypes.SingleSelect, CustomFieldTypes.MultiSelect, CustomFieldTypes.Radio, CustomFieldTypes.Checkbox]

export type ProjectInfoWithCustomFields = {
  readonly project: Project
  readonly issueTypes: ReadonlyArray<IssueType>
  readonly customFields: ReadonlyArray<CustomField>
  readonly statuses: ReadonlyArray<Status>
}

const getCustomFields = async (projectKey: string): Promise<ProjectInfoWithCustomFields> => {
  const project = await BacklogApi.get<Project>(`/api/v2/projects/${projectKey}`)
  const customFieldsP = BacklogApi.get<ReadonlyArray<CustomField>>(`/api/v2/projects/${projectKey}/customFields`)
  const statusesP = BacklogApi.get<Status[]>(`/api/v2/projects/${projectKey}/statuses`)
  const issueTypesP = BacklogApi.get<IssueType[]>(`/api/v2/projects/${projectKey}/issueTypes`)
  const [customFields, statuses, issueTypes] = await Promise.all([customFieldsP, statusesP, issueTypesP])
  return {
    project,
    issueTypes,
    customFields,
    statuses
  }
}

export type CustomFieldInput = {
  typeId: CustomFieldTypes
  name: string
  applicableIssueTypes: ReadonlyArray<number>
  description: string
  required: boolean
  initialValue?: number
}

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
  return await BacklogApi.post<CustomField>(`/api/v2/projects/${projectKey}/customFields`, postData)
}

const deleteCustomField = async (projectKey: string, customFieldId: number): Promise<CustomField> => {
  return await BacklogApi.delete<CustomField>(`/api/v2/projects/${projectKey}/customFields/${customFieldId}`)
}

export type MilestoneInput = {
  readonly projectId: number
  readonly name: string
  readonly startDate: Date | null
  readonly endDate: Date | null
  readonly description: string
}

const createMilestone = async (input: MilestoneInput): Promise<number> => {
  const created = await BacklogApi.post<Version>(`/api/v2/projects/${input.projectId}/versions`, {
    name: input.name,
    startDate: DateUtil.dateString(input.startDate),
    releaseDueDate: DateUtil.dateString(input.endDate),
    description: input.description
  })
  return created.id
}

const archiveMilestone = async (projectId: number, milestone: Version) => {
  await BacklogApi.patch<Version>(`/api/v2/projects/${projectId}/versions/${milestone.id}`, {
    name: milestone.name,
    archived: "true"
  })
}

export const ProjectInfo = {
  getMilestones,
  getCustomFields,
  createCustomField,
  deleteCustomField,
  createMilestone,
  archiveMilestone
}
