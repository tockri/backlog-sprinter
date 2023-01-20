import { Action, composeReducers, ReducerFunc, ResetAction } from "../../../util/RecoilReducer"
import { ProjectInfoWithCustomFields } from "../../backlog/ProjectInfo"
import { AppSettings, AppState, No, NoAction, Tabs } from "../common/types"
import { PBFormInfo } from "../types"

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
  readonly projectInfo: ProjectInfoWithCustomFields
}

export const ProjectInfoLoaded = (
  formInfo: PBFormInfo,
  projectInfo: ProjectInfoWithCustomFields
): ProjectInfoLoadedAction => ({
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

export type AppAction = NoAction | TabSelectedAction | SettingsLoadedAction | ProjectInfoLoadedAction | ResetAction

const projectInfoLoaded: ReducerFunc<AppState, AppAction> = (curr, action) => {
  return action.id === "ProjectInfoLoaded"
    ? {
        ...curr,
        projectInfo: action.projectInfo,
        formInfo: action.formInfo
      }
    : curr
}

const settingsLoaded: ReducerFunc<AppState, AppAction> = (curr, action) => {
  return action.id === "SettingsLoadedAction"
    ? {
        ...curr,
        settings: action.settings
      }
    : curr
}

const selectTab: ReducerFunc<AppState, AppAction> = (curr, action) => {
  if (action.id === "TabSelected") {
    return {
      ...curr,
      selectedTab: action.tab
    }
  } else {
    return curr
  }
}

export const appReducer = composeReducers(projectInfoLoaded, settingsLoaded, selectTab)
