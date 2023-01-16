import { Global } from "@emotion/react"
import styled from "@emotion/styled"
import React from "react"
import { DndProvider, useDrag } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { DateUtil } from "../../../util/DateUtil"
import { IssueData } from "../../backlog/Issue"
import { Version } from "../../backlog/ProjectInfo"
import { NestedList, NestedListAction, NestedListData, NestMethods } from "./NestedList"
import { PBIListEventBuilder } from "./PBIListEventBuilder"
import { PBIListChangeEvent } from "./ViewModel"

export type IssueDataWithOrder = IssueData & { order: number | null }
export type PBIListData = NestedListData<Version, IssueDataWithOrder>

type DropPoint = {
  subListId: string
  index: number
}

type DragContext = {
  hoverPoint: DropPoint | null
  dragging: DropPoint | null
}
const dragContext = React.createContext<DragContext>({ hoverPoint: null, dragging: null })

export type PBIListProps = {
  readonly items: ReadonlyArray<IssueDataWithOrder>
  readonly onChange?: (events: ReadonlyArray<PBIListChangeEvent>) => void
}

export const PBIList: React.FC<PBIListProps> = (props) => {
  const { items, onChange } = props
  const combinedReducer = (data: PBIListData, action: NestedListAction) => {
    const updated = NestedList.reducer(data, action)
    const events = PBIListEventBuilder.build(updated, action, nestMethods)
    onChange && onChange(events)
    return updated
  }
  const [nList, dispatch] = React.useReducer(combinedReducer, nest(items))

  return (
    <DndProvider backend={HTML5Backend} options={{ enableMouseEvents: true }}>
      <Global
        styles={{
          "body.dragging, body.dragging *": {
            cursor: "default !important"
          }
        }}
      />
      <dragContext.Provider value={{ hoverPoint: null, dragging: null }}>
        {nList.subLists.map((sl) => (
          <PBISubList subList={sl} dispatch={dispatch} key={sl.id} />
        ))}
      </dragContext.Provider>
    </DndProvider>
  )
}

const nestMethods: NestMethods<Version, IssueDataWithOrder> = {
  itemToHead: (item) => item.milestone.find((m) => m.startDate && m.releaseDueDate) || null,
  headId: (head) => (head ? "" + head.id : "--"),
  sortKey: (head) => (head && head.releaseDueDate ? Date.parse(head.releaseDueDate) : Number.MAX_VALUE)
}

const nest = (items: ReadonlyArray<IssueDataWithOrder>): PBIListData => {
  return NestedList.nest<Version, IssueDataWithOrder>(items, nestMethods)
}

type PBISubList = PBIListData["subLists"][number]

type PBISubListProps = {
  readonly subList: PBISubList
  readonly dispatch: React.Dispatch<NestedListAction>
}

const PBISubList: React.FC<PBISubListProps> = (props) => {
  const { subList, dispatch } = props
  const milestone = subList.head
  const releaseDate = milestone?.releaseDueDate ? DateUtil.shortDateString(new Date(milestone.releaseDueDate)) : ""
  return (
    <SL>
      <SLTitle>
        <MilestoneName>🏁{milestone?.name || "(No milestone)"}</MilestoneName>
        <ReleaseDate>{releaseDate}</ReleaseDate>
      </SLTitle>
      <SLBody>
        {subList.items.map((issue, index) => (
          <DropPoint key={issue.id} index={index} subListId={subList.id}>
            <PBItem issue={issue} index={index} subListId={subList.id} dispatch={dispatch} />
          </DropPoint>
        ))}
        <DropPoint index={subList.items.length} subListId={subList.id} />
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

type DropPointProps = {
  subListId: string
  index: number
  children?: React.ReactNode
}

const DropPoint: React.FC<DropPointProps> = (props) => {
  const { subListId, index, children } = props
  const context = React.useContext(dragContext)
  const timer = React.useRef<number>(0)
  const [hover, setHover] = React.useState(false)
  const canOver = () => {
    const { dragging } = context
    if (dragging) {
      if (dragging.subListId === subListId) {
        const diff = index - dragging.index
        if (diff === 0 || diff === 1) {
          return false
        }
      }
      return true
    } else {
      return false
    }
  }
  const onEnter = () => {
    if (canOver()) {
      setHover(true)
      window.clearTimeout(timer.current)
      context.hoverPoint = {
        subListId,
        index
      }
    }
  }
  const onLeave = () => {
    timer.current = window.setTimeout(() => {
      if (context.hoverPoint?.subListId === subListId && context.hoverPoint?.index === index) {
        context.hoverPoint = null
      }
      setHover(false)
      timer.current = 0
    }, 50)
  }
  const over = context.hoverPoint?.subListId === subListId && context.hoverPoint?.index === index && hover
  return (
    <DropPointView className={over ? "hover" : ""} onDragEnter={onEnter} onDragOver={onEnter} onDragLeave={onLeave}>
      {children}
    </DropPointView>
  )
}

const DropPointView = styled.div({
  minHeight: 20,
  transition: "padding 0.2s ease",
  "&.hover": {
    minHeight: 50,
    paddingTop: 8
  }
})

type PBItemProps = {
  subListId: string
  index: number
  issue: IssueData
  dispatch: React.Dispatch<NestedListAction>
}

const PBItem: React.FC<PBItemProps> = (props) => {
  const { issue, subListId, index, dispatch } = props
  const context = React.useContext(dragContext)
  const [, drag] = useDrag<{ subListId: string }>({
    type: "PBItem",
    item: props
  })
  // useEffect(() => {
  //   console.log("issue", issue)
  // }, [])
  return (
    <Cell
      ref={drag}
      onDragStart={() => {
        context.dragging = {
          subListId,
          index
        }
      }}
      onDragEnd={() => {
        const hp = context.hoverPoint
        if (hp) {
          if (context.dragging?.subListId === subListId && context.dragging.index === index) {
            context.dragging = null
            context.hoverPoint = null
          }
          dispatch(NestedList.Move([subListId, index], [hp.subListId, hp.index]))
        }
      }}
    >
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
