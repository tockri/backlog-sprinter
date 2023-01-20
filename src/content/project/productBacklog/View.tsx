import styled from "@emotion/styled"
import React from "react"
import { Loading } from "../../ui/Loading"
import { InfoArea } from "./InfoArea"
import { PBIListView } from "./PBIList/PBIListView"
import { useViewModel } from "./ViewModel"

export const ProjectProductBacklog: React.FC = () => {
  const vm = useViewModel()

  return vm.items ? (
    <Root>
      <PBIListView items={vm.items} onChange={vm.onChange} />
      <InfoArea />
    </Root>
  ) : (
    <Loading />
  )
}

const Root = styled.div({
  display: "flex"
})
