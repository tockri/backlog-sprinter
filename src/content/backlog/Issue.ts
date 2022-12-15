import { BackgroundClient } from "../BackgroundClient"
import { ProjectInfoData, Version } from "./ProjectInfo"

export type Status = {
  readonly id: number
}

export type IssueData = {
  readonly id: number
  readonly issueKey: string
  readonly summary: string
  readonly status: Status
  readonly milestone: ReadonlyArray<Version>
}

const searchUnclosed = async (projectInfo: ProjectInfoData, milestoneId: number): Promise<ReadonlyArray<IssueData>> => {
  return await BackgroundClient.apiGet<IssueData[]>("/api/v2/issues", [
    {
      "projectId[]": "" + projectInfo.project.id,
      "milestoneId[]": "" + milestoneId
    },
    ...projectInfo.statuses.filter((s) => s.id !== 4).map((s) => ({ "statusId[]": "" + s.id }))
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
    await BackgroundClient.apiPatch(`/api/v2/issues/${issue.id}`, {
      "milestoneId[]": "" + milestoneId
    })
  }
}

export const Issue = {
  searchUnclosed,
  bulkChangeMilestone
}
