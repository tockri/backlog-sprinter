import React from "react"
import { ArrayUtil } from "../../../util/ArrayUtil"
import { Dispatcher, useRecoilReducer } from "../../../util/RecoilReducer"
import { Issue, IssueData } from "../../backlog/Issue"
import { CustomNumberField } from "../../backlog/ProjectInfo"
import { stateSelector } from "../common/atom"
import { AppState } from "../common/types"
import { IssueDataWithOrder } from "./PBIList"
import { ProductBacklogAction, ProductBacklogChanged, ProductBacklogLoaded, productBacklogReducer } from "./Reducer"

type DispatchType = Dispatcher<AppState, ProductBacklogAction>

const load = async (dispatch: DispatchType, state: AppState) => {
  const { projectInfo, orderCustomField, settings, productBacklogItems: productBacklogs } = state
  if (projectInfo && settings.pbiIssueTypeId && orderCustomField && !productBacklogs) {
    const { project, statuses } = projectInfo
    const issues = await Issue.searchUnclosedInIssueType(project, statuses, settings.pbiIssueTypeId, orderCustomField)
    dispatch(ProductBacklogLoaded(issues))
  }
}

export type PBIListChangeEvent = {
  issueId: number
  milestoneId?: number | null
  order?: number | null
}

const applyChanges =
  (state: AppState, dispatch: DispatchType) =>
  async (events: ReadonlyArray<PBIListChangeEvent>): Promise<void> => {
    const customField = state.orderCustomField
    if (customField) {
      const chunked = ArrayUtil.chunk(events, 5)
      const updated: IssueData[] = []
      for (const chunk of chunked) {
        const issues = await Promise.all(
          chunk.map((ev) =>
            Issue.changeMilestoneAndCustomFieldValue(ev.issueId, ev.milestoneId || null, ev.order || null, customField)
          )
        )
        updated.push(...issues)
      }
      dispatch(ProductBacklogChanged(updated))
    }
  }

const getOrderValue = (orderCusomField: CustomNumberField, issue: IssueData): number | null => {
  const field = issue.customFields.find((cf) => cf.id === orderCusomField.id)
  if (field) {
    return Number(field.value)
  } else {
    return null
  }
}

export type ProjectProductBacklogViewModel = {
  readonly items: ReadonlyArray<IssueDataWithOrder> | null
  readonly orderCustomField: CustomNumberField | null
  readonly onChange: (events: ReadonlyArray<PBIListChangeEvent>) => void
}

export const useProjectProductBacklogViewModel = (): ProjectProductBacklogViewModel => {
  const [state, dispatch] = useRecoilReducer(productBacklogReducer, stateSelector)
  React.useEffect(() => {
    if (!state.productBacklogItems) {
      load(dispatch, state)
    }
  }, [dispatch, state])
  return {
    items:
      state.productBacklogItems &&
      state.productBacklogItems.map((issue) => ({
        ...issue,
        order: state.orderCustomField && getOrderValue(state.orderCustomField, issue)
      })),
    orderCustomField: state.orderCustomField,
    onChange: applyChanges(state, dispatch)
  }
}
