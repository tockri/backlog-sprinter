import styled from "@emotion/styled"
import React from "react"
import { DragAndDropProvider } from "../../../ui/DragAndDrop"
import { useLogic } from "./PBIListLogic"
import { PBISubList } from "./SubListView"

export const PBIListView: React.FC = () => {
  const logic = useLogic()

  return (
    <DragAndDropProvider>
      <Root>
        {logic.pbiListData.subLists.map((sl) => (
          <PBISubList subList={sl} dispatch={logic.dispatch} key={sl.id} />
        ))}
      </Root>
    </DragAndDropProvider>
  )
}

const Root = styled.div({
  padding: "8px 12px",
  flexGrow: 1,
  overflow: "auto"
})
