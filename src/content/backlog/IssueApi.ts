import { DateUtil } from "@/util/DateUtil"
import { Immutable } from "immer"
import { WritableDraft } from "immer/dist/internal"
import { BacklogApiRequest } from "./BacklogApiRequest"
import { CustomNumberField, IssueType, Status, Version } from "./ProjectInfoApi"

export type CustomFieldValue = Immutable<{
  id: number
  name: string
  value: string | number | null
  fieldTypeId: number
}>

export type Issue = Immutable<{
  id: number
  issueKey: string
  keyId: number
  issueType: Omit<IssueType, "templateSummary" | "templateDescription">
  summary: string
  status: Status
  milestone: ReadonlyArray<Version>
  customFields: ReadonlyArray<CustomFieldValue>
  description: string
  estimatedHours: number | null
  actualHours: number | null
  parentIssueId: number | null
}>

const searchUnclosedInMilestone = async (
  projectId: number,
  statuses: ReadonlyArray<Status>,
  milestoneId: number
): Promise<ReadonlyArray<Issue>> => {
  return await BacklogApiRequest.get<Issue[]>("/api/v2/issues", [
    {
      "projectId[]": "" + projectId,
      "milestoneId[]": "" + milestoneId,
      count: "100"
    },
    ...statuses.filter((s) => s.id !== 4).map((s) => ({ "statusId[]": "" + s.id }))
  ])
}

const searchInIssueTypeAndMilestones = async (
  projectId: number,
  issueTypeId: number,
  milestones: ReadonlyArray<Version>
): Promise<ReadonlyArray<Issue>> => {
  if (milestones.length == 0) {
    return []
  }
  return await BacklogApiRequest.get<ReadonlyArray<Issue>>("/api/v2/issues", [
    {
      "projectId[]": "" + projectId,
      "issueTypeId[]": "" + issueTypeId,
      count: "100"
    },
    ...milestones.map((v) => ({ "milestoneId[]": "" + v.id }))
  ])
}

const searchChildren = async (projectId: number, parentIssueId: number): Promise<ReadonlyArray<Issue>> => {
  return await BacklogApiRequest.get<ReadonlyArray<Issue>>("/api/v2/issues", [
    {
      "projectId[]": "" + projectId,
      "parentIssueId[]": "" + parentIssueId,
      count: "100"
    }
  ])
}

const searchClosed = async (
  projectId: number,
  updatedSince: Date,
  updatedUntil: Date
): Promise<ReadonlyArray<Issue>> => {
  return await BacklogApiRequest.get<ReadonlyArray<Issue>>("/api/v2/issues", [
    {
      "projectId[]": "" + projectId,
      "statusId[]": "4",
      updatedSince: DateUtil.dateString(updatedSince),
      updatedUntil: DateUtil.dateString(updatedUntil),
      count: "100"
    }
  ])
}

export type IssueIdCallback = (issueId: number) => void

const bulkChangeMilestone = async (
  issueIds: ReadonlyArray<number>,
  milestoneId: number,
  beforeSend?: IssueIdCallback
): Promise<void> => {
  for (let i = 0; i < issueIds.length; i++) {
    const issueId = issueIds[i]
    beforeSend && beforeSend(issueId)
    await BacklogApiRequest.patch(`/api/v2/issues/${issueId}`, {
      "milestoneId[]": "" + milestoneId
    })
  }
}

const changeMilestoneAndCustomFieldValue = async (
  issueId: number,
  milestoneId: number | null,
  customFieldValue: number | null,
  customField: CustomNumberField
): Promise<Issue> => {
  const params: Record<string, string> = {}
  if (milestoneId !== null) {
    params["milestoneId[]"] = milestoneId ? String(milestoneId) : ""
  }
  if (customFieldValue !== null) {
    params[`customField_${customField.id}`] = "" + customFieldValue
  }
  return await BacklogApiRequest.patch(`/api/v2/issues/${issueId}`, params)
}

export type EditIssueInput = Immutable<{
  summary?: string
  description?: string
  estimatedHours?: number | null
  actualHours?: number | null
  statusId?: number
  parentIssueId?: number | null
}>

const edit = async (issueId: number, input: EditIssueInput): Promise<Issue> => {
  const { summary, description, estimatedHours, actualHours, statusId, parentIssueId } = input
  const params: Record<string, string> = {}
  if (summary !== undefined) {
    params["summary"] = summary
  }
  if (description !== undefined) {
    params["description"] = description
  }
  if (estimatedHours !== undefined) {
    params["estimatedHours"] = estimatedHours !== null ? String(estimatedHours) : ""
  }
  if (actualHours !== undefined) {
    params["actualHours"] = actualHours !== null ? String(actualHours) : ""
  }
  if (statusId !== undefined) {
    params["statusId"] = String(statusId)
  }
  if (parentIssueId !== undefined) {
    params["parentIssueId"] = String(parentIssueId)
  }
  return await BacklogApiRequest.patch(`/api/v2/issues/${issueId}`, params)
}

const mutateByIssueInput = (issue: WritableDraft<Issue>, input: EditIssueInput, statuses: ReadonlyArray<Status>) => {
  if (input.summary !== undefined) {
    issue.summary = input.summary
  }
  if (input.description !== undefined) {
    issue.description = input.description
  }
  if (input.estimatedHours !== undefined) {
    issue.estimatedHours = input.estimatedHours
  }
  if (input.actualHours !== undefined) {
    issue.actualHours = input.actualHours
  }
  if (input.parentIssueId !== undefined) {
    issue.parentIssueId = input.parentIssueId
  }
  if (input.statusId !== undefined) {
    const newStatus = statuses.find((s) => s.id === input.statusId)
    if (newStatus) {
      issue.status = newStatus
    }
  }
}

export type AddIssueInput = Immutable<{
  projectId: number
  issueTypeId: number
  summary: string
  description: string
  parentIssueId?: number
  milestoneId?: number | null
  customField?: {
    id: number
    value: number
  }
}>

const add = async (input: AddIssueInput): Promise<Issue> => {
  const params: Record<string, string> = {}
  params["projectId"] = String(input.projectId)
  params["issueTypeId"] = String(input.issueTypeId)
  params["priorityId"] = "3"
  params["summary"] = input.summary
  params["description"] = input.description
  const { parentIssueId, milestoneId, customField } = input
  if (parentIssueId !== undefined) {
    params["parentIssueId"] = String(parentIssueId)
  }
  if (milestoneId !== undefined) {
    params["milestoneId[]"] = String(milestoneId)
  }
  if (customField !== undefined) {
    params[`customField_${customField.id}`] = String(customField.value)
  }
  return await BacklogApiRequest.post("/api/v2/issues", params)
}

export const IssueUtil = {
  mutateByIssueInput
} as const

export const RealIssueApi = {
  searchUnclosedInMilestone,
  searchInIssueTypeAndMilestones,
  searchChildren,
  searchClosed,
  bulkChangeMilestone,
  changeMilestoneAndCustomFieldValue,
  edit,
  add
} as const

export type IssueApi = typeof RealIssueApi
