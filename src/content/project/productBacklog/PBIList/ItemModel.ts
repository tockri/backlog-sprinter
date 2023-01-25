import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { SetAtom } from "jotai/core/atom"
import { NLMoveAction } from "../../../../util/NestedList"
import { orderCustomFieldAtom } from "../../app/State"
import { productBacklogAtom, selectedIssueIdAtom } from "../State"

type PBIItemModel = {
  readonly selectItem: (issueId: number) => void
  readonly isSelected: (issueId: number) => boolean
  readonly move: (action: NLMoveAction) => void
}

export const usePBIItemModel = (): PBIItemModel => {
  const [selected, select] = useAtom(selectedIssueIdAtom)
  const dispatch = useSetAtom(productBacklogAtom)
  const orderCustomField = useAtomValue(orderCustomFieldAtom)
  if (orderCustomField) {
    return {
      selectItem: selectItem(selected, select),
      isSelected: (issueId) => selected === issueId,
      move: dispatch
    }
  } else {
    throw new Error("orderCustomField is not set.")
  }
}

type Sel = number | null

const selectItem = (selected: Sel, select: SetAtom<Sel, void>) => (issueId: number) => {
  if (issueId === selected) {
    select(null)
  } else {
    select(issueId)
  }
}
