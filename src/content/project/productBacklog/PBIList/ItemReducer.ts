import { Action, composeReducers, ReducerFunc } from "../../../../util/RecoilReducer"
import { AppState } from "../../common/types"

// ------- SelectItem --------

export enum ItemActionId {
  ItemSelected = "ItemSelected",
  ItemDeselected = "ItemDeselected"
}

type ItemSelectedAction = Action & {
  id: ItemActionId.ItemSelected
  readonly issueId: number
}
export const ItemSelected = (issueId: number): ItemAction => ({
  id: ItemActionId.ItemSelected,
  issueId
})

const itemSelected: ReducerFunc<AppState, ItemAction> = (curr, action) => {
  if (action.id === ItemActionId.ItemSelected) {
    const { issueId } = action
    if (curr.productBacklogItems?.find((item) => item.id === issueId)) {
      return {
        ...curr,
        selectedItemId: issueId
      }
    }
  }
  return curr
}

// ------ DeselectItem -------

type ItemDeselectedAction = Action & {
  id: ItemActionId.ItemDeselected
}
export const ItemDeselected = (): ItemDeselectedAction => ({
  id: ItemActionId.ItemDeselected
})

const itemDeselected: ReducerFunc<AppState, ItemAction> = (curr, action) => {
  if (action.id === ItemActionId.ItemDeselected) {
    return {
      ...curr,
      selectedItemId: null
    }
  }
  return curr
}

// ------- Interface ------------

export type ItemAction = ItemSelectedAction | ItemDeselectedAction

export const ItemReducer = composeReducers(itemSelected, itemDeselected)
