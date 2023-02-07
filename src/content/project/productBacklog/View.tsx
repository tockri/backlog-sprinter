import styled from "@emotion/styled"
import React from "react"
import { DragAndDropProvider } from "../../ui/DragAndDrop"
import { InfoAreaView } from "./InfoArea/View"
import { PBIListView } from "./PBIList/PBIListView"

export const ProductBacklogView: React.FC = () => {
  return (
    <Root>
      <DragAndDropProvider>
        <PBIListView />
        <InfoAreaView />
      </DragAndDropProvider>
    </Root>
  )
}

const Root = styled.div({
  display: "flex",
  height: "100%",
  flexGrow: 1
})
