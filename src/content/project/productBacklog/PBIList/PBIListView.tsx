import styled from "@emotion/styled"
import React from "react"
import { cnu } from "../../../ui/cnu"
import { usePBIListModel } from "./PBIListModel"

import { PBISubListView } from "./PBISubListView"
import PlusIconSVG from "./plus-icon.svg"

export const PBIListView: React.FC = () => {
  const model = usePBIListModel()
  const { isMilestoneAdding } = model
  return (
    <Root>
      <AddButton type="button" onClick={model.startAddMilestone} className={cnu({ selected: isMilestoneAdding })}>
        <PlusIcon />
      </AddButton>
      <ListPane>
        {model.data.subLists.map((sl) => (
          <PBISubListView subList={sl} key={sl.id} />
        ))}
      </ListPane>
    </Root>
  )
}

const Root = styled.div({
  position: "relative",
  flexGrow: 1,
  overflow: "auto"
})

const AddButton = styled.button({
  position: "sticky",
  top: 1,
  left: "calc(100% - 25px)",
  padding: 4,
  height: 24,
  width: 24,
  boxShadow: "-3px 3px 4px #e0e0e0",
  backgroundColor: "white",
  borderWidth: 0,
  borderRadius: 4,
  "&:active": {
    backgroundColor: "#eeffdd",
    boxShadow: "-1px 1px 1px #d0d0d0"
  },
  "&.selected": {
    border: "2px solid #e0c0c0"
  }
})

const ListPane = styled.div({
  marginTop: -24
})

const PlusIcon = () => <PlusIconSVG width={14} height={14} viewBox="0 0 73 73" />
