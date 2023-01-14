import styled from "@emotion/styled"
import React from "react"
import { DndProvider, useDrag, useDrop } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
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
  console.log(data)

  return (
    <DndProvider backend={HTML5Backend}>
      {data.subLists.map((sl) => (
        <GroupView group={sl} key={sl.id} dispatch={dispatch} />
      ))}
    </DndProvider>
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

const DropPointView = styled.div({
  height: 15,
  "&.hover": {
    backgroundColor: "#ffe0e0",
    height: 30
  }
})

const DropPoint: React.FC<{ groupId: string; index: number; dispatch: React.Dispatch<NestedListAction> }> = (props) => {
  const { groupId, index, dispatch } = props
  const [, drop] = useDrop<DragItem>({
    accept: "test",
    drop: (item) => {
      const src: [string, number] = [item.groupId, item.index]
      const dst: [string, number] = [groupId, index]
      setHover(false)
      dispatch(NestedList.Move(src, dst))
    }
  })
  const [hover, setHover] = React.useState(false)
  return (
    <DropPointView
      ref={drop}
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
  const [collected, drag] = useDrag<DragItem, unknown, { dragging: boolean }>({
    type: "test",
    item: { item, groupId, index },
    collect: (monitor) => {
      return {
        dragging: monitor.isDragging()
      }
    }
  })
  return (
    <ListItem ref={drag} id={`listitem-${item.id}`}>
      {item.order} | {item.id}
    </ListItem>
  )
}
