import { Immutable } from "immer"
import { useAtom, useAtomValue } from "jotai"
import { ProductBacklog } from "../state/ProductBacklog"
import { SelectedItem } from "../state/SelectedItem"

import { PBIListData } from "./ListData"

type PBIListModel = Immutable<{
  data: PBIListData
  isMilestoneAdding: boolean
  startAddMilestone: () => void
}>

export const usePBIListModel = (): PBIListModel => {
  const data = useAtomValue(ProductBacklog.atom)
  const [sel, selDispatch] = useAtom(SelectedItem.atom)
  return {
    data,
    isMilestoneAdding: sel.type === "MilestoneAdding",
    startAddMilestone: () => {
      selDispatch(SelectedItem.Action.StartMilestoneAdding)
    }
  }
}
