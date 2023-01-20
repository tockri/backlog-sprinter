import React from "react"
import { ArrayUtil } from "../../../util/ArrayUtil"
import { Dispatcher, useRecoilReducer } from "../../../util/RecoilReducer"
import { Issue, IssueData } from "../../backlog/Issue"
import { CustomNumberField } from "../../backlog/ProjectInfo"
import { stateSelector } from "../common/atom"
import { AppState } from "../common/types"
import { IssueDataWithOrder, PBIListChangeEvent } from "./PBIList/PBIListData"
import { ProductBacklogAction, ProductBacklogChanged, ProductBacklogLoaded, productBacklogReducer } from "./Reducer"

export type ViewModel = {
  readonly items: ReadonlyArray<IssueDataWithOrder> | null
  readonly onChange: (events: ReadonlyArray<PBIListChangeEvent>) => Promise<void>
}

export const useViewModel = (): ViewModel => {
  const [state, dispatch] = useRecoilReducer(productBacklogReducer, stateSelector)

  React.useEffect(() => {
    if (!state.productBacklogItems) {
      load(dispatch, state).then()
    }
  }, [dispatch, state])
  return {
    items: getItems(state),
    onChange: onChange(state, dispatch)
  }
}

type DispatchType = Dispatcher<AppState, ProductBacklogAction>

const load = async (dispatch: DispatchType, state: AppState) => {
  const { projectInfo, orderCustomField, settings, productBacklogItems: productBacklogs } = state
  if (projectInfo && settings.pbiIssueTypeId && orderCustomField && !productBacklogs) {
    const { project, statuses } = projectInfo
    const issues = await Issue.searchUnclosedInIssueType(project, statuses, settings.pbiIssueTypeId, orderCustomField)
    dispatch(ProductBacklogLoaded(issues))
  }
}

const onChange =
  (state: AppState, dispatch: DispatchType) =>
  async (events: ReadonlyArray<PBIListChangeEvent>): Promise<void> => {
    const customField = state.orderCustomField
    if (customField) {
      const chunked = ArrayUtil.chunk(events, 5)
      const updated: IssueData[] = []
      for (const chunk of chunked) {
        const issues = await Promise.all(
          chunk.map((ev) =>
            Issue.changeMilestoneAndCustomFieldValue(
              ev.issueId,
              ev.milestoneId !== undefined ? ev.milestoneId : null,
              ev.order !== undefined ? ev.order : null,
              customField
            )
          )
        )
        updated.push(...issues)
      }
      dispatch(ProductBacklogChanged(updated))
    }
  }

const getItems = (state: AppState) =>
  state.productBacklogItems &&
  state.productBacklogItems.map((issue) => ({
    ...issue,
    order: state.orderCustomField && getOrderValue(state.orderCustomField, issue)
  }))

const getOrderValue = (orderCusomField: CustomNumberField, issue: IssueData): number | null => {
  const field = issue.customFields.find((cf) => cf.id === orderCusomField.id)
  if (field) {
    return field.value !== null ? Number(field.value) : null
  } else {
    return null
  }
}
