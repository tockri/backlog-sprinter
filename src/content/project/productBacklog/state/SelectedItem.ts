import { atom } from "jotai"

type IssueId = {
  type: "Issue"
  issueId: number
}

type MilestoneId = {
  type: "Milestone"
  milestoneId: number
}

type None = {
  type: "None"
}
const None: None = {
  type: "None"
}

type Value = IssueId | MilestoneId | None
const store = atom<Value>(None)

export const SelectedItem = {
  atom: store,
  Action: {
    SelectIssue: (issueId: number): IssueId => ({
      type: "Issue",
      issueId
    }),
    SelectMilestone: (milestoneId: number): MilestoneId => ({
      type: "Milestone",
      milestoneId
    }),
    Deselect: None
  }
}
export type SelectedItemAction = Value
