import styled from "@emotion/styled"
import { Immutable } from "immer"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import React from "react"
import { DateUtil } from "../../../../util/DateUtil"
import { NLLocation } from "../../../../util/NestedList"
import { Issue } from "../../../backlog/IssueApi"
import { BspEnvState } from "../../../state/BspEnvState"
import { IssueTypesState } from "../../../state/ProjectInfoState"
import { HBox, VBox } from "../../../ui/Box"
import { cnu } from "../../../ui/cnu"
import { Droppable } from "../../../ui/DragAndDrop"
import { EditableField } from "../../../ui/EditableField"
import { i18n } from "../i18n"
import { ItemSelectionState } from "../state/ItemSelectionState"
import { PBISubList } from "../state/PBIList"
import { PBIListState } from "../state/PBIListState"
import { PBItemView } from "./PBItemView"

type PBISubListProps = {
  readonly subList: PBISubList
}

type DragItem = {
  index: number
  subListId: string
}

const canArrange =
  (index: number, subListId: string) =>
  (dragging: DragItem): boolean => {
    if (dragging.subListId === subListId) {
      const diff = index - dragging.index
      if (diff === 0 || diff === 1) {
        return false
      }
    }
    return true
  }

const canMove =
  (issue: Issue) =>
  (dragging: Issue): boolean => {
    return dragging.parentIssueId !== issue.id
  }

type Sum = {
  total: number
  closed: number
}
const calcSum = (subList: PBISubList): Sum => {
  let total = 0
  let closed = 0
  subList.items.forEach((i) => {
    const size = i.actualHours || i.estimatedHours || 1
    total += size
    if (i.status.id === 4) {
      closed += size
    }
  })
  return { total, closed }
}

type HoverState = Immutable<{
  issueId: number
  type: "move" | "arrange"
}>

export const PBISubListView: React.FC<PBISubListProps> = (props) => {
  const { subList } = props
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
  const lastIdx = subList.items.length
  const sum = calcSum(subList)
  const t = i18n(lang)

  const setArrangeHovered = (issueId: number, _hover: boolean) => {
    if (_hover) {
      setHover({
        issueId,
        type: "arrange"
      })
    } else {
      setHover((curr) => (curr?.issueId === issueId ? null : curr))
    }
  }

  const isArrangeHovered = (issueId: number) => hover?.issueId === issueId && hover.type === "arrange"

  const setMoveHovered = (issueId: number, hover: boolean) => {
    if (hover) {
      setHover({
        issueId,
        type: "move"
      })
    } else {
      setHover((curr) => (curr?.issueId === issueId ? null : curr))
    }
  }

  const isMoveHovered = (issueId: number) => hover?.issueId === issueId && hover.type === "move"

  const addNewIssue = (summary: string) => {
    dispatch(PBIListState.Action.AddIssue(summary, milestone)).then()
  }

  const selectMilestone = () => {
    if (sel.type === "Milestone" && sel.milestoneId === milestoneId) {
      select(ItemSelectionState.Action.Deselect)
    } else {
      select(ItemSelectionState.Action.SelectMilestone(milestoneId))
    }
  }

  return (
    <SL>
      <SLTitle tabIndex={0} onClick={() => selectMilestone()} className={cnu({ selected: isSelected })}>
        <MilestoneName>🏁{milestoneName}</MilestoneName>
        <ReleaseDate>{releaseDate}</ReleaseDate>
        <Sum>
          {sum.closed} / {sum.total}
        </Sum>
      </SLTitle>
      <SLBody>
        {subList.items.map((issue, index) => (
          <Droppable
            key={issue.id}
            type="moveParent"
            item={issue}
            canDrop={canMove(issue)}
            hoverStateChanged={(h) => setMoveHovered(issue.id, h)}
          >
            <Droppable<NLLocation>
              type="arrange"
              item={{ index, subListId: subList.id }}
              canDrop={canArrange(index, subList.id)}
              hoverStateChanged={(h) => setArrangeHovered(issue.id, h)}
            >
              <DropArea
                className={cnu({
                  arrangeHover: isArrangeHovered(issue.id),
                  moveHover: isMoveHovered(issue.id)
                })}
              >
                <PBItemView issue={issue} key={index} index={index} subListId={subList.id} />
              </DropArea>
            </Droppable>
          </Droppable>
        ))}
        <Droppable
          type="arrange"
          item={{ index: lastIdx, subListId: subList.id }}
          canDrop={canArrange(lastIdx, subList.id)}
          hoverStateChanged={(h) => setArrangeHovered(-1, h)}
        >
          <DropArea className={cnu("empty", { arrangeHover: isArrangeHovered(-1) })}>
            <VBox>
              <EditableField
                placeholder={t.addNewItem}
                onFix={(summary) => addNewIssue(summary)}
                viewStyle={{
                  padding: 4
                }}
                editStyle={{
                  flexGrow: 1
                }}
                blurAction="submit"
                lang={lang}
                onStart={(value, setValue) => {
                  if (!value) {
                    setValue(pbiIssueType?.templateSummary || "")
                  }
                }}
              />
            </VBox>
          </DropArea>
        </Droppable>
      </SLBody>
    </SL>
  )
}

const DropArea = styled.div({
  transition: "padding 0.2s ease",
  "&.empty": {
    paddingBottom: 20
  },
  "&.arrangeHover": {
    paddingTop: 12
  },
  "&.moveHover": {
    backgroundColor: "#c0e0e0"
  }
})

const SL = styled.div({
  marginBottom: 8,
  padding: 8
})

const SLTitle = styled(HBox)({
  marginBottom: 4,
  padding: 4,
  alignItems: "center",
  "&.selected": {
    border: "2px solid #e0c0c0"
  }
})

const MilestoneName = styled.div({
  fontWeight: "bold",
  fontSize: "1.3rem"
})

const ReleaseDate = styled.div({
  marginLeft: "2em"
})

const Sum = styled.div({
  marginLeft: "auto",
  backgroundColor: "#e0e0e0",
  borderRadius: 4,
  textAlign: "center",
  padding: "4px 8px"
})

const SLBody = styled.div({
  padding: 0
})
