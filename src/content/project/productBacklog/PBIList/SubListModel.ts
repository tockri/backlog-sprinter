import React from "react"

type PBISubListModel = {
  setHovered: (index: number, hover: boolean) => void
  isHovered: (index: number) => boolean
}

export const usePBISubListModel = (): PBISubListModel => {
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
