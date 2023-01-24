import { Immutable } from "immer"
import { useAtomValue } from "jotai"
import { productBacklogAtom } from "../State"
import { PBIListData } from "./PBIListData"

type PBIListModel = Immutable<{
  data: PBIListData
}>

export const usePBIListModel = (): PBIListModel => {
  const data = useAtomValue(productBacklogAtom)
  return {
    data
  }
}
