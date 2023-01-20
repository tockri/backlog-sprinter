import React from "react"
import { DragAndDropProvider } from "../../../ui/DragAndDrop"
import { IssueDataWithOrder, PBIListChangeEvent } from "./PBIListData"
import { useLogic } from "./PBIListLogic"
import { PBISubList } from "./SubListView"

type ViewProps = {
  readonly items: ReadonlyArray<IssueDataWithOrder>
  readonly onChange: (events: ReadonlyArray<PBIListChangeEvent>) => void
}

export const PBIListView: React.FC<ViewProps> = (props) => {
  const { items, onChange } = props
  const logic = useLogic(items, onChange)

  return (
    <DragAndDropProvider>
      {logic.pbiListData.subLists.map((sl) => (
        <PBISubList subList={sl} dispatch={logic.dispatch} key={sl.id} />
      ))}
    </DragAndDropProvider>
  )
}
