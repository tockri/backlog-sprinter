import styled from "@emotion/styled"
import React from "react"
import { Draggable } from "../../../ui/DragAndDrop"
import { usePBIItemModel } from "./ItemModel"
import { IssueDataWithOrder } from "./ListData"

type PBIItemViewProps = {
  subListId: string
  index: number
  issue: IssueDataWithOrder
}

export const PBIItemView: React.FC<PBIItemViewProps> = (props) => {
  const { issue, subListId, index } = props
  const model = usePBIItemModel()
  const item = { subListId, index }

  return (
    <Draggable
      item={item}
      onDragEnd={(where) => {
        model.move({ src: item, dst: where })
      }}
    >
      <Cell onClick={() => model.selectItem(issue.id)} className={model.isSelected(issue.id) ? "selected" : ""}>
        <CellHeader>
          <IssueKey>
            <a href={`/view/${issue.issueKey}`} target="_blank" rel="noreferrer">
              {issue.issueKey}
            </a>
          </IssueKey>
          <StatusView>
            <StatusIcon style={{ backgroundColor: issue.status.color }} />
            {issue.status.name}
          </StatusView>
        </CellHeader>
        <Summary>{issue.summary}</Summary>
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
  backgroundColor: "#ffffff",
  "&.selected": {
    border: "2px solid #e0c0c0"
  }
})

const CellHeader = styled.div({ display: "flex" })

const IssueKey = styled.div({
  display: "inline-block",
  marginRight: "1em"
})

const StatusView = styled.div({
  display: "inline-block",
  marginLeft: "1em"
})

const StatusIcon = styled.div({
  display: "inline-block",
  width: "1em",
  height: "1em",
  borderRadius: "0.5em",
  marginRight: "0.5em",
  position: "relative",
  top: 1
})

const Summary = styled.div({ overflow: "hidden" })
