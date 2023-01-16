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

type ProductBacklogChangedAction = Action & {
  id: "ProductBacklogChanged"
  readonly updatedIssues: ReadonlyArray<IssueData>
}

export const ProductBacklogChanged = (updatedIssues: ReadonlyArray<IssueData>): ProductBacklogChangedAction => ({
  id: "ProductBacklogChanged",
  updatedIssues
})

export type ProductBacklogAction = NoAction | ProductBacklogLoadedAction | ProductBacklogChangedAction

const productBacklogLoaded: RecoilReducer<AppState, ProductBacklogAction> = (curr, action) => {
  return action.id === "ProductBacklogLoaded"
    ? {
        ...curr,
        productBacklogItems: action.productBacklog
      }
    : curr
}

const productBacklogChanged: RecoilReducer<AppState, ProductBacklogAction> = (curr, action) => {
  if (action.id === "ProductBacklogChanged" && curr.productBacklogItems) {
    const changeMap = new Map(action.updatedIssues.map((issue) => [issue.id, issue]))
    return {
      ...curr,
      productBacklogItems: curr.productBacklogItems.map((curIssue) => {
        if (changeMap.has(curIssue.id)) {
          return changeMap.get(curIssue.id) as IssueData
        } else {
          return curIssue
        }
      })
    }
  } else {
    return curr
  }
}

export const productBacklogReducer = composeReducers(productBacklogLoaded, productBacklogChanged)
