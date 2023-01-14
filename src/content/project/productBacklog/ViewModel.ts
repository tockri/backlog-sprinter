import React from "react"
import { Dispatcher, useRecoilReducer } from "../../../util/RecoilReducer"
import { Issue, IssueData } from "../../backlog/Issue"
import { stateSelector } from "../common/atom"
import { AppState } from "../common/types"
import { ProductBacklogAction, ProductBacklogLoaded, productBacklogReducer } from "./Reducer"

type DispatchType = Dispatcher<AppState, ProductBacklogAction>

const load = async (dispatch: DispatchType, state: AppState) => {
  const { projectInfo, orderCustomField, settings, productBacklogItems: productBacklogs } = state
  if (projectInfo && settings.pbiIssueTypeId && orderCustomField && !productBacklogs) {
    const { project, statuses } = projectInfo
    const issues = await Issue.searchUnclosedInIssueType(project, statuses, settings.pbiIssueTypeId, orderCustomField)
    dispatch(ProductBacklogLoaded(issues))
  }
}

export type ProjectProductBacklogViewModel = {
  readonly items: ReadonlyArray<IssueData> | null
}

export const useProjectProductBacklogViewModel = (): ProjectProductBacklogViewModel => {
  const [state, dispatch] = useRecoilReducer(productBacklogReducer, stateSelector)
  React.useEffect(() => {
    if (!state.productBacklogItems) {
      load(dispatch, state)
    }
  }, [dispatch, state])
  return {
    items: state.productBacklogItems
  }
}
