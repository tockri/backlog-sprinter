import produce from "immer"
import { WritableDraft } from "immer/dist/types/types-external"
import { atom } from "jotai"
import { atomFamily } from "jotai/utils"
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

/* eslint @typescript-eslint/no-unused-vars: 0 */
const storeAtom = atomFamily((_parentIssueId: number) => atom<ReadonlyArray<IssueData> | null>(null))

const interfaceAtom = atomFamily((parentIssueId: number) =>
  atom(
    async (get) => {
      const stored = get(storeAtom(parentIssueId))
      if (stored !== null) {
        return stored
      } else {
        const api = get(Api.atom)
        const project = await get(ProjectState.atom)
        return await api.issue.searchChildren(project, parentIssueId)
      }
    },
    async (get, set, action: ChildIssuesAction) => {
      if (action.type === "Move") {
        const { issue, destinationIssueId } = action
        const api = get(Api.atom)
        const updated = await api.issue.editIssue(issue.id, { parentIssueId: destinationIssueId })
        const currSrc = await get(interfaceAtom(parentIssueId))
        set(
          storeAtom(parentIssueId),
          produce(currSrc, (draft) => {
            const idx = draft.findIndex((i) => i.id === issue.id)
            if (idx >= 0) {
              draft.splice(idx, 1)
            }
          })
        )
        const currDst = await get(interfaceAtom(destinationIssueId))
        set(
          storeAtom(destinationIssueId),
          produce(currDst, (draft) => {
            draft.push(updated as WritableDraft<IssueData>)
          })
        )
      }
    }
  )
)

export const ChildIssuesState = {
  atom: interfaceAtom,
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
