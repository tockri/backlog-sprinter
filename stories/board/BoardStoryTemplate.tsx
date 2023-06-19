import styled from "@emotion/styled"
import { Immutable } from "immer"
import { createStore, Provider } from "jotai"
import React from "react"
import { BoardConfState } from "../../src/content/board/state/BoardConfState"
import { ApiState } from "../../src/content/state/ApiState"
import { BspConfState } from "../../src/content/state/BspConfState"
import { BspEnvState } from "../../src/content/state/BspEnvState"
import { Loading } from "../../src/content/ui/Loading"
import { MockApi } from "../../src/test/mock/MockApi"
import { MockBoardConf, MockBspConf } from "../../src/test/mock/MockConf"
import { MockEnv } from "../../src/test/mock/MockEnv"

type Store = ReturnType<typeof createStore>
type SetStore = Store["set"]

export type BoardStoryTemplateProps = Immutable<{
  initialValues?: (set: SetStore) => void
  children?: React.ReactNode
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
