import React, { PropsWithChildren } from "react"
import { ObjectUtil } from "../../util/ObjectUtil"

/* eslint-disable  @typescript-eslint/no-explicit-any */
class DragContext<T = any> {
  private dragging: Record<string, T | null> = {}
  private hoverring: Record<string, T | null> = {}
  private endFunc: Record<string, (() => void) | null> = {}
  setDragging(type: string, t: T | null) {
    this.dragging[type] = t
  }
  getDragging(type: string): T | null {
    return this.dragging[type]
  }
  setHoverring(type: string, t: T | null) {
    this.hoverring[type] = t
  }
  getHoverring(type: string): T | null {
    return this.hoverring[type]
  }
  setEndFunc(type: string, func: (() => void) | null) {
    this.endFunc[type] = func
  }
  executeEndFunc(type: string) {
    const func = this.endFunc[type]
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
  const context: DragContext<T> = React.useContext(dragContext)

  const timer = React.useRef<number>(0)
  const hover = React.useRef<boolean>(false)

  const acceptable = () => {
    const dragging = context.getDragging(type)
    if (dragging) {
      return canDrop ? canDrop(dragging) : true
    } else {
      return false
    }
  }

  const onEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    window.clearTimeout(timer.current)
    if (acceptable() && context.getHoverring(type) !== item) {
      context.setHoverring(type, item)
      context.setEndFunc(type, onLeave)
      if (!hover.current) {
        hover.current = true
        hoverStateChanged && hoverStateChanged(true)
      }
    }
  }

  const onLeave = () => {
    timer.current = window.setTimeout(() => {
      timer.current = 0
      if (ObjectUtil.isStrictEqual(context.getHoverring(type), item)) {
        context.setHoverring(type, null)
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
  const context = React.useContext<DragContext<T>>(dragContext)
  return (
    <div
      draggable={true}
      onDragStart={(e) => {
        e.dataTransfer.dropEffect = "move"
        context.setDragging(type, item)
        onDragStart && onDragStart()
      }}
      onDragEnd={() => {
        const hp = context.getHoverring(type)
        if (hp) {
          context.setDragging(type, null)
          context.setHoverring(type, null)
          context.executeEndFunc(type)
          context.setEndFunc(type, null)
        }
        onDragEnd(hp)
      }}
    >
      {props.children}
    </div>
  )
}
