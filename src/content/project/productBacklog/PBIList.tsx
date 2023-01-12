import styled from "@emotion/styled"
import React from "react"
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd"
import { IssueData } from "../../backlog/Issue"
import { PBIListState, PBISubList } from "./ViewModel"

export type PBIListProps = {
  readonly table: PBIListState
}

export const PBIList: React.FC<PBIListProps> = (props) => {
  const { table } = props

  return (
    <DragDropContext
      onDragEnd={(result, provided) => {
        console.log({ result, provided })
      }}
    >
      <Board>
        {table.groups.map((column) => (
          <Column column={column} key={column.head?.id || 0} />
        ))}
      </Board>
    </DragDropContext>
  )
}

const Board = styled.div`
  overflow: auto;
`

type ColumnProps = {
  readonly column: PBISubList
}

const Column: React.FC<ColumnProps> = (props) => {
  const { column } = props
  return (
    <Lane>
      <LaneTitle>🏁{column.head?.name || "(No milestone)"}</LaneTitle>
      <Droppable droppableId={`${column.head?.id || 0}`}>
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {column.items.map((item, index) => (
              <PBI item={item} key={item.id} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </Lane>
  )
}

const Lane = styled.div`
  margin-bottom: 8px;
`

const LaneTitle = styled.div`
  font-weight: bold;
`

type PBIProps = {
  readonly item: IssueData
  readonly index: number
}

const PBI: React.FC<PBIProps> = (props) => {
  const { item, index } = props
  return (
    <Draggable draggableId={`${item.id}`} index={index}>
      {(provided) => (
        <Cell className="bsp-pbi" {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef}>
          <CellHeader>
            <IssueKey>
              <a href={`/view/${item.issueKey}`} target="_blank" rel="noreferrer">
                {item.issueKey}
              </a>
            </IssueKey>
            <StatusView>
              <StatusIcon style={{ backgroundColor: item.status.color }} />
              {item.status.name}
            </StatusView>
          </CellHeader>
          <Summary>{item.summary}</Summary>
        </Cell>
      )}
    </Draggable>
  )
}

const Cell = styled.div`
  padding: 4px;
  border: 1px solid #d0d0d0;
  border-radius: 2px;
  color: #404040;
  margin: 4px;
  background-color: #ffffff;
  left: auto !important;
  top: auto !important;
`

const CellHeader = styled.div`
  display: flex;
`

const IssueKey = styled.div`
  display: inline-block;
  margin-right: 1em;
`

const StatusView = styled.div`
  display: inlinne-block;
  margin-left: 1em;
`

const StatusIcon = styled.div`
  display: inline-block;
  width: 1em;
  height: 1em;
  border-radius: 0.5em;
  margin-right: 0.5em;
  position: relative;
  top: 1px;
`

const Summary = styled.div`
  overflow: hidden;
`
