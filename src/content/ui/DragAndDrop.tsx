import React, { PropsWithChildren } from "react"
import { ObjectUtil } from "../../util/ObjectUtil"

type DragItem = {
  type: string
  item: unknown
}

/* eslint-disable  @typescript-eslint/no-explicit-any */
class DragContext {
  private dragging: DragItem | null = null
  private hovering: DragItem | null = null
  private endFunc: (() => void) | null = null
  setDragging<T>(type: string, item: T | null) {
    this.dragging = { type, item }
  }
  getDragging<T>(type: string): T | null {
    return (this.dragging?.type === type && (this.dragging?.item as T)) || null
  }
  setHovering<T>(type: string, item: T | null) {
    this.hovering = { type, item }
  }
  getHovering<T>(type: string): T | null {
    return (this.hovering?.type == type && (this.hovering?.item as T)) || null
  }
  setEndFunc(func: (() => void) | null) {
    this.endFunc = func
  }
  executeEndFunc() {
    const func = this.endFunc
    if (func) {
      func()
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
  readonly type: string
  readonly item: T
  readonly canDrop?: (dragging: T) => boolean
  readonly hoverStateChanged?: (hover: boolean) => void
}

export const Droppable = <T,>(props: DropPointProps<T>): React.ReactElement => {
  const { type, item, children, canDrop, hoverStateChanged } = props
  const context: DragContext = React.useContext(dragContext)

  const timer = React.useRef<number>(0)
  const hover = React.useRef<boolean>(false)

  const acceptable = () => {
    const dragging = context.getDragging<T>(type)
    if (dragging) {
      return canDrop ? canDrop(dragging) : true
    } else {
      return false
    }
  }

  const onEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    window.clearTimeout(timer.current)
    if (acceptable() && context.getHovering(type) !== item) {
      context.setHovering(type, item)
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
      if (ObjectUtil.isStrictEqual(context.getHovering(type), item)) {
        context.setHovering(type, null)
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
  readonly type: string
  readonly item: T
  readonly onDragEnd: (dropped: T | null) => void
  readonly onDragStart?: () => void
}

export const Draggable = <T,>(props: DraggableProps<T>): React.ReactElement => {
  const { type, item, onDragEnd, onDragStart } = props
  const context = React.useContext<DragContext>(dragContext)
  return (
    <div
      draggable={true}
      onDragStart={(e) => {
        e.dataTransfer.dropEffect = "move"
        context.setDragging(type, item)
        onDragStart && onDragStart()
      }}
      onDragEnd={() => {
        const hp = context.getHovering<T>(type)
        if (hp) {
          context.setDragging(type, null)
          context.setHovering(type, null)
          context.executeEndFunc()
          context.setEndFunc(null)
        }
        onDragEnd(hp)
      }}
    >
      {props.children}
    </div>
  )
}
