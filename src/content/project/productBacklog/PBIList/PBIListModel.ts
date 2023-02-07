import { Immutable } from "immer"
import { useAtom, useAtomValue } from "jotai"
import { ItemSelectionState } from "../state/ItemSelectionState"
import { PBIListState } from "../state/PBIListState"

import { PBIList } from "../state/PBIList"

type PBIListModel = Immutable<{
  data: PBIList
  isMilestoneAdding: boolean
  startAddMilestone: () => void
}>

export const usePBIListModel = (): PBIListModel => {
  const data = useAtomValue(PBIListState.atom)
  const [sel, selDispatch] = useAtom(ItemSelectionState.atom)
  const isMilestoneAdding = sel.type === "MilestoneAdding"
  return {
    data,
    isMilestoneAdding,
    startAddMilestone: () => {
      if (isMilestoneAdding) {
        selDispatch(ItemSelectionState.Action.Deselect)
      } else {
        selDispatch(ItemSelectionState.Action.StartMilestoneAdding)
      }
    }
  }
}
