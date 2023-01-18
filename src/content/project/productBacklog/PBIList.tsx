import { Global } from "@emotion/react"
import styled from "@emotion/styled"
import React from "react"
import { DateUtil } from "../../../util/DateUtil"
import { DragAndDropProvider, Draggable, Droppable } from "../../ui/DragAndDrop"
import { NestedList, NestedListAction } from "./NestedList"
import { IssueDataWithOrder, nestBacklogItems, PBIListData } from "./PBI"
import { PBIListEventBuilder } from "./PBIListEventBuilder"
import { PBIListChangeEvent } from "./ViewModel"

export type PBIListProps = {
  readonly items: ReadonlyArray<IssueDataWithOrder>
  readonly onChange?: (events: ReadonlyArray<PBIListChangeEvent>) => void
}

export const PBIList: React.FC<PBIListProps> = (props) => {
  const { items, onChange } = props
  const combinedReducer = (data: PBIListData, action: NestedListAction) => {
    const updated = NestedList.reducer(data, action)
    const events = PBIListEventBuilder.build(updated, action)
    onChange && onChange(events)
    return updated
  }
  const [nList, dispatch] = React.useReducer(combinedReducer, nestBacklogItems(items))

  return (
    <DragAndDropProvider>
      <Global
        styles={{
          "body.dragging, body.dragging *": {
            cursor: "default !important"
          }
        }}
      />
      {nList.subLists.map((sl) => (
        <PBISubList subList={sl} dispatch={dispatch} key={sl.id} />
      ))}
    </DragAndDropProvider>
  )
}

type PBISubList = PBIListData["subLists"][number]

type PBISubListProps = {
  readonly subList: PBISubList
  readonly dispatch: React.Dispatch<NestedListAction>
}

type DragItem = {
  index: number
  subListId: string
}

const canDropOn =
  (index: number, subListId: string) =>
  (dragging: DragItem): boolean => {
    if (dragging.subListId === subListId) {
      const diff = index - dragging.index
      if (diff === 0 || diff === 1) {
        return false
      }
    }
    return true
  }

const PBISubList: React.FC<PBISubListProps> = (props) => {
  const { subList, dispatch } = props
  const milestone = subList.head
  const releaseDate = milestone?.releaseDueDate ? DateUtil.shortDateString(new Date(milestone.releaseDueDate)) : ""
  const [hover, setHover] = React.useState(false)
  return (
    <SL>
      <SLTitle>
        <MilestoneName>🏁{milestone?.name || "(No milestone)"}</MilestoneName>
        <ReleaseDate>{releaseDate}</ReleaseDate>
      </SLTitle>
      <SLBody>
        {subList.items.map((issue, index) => (
          <PBItem issue={issue} key={index} index={index} subListId={subList.id} dispatch={dispatch} />
        ))}
        <Droppable
          item={{ index: subList.items.length, subListId: subList.id }}
          canDrop={canDropOn(subList.items.length, subList.id)}
          hoverStateChanged={setHover}
        >
          <DropArea className={hover ? "hover empty" : "empty"} />
        </Droppable>
      </SLBody>
    </SL>
  )
}

const SL = styled.div({
  marginBottom: 8,
  paddingTop: 4
})

const SLTitle = styled.div({
  paddingBottom: 4
})

const MilestoneName = styled.span({
  fontWeight: "bold"
})

const ReleaseDate = styled.span({
  display: "inline-block",
  marginLeft: "2em"
})

const SLBody = styled.div({
  padding: 0
})

type PBItemProps = {
  subListId: string
  index: number
  issue: IssueDataWithOrder
  dispatch: React.Dispatch<NestedListAction>
}

const PBItem: React.FC<PBItemProps> = (props) => {
  const { issue, subListId, index, dispatch } = props
  const [hover, setHover] = React.useState(false)

  return (
    <Draggable
      item={{ subListId, index }}
      onDragEnd={(where) => {
        dispatch(NestedList.Move([subListId, index], [where.subListId, where.index]))
      }}
    >
      <Droppable
        key={issue.id}
        item={{ index, subListId }}
        canDrop={canDropOn(index, subListId)}
        hoverStateChanged={setHover}
      >
        <DropArea className={hover ? "hover" : ""}>
          <Cell>
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
        </DropArea>
      </Droppable>
    </Draggable>
  )
}

const DropArea = styled.div({
  transition: "padding 0.2s ease",
  "&.empty": {
    minHeight: 30
  },
  "&.hover": {
    paddingTop: 12
  }
})

const Cell = styled.div({
  padding: 4,
  border: "1px solid #d0d0d0",
  borderRadius: 2,
  color: "#404040",
  margin: "4px 0",
  backgroundColor: "#ffffff"
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
