import { atom } from "jotai"
import { MilestonesState } from "../../../state/ProjectInfoState"
import { PBIListFunc } from "./PBIList"
import { PBIListState } from "./PBIListState"

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

export type ItemSelection = IssueId | MilestoneId | MilestoneAdding | None

const store = atom<ItemSelection>(None)

const milestoneAtom = atom(async (get) => {
  const item = get(store)
  if (item.type === "Milestone") {
    const milestones = await get(MilestonesState.atom)
    const milestone = milestones.find((m) => m.id === item.milestoneId) || null
    if (milestone) {
      const pbi = await get(PBIListState.atom)
      const issues = PBIListFunc.findIssuesInMilestone(pbi, milestone.id)
      const disallowArchive = !!issues.find((i) => i.status.id !== 4)
      return {
        milestone,
        disallowArchive
      }
    }
  }
  return null
})

const issueAtom = atom(async (get) => {
  const item = get(store)
  if (item.type === "Issue") {
    const pbi = await get(PBIListState.atom)
    return PBIListFunc.findIssue(pbi, item.issueId)
  }
  return null
})

export const ItemSelectionState = {
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
} as const
