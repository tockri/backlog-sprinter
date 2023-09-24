import styled from "@emotion/styled"
import { useAtomValue } from "jotai"
import React from "react"
import { ItemSelectionState } from "../state/ItemSelectionState"
import { AddMilestoneFormView } from "./AddMilestoneFormView"
import { IssueAreaView } from "./IssueAreaView"
import { MilestoneView } from "./MilestoneView"

export const InfoAreaView: React.FC = () => {
  const item = useAtomValue(ItemSelectionState.atom)
  switch (item.type) {
    case "Issue":
      return (
        <Area>
          <IssueAreaView />
        </Area>
      )
    case "Milestone":
      return (
        <Area>
          <MilestoneView />
        </Area>
      )
    case "MilestoneAdding":
      return (
        <Area>
          <AddMilestoneFormView />
        </Area>
      )
    default:
      return <></>
  }
}

const Area = styled.div({
  width: "50%",
  height: "calc(100% - 12px)"
})
