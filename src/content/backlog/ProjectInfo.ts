import { BackgroundClient } from "../BackgroundClient"

export type Project = {
  readonly id: number
  readonly name: string
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

export type Status = {
  readonly id: number
  readonly name: string
}

export type MilestonesData = {
  readonly project: Project
  readonly versions: ReadonlyArray<Version>
  readonly statuses: ReadonlyArray<Status>
}

const getMilestones = async (projectKey: string): Promise<MilestonesData> => {
  const project = await BackgroundClient.blgApiGet<Project>(`/api/v2/projects/${projectKey}`)
  const versionsP = BackgroundClient.blgApiGet<Version[]>(`/api/v2/projects/${projectKey}/versions`)
  const statusesP = BackgroundClient.blgApiGet<Status[]>(`/api/v2/projects/${projectKey}/statuses`)
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

export type CustomFieldsData = {
  readonly project: Project
  readonly issueTypes: ReadonlyArray<IssueType>
  readonly customFields: ReadonlyArray<CustomField>
  readonly statuses: ReadonlyArray<Status>
}

const getCustomFields = async (projectKey: string): Promise<CustomFieldsData> => {
  const project = await BackgroundClient.blgApiGet<Project>(`/api/v2/projects/${projectKey}`)
  const customFieldsP = BackgroundClient.blgApiGet<ReadonlyArray<CustomField>>(
    `/api/v2/projects/${projectKey}/customFields`
  )
  const statusesP = BackgroundClient.blgApiGet<Status[]>(`/api/v2/projects/${projectKey}/statuses`)
  const issueTypesP = BackgroundClient.blgApiGet<IssueType[]>(`/api/v2/projects/${projectKey}/issueTypes`)
  const [customFields, statuses, issueTypes] = await Promise.all([customFieldsP, statusesP, issueTypesP])
  return {
    project,
    issueTypes,
    customFields,
    statuses
  }
}

export const ProjectInfo = {
  getMilestones,
  getCustomFields
}
