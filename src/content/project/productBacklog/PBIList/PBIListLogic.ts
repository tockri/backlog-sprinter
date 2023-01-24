import React from "react"
import { ArrayUtil } from "../../../../util/ArrayUtil"
import { NestedList } from "../../../../util/NestedList"
import { composeReducers, Dispatcher, ReducerFunc, useRecoilReducer } from "../../../../util/RecoilReducer"
import { BacklogApi, BacklogApiContext } from "../../../backlog/BacklogApiForReact"
import { IssueData } from "../../../backlog/Issue"
import { CustomNumberField } from "../../../backlog/ProjectInfo"
import { stateSelector } from "../../common/atom"
import { AppState } from "../../common/types"
import { ProductBacklogAction, ProductBacklogChanged, productBacklogReducer } from "../Reducer"
import { IssueDataWithOrder, PBIListAction, PBIListChangeEvent, PBIListData, PBIListDataHandler } from "./PBIListData"

export type PBIListLogic = {
  readonly dispatch: React.Dispatch<PBIListAction>
  readonly pbiListData: PBIListData
}

export const useLogic = (): PBIListLogic => {
  const [appState, appDispatch] = useRecoilReducer(productBacklogReducer, stateSelector)
  const api = React.useContext(BacklogApiContext)
  const items = getItems(appState)
  const [pbiListData, dispatch] = React.useReducer(
    composeReducers(NestedList.reducer, sideEffect(appState, api, appDispatch)),
    PBIListDataHandler.nest(items)
  )
  return {
    pbiListData,
    dispatch
  }
}

const getItems = (state: AppState): ReadonlyArray<IssueDataWithOrder> =>
  (state.productBacklogItems &&
    state.productBacklogItems.map((issue) => ({
      ...issue,
      order: state.orderCustomField && getOrderValue(state.orderCustomField, issue)
    }))) ||
  []

const getOrderValue = (orderCusomField: CustomNumberField, issue: IssueData): number | null => {
  const field = issue.customFields.find((cf) => cf.id === orderCusomField.id)
  if (field) {
    return field.value !== null ? Number(field.value) : null
  } else {
    return null
  }
}

const sideEffect =
  (
    state: AppState,
    api: BacklogApi,
    appDispatch: Dispatcher<AppState, ProductBacklogAction>
  ): ReducerFunc<PBIListData, PBIListAction> =>
  (data, action) => {
    const customField = state.orderCustomField
    if (customField) {
      updateIssues(customField, PBIListDataHandler.buildEvent(data, action), api, appDispatch).then()
    }
    return data
  }

const updateIssues = async (
  customField: CustomNumberField,
  events: ReadonlyArray<PBIListChangeEvent>,
  api: BacklogApi,
  appDispatch: Dispatcher<AppState, ProductBacklogAction>
) => {
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
  appDispatch(ProductBacklogChanged(updated))
}
