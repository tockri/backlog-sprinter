import React from "react"
import { NestedList, NestedListAction } from "../../../../util/NestedList"
import { Dispatcher, useRecoilReducer } from "../../../../util/RecoilReducer"
import { stateSelector } from "../../common/atom"
import { AppState } from "../../common/types"
import { ItemAction, ItemDeselected, ItemReducer, ItemSelected } from "./ItemReducer"

type LocalDispatchType = React.Dispatch<NestedListAction>
type NestedListPoint = [subListId: string, index: number]

export type ItemLogic = {
  readonly selectItem: (issueId: number) => void
  readonly isSelected: (issueId: number) => boolean
  readonly move: (src: NestedListPoint, dst: NestedListPoint) => void
}

export const useItemLogic = (localDispatch: LocalDispatchType): ItemLogic => {
  const [state, globalDispatch] = useRecoilReducer(ItemReducer, stateSelector)
  return {
    selectItem: selectItem(state, globalDispatch),
    isSelected: (issueId) => state.selectedItemId === issueId,
    move: moveNestedList(localDispatch)
  }
}

type GlobalDispatchType = Dispatcher<AppState, ItemAction>

const selectItem = (state: AppState, dispatch: GlobalDispatchType) => (issueId: number) => {
  dispatch(state.selectedItemId === issueId ? ItemDeselected() : ItemSelected(issueId))
}

const moveNestedList = (localDispatch: LocalDispatchType) => (src: NestedListPoint, dst: NestedListPoint) => {
  localDispatch(NestedList.Move(src, dst))
}
