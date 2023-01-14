import styled from "@emotion/styled"
import React from "react"
import { DateUtil } from "../../../util/DateUtil"
import { IssueData } from "../../backlog/Issue"
import { Version } from "../../backlog/ProjectInfo"
import { NestedList, NestedListAction, NestedListData } from "./NestedList"

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
  const [nList, dispatch] = React.useReducer(
    (data: PBIListData, action: NestedListAction) => NestedList.reducer(data, action),
    nest(items)
  )
  console.log(dispatch)

  return (
    <>
      {nList.subLists.map((column) => (
        <PBISubList column={column} key={column.head?.id || 0} />
      ))}
    </>
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
      <SLBody>
        {column.items.map((item, index) => (
          <PBIItem item={item} key={item.id} index={index} milestone={milestone} />
        ))}
      </SLBody>
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
  minHeight: 300
})

type DragItem = {
  readonly item: IssueData
  readonly milestone: Version | null
  readonly index: number
}

type PBIProps = DragItem

type DragInfo = {
  dragging: boolean
}

const PBIItem: React.FC<PBIProps> = (props) => {
  const { item } = props
  return (
    <Cell>
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
      <Summary>!!!{item.summary}</Summary>
    </Cell>
  )
}

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
