import { atom } from "jotai"

type IssueId = {
  type: "Issue"
  issueId: number
}

type MilestoneId = {
  type: "Milestone"
  milestoneId: number
}

const store = atom<IssueId | MilestoneId | null>(null)

export const SelectedItem = {
  atom: store
}

export type SelectedItem_IssueId = IssueId
export type SelectedItem_MilestoneId = MilestoneId
export type SelectedItem = SelectedItem_IssueId | SelectedItem_MilestoneId
