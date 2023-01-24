import React from "react"

export type SubListLogic = {
  setHovered: (index: number, hover: boolean) => void
  isHovered: (index: number) => boolean
}

export const useSubListLogic = (): SubListLogic => {
  const [hoverIndex, setHoverIndex] = React.useState(-1)

  return {
    setHovered: (index: number, hover: boolean) => {
      if (hover) {
        setHoverIndex(index)
      } else {
        setHoverIndex((hi) => (hi === index ? -1 : hi))
      }
    },
    isHovered: (index) => index === hoverIndex
  }
}
