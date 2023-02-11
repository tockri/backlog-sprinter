import { BacklogApi, FakeBacklogApi } from "@/content/backlog/BacklogApiForReact"
import { EditIssueInput, IssueData, IssueDataUtil } from "@/content/backlog/Issue"
import produce from "immer"
import { MockData } from "./MockApi-data"

export const MockApi: BacklogApi = produce(FakeBacklogApi, (draft) => {
  draft.projectInfo.getProjectInfoWithCustomFields = () => Promise.resolve(MockData.projectInfoBT)
  draft.issue.searchInIssueTypeAndMilestones = () => Promise.resolve(MockData.productBacklogBT)
  draft.issue.changeMilestoneAndCustomFieldValue = async (
    issueId: number,
    milestoneId: number | null,
    customFieldValue: number | null
  ) => {
    const issue = MockData.productBacklogBT.find((i) => i.id === issueId) as IssueData
    return produce(issue, (d) => {
      if (milestoneId && d.milestone[0]) {
        d.milestone[0].id = milestoneId
      }
      if (customFieldValue && d.customFields[0]) {
        d.customFields[0].value = customFieldValue
      }
    })
  }
  draft.issue.editIssue = async (issueId: number, input: EditIssueInput) => {
    const issue = MockData.productBacklogBT.find((i) => i.id === issueId) as IssueData
    const statuses = MockData.projectInfoBT.statuses
    return produce(issue, (d) => {
      IssueDataUtil.mutateByIssueInput(d, input, statuses)
    })
  }
  draft.issue.searchChildren = () => Promise.resolve(MockData.childIssuesBT)
})
