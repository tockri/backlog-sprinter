import produce from "immer"
import { WritableDraft } from "immer/dist/types/types-external"
import { atom } from "jotai"
import { atomFamily } from "jotai/utils"
import { IssueCreateInput, IssueData } from "../../../backlog/Issue"
import { backlogApiAtom, projectAtom } from "../../app/State"

enum Types {
  Move = "Move",
  Create = "Create"
}

type CreateAction = {
  type: Types.Create
  input: IssueCreateInput
}
type MoveAction = {
  type: Types.Move
  issue: IssueData
  destinationIssueId: number
}
type Action = CreateAction | MoveAction

/* eslint @typescript-eslint/no-unused-vars: 0 */
const storeAtom = atomFamily((_parentIssueId: number) => atom<ReadonlyArray<IssueData> | null>(null))

const interfaceAtom = atomFamily((parentIssueId: number) =>
  atom(
    async (get) => {
      const stored = get(storeAtom(parentIssueId))
      if (stored !== null) {
        return stored
      } else {
        const api = get(backlogApiAtom)
        const project = get(projectAtom)
        return await api.issue.searchChildren(project, parentIssueId)
      }
    },
    async (get, set, action: Action) => {
      if (action.type === Types.Move) {
        const { issue, destinationIssueId } = action
        const api = get(backlogApiAtom)
        const updated = await api.issue.editIssue(issue.id, { parentIssueId: destinationIssueId })
        const currSrc = get(interfaceAtom(parentIssueId))
        set(
          storeAtom(parentIssueId),
          produce(currSrc, (draft) => {
            const idx = draft.findIndex((i) => i.id === issue.id)
            if (idx >= 0) {
              draft.splice(idx, 1)
            }
          })
        )
        const currDst = get(interfaceAtom(destinationIssueId))
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

export type ChildIssueAction = Action

export const ChildIssue = {
  atom: interfaceAtom,
  Action: {
    Create: (input: IssueCreateInput): CreateAction => ({
      type: Types.Create,
      input
    }),
    Move: (issue: IssueData, destinationIssueId: number): MoveAction => ({
      type: Types.Move,
      issue,
      destinationIssueId
    })
  }
}
