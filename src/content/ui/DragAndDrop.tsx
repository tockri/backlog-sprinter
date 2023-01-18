import styled from "@emotion/styled"
import React, { PropsWithChildren } from "react"
import { ObjectUtil } from "../../util/ObjectUtil"

type DragContext<T = any> = {
  hoverring: T | null
  dragging: T | null
}

const dragContext = React.createContext<DragContext>({ hoverring: null, dragging: null })

type DragAndDropProviderProps = React.PropsWithChildren

export const DragAndDropProvider = (props: DragAndDropProviderProps): React.ReactElement => {
  return <dragContext.Provider value={{ hoverring: null, dragging: null }}>{props.children}</dragContext.Provider>
}

type DropPointProps<T> = React.PropsWithChildren & {
  readonly item: T
  readonly canOver: (dragging: T) => boolean
}

export const Droppable = <T,>(props: DropPointProps<T>): React.ReactElement => {
  const { item, children } = props
  const context: DragContext<T> = React.useContext(dragContext)
  const timer = React.useRef<number>(0)
  const [hover, setHover] = React.useState(false)
  const canOver = () => {
    const { dragging } = context
    if (dragging) {
      return props.canOver(dragging)
    } else {
      return false
    }
  }
  const onEnter = (e: React.DragEvent<HTMLDivElement>) => {
    if (canOver()) {
      e.preventDefault()
      setHover(true)
      window.clearTimeout(timer.current)
      context.hoverring = item
    }
  }
  const onLeave = () => {
    timer.current = window.setTimeout(() => {
      if (ObjectUtil.isStrictEqual(context.hoverring, item)) {
        context.hoverring = null
      }
      setHover(false)
      timer.current = 0
    }, 50)
  }
  const over = hover && ObjectUtil.isStrictEqual(context.hoverring, item)
  return (
    <DropPointView className={over ? "hover" : ""} onDragEnter={onEnter} onDragOver={onEnter} onDragLeave={onLeave}>
      {children}
    </DropPointView>
  )
}

const DropPointView = styled.div({
  minHeight: 20,
  transition: "padding 0.1s ease",
  "&.hover": {
    minHeight: 50,
    paddingTop: 8
  }
})

type DraggableProps<T> = PropsWithChildren & {
  readonly item: T
  readonly onDragEnd: (dropped: T) => void
}

export const Draggable = <T,>(props: DraggableProps<T>): React.ReactElement => {
  const context = React.useContext<DragContext<T>>(dragContext)
  return (
    <div
      draggable={true}
      onDragStart={() => {
        context.dragging = props.item
      }}
      onDragEnd={() => {
        const hp = context.hoverring
        if (hp) {
          props.onDragEnd(hp)
          context.dragging = null
          context.hoverring = null
        }
      }}
    >
      {props.children}
    </div>
  )
}
