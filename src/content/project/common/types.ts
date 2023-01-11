import { Action } from "../../../util/RecoilReducer"
import { IssueData } from "../../backlog/Issue"
import { CustomFieldsData, CustomNumberField } from "../../backlog/ProjectInfo"
import { PBFormInfo } from "../types"

export type AppSettings = {
  readonly pbiIssueTypeId: number | null
}

export const defaultSettings = (): AppSettings => ({
  pbiIssueTypeId: null
})

export enum Tabs {
  Backlog = 0,
  Velocity = 1,
  Settings = 2
}

export type AppState = {
  readonly formInfo: PBFormInfo | null
  readonly projectInfo: CustomFieldsData | null
  readonly productBacklogItems: ReadonlyArray<IssueData> | null
  readonly orderCustomField: CustomNumberField | null
  readonly selectedTab: Tabs
  readonly settings: AppSettings
}

export const defaultAppState = (): AppState => ({
  formInfo: null,
  projectInfo: null,
  productBacklogItems: null,
  orderCustomField: null,
  selectedTab: Tabs.Backlog,
  settings: defaultSettings()
})

export type NoAction = Action & {
  id: "No"
}

export const No: NoAction = {
  id: "No"
}
