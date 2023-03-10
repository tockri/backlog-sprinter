import { JotaiUtil } from "@/content/util/JotaiUtil"
import produce from "immer"
import { WritableDraft } from "immer/dist/types/types-external"
import { AddIssueInput, Issue } from "../../../backlog/IssueApi"

import { PBIListFunc } from "@/content/project/productBacklog/state/PBIList"
import { PBIListState } from "@/content/project/productBacklog/state/PBIListState"
import { ApiState } from "@/content/state/ApiState"
import { ProjectState } from "../../../state/ProjectInfoState"

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

      const updated = await api.issue.edit(issue.id, { parentIssueId: destinationIssueId })
      const currDst = await get(mainAtom(destinationIssueId))
      set(
        storeAtom(destinationIssueId),
        produce(currDst, (draft) => {
          draft.push(updated as WritableDraft<Issue>)
        })
      )

      return produce(curr, (draft) => {
        const idx = draft.findIndex((i) => i.id === issue.id)
        if (idx >= 0) {
          draft.splice(idx, 1)
        }
      })
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
