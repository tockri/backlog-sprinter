import React from "react"
import { Dispatcher, useRecoilReducer } from "../../../util/RecoilReducer"
import { BacklogApi, BacklogApiContext } from "../../backlog/BacklogApiForReact"
import { IssueData } from "../../backlog/Issue"
import { stateSelector } from "../common/atom"
import { AppState } from "../common/types"
import { ProductBacklogAction, ProductBacklogLoaded, productBacklogReducer } from "./Reducer"

export type Logic = {
  readonly selectedItem: IssueData | null
  readonly markdownOnDescription: boolean
  readonly isReady: boolean
}

export const useLogic = (): Logic => {
  const [state, dispatch] = useRecoilReducer(productBacklogReducer, stateSelector)
  const api = React.useContext(BacklogApiContext)

  React.useEffect(() => {
    if (!state.productBacklogItems) {
      load(dispatch, state, api).then()
    }
  }, [dispatch, state, api])
  return {
    isReady: !!state.productBacklogItems,
    selectedItem: state.selectedItem,
    markdownOnDescription: state.projectInfo?.project.textFormattingRule === "markdown"
  }
}

type DispatchType = Dispatcher<AppState, ProductBacklogAction>

const load = async (dispatch: DispatchType, state: AppState, api: BacklogApi) => {
  const { projectInfo, orderCustomField, settings, productBacklogItems: productBacklogs } = state
  if (projectInfo && settings.pbiIssueTypeId && orderCustomField && !productBacklogs) {
    const { project, statuses } = projectInfo
    const issues = await api.issue.searchUnclosedInIssueType(
      project,
      statuses,
      settings.pbiIssueTypeId,
      orderCustomField
    )
    dispatch(ProductBacklogLoaded(issues))
  }
}
