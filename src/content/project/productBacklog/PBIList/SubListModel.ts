import { Immutable } from "immer"
import React from "react"

type PBISubListModel = Immutable<{
  setArrangeHovered: (index: number, hover: boolean) => void
  isArrangeHovered: (index: number) => boolean
  setMoveHovered: (issueId: number, hover: boolean) => void
  isMoveHovered: (issueId: number) => boolean
}>

export const usePBISubListModel = (): PBISubListModel => {
  const [hoverIndex, setHoverIndex] = React.useState(-1)
  const [moveHoverId, setMoveHoverId] = React.useState<number | null>(null)
  const [adding, setAdding] = React.useState(false)

  return {
    setArrangeHovered: (index: number, hover: boolean) => {
      if (hover) {
        setHoverIndex(index)
      } else {
        setHoverIndex((hi) => (hi === index ? -1 : hi))
      }
    },
    isArrangeHovered: (index) => index === hoverIndex,
    setMoveHovered: (issueId: number, hover: boolean) => {
      if (hover) {
        setMoveHoverId(issueId)
      } else {
        setMoveHoverId((i) => (i === issueId ? null : i))
      }
    },
    isMoveHovered: (issueId: number) => moveHoverId === issueId
  }
}
