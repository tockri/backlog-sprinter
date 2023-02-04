import { Immutable } from "immer"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import React from "react"
import { DateUtil } from "../../../../util/DateUtil"
import { Version } from "../../../backlog/ProjectInfo"
import { Environment } from "../../app/state/Environment"
import { UserLang } from "../../types"
import { ProductBacklog, ProductBacklogAction } from "../state/ProductBacklog"
import { SelectedItem } from "../state/SelectedItem"
import { PBIListData } from "./ListData"

type PBISubListModel = Immutable<{
  lang: UserLang
  setArrangeHovered: (index: number, hover: boolean) => void
  isArrangeHovered: (index: number) => boolean
  setMoveHovered: (issueId: number, hover: boolean) => void
  isMoveHovered: (issueId: number) => boolean
  createNewIssue: (summary: string) => void
  selectMilestone: () => void
  milestoneName: string
  isSelected: boolean
  releaseDate: string
}>

type PBISubList = PBIListData["subLists"][number]

type HoverState = Immutable<{
  issueId: number
  type: "move" | "arrange"
}>

export const usePBISubListModel = (subList: PBISubList): PBISubListModel => {
  const [hover, setHover] = React.useState<HoverState | null>(null)
  const dispatch = useSetAtom(ProductBacklog.atom)
  const { lang } = useAtomValue(Environment.atom)
  const [sel, select] = useAtom(SelectedItem.atom)
  const milestone = subList.head
  const milestoneId = milestone?.id || 0
  const releaseDate = milestone?.releaseDueDate ? DateUtil.shortDateString(new Date(milestone.releaseDueDate)) : ""
  const isSelected = sel.type === "Milestone" && sel.milestoneId === milestoneId
  const milestoneName = milestone?.name || "(No milestone)"

  return {
    lang,
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
    createNewIssue: createNewIssue(subList.head, dispatch),
    selectMilestone: () => {
      if (sel.type === "Milestone" && sel.milestoneId === milestoneId) {
        select(SelectedItem.Action.Deselect)
      } else {
        select(SelectedItem.Action.SelectMilestone(milestoneId))
      }
    },
    milestoneName,
    isSelected,
    releaseDate
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
