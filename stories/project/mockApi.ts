import produce from "immer"
import { BacklogApi, FakeBacklogApi } from "../../src/content/backlog/BacklogApiForReact"
import { IssueChangeInput, IssueData } from "../../src/content/backlog/Issue"
import { productBacklogBT, projectInfoBT } from "./mockApiData"

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
  draft.issue.changeInfo = async (issueId: number, input: IssueChangeInput) => {
    const issue = productBacklogBT.find((i) => i.id === issueId) as IssueData
    return produce(issue, (d) => {
      if (input.description !== undefined) {
        d.description = input.description
      }
      if (input.summary !== undefined) {
        d.summary = input.summary
      }
      if (input.estimatedHours !== undefined) {
        d.estimatedHours = input.estimatedHours
      }
      if (input.statusId !== undefined) {
        const statuses = projectInfoBT.statuses
        const newStatus = statuses.find((st) => st.id === input.statusId)
        if (newStatus) {
          d.status = newStatus
        }
      }
    })
  }
})
