import { Action, composeReducers, RecoilReducer } from "../../../util/RecoilReducer"
import { CustomFieldsData } from "../../backlog/ProjectInfo"
import { AppSettings, AppState, defaultAppState, No, NoAction, Tabs } from "../common/types"
import { PBFormInfo } from "../types"

type ClearAction = Action & {
  readonly id: "Clear"
}

export const Clear = (): ClearAction => ({
  id: "Clear"
})

type SettingsLoadedAction = Action & {
  readonly id: "SettingsLoadedAction"
  readonly settings: AppSettings
}

export const SettingsLoaded = (settings: AppSettings): SettingsLoadedAction => ({
  id: "SettingsLoadedAction",
  settings
})

type ProjectInfoLoadedAction = Action & {
  readonly id: "ProjectInfoLoaded"
  readonly formInfo: PBFormInfo
  readonly projectInfo: CustomFieldsData
}

export const ProjectInfoLoaded = (formInfo: PBFormInfo, projectInfo: CustomFieldsData): ProjectInfoLoadedAction => ({
  id: "ProjectInfoLoaded",
  formInfo,
  projectInfo
})

type TabSelectedAction = {
  readonly id: "TabSelected"
  readonly tab: Tabs
}

export const TabSelected = (index: number): TabSelectedAction | NoAction => {
  if (index in Tabs) {
    return {
      id: "TabSelected",
      tab: index
    }
  } else {
    console.warn("Invalid index", index)
    return No
  }
}

export type AppAction = NoAction | ClearAction | TabSelectedAction | SettingsLoadedAction | ProjectInfoLoadedAction

const clear: RecoilReducer<AppState, AppAction> = (curr, action) => {
  return action.id === "Clear" ? defaultAppState() : curr
}

const projectInfoLoaded: RecoilReducer<AppState, AppAction> = (curr, action) => {
  return action.id === "ProjectInfoLoaded"
    ? {
        ...curr,
        projectInfo: action.projectInfo,
        formInfo: action.formInfo
      }
    : curr
}

const settingsLoaded: RecoilReducer<AppState, AppAction> = (curr, action) => {
  return action.id === "SettingsLoadedAction"
    ? {
        ...curr,
        settings: action.settings
      }
    : curr
}

const selectTab: RecoilReducer<AppState, AppAction> = (curr, action) => {
  if (action.id === "TabSelected") {
    return {
      ...curr,
      selectedTab: action.tab
    }
  } else {
    return curr
  }
}

export const appReducer = composeReducers(projectInfoLoaded, settingsLoaded, selectTab, clear)
