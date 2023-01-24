import styled from "@emotion/styled"
import React from "react"
import { InfoAreaView } from "./InfoArea/InfoAreaView"
import { useProductBacklogModel } from "./Model"
import { PBIListView } from "./PBIList/PBIListView"

export const ProductBacklogView: React.FC = () => {
  const model = useProductBacklogModel()
  return (
    <Root>
      <PBIListView />
      {model.selectedIssueId && <InfoAreaView issueId={model.selectedIssueId} markdown={model.markdownOnDescription} />}
    </Root>
  )
}

const Root = styled.div({
  display: "flex",
  height: "100%"
})
