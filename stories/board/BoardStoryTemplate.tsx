import { BoardConfState } from "@/content/board/state/BoardConfState"

import { ApiState } from "@/content/state/ApiState"
import { BspConfState } from "@/content/state/BspConfState"
import { BspEnvState } from "@/content/state/BspEnvState"
import { Loading } from "@/content/ui/Loading"
import styled from "@emotion/styled"
import { MockApi } from "@test/mock/MockApi"
import { MockBoardConf, MockBspConf } from "@test/mock/MockConf"
import { MockEnv } from "@test/mock/MockEnv"
import { Immutable } from "immer"
import { createStore, Provider } from "jotai"
import React from "react"

type Store = ReturnType<typeof createStore>
type SetStore = Store["set"]

export type BoardStoryTemplateProps = Immutable<{
  initialValues?: (set: SetStore) => void
  children: React.ReactNode
}>

export const BoardStoryTemplate: React.FC<BoardStoryTemplateProps> = ({ initialValues, children }) => {
  const store = createStore()
  store.set(BspEnvState.atom, MockEnv)
  store.set(BoardConfState.atom, MockBoardConf)
  store.set(BspConfState.atom, MockBspConf)
  store.set(ApiState.atom, MockApi)
  initialValues && initialValues(store.set)
  return (
    <Provider store={store}>
      <React.Suspense fallback={<Loading />}>
        <Root style={{ height: 600, width: 600, display: "flex" }}>{children}</Root>
      </React.Suspense>
    </Provider>
  )
}

const Root = styled.div({
  border: "20px solid #e0e0e0",
  " *": {
    fontSize: 13
  }
})
