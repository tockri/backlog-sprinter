import styled from "@emotion/styled"
import React from "react"
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd"
import { DateUtil } from "../../../util/DateUtil"
import { IssueData } from "../../backlog/Issue"
import { Version } from "../../backlog/ProjectInfo"
import { NestedList, NestedListData } from "./NestedList"

export type PBIListData = NestedListData<Version, IssueData>

export type PBIListProps = {
  readonly items: ReadonlyArray<IssueData>
}

const nest = (items: ReadonlyArray<IssueData>): PBIListData => {
  return NestedList.nest<Version, IssueData>(items, {
    itemToHead: (item) => item.milestone.find((m) => m.startDate && m.releaseDueDate) || null,
    headId: (head) => (head ? "" + head.id : "--"),
    sortKey: (head) => (head && head.releaseDueDate ? Date.parse(head.releaseDueDate) : Number.MAX_VALUE)
  })
}

export const PBIList: React.FC<PBIListProps> = (props) => {
  const { items } = props
  const [nList, dispatch] = React.useReducer(NestedList.reducer<Version, IssueData>, nest(items))

  return (
    <DragDropContext
      onDragEnd={(result, provided) => {
        const { source, destination } = result
        if (source && destination) {
          const src: [string, number] = [source.droppableId, source.index]
          const dst: [string, number] = [destination.droppableId, destination.index]
          dispatch(NestedList.Move(src, dst))
          provided.announce("moved.")
        }
      }}
    >
      {nList.subLists.map((column) => (
        <PBISubList column={column} key={column.head?.id || 0} />
      ))}
    </DragDropContext>
  )
}

type PBISubList = PBIListData["subLists"][number]

type ColumnProps = {
  readonly column: PBISubList
}

const PBISubList: React.FC<ColumnProps> = (props) => {
  const { column } = props
  const milestone = column.head
  const releaseDate = milestone?.releaseDueDate ? DateUtil.shortDateString(new Date(milestone.releaseDueDate)) : ""
  return (
    <SL>
      <SLTitle>
        <MilestoneName>🏁{milestone?.name || "(No milestone)"}</MilestoneName>
        <ReleaseDate>{releaseDate}</ReleaseDate>
      </SLTitle>
      <Droppable droppableId={column.id}>
        {(provided) => (
          <SLBody ref={provided.innerRef} {...provided.droppableProps}>
            {column.items.map((item, index) => (
              <PBIItem item={item} key={item.id} index={index} />
            ))}
            {provided.placeholder}
          </SLBody>
        )}
      </Droppable>
    </SL>
  )
}

const SL = styled.div({
  position: "relative",
  marginBottom: 8,
  paddingTop: 20
})

const SLTitle = styled.div({
  position: "absolute",
  top: 0
})

const MilestoneName = styled.span({
  fontWeight: "bold"
})

const ReleaseDate = styled.span({
  display: "inline-block",
  marginLeft: "2em"
})

const SLBody = styled.div({
  minHeight: 50
})

type PBIProps = {
  readonly item: IssueData
  readonly index: number
}

const PBIItem: React.FC<PBIProps> = (props) => {
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

const Cell = styled.div({
  position: "relative",
  padding: 4,
  border: "1px solid #d0d0d0",
  borderRadius: 2,
  color: "#404040",
  margin: "4px 0",
  backgroundColor: "#ffffff",
  left: "auto !important",
  top: "auto !important"
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
