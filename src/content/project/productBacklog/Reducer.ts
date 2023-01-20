// ------- ProductBacklogLoaded --------

import { ArrayUtil } from "../../../util/ArrayUtil"
import { Action, composeReducers, ReducerFunc } from "../../../util/RecoilReducer"
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

const productBacklogLoaded: ReducerFunc<AppState, ProductBacklogAction> = (curr, action) => {
  return action.id === "ProductBacklogLoaded"
    ? {
        ...curr,
        productBacklogItems: action.productBacklog
      }
    : curr
}

type ProductBacklogChangedAction = Action & {
  id: "ProductBacklogChanged"
  readonly updatedIssues: ReadonlyArray<IssueData>
}

export const ProductBacklogChanged = (updatedIssues: ReadonlyArray<IssueData>): ProductBacklogChangedAction => ({
  id: "ProductBacklogChanged",
  updatedIssues
})

const productBacklogChanged: ReducerFunc<AppState, ProductBacklogAction> = (curr, action) => {
  if (action.id === "ProductBacklogChanged" && curr.productBacklogItems && curr.orderCustomField) {
    const changes = ArrayUtil.toRecord(action.updatedIssues, (issue) => issue.id)
    return {
      ...curr,
      productBacklogItems: curr.productBacklogItems.map((curIssue) => changes[curIssue.id] || curIssue)
    }
  } else {
    return curr
  }
}

export type ProductBacklogAction = NoAction | ProductBacklogLoadedAction | ProductBacklogChangedAction

export const productBacklogReducer = composeReducers(productBacklogLoaded, productBacklogChanged)
