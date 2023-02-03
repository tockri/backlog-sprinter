import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { NLMoveAction } from "../../../../util/NestedList"
import { orderCustomFieldAtom } from "../../app/State"
import { productBacklogAtom } from "../State"
import { SelectedItem } from "../state/SelectedItem"

type PBIItemModel = {
  readonly selectItem: (issueId: number) => void
  readonly isSelected: (issueId: number) => boolean
  readonly move: (action: NLMoveAction) => void
}

export const usePBIItemModel = (): PBIItemModel => {
  const [selected, select] = useAtom(SelectedItem.atom)
  const dispatch = useSetAtom(productBacklogAtom)
  const orderCustomField = useAtomValue(orderCustomFieldAtom)
  const selectedIssueId = selected?.type === "Issue" ? selected.issueId : null
  if (orderCustomField) {
    return {
      selectItem: (issueId) => {
        if (issueId === selectedIssueId) {
          select(null)
        } else {
          select({
            type: "Issue",
            issueId
          })
        }
      },
      isSelected: (issueId) => selectedIssueId === issueId,
      move: dispatch
    }
  } else {
    throw new Error("orderCustomField is not set.")
  }
}
