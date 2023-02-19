import { ProjectConfState } from "@/content/project/app/state/ProjectConfState"
import { ApiState } from "@/content/state/ApiState"
import { EnvState } from "@/content/state/EnvState"
import { Loading } from "@/content/ui/Loading"
import styled from "@emotion/styled"
import { MockApi } from "@test/mock/MockApi"
import { MockConf } from "@test/mock/MockConf"
import { MockEnv } from "@test/mock/MockEnv"
import { Immutable } from "immer"
import { createStore, PrimitiveAtom, Provider, WritableAtom } from "jotai"
import React from "react"

type Pair<T = any> = Immutable<[WritableAtom<T, [T], void> | PrimitiveAtom<T>, T]>

export type ProjectStoryTemplateProps = Immutable<{
  initialValues?: Array<Pair>
  children: React.ReactNode
}>

export const ProjectStoryTemplate: React.FC<ProjectStoryTemplateProps> = ({ initialValues, children }) => {
  const store = createStore()
  store.set(ProjectConfState.atom, MockConf)
  store.set(EnvState.atom, MockEnv)
  store.set(ApiState.atom, MockApi)
  initialValues?.forEach(([atm, value]) => {
    store.set(atm, value)
  })
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
