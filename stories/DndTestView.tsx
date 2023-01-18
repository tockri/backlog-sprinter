import styled from "@emotion/styled"
import React from "react"
import { DragAndDropProvider, Draggable, Droppable } from "../src/content/ui/DragAndDrop"

export const DndTestView: React.FC = () => {
  const [hover, setHover] = React.useState(false)
  return (
    <div style={{ position: "relative" }}>
      <DragAndDropProvider>
        <DndTestDraggable index={1} />
        <DndTestDraggable index={2} />
        <DndTestDraggable index={3} />
        <DndTestDraggable index={4} />
        <Droppable item={{ index: 5 }} canDrop={(i) => i.index !== 4} hoverStateChanged={(h) => setHover(h)}>
          <DropArea className={hover ? "hover" : ""}>drop here</DropArea>
        </Droppable>
      </DragAndDropProvider>
    </div>
  )
}

const DropArea = styled.div({
  height: 50,
  backgroundColor: "#e0f0f0",
  "&.hover": {
    backgroundColor: "#f0f0e0"
  }
})

const DndTestDraggable: React.FC<{ index: number }> = (props) => {
  const { index } = props
  const Pane = styled.div({
    display: "inline-block",
    width: 100,
    height: 40,
    backgroundColor: "#ccddff"
  })

  return (
    <Draggable
      item={{ index }}
      onDragEnd={(where) => {
        console.log(`dropped ${index} to ${where.index}`)
      }}
    >
      <Droppable item={{ index }}>
        <Pane>drag me ({props.index})</Pane>
      </Droppable>
    </Draggable>
  )
}
