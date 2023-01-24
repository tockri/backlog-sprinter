import styled from "@emotion/styled"
import React from "react"
import { InfoAreaView } from "./InfoArea/View"
import { PBIListView } from "./PBIList/ListView"

export const ProductBacklogView: React.FC = () => {
  return (
    <Root>
      <PBIListView />
      <InfoAreaView />
    </Root>
  )
}

const Root = styled.div({
  display: "flex",
  height: "100%"
})
