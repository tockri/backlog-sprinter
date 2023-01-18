import { Dispatcher, Reset, useRecoilReducer } from "../../../util/RecoilReducer"
import { ProjectInfo } from "../../backlog/ProjectInfo"
import { stateSelector } from "../common/atom"
import { SettingStore } from "../common/SettingStore"
import { AppState, Tabs } from "../common/types"
import { PBFormInfo, UserLang } from "../types"
import { AppAction, appReducer, ProjectInfoLoaded, SettingsLoaded, TabSelected } from "./Reducer"

type DispatchType = Dispatcher<AppState, AppAction>
type VMFunc0 = (dispatch: DispatchType) => () => void
type VMFunc1<T> = (dispatch: DispatchType) => (arg: T) => void

const start = (dispatch: DispatchType, state: AppState) => async (formInfo: PBFormInfo) => {
  if (!state.formInfo && !state.projectInfo) {
    const projectInfo = await ProjectInfo.getCustomFields(formInfo.projectKey)
    const settings = SettingStore.load(formInfo.projectKey)
    dispatch([ProjectInfoLoaded(formInfo, projectInfo), SettingsLoaded(settings), TabSelected(Tabs.Backlog)])
  }
}

const clear: VMFunc0 = (dispatch) => () => {
  dispatch(Reset)
}

const selectTab: VMFunc1<number> = (dispatch) => (tab) => {
  dispatch(TabSelected(tab))
}

export type ProjectAppViewModel = {
  readonly isReady: boolean
  readonly lang: UserLang
  readonly start: (formInfo: PBFormInfo) => Promise<void>
  readonly clear: () => void
  readonly selectedTab: Tabs
  readonly selectTab: (tab: number) => void
}

export const useProjectAppViewModel = (): ProjectAppViewModel => {
  const [state, dispatch] = useRecoilReducer(appReducer, stateSelector)

  return {
    isReady: !!(state.formInfo && state.projectInfo),
    lang: state.formInfo?.lang || "en",
    start: start(dispatch, state),
    clear: clear(dispatch),
    selectedTab: state.orderCustomField ? state.selectedTab : Tabs.Settings,
    selectTab: selectTab(dispatch)
  }
}
