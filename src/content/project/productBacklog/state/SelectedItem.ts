import { atom } from "jotai"
import { Milestones } from "../../app/state/ProjectInfo"
import { PBIListDataHandler } from "../PBIList/ListData"
import { ProductBacklog } from "./ProductBacklog"

type IssueId = {
  type: "Issue"
  issueId: number
}

type MilestoneId = {
  type: "Milestone"
  milestoneId: number
}

type MilestoneAdding = {
  type: "MilestoneAdding"
}

type None = {
  type: "None"
}

const None: None = {
  type: "None"
}

type Value = IssueId | MilestoneId | MilestoneAdding | None
const store = atom<Value>(None)

const milestoneAtom = atom((get) => {
  const item = get(store)
  if (item.type === "Milestone") {
    const milestones = get(Milestones.atom)
    return milestones.find((m) => m.id === item.milestoneId) || null
  }
  return null
})

const issueAtom = atom((get) => {
  const item = get(store)
  if (item.type === "Issue") {
    const pbi = get(ProductBacklog.atom)
    const [issue] = PBIListDataHandler.findIssue(pbi, item.issueId)
    return issue
  }
  return null
})

export const SelectedItem = {
  atom: store,
  milestoneAtom,
  issueAtom,
  Action: {
    SelectIssue: (issueId: number): IssueId => ({
      type: "Issue",
      issueId
    }),
    SelectMilestone: (milestoneId: number): MilestoneId => ({
      type: "Milestone",
      milestoneId
    }),
    StartMilestoneAdding: {
      type: "MilestoneAdding"
    } as MilestoneAdding,
    Deselect: None
  }
}
export type SelectedItemAction = Value
