import { Dispatcher, useRecoilReducer } from "../../../util/RecoilReducer"
import { Issue, IssueData } from "../../backlog/Issue"
import { Version } from "../../backlog/ProjectInfo"
import { stateSelector } from "../common/atom"
import { AppState } from "../common/types"
import { GroupedList, ProductBacklogAction, ProductBacklogLoaded, productBacklogReducer } from "./Reducer"

type DispatchType = Dispatcher<AppState, ProductBacklogAction>
type AsyncVMFunc = (dispatch: DispatchType, state: AppState) => () => Promise<void>

export type PBIListState = GroupedList<Version, IssueData>
export type PBISubList = PBIListState["groups"][number]

const load: AsyncVMFunc = (dispatch, state) => async () => {
  const { projectInfo, orderCustomField, settings, productBacklogItems: productBacklogs } = state
  if (projectInfo && settings.pbiIssueTypeId && orderCustomField && !productBacklogs) {
    const { project, statuses } = projectInfo
    const issues = await Issue.searchUnclosedInIssueType(project, statuses, settings.pbiIssueTypeId, orderCustomField)
    dispatch(ProductBacklogLoaded(issues))
  }
}

const backlogTable = (state: AppState) => (): PBIListState => {
  const table = new Map<number, { id: string; head: Version | null; items: IssueData[] }>()
  state.productBacklogItems?.forEach((item) => {
    const milestone = item.milestone.find((m) => m.startDate && m.releaseDueDate) || null
    const colId = milestone?.id || 0
    if (!table.has(colId)) {
      table.set(colId, { id: "" + (milestone?.id || 0), head: milestone, items: [] })
    }
    table.get(colId)?.items.push(item)
  })
  const groups = Array.from(table.values()).sort((c1, c2) => {
    const getTime = (d?: string | null): number => (d ? new Date(d).getTime() : Number.MAX_VALUE)
    const t1 = getTime(c1.head?.releaseDueDate)
    const t2 = getTime(c2.head?.releaseDueDate)
    console.log({ t1, c1, t2, c2 })
    return t1 - t2
  })
  return { groups }
}

export type ProjectProductBacklogViewModel = {
  readonly loaded: boolean
  readonly load: () => Promise<void>
  readonly backlogTable: () => PBIListState
}

export const useProjectProductBacklogViewModel = (): ProjectProductBacklogViewModel => {
  const [state, dispatch] = useRecoilReducer(stateSelector, productBacklogReducer)
  return {
    loaded: !!state.productBacklogItems,
    load: load(dispatch, state),
    backlogTable: backlogTable(state)
  }
}
