import { BacklogApiRequest } from "./BacklogApiRequest"
import { CustomNumberField, Project, Status, Version } from "./ProjectInfo"

export type CustomFieldData = {
  id: number
  name: string
  value: string | number | null
  fieldTypeId: number
}

export type IssueData = {
  readonly id: number
  readonly issueKey: string
  readonly summary: string
  readonly status: Status
  readonly milestone: ReadonlyArray<Version>
  readonly customFields: ReadonlyArray<CustomFieldData>
  readonly description: string
}

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

const searchUnclosedInIssueType = async (
  project: Project,
  statuses: ReadonlyArray<Status>,
  issueTypeId: number,
  sortField: CustomNumberField
): Promise<Array<IssueData>> => {
  return await BacklogApiRequest.get<IssueData[]>("/api/v2/issues", [
    {
      "projectId[]": "" + project.id,
      "issueTypeId[]": "" + issueTypeId,
      sort: `customField_${sortField.id}`,
      count: "100"
    },
    ...statuses.filter((s) => s.id !== 4).map((s) => ({ "statusId[]": "" + s.id }))
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
}

const changeInfo = async (issueId: number, input: IssueChangeInput): Promise<IssueData> => {
  const { summary, description } = input
  const params: Record<string, string> = {}
  if (summary !== undefined) {
    params["summary"] = summary
  }
  if (description !== undefined) {
    params["description"] = description
  }
  return await BacklogApiRequest.patch(`/api/v2/issues/${issueId}`, params)
}

const Issue = {
  searchUnclosedInMilestone,
  searchUnclosedInIssueType,
  bulkChangeMilestone,
  changeMilestoneAndCustomFieldValue,
  changeInfo
}

export type IssueApi = typeof Issue

export const RealIssue = Issue
