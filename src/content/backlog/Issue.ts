import { Immutable } from "immer"
import { WritableDraft } from "immer/dist/internal"
import { BacklogApiRequest } from "./BacklogApiRequest"
import { CustomNumberField, Project, Status, Version } from "./ProjectInfo"

export type CustomFieldData = Immutable<{
  id: number
  name: string
  value: string | number | null
  fieldTypeId: number
}>

export type IssueData = Immutable<{
  id: number
  issueKey: string
  summary: string
  status: Status
  milestone: ReadonlyArray<Version>
  customFields: ReadonlyArray<CustomFieldData>
  description: string
  estimatedHours: number | null
  actualHours: number | null
}>

const searchUnclosedInMilestone = async (
  project: Project,
  statuses: ReadonlyArray<Status>,
  milestoneId: number
): Promise<ReadonlyArray<IssueData>> => {
  return await BacklogApiRequest.get<IssueData[]>("/api/v2/issues", [
    {
      "projectId[]": "" + project.id,
      "milestoneId[]": "" + milestoneId,
      count: "100"
    },
    ...statuses.filter((s) => s.id !== 4).map((s) => ({ "statusId[]": "" + s.id }))
  ])
}

const searchInIssueTypeAndMilestones = async (
  project: Project,
  issueTypeId: number,
  milestones: ReadonlyArray<Version>
): Promise<ReadonlyArray<IssueData>> => {
  return await BacklogApiRequest.get<ReadonlyArray<IssueData>>("/api/v2/issues", [
    {
      "projectId[]": "" + project.id,
      "issueTypeId[]": "" + issueTypeId,
      count: "100"
    },
    ...milestones.map((v) => ({ "milestoneId[]": "" + v.id }))
  ])
}

const searchChildren = async (project: Project, parentIssueId: number): Promise<ReadonlyArray<IssueData>> => {
  return await BacklogApiRequest.get<ReadonlyArray<IssueData>>("/api/v2/issues", [
    {
      "projectId[]": "" + project.id,
      "parentIssueId[]": "" + parentIssueId,
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
): Promise<IssueData> => {
  const params: Record<string, string> = {}
  if (milestoneId !== null) {
    params["milestoneId[]"] = milestoneId ? String(milestoneId) : ""
  }
  if (customFieldValue !== null) {
    params[`customField_${customField.id}`] = "" + customFieldValue
  }
  return await BacklogApiRequest.patch(`/api/v2/issues/${issueId}`, params)
}

export type IssueChangeInput = {
  summary?: string
  description?: string
  estimatedHours?: number | null
  actualHours?: number | null
  statusId?: number
}

const changeInfo = async (issueId: number, input: IssueChangeInput): Promise<IssueData> => {
  const { summary, description, estimatedHours, actualHours, statusId } = input
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
  return await BacklogApiRequest.patch(`/api/v2/issues/${issueId}`, params)
}

const mutateByIssueInput = (
  issue: WritableDraft<IssueData>,
  input: IssueChangeInput,
  statuses: ReadonlyArray<Status>
) => {
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
  if (input.statusId !== undefined) {
    const newStatus = statuses.find((s) => s.id === input.statusId)
    if (newStatus) {
      issue.status = newStatus
    }
  }
}

const Issue = {
  searchUnclosedInMilestone,
  searchInIssueTypeAndMilestones,
  searchChildren,
  bulkChangeMilestone,
  changeMilestoneAndCustomFieldValue,
  changeInfo
}

export const IssueDataUtil = {
  mutateByIssueInput
}

export type IssueApi = typeof Issue

export const RealIssue = Issue
