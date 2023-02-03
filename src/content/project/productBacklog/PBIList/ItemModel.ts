import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { NLMoveAction } from "../../../../util/NestedList"
import { orderCustomFieldAtom } from "../../app/State"
import { ProductBacklog } from "../state/ProductBacklog"

import { SelectedItem } from "../state/SelectedItem"

type PBIItemModel = {
  readonly selectItem: (issueId: number) => void
  readonly isSelected: (issueId: number) => boolean
  readonly move: (action: NLMoveAction) => void
}

export const usePBIItemModel = (): PBIItemModel => {
  const [selected, selectDispatch] = useAtom(SelectedItem.atom)
  const pbDispatch = useSetAtom(ProductBacklog.atom)
  const orderCustomField = useAtomValue(orderCustomFieldAtom)
  const selectedIssueId = selected?.type === "Issue" ? selected.issueId : null
  if (orderCustomField) {
    return {
      selectItem: (issueId) => {
        if (issueId === selectedIssueId) {
          selectDispatch(SelectedItem.Action.Deselect)
        } else {
          selectDispatch(SelectedItem.Action.SelectIssue(issueId))
        }
      },
      isSelected: (issueId) => selectedIssueId === issueId,
      move: pbDispatch
    }
  } else {
    throw new Error("orderCustomField is not set.")
  }
}
