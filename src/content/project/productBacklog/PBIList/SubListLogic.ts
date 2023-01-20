import React from "react"

export type SubListLogic = {
  setHovered: (index: number, hover: boolean) => void
  isHovered: (index: number) => boolean
}

export const useSubListLogic = (): SubListLogic => {
  const [hoverIndex, setHoverIndex] = React.useState(-1)

  return {
    setHovered: (index: number, hover: boolean) => {
      if (!hover) {
        setHoverIndex(-1)
      } else {
        setHoverIndex(index)
      }
    },
    isHovered: (index) => index === hoverIndex
  }
}
