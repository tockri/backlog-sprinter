import styled from "@emotion/styled"
import React from "react"
import { cnu } from "../../../ui/cnu"

import { useAtom, useAtomValue } from "jotai/index"
import { BspEnvState } from "../../../state/BspEnvState"
import { ResourceImg } from "../../../ui/ResourceImg"
import { i18n } from "../i18n"
import { ItemSelectionState } from "../state/ItemSelectionState"
import { PBIListState } from "../state/PBIListState"
import { PBISubListView } from "./PBISubListView"

export const PBIListView: React.FC = () => {
  const data = useAtomValue(PBIListState.atom)
  const [sel, selDispatch] = useAtom(ItemSelectionState.atom)
  const isMilestoneAdding = sel.type === "MilestoneAdding"
  const env = useAtomValue(BspEnvState.atom)
  const startAddMilestone = () => {
    if (isMilestoneAdding) {
      selDispatch(ItemSelectionState.Action.Deselect)
    } else {
      selDispatch(ItemSelectionState.Action.StartMilestoneAdding)
    }
  }

  const t = i18n(env.lang)
  return (
    <Root>
      <ListPane>
        {data.subLists.map((sl) => (
          <PBISubListView subList={sl} key={sl.id} />
        ))}
      </ListPane>
      <AddButton type="button" onClick={startAddMilestone} className={cnu({ selected: isMilestoneAdding })}>
        <PlusIcon />
        {t.addMilestone}
      </AddButton>
    </Root>
  )
}

const Root = styled.div({
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  flexGrow: 1
})

const AddButton = styled.button({
  flexShrink: 0,
  flexGrow: 0,
  height: 36,
  backgroundColor: "white",
  borderWidth: 0,
  borderTopLeftRadius: 4,
  borderTopRightRadius: 4,
  boxShadow: "0 -2px 3px #d0d0d0",
  "&:active": {
    backgroundColor: "#eeffdd",
    boxShadow: "-1px 1px 1px #d0d0d0"
  },
  "&.selected": {
    border: "2px solid #e0c0c0"
  },
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: 4,
  justifyContent: "center"
})

const ListPane = styled.div({
  flexGrow: 1,
  overflow: "auto"
})

const PlusIcon = () => <ResourceImg path="images/plus-icon.svg" style={{ width: 14, height: 14 }} />
