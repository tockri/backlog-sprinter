import { Action } from "../../../util/RecoilReducer"
import { IssueData } from "../../backlog/Issue"
import { CustomNumberField, ProjectInfoWithCustomFields } from "../../backlog/ProjectInfo"
import { PBFormInfo } from "../types"

export type AppSettings = {
  readonly pbiIssueTypeId: number | null
}

export enum Tabs {
  Backlog = 0,
  //  Velocity = 1,
  Settings = 1
}

export type AppState = {
  readonly formInfo: PBFormInfo | null
  readonly projectInfo: ProjectInfoWithCustomFields | null
  readonly productBacklogItems: ReadonlyArray<IssueData> | null
  readonly selectedItemId: number | null
  readonly selectedItem: IssueData | null
  readonly orderCustomField: CustomNumberField | null
  readonly selectedTab: Tabs
  readonly settings: AppSettings
}

export type NoAction = Action & {
  id: "No"
}

export const No: NoAction = {
  id: "No"
}
