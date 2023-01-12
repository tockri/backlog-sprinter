import { Action, composeReducers, RecoilReducer } from "../../../util/RecoilReducer"
import { IssueData } from "../../backlog/Issue"
import { AppState, NoAction } from "../common/types"

type ProductBacklogLoadedAction = Action & {
  id: "ProductBacklogLoaded"
  readonly productBacklog: ReadonlyArray<IssueData>
}

export const ProductBacklogLoaded = (productBacklog: ReadonlyArray<IssueData>): ProductBacklogLoadedAction => ({
  id: "ProductBacklogLoaded",
  productBacklog
})

export type ProductBacklogAction = NoAction | ProductBacklogLoadedAction

const productBacklogLoaded: RecoilReducer<AppState, ProductBacklogAction> = (curr, action) => {
  return action.id === "ProductBacklogLoaded"
    ? {
        ...curr,
        productBacklogItems: action.productBacklog
      }
    : curr
}

export const productBacklogReducer = composeReducers(productBacklogLoaded)

// =====================================
// GroupedList
// =====================================

export type GroupedListColumn<H, T> = {
  readonly id: string
  readonly head: H | null
  readonly items: ReadonlyArray<T>
}

export type GroupedList<H, T> = {
  readonly groups: ReadonlyArray<GroupedListColumn<H, T>>
}

type DnDPoint = {
  readonly groupId: string
  readonly index: number
}

export type DropAction = Action & {
  readonly id: "Drop"
  readonly source: DnDPoint
  readonly destination: DnDPoint
}

export const Dropped = (source: DnDPoint, destination: DnDPoint): DropAction => ({ id: "Drop", source, destination })

type GroupedListAction = DropAction

type GroupedListReducer<H, T> = React.Reducer<GroupedList<H, T>, GroupedListAction>

const dropped: GroupedListReducer<unknown, unknown> = (state, action) => {
  if (action.id === "Drop") {
    if (action.source.groupId !== action.destination.groupId) {
      const srcGroup = state.groups.find((g) => g.id === action.source.groupId)
      const dstGroup = state.groups.find((g) => g.id === action.destination.groupId)
      if (srcGroup && dstGroup) {
        const srcItems = Array.from(srcGroup.items)
        const removed = srcItems.splice(action.source.index, 1)
        const dstItems = Array.from(dstGroup.items)
        dstItems.splice(action.destination.index, 0, ...removed)
        return {
          groups: state.groups.map((g) => {
            if (g.id === action.source.groupId) {
              return {
                ...g,
                items: srcItems
              }
            } else if (g.id === action.destination.groupId) {
              return {
                ...g,
                items: dstItems
              }
            } else {
              return g
            }
          })
        }
      }
    }
  }
  return state
}

export const groupedListReducer = dropped
