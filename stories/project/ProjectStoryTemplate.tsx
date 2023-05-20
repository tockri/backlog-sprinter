import { ProjectConfState } from "@/content/project/state/ProjectConfState"
import { ApiState } from "@/content/state/ApiState"
import { BspConfState } from "@/content/state/BspConfState"
import { BspEnvState } from "@/content/state/BspEnvState"
import { Loading } from "@/content/ui/Loading"
import styled from "@emotion/styled"
import { MockApi } from "@test/mock/MockApi"
import { MockBspConf, MockProjectConf } from "@test/mock/MockConf"
import { MockEnv } from "@test/mock/MockEnv"
import { Immutable } from "immer"
import { createStore, Provider } from "jotai"
import React from "react"

type Store = ReturnType<typeof createStore>
type SetStore = Store["set"]

export type ProjectStoryTemplateProps = Immutable<{
  initialValues?: (set: SetStore) => void
  children: React.ReactNode
}>

export const ProjectStoryTemplate: React.FC<ProjectStoryTemplateProps> = ({ initialValues, children }) => {
  const store = createStore()
  store.set(ProjectConfState.atom, MockProjectConf)
  store.set(BspConfState.atom, MockBspConf)
  store.set(BspEnvState.atom, MockEnv)
  store.set(ApiState.atom, MockApi)
  initialValues && initialValues(store.set)
  return (
    <Provider store={store}>
      <React.Suspense fallback={<Loading />}>
        <Root style={{ height: 480, width: 800, display: "flex" }}>{children}</Root>
      </React.Suspense>
    </Provider>
  )
}

const Root = styled.div({
  " *": {
    fontSize: 13
  }
})
