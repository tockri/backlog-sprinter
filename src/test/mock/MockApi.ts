import { produce } from "immer"
import { BacklogApi, FakeBacklogApi } from "../../content/backlog/BacklogApi"
import { AddIssueInput, EditIssueInput, Issue, IssueApi, IssueUtil } from "../../content/backlog/IssueApi"
import { ProjectInfoApi } from "../../content/backlog/ProjectInfoApi"
import { MockData } from "./MockApi-data"

const createIssueType: ProjectInfoApi["addIssueType"] = (input) =>
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

const addIssue: IssueApi["add"] = (input: AddIssueInput) =>
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

const editIssue: IssueApi["edit"] = async (issueId: number, input: EditIssueInput) => {
  const issue = MockData.productBacklogBT.find((i) => i.id === issueId) as Issue
  const statuses = MockData.projectInfoBT.statuses
  return produce(issue, (d) => {
    IssueUtil.mutateByIssueInput(d, input, statuses)
  })
}

export const MockApi: BacklogApi = produce(FakeBacklogApi, (draft) => {
  draft.projectInfo = produce(draft.projectInfo, (pi) => {
    pi.getProject = () => Promise.resolve(MockData.projectInfoBT.project)
    pi.getMilestones = () => Promise.resolve(MockData.projectInfoBT.milestones)
    pi.getStatuses = () => Promise.resolve(MockData.projectInfoBT.statuses)
    pi.getIssueTypes = () => Promise.resolve(MockData.projectInfoBT.issueTypes)
    pi.getCustomFields = () => Promise.resolve(MockData.projectInfoBT.customFields)
    pi.addIssueType = createIssueType
  })
  draft.issue = produce(draft.issue, (iss) => {
    iss.searchInIssueTypeAndMilestones = () => Promise.resolve(MockData.productBacklogBT)
    iss.changeMilestoneAndCustomFieldValue = changeMilestoneAndCustomFieldValue
    iss.add = addIssue
    iss.edit = editIssue
    iss.searchChildren = () => Promise.resolve(MockData.childIssuesBT)
  })
})
