import styled from "@emotion/styled"
import React from "react"
import { DragAndDropProvider } from "../../ui/DragAndDrop"
import { Loading } from "../../ui/Loading"
import { InfoAreaView } from "./InfoArea/View"
import { PBIListView } from "./PBIList/PBIListView"

export const ProductBacklogView: React.FC = () => {
  return (
    <Root>
      <DragAndDropProvider>
        <React.Suspense fallback={<Loading />}>
          <PBIListView />
        </React.Suspense>
        <React.Suspense fallback={<Loading />}>
          <InfoAreaView />
        </React.Suspense>
      </DragAndDropProvider>
    </Root>
  )
}

const Root = styled.div({
  display: "flex",
  height: "100%",
  flexGrow: 1
})
