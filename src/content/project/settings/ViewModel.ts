import { Dispatcher, useRecoilReducer } from "../../../util/RecoilReducer"
import { CustomFieldTypes, CustomNumberField, IssueType, ProjectInfo } from "../../backlog/ProjectInfo"
import { stateSelector } from "../common/atom"
import { SettingStore } from "../common/SettingStore"
import { AppSettings, AppState } from "../common/types"
import { OrderCustomFieldCreated, PBIIssueTypeIdSet, SettingAction, settingsReducer } from "./Reducers"

type DispatchType = Dispatcher<AppState, SettingAction>
type AsyncVMFunc0 = (dispatch: DispatchType, state: AppState) => () => Promise<void>
type VMFunc1<T> = (dispatch: DispatchType) => (arg: T) => void

const selectIssueType: VMFunc1<number> = (dispatch) => (issueTypeId) => {
  dispatch(PBIIssueTypeIdSet(issueTypeId), (state) => {
    if (state.formInfo) {
      SettingStore.save(state.formInfo.projectKey, state.settings)
    }
  })
}

const createCustomField: AsyncVMFunc0 = (dispatch, state) => async () => {
  const projectKey = state?.formInfo?.projectKey
  const issueTypeId = state?.settings.pbiIssueTypeId
  if (projectKey && issueTypeId) {
    const created = await ProjectInfo.createCustomField(projectKey, {
      typeId: CustomFieldTypes.Number,
      name: `__PBI_ORDER__${issueTypeId}__`,
      applicableIssueTypes: [issueTypeId],
      description: "",
      required: false,
      initialValue: 0
    })
    dispatch(OrderCustomFieldCreated(created), (state) => {
      if (state.formInfo) {
        SettingStore.save(state.formInfo.projectKey, state.settings)
      }
    })
  }
}

export type ProjectSettingsViewModel = {
  readonly settings: AppSettings
  readonly issueTypes: ReadonlyArray<IssueType>
  readonly orderCustomField: CustomNumberField | null
  readonly selectIssueType: (issueTypeId: number) => void
  readonly createCustomField: () => Promise<void>
}

export const useProjectSettingsViewModel = (): ProjectSettingsViewModel => {
  const [state, dispatch] = useRecoilReducer(stateSelector, settingsReducer)
  return {
    settings: state.settings,
    issueTypes: state.projectInfo?.issueTypes || [],
    orderCustomField: state.orderCustomField,
    selectIssueType: selectIssueType(dispatch),
    createCustomField: createCustomField(dispatch, state)
  }
}
