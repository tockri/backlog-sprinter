import { BackgroundClient } from "../../background/BackgroundClient"
import { CustomNumberField, Project, Status, Version } from "./ProjectInfo"

export type IssueData = {
  readonly id: number
  readonly issueKey: string
  readonly summary: string
  readonly status: Status
  readonly milestone: ReadonlyArray<Version>
}

const searchUnclosedInMilestone = async (
  project: Project,
  statuses: ReadonlyArray<Status>,
  milestoneId: number
): Promise<ReadonlyArray<IssueData>> => {
  return await BackgroundClient.blgApiGet<IssueData[]>("/api/v2/issues", [
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
): Promise<ReadonlyArray<IssueData>> => {
  return await BackgroundClient.blgApiGet<IssueData[]>("/api/v2/issues", [
    {
      "projectId[]": "" + project.id,
      "issueTypeId[]": "" + issueTypeId,
      sort: `customField_${sortField.id}`,
      count: "100"
    },
    ...statuses.filter((s) => s.id !== 4).map((s) => ({ "statusId[]": "" + s.id }))
  ])
}

export type IssueCallback = (i: IssueData) => void

const bulkChangeMilestone = async (
  issues: ReadonlyArray<IssueData>,
  milestoneId: number,
  callback?: IssueCallback
): Promise<void> => {
  for (let i = 0; i < issues.length; i++) {
    const issue = issues[i]
    callback && callback(issue)
    await BackgroundClient.blgApiPatch(`/api/v2/issues/${issue.id}`, {
      "milestoneId[]": "" + milestoneId
    })
  }
}

export const Issue = {
  searchUnclosedInMilestone,
  searchUnclosedInIssueType,
  bulkChangeMilestone
}
