import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { NLLocation } from "../../../../util/NestedList"
import { OrderCustomFieldState } from "../../state/OrderCustomFieldState"
import { PBIListState } from "../state/PBIListState"

import { ItemSelectionState } from "../state/ItemSelectionState"

type PBItemModel = {
  readonly selectItem: (issueId: number) => void
  readonly isSelected: (issueId: number) => boolean
  readonly move: (src: NLLocation, dst: NLLocation) => void
}

export const usePBItemModel = (): PBItemModel => {
  const [selected, selectDispatch] = useAtom(ItemSelectionState.atom)
  const pbDispatch = useSetAtom(PBIListState.atom)
  const orderCustomField = useAtomValue(OrderCustomFieldState.atom)
  const selectedIssueId = selected?.type === "Issue" ? selected.issueId : null
  if (orderCustomField) {
    return {
      selectItem: (issueId) => {
        if (issueId === selectedIssueId) {
          selectDispatch(ItemSelectionState.Action.Deselect)
        } else {
          selectDispatch(ItemSelectionState.Action.SelectIssue(issueId))
        }
      },
      isSelected: (issueId) => selectedIssueId === issueId,
      move: (src, dst) => {
        pbDispatch(PBIListState.Action.ListMove(src, dst)).then()
      }
    }
  } else {
    throw new Error("orderCustomField is not set.")
  }
}
