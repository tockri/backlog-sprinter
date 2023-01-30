import { Immutable } from "immer"
import { useAtomValue, useSetAtom } from "jotai"
import React from "react"
import { Version } from "../../../backlog/ProjectInfo"
import { formInfoAtom } from "../../app/State"
import { UserLang } from "../../types"
import { ProductBacklogAction, productBacklogAtom } from "../State"
import { PBIListData } from "./ListData"

type PBISubListModel = Immutable<{
  lang: UserLang
  setArrangeHovered: (index: number, hover: boolean) => void
  isArrangeHovered: (index: number) => boolean
  setMoveHovered: (issueId: number, hover: boolean) => void
  isMoveHovered: (issueId: number) => boolean
  createNewIssue: (summary: string) => void
}>

type PBISubList = PBIListData["subLists"][number]

type HoverState = Immutable<{
  issueId: number
  type: "move" | "arrange"
}>

export const usePBISubListModel = (subList: PBISubList): PBISubListModel => {
  const [hover, setHover] = React.useState<HoverState | null>(null)
  const dispatch = useSetAtom(productBacklogAtom)
  const formInfo = useAtomValue(formInfoAtom)

  return {
    lang: formInfo.lang,
    setArrangeHovered: (issueId: number, hover: boolean) => {
      if (hover) {
        setHover({
          issueId,
          type: "arrange"
        })
      } else {
        setHover((curr) => (curr?.issueId === issueId ? null : curr))
      }
    },
    isArrangeHovered: (issueId) => hover?.issueId === issueId && hover.type === "arrange",
    setMoveHovered: (issueId: number, hover: boolean) => {
      if (hover) {
        setHover({
          issueId,
          type: "move"
        })
      } else {
        setHover((curr) => (curr?.issueId === issueId ? null : curr))
      }
    },
    isMoveHovered: (issueId: number) => hover?.issueId === issueId && hover.type === "move",
    createNewIssue: createNewIssue(subList.head, dispatch)
  }
}

const createNewIssue =
  (milestone: Version | null, dispatch: (action: ProductBacklogAction) => void) => (summary: string) => {
    dispatch({
      type: "ProductBacklogCreate",
      milestone,
      summary
    })
  }
