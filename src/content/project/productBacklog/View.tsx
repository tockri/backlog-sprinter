import styled from "@emotion/styled"
import React from "react"
import { Loading } from "../../ui/Loading"
import { InfoAreaView } from "./InfoArea/InfoAreaView"
import { useLogic } from "./Logic"
import { PBIListView } from "./PBIList/PBIListView"

export const ProjectProductBacklog: React.FC = () => {
  const vm = useLogic()
  const selectedItem = vm.selectedItem
  return vm.isReady ? (
    <Root>
      <PBIListView />
      {selectedItem && <InfoAreaView issue={selectedItem} markdown={vm.markdownOnDescription} />}
    </Root>
  ) : (
    <Loading />
  )
}

const Root = styled.div({
  display: "flex",
  height: "100%"
})
