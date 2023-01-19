import React from "react"
import { Dispatcher, useRecoilReducer } from "../../../util/RecoilReducer"
import { ErrorData } from "../../backlog/BacklogApi"
import { CustomFieldTypes, CustomNumberField, IssueType, ProjectInfo } from "../../backlog/ProjectInfo"
import { stateSelector } from "../common/atom"
import { SettingStore } from "../common/SettingStore"
import { AppSettings, AppState } from "../common/types"
import { UserLang } from "../types"
import { i18n } from "./i18n"
import {
  OrderCustomFieldCreated,
  OrderCustomFieldDeleted,
  PBIIssueTypeIdSet,
  SettingAction,
  settingsReducer
} from "./Reducers"

type DispatchType = Dispatcher<AppState, SettingAction>
type LocalSetType = React.Dispatch<React.SetStateAction<LocalState>>

const selectIssueType = (dispatch: DispatchType) => (issueTypeId: number) => {
  dispatch(PBIIssueTypeIdSet(issueTypeId), (state) => {
    if (state.formInfo) {
      SettingStore.save(state.formInfo.projectKey, state.settings)
    }
  })
}

const createCustomField = (dispatch: DispatchType, state: AppState, setLocalState: LocalSetType) => async () => {
  const projectKey = state?.formInfo?.projectKey
  const issueTypeId = state?.settings.pbiIssueTypeId
  if (projectKey && issueTypeId) {
    try {
      const created = await ProjectInfo.createCustomField(projectKey, {
        typeId: CustomFieldTypes.Number,
        name: `__PBI_ORDER__${issueTypeId}__`,
        applicableIssueTypes: [issueTypeId],
        description: "",
        required: false
      })
      if (created) {
        dispatch(OrderCustomFieldCreated(created), (state) => {
          if (state.formInfo) {
            SettingStore.save(state.formInfo.projectKey, state.settings)
          }
        })
      }
    } catch (e) {
      const errorData = e as ErrorData
      const t = i18n(state.formInfo?.lang || "en")
      const first = errorData.errors[0]
      if (first.code === 2) {
        setLocalState({ errorMessage: t.errorInsufficientLicense })
      } else if (first.code === 5) {
        setLocalState({ errorMessage: t.errorNoRightForCreateCustomField })
      } else {
        setLocalState({ errorMessage: first.message })
      }
    }
  }
}

const deleteCustomField = (dispatch: DispatchType, state: AppState, setLocalState: LocalSetType) => async () => {
  const projectKey = state?.formInfo?.projectKey
  if (projectKey && state.orderCustomField) {
    try {
      const deleted = await ProjectInfo.deleteCustomField(projectKey, state.orderCustomField.id)
      dispatch(OrderCustomFieldDeleted(deleted.id))
    } catch (e) {
      const errorData = e as ErrorData
      const first = errorData.errors[0]
      const t = i18n(state.formInfo?.lang || "en")
      if (first.code === 5) {
        setLocalState({ errorMessage: t.errorNoRightForCreateCustomField })
      } else {
        setLocalState({ errorMessage: first.message })
      }
    }
  }
}

type LocalState = {
  readonly errorMessage: string | null
}

export type ProjectSettingsViewModel = {
  readonly settings: AppSettings
  readonly issueTypes: ReadonlyArray<IssueType>
  readonly orderCustomField: CustomNumberField | null
  readonly selectIssueType: (issueTypeId: number) => void
  readonly createCustomField: () => Promise<void>
  readonly errorMessageOnCreateCustomField: string | null
  readonly deleteCustomField: () => Promise<void>
  readonly lang: UserLang
}

export const useProjectSettingsViewModel = (): ProjectSettingsViewModel => {
  const [state, dispatch] = useRecoilReducer(settingsReducer, stateSelector)
  const [localState, setLocalState] = React.useState<LocalState>({ errorMessage: null })
  return {
    settings: state.settings,
    issueTypes: state.projectInfo?.issueTypes || [],
    orderCustomField: state.orderCustomField,
    selectIssueType: selectIssueType(dispatch),
    createCustomField: createCustomField(dispatch, state, setLocalState),
    deleteCustomField: deleteCustomField(dispatch, state, setLocalState),
    errorMessageOnCreateCustomField: localState.errorMessage,
    lang: state.formInfo?.lang || "en"
  }
}
