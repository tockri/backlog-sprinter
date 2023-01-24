import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { SetAtom } from "jotai/core/atom"
import { ArrayUtil } from "../../../../util/ArrayUtil"
import { NestedList, NLLocation } from "../../../../util/NestedList"
import { BacklogApi } from "../../../backlog/BacklogApiForReact"
import { IssueData } from "../../../backlog/Issue"
import { CustomNumberField } from "../../../backlog/ProjectInfo"
import { ImmerAtomSetter } from "../../../util/JotaiUtil"
import { backlogApiAtom, orderCustomFieldAtom } from "../../app/State"
import { productBacklogAtom, selectedIssueIdAtom } from "../State"
import { PBIListChangeEvent, PBIListData, PBIListDataHandler } from "./PBIListData"

type ItemModel = {
  readonly selectItem: (issueId: number) => void
  readonly isSelected: (issueId: number) => boolean
  readonly move: (src: NLLocation, dst: NLLocation) => void
}

export const useItemModel = (): ItemModel => {
  const [selected, select] = useAtom(selectedIssueIdAtom)
  const setData = useSetAtom(productBacklogAtom)
  const orderCustomField = useAtomValue(orderCustomFieldAtom)
  const api = useAtomValue(backlogApiAtom)
  if (orderCustomField) {
    return {
      selectItem: selectItem(selected, select),
      isSelected: (issueId) => selected === issueId,
      move: move(setData, orderCustomField, api)
    }
  } else {
    throw new Error("orderCustomField is not set.")
  }
}

type Sel = number | null

const selectItem = (selected: Sel, select: SetAtom<Sel, void>) => (issueId: number) => {
  if (issueId === selected) {
    select(null)
  } else {
    select(issueId)
  }
}

const move =
  (setData: ImmerAtomSetter<PBIListData>, customField: CustomNumberField, api: BacklogApi) =>
  (src: NLLocation, dst: NLLocation) => {
    setData((data) => {
      NestedList.mutateMove(data, src, dst)
      const events = PBIListDataHandler.buildMovedEvents(data, { src, dst })
      updateIssues(customField, events, api).then()
    })
  }

const updateIssues = async (
  customField: CustomNumberField,
  events: ReadonlyArray<PBIListChangeEvent>,
  api: BacklogApi
): Promise<ReadonlyArray<IssueData>> => {
  const chunked = ArrayUtil.chunk(events, 5)
  const updated: IssueData[] = []
  for (const chunk of chunked) {
    const issues = await Promise.all(
      chunk.map((ev) =>
        api.issue.changeMilestoneAndCustomFieldValue(
          ev.issueId,
          ev.milestoneId !== undefined ? ev.milestoneId : null,
          ev.order !== undefined ? ev.order : null,
          customField
        )
      )
    )
    updated.push(...issues)
  }
  return updated
}
