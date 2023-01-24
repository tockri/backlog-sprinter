import React from "react"
import { Dispatcher, useRecoilReducer } from "../../../../util/RecoilReducer"
import { BacklogApi, BacklogApiContext } from "../../../backlog/BacklogApiForReact"
import { IssueChangeInput, IssueData } from "../../../backlog/Issue"
import { stateSelector } from "../../common/atom"
import { AppState } from "../../common/types"
import { ProductBacklogAction, ProductBacklogChanged, productBacklogReducer } from "../Reducer"

export type InfoAreaLogic = {
  changeIssue: (key: keyof IssueChangeInput, value: string | number) => void
}
export const useInfoAreaLogic = (issue: IssueData): InfoAreaLogic => {
  const [, dispatch] = useRecoilReducer(productBacklogReducer, stateSelector)
  const api = React.useContext(BacklogApiContext)

  return {
    changeIssue: changeIssue(dispatch, issue, api)
  }
}

const changeIssue =
  (dispatch: Dispatcher<AppState, ProductBacklogAction>, issue: IssueData, api: BacklogApi) =>
  async (key: keyof IssueChangeInput, value: string | number) => {
    const input = {
      [key]: value
    }
    const updated = await api.issue.changeInfo(issue.id, input)
    dispatch(ProductBacklogChanged([updated]))
  }
