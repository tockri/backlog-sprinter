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
