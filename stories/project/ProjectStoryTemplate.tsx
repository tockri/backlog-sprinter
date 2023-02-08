import styled from "@emotion/styled"
import { createStore, PrimitiveAtom, Provider, WritableAtom } from "jotai"
import React from "react"
import { Api } from "../../src/content/project/app/state/Api"
import { AppConfState } from "../../src/content/project/app/state/AppConfState"
import { EnvState } from "../../src/content/project/app/state/EnvState"
import { Loading } from "../../src/content/ui/Loading"
import { mockApi } from "./mockApi"

type Pair<T = any> = [WritableAtom<T, [T], void> | PrimitiveAtom<T>, T]

export type ProjectStoryTemplateProps = {
  initialValues: Array<Pair>
  children: React.ReactNode
}
export const ProjectStoryTemplate: React.FC<ProjectStoryTemplateProps> = ({ initialValues, children }) => {
  const store = createStore()
  store.set(AppConfState.atom, {
    selectedTab: 0,
    pbiIssueTypeId: 389286
  })
  store.set(EnvState.atom, {
    projectKey: "BT",
    lang: "ja"
  })
  store.set(Api.atom, mockApi)
  initialValues.forEach(([atomConf, value]) => {
    store.set(atomConf, value)
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
