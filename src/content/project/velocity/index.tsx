import styled from "@emotion/styled"
import React from "react"
import { DndProvider, useDrag, useDrop } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"

export const DndTestView: React.FC = () => {
  return (
    <div style={{ position: "relative" }}>
      <DndProvider backend={HTML5Backend}>
        <DndTestDropPoint />
        <DndTestDraggable id={1} />
        <DndTestDraggable id={2} />
        <DndTestDraggable id={3} />
        <DndTestDraggable id={4} />
      </DndProvider>
    </div>
  )
}

const DndTestDropPoint: React.FC = () => {
  const [, drop] = useDrop<{ id: number }>({
    accept: "test",
    drop: (item) => {
      addDropped((curr) => [...curr, item.id])
    }
  })
  const [droppedItems, addDropped] = React.useState<number[]>([])
  const Pane = styled.div({
    height: 60,
    backgroundColor: "#ffccdd"
  })
  return (
    <Pane ref={drop}>
      drop here
      {droppedItems.join(",")}
    </Pane>
  )
}

const DndTestDraggable: React.FC<{ id: number }> = (props) => {
  const [, drag] = useDrag({
    type: "test",
    item: props
  })
  const Pane = styled.div({
    display: "inline-block",
    width: 100,
    height: 40,
    backgroundColor: "#ccddff"
  })

  return <Pane ref={drag}>drag me ({props.id})</Pane>
}
