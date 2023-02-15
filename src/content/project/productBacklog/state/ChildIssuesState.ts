import { JotaiUtil } from "@/content/util/JotaiUtil"
import produce from "immer"
import { WritableDraft } from "immer/dist/types/types-external"
import { AddIssueInput, IssueData } from "../../../backlog/Issue"
import { Api } from "../../app/state/Api"
import { ProjectState } from "../../app/state/ProjectInfoState"

type CreateAction = {
  type: "Create"
  input: AddIssueInput
}
type MoveAction = {
  type: "Move"
  issue: IssueData
  destinationIssueId: number
}
export type ChildIssuesAction = CreateAction | MoveAction

const mainAtom = JotaiUtil.asyncAtomFamilyWithAction(
  (parentIssueId: number) => async (get) => {
    const api = get(Api.atom)
    const project = await get(ProjectState.atom)
    return await api.issue.searchChildren(project, parentIssueId)
  },
  (parentIssueId, storeAtom) => async (curr, get, set, action: ChildIssuesAction) => {
    if (action.type === "Move") {
      const { issue, destinationIssueId } = action
      const api = get(Api.atom)

      const updated = await api.issue.editIssue(issue.id, { parentIssueId: destinationIssueId })
      const currDst = await get(mainAtom(destinationIssueId))
      set(
        storeAtom(destinationIssueId),
        produce(currDst, (draft) => {
          draft.push(updated as WritableDraft<IssueData>)
        })
      )

      return produce(curr, (draft) => {
        const idx = draft.findIndex((i) => i.id === issue.id)
        if (idx >= 0) {
          draft.splice(idx, 1)
        }
      })
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
    Move: (issue: IssueData, destinationIssueId: number): MoveAction => ({
      type: "Move",
      issue,
      destinationIssueId
    })
  }
}
