import styled from "@emotion/styled"
import React from "react"
import { DateUtil } from "../../../../util/DateUtil"
import { NestedListAction } from "../../../../util/NestedList"
import { Droppable } from "../../../ui/DragAndDrop"
import { ItemView } from "./ItemView"
import { PBIListData } from "./PBIListData"
import { useSubListLogic } from "./SubListLogic"

type PBISubList = PBIListData["subLists"][number]

type PBISubListProps = {
  readonly subList: PBISubList
  readonly dispatch: React.Dispatch<NestedListAction>
}

type DragItem = {
  index: number
  subListId: string
}

const canDropOn =
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

export const PBISubList: React.FC<PBISubListProps> = (props) => {
  const { subList, dispatch } = props
  const milestone = subList.head
  const releaseDate = milestone?.releaseDueDate ? DateUtil.shortDateString(new Date(milestone.releaseDueDate)) : ""
  const logic = useSubListLogic()
  const lastIdx = subList.items.length
  return (
    <SL>
      <SLTitle>
        <MilestoneName>🏁{milestone?.name || "(No milestone)"}</MilestoneName>
        <ReleaseDate>{releaseDate}</ReleaseDate>
      </SLTitle>
      <SLBody>
        {subList.items.map((issue, index) => (
          <Droppable
            key={issue.id}
            item={{ index, subListId: subList.id }}
            canDrop={canDropOn(index, subList.id)}
            hoverStateChanged={(h) => logic.setHovered(index, h)}
          >
            <DropArea className={logic.isHovered(index) ? "hover" : ""}>
              <ItemView issue={issue} key={index} index={index} subListId={subList.id} dispatch={dispatch} />
            </DropArea>
          </Droppable>
        ))}
        <Droppable
          item={{ index: lastIdx, subListId: subList.id }}
          canDrop={canDropOn(lastIdx, subList.id)}
          hoverStateChanged={(h) => logic.setHovered(lastIdx, h)}
        >
          <DropArea className={logic.isHovered(lastIdx) ? "hover empty" : "empty"} />
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
  "&.hover": {
    paddingTop: 12
  }
})

const SL = styled.div({
  marginBottom: 8,
  paddingTop: 4
})

const SLTitle = styled.div({
  paddingBottom: 4
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
