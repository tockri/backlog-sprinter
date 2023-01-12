import React from "react"
import { Dispatcher, useRecoilReducer } from "../../../util/RecoilReducer"
import { Issue, IssueData } from "../../backlog/Issue"
import { Version } from "../../backlog/ProjectInfo"
import { stateSelector } from "../common/atom"
import { AppState } from "../common/types"
import { NestedList } from "./NestedList"
import { ProductBacklogAction, ProductBacklogLoaded, productBacklogReducer } from "./Reducer"

type DispatchType = Dispatcher<AppState, ProductBacklogAction>
type AsyncVMFunc = (dispatch: DispatchType, state: AppState) => () => Promise<void>

export type PBIListState = NestedList.List<Version, IssueData>
export type PBISubList = PBIListState["subLists"][number]

const load: AsyncVMFunc = (dispatch, state) => async () => {
  const { projectInfo, orderCustomField, settings, productBacklogItems: productBacklogs } = state
  if (projectInfo && settings.pbiIssueTypeId && orderCustomField && !productBacklogs) {
    const { project, statuses } = projectInfo
    const issues = await Issue.searchUnclosedInIssueType(project, statuses, settings.pbiIssueTypeId, orderCustomField)
    dispatch(ProductBacklogLoaded(issues))
  }
}

const backlogTable = (state: AppState) => (): PBIListState => {
  if (state.productBacklogItems) {
    const itemToHead = (item: IssueData): Version | null =>
      item.milestone.find((m) => m.startDate && m.releaseDueDate) || null
    const headId = (head: Version): string => "" + head.id
    const sortKey = (head: Version | null): number =>
      head && head.releaseDueDate ? Date.parse(head.releaseDueDate) : Number.MAX_VALUE
    return NestedList.nest(state.productBacklogItems, { itemToHead, headId, sortKey })
  } else {
    return {
      subLists: []
    }
  }
}

export type ProjectProductBacklogViewModel = {
  readonly loaded: boolean
  readonly backlogTable: () => PBIListState
}

export const useProjectProductBacklogViewModel = (): ProjectProductBacklogViewModel => {
  const [state, dispatch] = useRecoilReducer(stateSelector, productBacklogReducer)
  const startLoad = load(dispatch, state)
  React.useEffect(() => {
    if (state.productBacklogItems) {
      startLoad()
    }
  }, [state.productBacklogItems, startLoad])
  return {
    loaded: !!state.productBacklogItems,
    backlogTable: backlogTable(state)
  }
}
