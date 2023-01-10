import { Action, composeReducers, RecoilReducer } from "../../../util/RecoilReducer"
import { CustomField, CustomFieldsData, CustomNumberField, isNumberField, IssueType } from "../../backlog/ProjectInfo"
import { PBFormInfo } from "../types"
import { AppSettings } from "./localStorage"

// ======================================
// Data in Recoil Atom
// ======================================
export enum Tabs {
  Backlog = 0,
  Velocity = 1,
  Settings = 2
}

export type AppState = {
  formInfo: PBFormInfo | null
  projectInfo: CustomFieldsData | null
  selectedTab: Tabs
  settings: AppSettings
}

export const defaultAppState = (): AppState => ({
  formInfo: null,
  projectInfo: null,
  selectedTab: Tabs.Backlog,
  settings: {
    pbiIssueTypeId: null,
    customFieldId: null
  }
})

// ======================================
// Actions and constructors
// ======================================

type NoAction = Action & {
  id: "No"
}

const No: NoAction = {
  id: "No"
}

type ClearAction = Action & {
  id: "Clear"
}

export const Clear = (): ClearAction => ({
  id: "Clear"
})

type SettingsLoadedAction = Action & {
  id: "SettingsLoadedAction"
  settings: AppSettings
}

export const SettingsLoaded = (settings: AppSettings): SettingsLoadedAction => ({
  id: "SettingsLoadedAction",
  settings
})

type ProjectInfoLoadedAction = Action & {
  id: "ProjectInfoLoaded"
  formInfo: PBFormInfo
  projectInfo: CustomFieldsData
}

export const ProjectInfoLoaded = (formInfo: PBFormInfo, projectInfo: CustomFieldsData): ProjectInfoLoadedAction => ({
  id: "ProjectInfoLoaded",
  formInfo,
  projectInfo
})

type PBIIssueTypeIdSetAction = Action & {
  id: "PBIIssueTypeIdSetAction"
  pbiIssueTypeId: number | null
}

export const PBIIssueTypeIdSet = (issueTypeId: number | null): PBIIssueTypeIdSetAction => ({
  id: "PBIIssueTypeIdSetAction",
  pbiIssueTypeId: issueTypeId
})

type PBIIssueTypeCreatedAction = Action & {
  id: "IssueTypeCreated"
  issueType: IssueType
}

export const PBIIssueTypeCreated = (issueType: IssueType): PBIIssueTypeCreatedAction => ({
  id: "IssueTypeCreated",
  issueType
})

type OrderCustomFieldCreatedAction = {
  id: "OrderCustomFieldCreated"
  customField: CustomNumberField
}

export const OrderCustomFieldCreated = (customField: CustomField): OrderCustomFieldCreatedAction | NoAction => {
  if (isNumberField(customField)) {
    return {
      id: "OrderCustomFieldCreated",
      customField: customField
    }
  } else {
    console.warn({ customField })
    return No
  }
}

type TabSelectedAction = {
  id: "TabSelected"
  tab: Tabs
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

export type AppAction =
  | NoAction
  | ClearAction
  | TabSelectedAction
  | SettingsLoadedAction
  | ProjectInfoLoadedAction
  | PBIIssueTypeIdSetAction
  | PBIIssueTypeCreatedAction
  | OrderCustomFieldCreatedAction

// ======================================
// Reducers (pure function)
// ======================================

const isValidPBIIssueType = (issueType: IssueType): boolean => issueType.name === "PBI"

const isValidPBIIssueTypeAndCustomField =
  (issueType: IssueType) =>
  (customField: CustomField): boolean =>
    customField.applicableIssueTypes.includes(issueType.id) &&
    isNumberField(customField) &&
    customField.name == `__PBI_ORDER__${issueType.id}__`

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

const pbiIssueTypeIdSet: RecoilReducer<AppState, AppAction> = (curr, action) => {
  return action.id === "PBIIssueTypeIdSetAction"
    ? {
        ...curr,
        pbiIssueTypeId: action.pbiIssueTypeId
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

const issueTypeCreated: RecoilReducer<AppState, AppAction> = (curr, action) => {
  const { projectInfo, settings } = curr
  if (action.id === "IssueTypeCreated" && projectInfo) {
    return {
      ...curr,
      projectInfo: {
        ...projectInfo,
        issueTypes: [action.issueType, ...projectInfo.issueTypes]
      },
      settings: {
        ...settings,
        pbiIssueTypeId: action.issueType.id,
        customFieldId: null
      }
    }
  } else {
    return curr
  }
}

const customFieldCreated: RecoilReducer<AppState, AppAction> = (curr, action) => {
  const { projectInfo, settings } = curr
  if (action.id === "OrderCustomFieldCreated" && projectInfo) {
    return {
      ...curr,
      projectInfo: {
        ...projectInfo,
        customFields: [action.customField, ...projectInfo.customFields]
      },
      settings: {
        ...settings,
        customFieldId: action.customField.id
      }
    }
  } else {
    return curr
  }
}

const selectTab: RecoilReducer<AppState, AppAction> = (curr, action) => {
  const pbiIssueType = curr.projectInfo?.issueTypes.find(isValidPBIIssueType)
  const customField =
    pbiIssueType && curr.projectInfo?.customFields.find(isValidPBIIssueTypeAndCustomField(pbiIssueType))
  if (customField && action.id === "TabSelected") {
    return {
      ...curr,
      selectedTab: action.tab
    }
  } else {
    return {
      ...curr,
      selectedTab: Tabs.Settings,
      settings: {
        ...curr.settings,
        customFieldId: null
      }
    }
  }
}

export const appReducer = composeReducers(
  projectInfoLoaded,
  issueTypeCreated,
  pbiIssueTypeIdSet,
  customFieldCreated,
  settingsLoaded,
  selectTab,
  clear
)
