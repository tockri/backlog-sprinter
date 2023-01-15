import styled from "@emotion/styled"
import React from "react"
import { NestedList, NestedListAction } from "../productBacklog/NestedList"

type TestHead = {
  readonly id: string
}
type TestItem = {
  readonly id: string
  readonly head: TestHead
  readonly order: number
}

const heads: ReadonlyArray<TestHead> = new Array(3).fill("").map((_, i) => ({ id: `h${i}` }))
const items: ReadonlyArray<TestItem> = new Array(10).fill("").map((_, i) => ({
  id: `i${i}`,
  head: heads[Math.floor(i / 4)],
  order: 0
}))

const origData = NestedList.nest<TestHead, TestItem>(items, {
  headId: (head) => head?.id || "-",
  itemToHead: (item) => item.head,
  sortKey: (head) => (head ? parseInt(head.id.substring(1)) : Number.MAX_VALUE)
})

type Data = typeof origData
type Group = Data["subLists"][number]
type Item = Group["items"][number]

const reducer = (data: Data, action: NestedListAction): Data => NestedList.reducer(data, action)

export const VelocityView: React.FC = () => {
  const [data, dispatch] = React.useReducer(reducer, origData)

  return (
    <div>
      {data.subLists.map((sl) => (
        <GroupView group={sl} key={sl.id} dispatch={dispatch} />
      ))}
    </div>
  )
}

const SubList = styled.div({
  minHeight: 20,
  backgroundColor: "#e0e0e0",
  padding: 30,
  marginBottom: 10
})

const GroupView: React.FC<{ group: Group; dispatch: React.Dispatch<NestedListAction> }> = (props) => {
  const { group, dispatch } = props
  return (
    <SubList>
      <DropPoint groupId={group.id} index={0} dispatch={dispatch} />
      {group.items.map((item, index) => (
        <div key={index}>
          <ItemView item={item} groupId={group.id} index={index} />
          <DropPoint groupId={group.id} index={index + 1} dispatch={dispatch} />
        </div>
      ))}
    </SubList>
  )
}

const DropPoint: React.FC<{ groupId: string; index: number; dispatch: React.Dispatch<NestedListAction> }> = (props) => {
  const { groupId, index, dispatch } = props
  // const [, drop] = useDrop<DragItem>({
  //   accept: "test",
  //   drop: (item) => {
  //     const src: [string, number] = [item.groupId, item.index]
  //     const dst: [string, number] = [groupId, index]
  //     setHover(false)
  //     dispatch(NestedList.Move(src, dst))
  //   }
  // })
  const [hover, setHover] = React.useState(false)
  return (
    <DropPointView
      className={hover ? "hover" : ""}
      onDragEnter={() => {
        setHover(true)
      }}
      onDragLeave={() => {
        setHover(false)
      }}
    />
  )
}

const DropPointView = styled.div({
  height: 15,
  "&.hover": {
    backgroundColor: "#ffe0e0",
    height: 30
  }
})

const ListItem = styled.div({
  margin: 0,
  backgroundColor: "#eecccc",
  padding: 8,
  ".dragging": {
    opacity: 0.5
  }
})

type DragItem = {
  item: Item
  groupId: string
  index: number
}

const ItemView: React.FC<{ item: Item; groupId: string; index: number }> = (props) => {
  const { item, groupId, index } = props
  // const [, drag] = useDrag<DragItem, unknown, { dragging: boolean }>({
  //   type: "test",
  //   item: { item, groupId, index },
  //   collect: (monitor) => {
  //     return {
  //       dragging: monitor.isDragging()
  //     }
  //   }
  // })
  return (
    <ListItem id={`listitem-${item.id}`}>
      {item.order} | {item.id}
    </ListItem>
  )
}

export const DndTestView: React.FC = () => {
  return (
    <div style={{ position: "relative" }}>
      <DndTestDropPoint />
      <DndTestDraggable id={1} />
      <DndTestDraggable id={2} />
      <DndTestDraggable id={3} />
      <DndTestDraggable id={4} />
    </div>
  )
}

const DndTestDropPoint: React.FC = () => {
  // const [, drop] = useDrop<{ id: number }>({
  //   accept: "test",
  //   drop: (item) => {
  //     addDropped((curr) => [...curr, item.id])
  //   }
  // })
  const [droppedItems, addDropped] = React.useState<number[]>([])
  const Pane = styled.div({
    height: 60,
    backgroundColor: "#ffccdd"
  })
  return (
    <Pane>
      drop here
      {droppedItems.join(",")}
    </Pane>
  )
}

const DndTestDraggable: React.FC<{ id: number }> = (props) => {
  // const [, drag] = useDrag({
  //   type: "test",
  //   item: props
  // })
  const Pane = styled.div({
    display: "inline-block",
    width: 100,
    height: 40,
    backgroundColor: "#ccddff"
  })
  const ref = React.useRef<HTMLDivElement>(null)

  return <Pane ref={ref}>drag me ({props.id})</Pane>
}
