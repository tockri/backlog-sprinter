import styled from "@emotion/styled"
import React, { PropsWithChildren } from "react"
import { ObjectUtil } from "../../util/ObjectUtil"

/* eslint-disable  @typescript-eslint/no-explicit-any */
class DragContext<T = any> {
  private dragging: T | null = null
  private hoverring: T | null = null
  private endFunc: (() => void) | null = null
  setDragging(t: T | null) {
    this.dragging = t
  }
  getDragging(): T | null {
    return this.dragging
  }
  setHoverring(t: T | null) {
    this.hoverring = t
  }
  getHoverring(): T | null {
    return this.hoverring
  }
  setEndFunc(func: (() => void) | null) {
    this.endFunc = func
  }
  executeEndFunc() {
    if (this.endFunc) {
      this.endFunc()
    }
  }
}

const dragContext = React.createContext<DragContext>(new DragContext())

type DragAndDropProviderProps = React.PropsWithChildren

export const DragAndDropProvider = (props: DragAndDropProviderProps): React.ReactElement => {
  const { children } = props
  const context = React.useRef(new DragContext())
  return <dragContext.Provider value={context.current}>{children}</dragContext.Provider>
}

type DropPointProps<T> = React.PropsWithChildren & {
  readonly item: T
  readonly canDrop?: (dragging: T) => boolean
  readonly hoverStateChanged?: (hover: boolean) => void
}

export const Droppable = <T,>(props: DropPointProps<T>): React.ReactElement => {
  const { item, children, canDrop, hoverStateChanged } = props
  const context: DragContext<T> = React.useContext(dragContext)

  const timer = React.useRef<number>(0)
  const hover = React.useRef<boolean>(false)

  const acceptable = () => {
    const dragging = context.getDragging()
    if (dragging) {
      return canDrop ? canDrop(dragging) : true
    } else {
      return false
    }
  }

  const onEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    window.clearTimeout(timer.current)
    if (acceptable() && context.getHoverring() !== item) {
      context.setHoverring(item)
      context.setEndFunc(onLeave)
      if (!hover.current) {
        hover.current = true
        hoverStateChanged && hoverStateChanged(true)
      }
    }
  }

  const onLeave = () => {
    timer.current = window.setTimeout(() => {
      timer.current = 0
      if (ObjectUtil.isStrictEqual(context.getHoverring(), item)) {
        context.setHoverring(null)
      }
      if (hover.current) {
        hover.current = false
        hoverStateChanged && hoverStateChanged(false)
      }
    }, 50)
  }

  return (
    <div onDragEnter={onEnter} onDragOver={onEnter} onDragLeave={onLeave}>
      {children}
    </div>
  )
}

type DraggableProps<T> = PropsWithChildren & {
  readonly item: T
  readonly onDragEnd: (dropped: T) => void
}

export const Draggable = <T,>(props: DraggableProps<T>): React.ReactElement => {
  const { item, onDragEnd } = props
  const context = React.useContext<DragContext<T>>(dragContext)
  return (
    <DraggableView
      draggable={true}
      onDragStart={(e) => {
        e.dataTransfer.dropEffect = "move"
        context.setDragging(item)
      }}
      onDragEnd={() => {
        const hp = context.getHoverring()
        if (hp) {
          onDragEnd(hp)
          context.setDragging(null)
          context.setHoverring(null)
          context.executeEndFunc()
          context.setEndFunc(null)
        }
      }}
    >
      {props.children}
    </DraggableView>
  )
}

const DraggableView = styled.div({
  // cursor: "default",
  // ":active *": {
  //   cursor: "move"
  // }
})
