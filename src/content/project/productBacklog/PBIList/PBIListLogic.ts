import React from "react"
import { NestedList, NestedListAction } from "../../../../util/NestedList"
import { composeReducers, ReducerFunc } from "../../../../util/RecoilReducer"
import { IssueDataWithOrder, PBIListChangeEvent, PBIListData, PBIListDataHandler } from "./PBIListData"

export type PBIListLogic = {
  readonly dispatch: React.Dispatch<NestedListAction>
  readonly pbiListData: PBIListData
}

export const useLogic = (
  items: ReadonlyArray<IssueDataWithOrder>,
  onChange?: (events: ReadonlyArray<PBIListChangeEvent>) => void
): PBIListLogic => {
  const [pbiListData, dispatch] = React.useReducer(
    composeReducers(NestedList.reducer, sideEffect(onChange)),
    PBIListDataHandler.nest(items)
  )
  return {
    pbiListData,
    dispatch
  }
}

const sideEffect =
  (onChange?: (events: ReadonlyArray<PBIListChangeEvent>) => void): ReducerFunc<PBIListData, NestedListAction> =>
  (data, action) => {
    const events = PBIListDataHandler.buildEvent(data, action)
    onChange && onChange(events)
    return data
  }
