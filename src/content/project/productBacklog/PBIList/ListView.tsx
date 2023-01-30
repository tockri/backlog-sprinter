import styled from "@emotion/styled"
import React from "react"
import { usePBIListModel } from "./ListModel"
import { PBISubList } from "./SubListView"

export const PBIListView: React.FC = () => {
  const model = usePBIListModel()
  return (
    <Root>
      {model.data.subLists.map((sl) => (
        <PBISubList subList={sl} key={sl.id} />
      ))}
    </Root>
  )
}

const Root = styled.div({
  padding: "8px 12px",
  flexGrow: 1,
  overflow: "auto"
})
