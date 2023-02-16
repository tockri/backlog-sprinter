import { BacklogApi, FakeBacklogApi } from "@/content/backlog/BacklogApiForReact"
import { AddIssueInput, EditIssueInput, Issue, IssueApi, IssueDataUtil } from "@/content/backlog/IssueApi"
import { ProjectInfoApi } from "@/content/backlog/ProjectInfoApi"
import produce from "immer"
import { MockData } from "./MockApi-data"

const createIssueType: ProjectInfoApi["createIssueType"] = (input) =>
  Promise.resolve({
    ...MockData.projectInfoBT.issueTypes[0],
    id: 100000,
    ...input
  })

const changeMilestoneAndCustomFieldValue: IssueApi["changeMilestoneAndCustomFieldValue"] = async (
  issueId: number,
  milestoneId: number | null,
  customFieldValue: number | null
) => {
  const issue = MockData.productBacklogBT.find((i) => i.id === issueId) as Issue
  return produce(issue, (d) => {
    if (milestoneId && d.milestone[0]) {
      d.milestone[0].id = milestoneId
    }
    if (customFieldValue && d.customFields[0]) {
      d.customFields[0].value = customFieldValue
    }
  })
}

const addIssue: IssueApi["addIssue"] = (input: AddIssueInput) =>
  Promise.resolve(
    produce(MockData.productBacklogBT[0], (d) => {
      d.id = 200000
      d.summary = input.summary

      if (input.milestoneId) {
        d.milestone[0].id = input.milestoneId
      }
      const inCf = input.customField
      if (inCf) {
        const cf = d.customFields.find((cf) => cf.id === inCf.id)
        if (cf) {
          cf.id = inCf.id
          cf.value = inCf.value
        }
      }
    })
  )

const editIssue: IssueApi["editIssue"] = async (issueId: number, input: EditIssueInput) => {
  const issue = MockData.productBacklogBT.find((i) => i.id === issueId) as Issue
  const statuses = MockData.projectInfoBT.statuses
  return produce(issue, (d) => {
    IssueDataUtil.mutateByIssueInput(d, input, statuses)
  })
}

export const MockApi: BacklogApi = produce(FakeBacklogApi, (draft) => {
  draft.projectInfo.getProjectInfoWithCustomFields = () => Promise.resolve(MockData.projectInfoBT)
  draft.projectInfo.createIssueType = createIssueType
  draft.issue.searchInIssueTypeAndMilestones = () => Promise.resolve(MockData.productBacklogBT)
  draft.issue.changeMilestoneAndCustomFieldValue = changeMilestoneAndCustomFieldValue
  draft.issue.addIssue = addIssue
  draft.issue.editIssue = editIssue
  draft.issue.searchChildren = () => Promise.resolve(MockData.childIssuesBT)
})
