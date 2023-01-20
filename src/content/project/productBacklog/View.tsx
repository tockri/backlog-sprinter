import styled from "@emotion/styled"
import React from "react"
import { Loading } from "../../ui/Loading"
import { InfoArea } from "./InfoArea/InfoArea"
import { useLogic } from "./Logic"
import { PBIListView } from "./PBIList/PBIListView"

export const ProjectProductBacklog: React.FC = () => {
  const vm = useLogic()
  const selectedItem = vm.selectedItem
  return vm.items ? (
    <Root>
      <PBIListView items={vm.items} onChange={vm.onChange} />
      {selectedItem && <InfoArea issue={selectedItem} />}
    </Root>
  ) : (
    <Loading />
  )
}

const Root = styled.div({
  display: "flex",
  height: "100%"
})
