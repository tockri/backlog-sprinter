import Recoil from "recoil"
import { Dispatcher, useRecoilReducer } from "../../../util/RecoilReducer"
import { ProjectInfo } from "../../backlog/ProjectInfo"
import { PBFormInfo } from "../types"
import { AppAction, appReducer, AppState, Clear, defaultAppState, ProjectInfoLoaded, TabSelected } from "./reducers"

export type ProjectViewModel = {
  state: AppState
  start: (formInfo: PBFormInfo) => void
  clear: () => void
  selectTab: (tab: number) => void
}

const stateAtom = Recoil.atom<AppState>({
  key: "project.model.stateAtom",
  default: defaultAppState()
})

type DispatchFunc0 = (dispatch: Dispatcher<AppAction>) => () => void | Promise<void>

type DispatchFunc1<A> = (dispatch: Dispatcher<AppAction>) => (arg: A) => void | Promise<void>

const start: DispatchFunc1<PBFormInfo> = (dispatch) => async (formInfo) => {
  const projectInfo = await ProjectInfo.getCustomFields(formInfo.projectKey)
  dispatch(ProjectInfoLoaded(formInfo, projectInfo))
}

const clear: DispatchFunc0 = (dispatch) => () => {
  dispatch(Clear())
}

const selectTab: DispatchFunc1<number> = (dispatch) => (tab) => {
  dispatch(TabSelected(tab))
}

export const useProjectModel = (): ProjectViewModel => {
  const [state, dispatch] = useRecoilReducer(stateAtom, appReducer)
  return {
    state,
    start: start(dispatch),
    clear: clear(dispatch),
    selectTab: selectTab(dispatch)
  }
}
