import { Action, composeReducers, RecoilReducer } from "../../../util/RecoilReducer"
import { CustomField, CustomNumberField, isNumberField, IssueType } from "../../backlog/ProjectInfo"
import { AppState, No, NoAction } from "../common/types"

type PBIIssueTypeIdSetAction = Action & {
  readonly id: "PBIIssueTypeIdSetAction"
  readonly pbiIssueTypeId: number | null
}

export const PBIIssueTypeIdSet = (issueTypeId: number | null): PBIIssueTypeIdSetAction =>
  ({
    id: "PBIIssueTypeIdSetAction",
    pbiIssueTypeId: issueTypeId
  } as const)

type PBIIssueTypeCreatedAction = Action & {
  readonly id: "IssueTypeCreated"
  readonly issueType: IssueType
}

export const PBIIssueTypeCreated = (issueType: IssueType): PBIIssueTypeCreatedAction => ({
  id: "IssueTypeCreated",
  issueType
})

type OrderCustomFieldCreatedAction = {
  readonly id: "OrderCustomFieldCreated"
  readonly customField: CustomNumberField
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

export type SettingAction =
  | NoAction
  | PBIIssueTypeIdSetAction
  | PBIIssueTypeCreatedAction
  | OrderCustomFieldCreatedAction

// ======================================
// Reducers (pure function)
// ======================================

const pbiIssueTypeIdSet: RecoilReducer<AppState, SettingAction> = (curr, action) => {
  return action.id === "PBIIssueTypeIdSetAction"
    ? {
        ...curr,
        productBacklogItems: null,
        settings: {
          ...curr.settings,
          pbiIssueTypeId: action.pbiIssueTypeId
        }
      }
    : curr
}

const issueTypeCreated: RecoilReducer<AppState, SettingAction> = (curr, action) => {
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
        pbiIssueTypeId: action.issueType.id
      }
    }
  } else {
    return curr
  }
}

const customFieldCreated: RecoilReducer<AppState, SettingAction> = (curr, action) => {
  const { projectInfo } = curr
  if (action.id === "OrderCustomFieldCreated" && projectInfo) {
    return {
      ...curr,
      projectInfo: {
        ...projectInfo,
        customFields: [action.customField, ...projectInfo.customFields]
      }
    }
  } else {
    return curr
  }
}

export const settingsReducer = composeReducers(issueTypeCreated, pbiIssueTypeIdSet, customFieldCreated)
