import { Immutable } from "immer"
import { useAtomValue } from "jotai"
import { ProductBacklog } from "../state/ProductBacklog"

import { PBIListData } from "./ListData"

type PBIListModel = Immutable<{
  data: PBIListData
  creating: boolean
  startCreating: () => void
}>

export const usePBIListModel = (): PBIListModel => {
  const data = useAtomValue(ProductBacklog.atom)
  return {
    data,
    creating: false,
    startCreating: () => {
      console.error("Not implemented")
    }
  }
}
