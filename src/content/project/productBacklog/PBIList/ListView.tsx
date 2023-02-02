import styled from "@emotion/styled"
import React from "react"
import { usePBIListModel } from "./ListModel"
import { MilestoneCreateForm } from "./MilestoneCreateForm"
import PlusIconSVG from "./plus-icon.svg"
import { PBISubList } from "./SubListView"

export const PBIListView: React.FC = () => {
  const model = usePBIListModel()
  return (
    <Root>
      {model.creating ? (
        <MilestoneCreateForm />
      ) : (
        <AddButton type="button" onClick={model.startCreating}>
          <PlusIcon />
        </AddButton>
      )}

      {model.data.subLists.map((sl) => (
        <PBISubList subList={sl} key={sl.id} />
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
  top: 8,
  right: 12,
  padding: 0,
  height: 28,
  width: 28,
  boxShadow: "-3px 3px 4px #e0e0e0",
  backgroundColor: "white",
  borderWidth: 0,
  borderRadius: 4,
  "&:active": {
    backgroundColor: "#ffffdd",
    boxShadow: "-1px 1px 1px #d0d0d0"
  }
})

const PlusIcon = () => <PlusIconSVG width={20} height={20} viewBox="0 0 73 73" />
