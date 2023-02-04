import styled from "@emotion/styled"
import React from "react"
import { cnu } from "../../../ui/cnu"
import { usePBIListModel } from "./ListModel"

import PlusIconSVG from "./plus-icon.svg"
import { PBISubListView } from "./SubListView"

export const PBIListView: React.FC = () => {
  const model = usePBIListModel()
  const { creating } = model
  return (
    <Root>
      <AddButton type="button" onClick={model.startCreating} className={cnu({ creating })}>
        <PlusIcon />
      </AddButton>

      {model.data.subLists.map((sl) => (
        <PBISubListView subList={sl} key={sl.id} />
      ))}
    </Root>
  )
}

const Root = styled.div({
  position: "relative",
  padding: "8px 12px",
  flexGrow: 1,
  overflow: "auto"
})

const AddButton = styled.button({
  position: "absolute",
  top: 10,
  right: 12,
  padding: 0,
  height: 24,
  width: 24,
  boxShadow: "-3px 3px 4px #e0e0e0",
  backgroundColor: "white",
  borderWidth: 0,
  borderRadius: 4,
  "&:active": {
    backgroundColor: "#eeffdd",
    boxShadow: "-1px 1px 1px #d0d0d0"
  }
})

const PlusIcon = () => <PlusIconSVG width={14} height={14} viewBox="0 0 73 73" />
