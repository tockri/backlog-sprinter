import { Immutable } from "immer"
import { useAtom, useAtomValue } from "jotai"
import { productBacklogAtom } from "../State"
import { PBIListData } from "./ListData"
import { MilestoneFormAction, milestoneFormAtom } from "./State"

type PBIListModel = Immutable<{
  data: PBIListData
  creating: boolean
  startCreating: () => void
}>

export const usePBIListModel = (): PBIListModel => {
  const data = useAtomValue(productBacklogAtom)
  const [milestoneForm, dispatch] = useAtom(milestoneFormAtom(0))
  return {
    data,
    creating: milestoneForm.creating,
    startCreating: () => dispatch(MilestoneFormAction.Start)
  }
}
