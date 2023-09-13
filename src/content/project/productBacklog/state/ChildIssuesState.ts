
import { JotaiUtil } from "../../../util/JotaiUtil"

import { AddIssueInput, Issue } from "../../../backlog/IssueApi"

import { ApiState } from "../../../state/ApiState"
import { ProjectState } from "../../../state/ProjectInfoState"
import { PBIListFunc } from "./PBIList"
import { PBIListState } from "./PBIListState"

type CreateAction = {
  type: "Create"
  input: AddIssueInput
}
type MoveAction = {
  type: "Move"
  issue: Issue
  destinationIssueId: number
}
type ReloadAction = {
  type: "Reload"
}
export type ChildIssuesAction = CreateAction | MoveAction | ReloadAction

const mainAtom = JotaiUtil.asyncAtomFamilyWithAction(
  (parentIssueId: number) => async (get) => {
    const api = get(ApiState.atom)
    const project = await get(ProjectState.atom)
    const pbi = await get(PBIListState.atom)
    const parent = PBIListFunc.findIssue(pbi, parentIssueId)
    return await api.issue.searchChildren(project.id, parent ? parent.id : parentIssueId)
  },
  (parentIssueId, storeAtom) => async (curr, get, set, action: ChildIssuesAction) => {
    if (action.type === "Move") {
      const { issue, destinationIssueId } = action
      const api = get(ApiState.atom)

      await api.issue.edit(issue.id, { parentIssueId: destinationIssueId })

      set(
        storeAtom(destinationIssueId),
        null
      )

      const idx = curr.findIndex((i) => i.id === issue.id)
      return idx >= 0 ? curr.toSpliced(idx, 1) : curr
    } else if (action.type === "Reload") {
      return null
    }
    return curr
  }
)

export const ChildIssuesState = {
  atom: mainAtom,
  Action: {
    Create: (input: AddIssueInput): CreateAction => ({
      type: "Create",
      input
    }),
    Move: (issue: Issue, destinationIssueId: number): MoveAction => ({
      type: "Move",
      issue,
      destinationIssueId
    })
  }
} as const
