import { IssueType } from "@/content/backlog/ProjectInfoApi"
import { IssueTypesState } from "@/content/state/ProjectInfoState"
import { DateUtil } from "@/util/DateUtil"
import { Immutable } from "immer"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import React from "react"
import { BspEnvState, UserLang } from "../../../state/BspEnvState"
import { ItemSelectionState } from "../state/ItemSelectionState"
import { PBIList } from "../state/PBIList"
import { PBIListState } from "../state/PBIListState"

type PBISubListModel = Immutable<{
  lang: UserLang
  setArrangeHovered: (index: number, hover: boolean) => void
  isArrangeHovered: (index: number) => boolean
  setMoveHovered: (issueId: number, hover: boolean) => void
  isMoveHovered: (issueId: number) => boolean
  addNewIssue: (summary: string) => void
  selectMilestone: () => void
  milestoneName: string
  isSelected: boolean
  releaseDate: string
  dataForTest: PBISubList
  pbiIssueType: IssueType | null
}>

type PBISubList = PBIList["subLists"][number]

type HoverState = Immutable<{
  issueId: number
  type: "move" | "arrange"
}>

export const usePBISubListModel = (subList: PBISubList): PBISubListModel => {
  const [hover, setHover] = React.useState<HoverState | null>(null)
  const dispatch = useSetAtom(PBIListState.atom)
  const { lang } = useAtomValue(BspEnvState.atom)
  const [sel, select] = useAtom(ItemSelectionState.atom)
  const milestone = subList.head
  const milestoneId = milestone?.id || 0
  const releaseDate = milestone?.releaseDueDate ? DateUtil.shortDateString(new Date(milestone.releaseDueDate)) : ""
  const isSelected = sel.type === "Milestone" && sel.milestoneId === milestoneId
  const milestoneName = milestone?.name || "(No milestone)"
  const pbiIssueType = useAtomValue(IssueTypesState.pbiIssueTypeAtom)

  return {
    lang,
    dataForTest: subList,
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
    addNewIssue: (summary: string) => {
      dispatch(PBIListState.Action.AddIssue(summary, milestone)).then()
    },
    selectMilestone: () => {
      if (sel.type === "Milestone" && sel.milestoneId === milestoneId) {
        select(ItemSelectionState.Action.Deselect)
      } else {
        select(ItemSelectionState.Action.SelectMilestone(milestoneId))
      }
    },
    milestoneName,
    isSelected,
    releaseDate,
    pbiIssueType
  }
}
