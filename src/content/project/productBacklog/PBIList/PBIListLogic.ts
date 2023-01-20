import React from "react"
import { NestedList, NestedListAction } from "../../../../util/NestedList"
import { composeReducers } from "../../../../util/RecoilReducer"
import { IssueDataWithOrder, PBIListChangeEvent, PBIListData, PBIListDataHandler } from "./PBIListData"

export type PBIListLogic = {
  readonly dispatch: React.Dispatch<NestedListAction>
  readonly pbiListData: PBIListData
}

export const useLogic = (
  items: ReadonlyArray<IssueDataWithOrder>,
  onChange: (events: ReadonlyArray<PBIListChangeEvent>) => void
): PBIListLogic => {
  const sideEffect = (data: PBIListData, action: NestedListAction) => {
    const events = PBIListDataHandler.buildEvent(data, action)
    onChange && onChange(events)
    return data
  }
  const [pbiListData, dispatch] = React.useReducer(
    composeReducers(NestedList.reducer, sideEffect),
    PBIListDataHandler.nest(items)
  )
  return {
    pbiListData,
    dispatch
  }
}
