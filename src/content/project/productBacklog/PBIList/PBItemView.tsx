import styled from "@emotion/styled"
import { useAtom, useSetAtom } from "jotai/index"
import React from "react"
import { NLLocation } from "../../../../util/NestedList"
import { cnu } from "../../../ui/cnu"
import { Draggable } from "../../../ui/DragAndDrop"
import { ItemSelectionState } from "../state/ItemSelectionState"
import { IssueDataWithOrder } from "../state/PBIList"
import { PBIListState } from "../state/PBIListState"
import { StatusView } from "../StatusView"
import { StoryPointView } from "../StoryPointView"

type PBIItemViewProps = {
  subListId: string
  index: number
  issue: IssueDataWithOrder
}

export const PBItemView: React.FC<PBIItemViewProps> = (props) => {
  const { issue, subListId, index } = props
  const [selected, selectDispatch] = useAtom(ItemSelectionState.atom)
  const pbDispatch = useSetAtom(PBIListState.atom)
  const selectedIssueId = selected?.type === "Issue" ? selected.issueId : null
  const item = { subListId, index }
  const [dragging, setDragging] = React.useState(false)

  const selectItem = (issueId: number) => {
    if (issueId === selectedIssueId) {
      selectDispatch(ItemSelectionState.Action.Deselect)
    } else {
      selectDispatch(ItemSelectionState.Action.SelectIssue(issueId))
    }
  }
  const isSelected = selectedIssueId === issue.id

  return (
    <Draggable<NLLocation>
      type="arrange"
      item={item}
      onDragEnd={(where) => {
        if (where) {
          pbDispatch(PBIListState.Action.ListMove(item, where)).then()
        }
        setDragging(false)
      }}
      onDragStart={() => setDragging(true)}
    >
      <Cell onClick={() => selectItem(issue.id)} className={cnu({ selected: isSelected, dragging: dragging })}>
        <Body>
          <CellHeader>
            <IssueKey>
              <a href={`/view/${issue.issueKey}`} target="_blank" rel="noreferrer">
                {issue.issueKey}
              </a>
            </IssueKey>
            <StatusView status={issue.status} />
          </CellHeader>
          <Summary>{issue.summary}</Summary>
        </Body>
        <Side>
          <StoryPointView issue={issue} />
        </Side>
      </Cell>
    </Draggable>
  )
}

const Cell = styled.div({
  padding: 4,
  border: "1px solid #d0d0d0",
  borderRadius: 2,
  color: "#404040",
  margin: "4px 0",
  display: "flex",
  "&.selected": {
    border: "2px solid #e0c0c0"
  },
  "&.dragging": {
    opacity: 0.5,
    backgroundColor: "#ffeedd"
  }
})

const Body = styled.div({
  flexGrow: 1
})

const Side = styled.div({
  flexShrink: 1,
  display: "flex",
  alignItems: "center"
})

const CellHeader = styled.div({ display: "flex" })

const IssueKey = styled.div({
  display: "inline-block",
  marginRight: 8,
  whiteSpace: "nowrap"
})

const Summary = styled.div({ overflow: "hidden" })
