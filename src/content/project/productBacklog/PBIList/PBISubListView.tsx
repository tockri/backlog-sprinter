import { Issue } from "@/content/backlog/IssueApi"
import { VBox } from "@/content/ui/Box"
import { cnu } from "@/content/ui/cnu"
import { Droppable } from "@/content/ui/DragAndDrop"
import { EditableField } from "@/content/ui/EditableField"
import { NLLocation } from "@/util/NestedList"
import styled from "@emotion/styled"
import React from "react"
import { i18n } from "../i18n"
import { PBISubList } from "../state/PBIList"
import { usePBISubListModel } from "./PBISubListModel"
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

export const PBISubListView: React.FC<PBISubListProps> = (props) => {
  const { subList } = props
  const model = React.useCallback(usePBISubListModel, [])(subList)
  const lastIdx = subList.items.length
  const t = i18n(model.lang)
  return (
    <SL>
      <SLTitle
        tabIndex={0}
        onClick={() => {
          model.selectMilestone()
        }}
        className={cnu({ selected: model.isSelected })}
      >
        <MilestoneName>🏁{model.milestoneName}</MilestoneName>
        <ReleaseDate>{model.releaseDate}</ReleaseDate>
      </SLTitle>
      <SLBody>
        {subList.items.map((issue, index) => (
          <Droppable
            key={issue.id}
            type="moveParent"
            item={issue}
            canDrop={canMove(issue)}
            hoverStateChanged={(h) => {
              model.setMoveHovered(issue.id, h)
            }}
          >
            <Droppable<NLLocation>
              type="arrange"
              item={{ index, subListId: subList.id }}
              canDrop={canArrange(index, subList.id)}
              hoverStateChanged={(h) => {
                model.setArrangeHovered(issue.id, h)
              }}
            >
              <DropArea
                className={cnu({
                  arrangeHover: model.isArrangeHovered(issue.id),
                  moveHover: model.isMoveHovered(issue.id)
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
          hoverStateChanged={(h) => model.setArrangeHovered(-1, h)}
        >
          <DropArea className={cnu("empty", { arrangeHover: model.isArrangeHovered(-1) })}>
            <VBox>
              <EditableField
                placeholder={t.addNewItem}
                onFix={(summary) => {
                  model.addNewIssue(summary)
                }}
                viewStyle={{
                  padding: 4
                }}
                editStyle={{
                  flexGrow: 1
                }}
                blurAction="submit"
                lang={model.lang}
                onStart={(value, setValue) => {
                  if (!value) {
                    setValue(model.pbiIssueType?.templateSummary || "")
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

const SLTitle = styled.div({
  paddingBottom: 4,
  "&.selected": {
    border: "2px solid #e0c0c0"
  }
})

const MilestoneName = styled.span({
  fontWeight: "bold"
})

const ReleaseDate = styled.span({
  display: "inline-block",
  marginLeft: "2em"
})

const SLBody = styled.div({
  padding: 0
})
