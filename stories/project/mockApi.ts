import produce from "immer"
import { BacklogApi, FakeBacklogApi } from "../../src/content/backlog/BacklogApiForReact"
import { IssueChangeInput, IssueData, IssueDataUtil } from "../../src/content/backlog/Issue"
import { childIssuesBT, productBacklogBT, projectInfoBT } from "./mockApiData"

export const mockApi: BacklogApi = produce(FakeBacklogApi, (draft) => {
  draft.projectInfo.getProjectInfoWithCustomFields = () => Promise.resolve(projectInfoBT)
  draft.issue.searchInIssueTypeAndMilestones = () => Promise.resolve(productBacklogBT)
  draft.issue.changeMilestoneAndCustomFieldValue = async (
    issueId: number,
    milestoneId: number | null,
    customFieldValue: number | null
  ) => {
    const issue = productBacklogBT.find((i) => i.id === issueId) as IssueData
    return produce(issue, (d) => {
      if (milestoneId && d.milestone[0]) {
        d.milestone[0].id = milestoneId
      }
      if (customFieldValue && d.customFields[0]) {
        d.customFields[0].value = customFieldValue
      }
    })
  }
  draft.issue.editIssue = async (issueId: number, input: IssueChangeInput) => {
    const issue = productBacklogBT.find((i) => i.id === issueId) as IssueData
    const statuses = projectInfoBT.statuses
    return produce(issue, (d) => {
      IssueDataUtil.mutateByIssueInput(d, input, statuses)
    })
  }
  draft.issue.searchChildren = () => Promise.resolve(childIssuesBT)
})
