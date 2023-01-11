import { Dispatcher, useRecoilReducer } from "../../../util/RecoilReducer"
import { Issue, IssueData } from "../../backlog/Issue"
import { stateSelector } from "../common/atom"
import { AppState } from "../common/types"
import { ProductBacklogAction, ProductBacklogLoaded, productBacklogReducer } from "./Reducer"

type DispatchType = Dispatcher<AppState, ProductBacklogAction>
type AsyncVMFunc = (dispatch: DispatchType, state: AppState) => () => Promise<void>

const load: AsyncVMFunc = (dispatch, state) => async () => {
  const { projectInfo, orderCustomField, settings, productBacklogItems: productBacklogs } = state
  if (projectInfo && settings.pbiIssueTypeId && orderCustomField && !productBacklogs) {
    const { project, statuses } = projectInfo
    const issues = await Issue.searchUnclosedInIssueType(project, statuses, settings.pbiIssueTypeId, orderCustomField)
    dispatch(ProductBacklogLoaded(issues))
  }
}

export type ProjectProductBacklogViewModel = {
  readonly backlogItems: ReadonlyArray<IssueData> | null
  readonly load: () => Promise<void>
}

export const useProjectProductBacklogViewModel = (): ProjectProductBacklogViewModel => {
  const [state, dispatch] = useRecoilReducer(stateSelector, productBacklogReducer)
  return {
    backlogItems: state.productBacklogItems,
    load: load(dispatch, state)
  }
}
