import { MessageBroker } from "@/util/MessageBroker"
import { Immutable, produce } from "immer"
import { createStore, useAtom, useAtomValue } from "jotai"
import React from "react"
import { BacklogApiContext } from "../../backlog/BacklogApiForReact"
import { ProjectEnv } from "../types"

import { ApiState } from "@/content/state/ApiState"
import { UserLang } from "@/content/types"
import { EnvState } from "./state/EnvState"
import { OrderCustomFieldState } from "./state/OrderCustomFieldState"
import { ProjectConfState, Tabs } from "./state/ProjectConfState"

type AppModel = {
  clear: () => void
  env: ProjectEnv | null
  jotaiStore: ReturnType<typeof createStore>
}

const jotaiStore = createStore()

export const useAppModel = (broker: MessageBroker<ProjectEnv>): AppModel => {
  const [env, setEnv] = React.useState<ProjectEnv | null>(null)
  const api = React.useContext(BacklogApiContext)

  React.useEffect(() => {
    if (!env) {
      jotaiStore.set(ApiState.atom, api)
      broker.subscribe("Project", (env) => {
        setEnv(env)
        jotaiStore.set(EnvState.atom, env)
      })
    }
    return () => {
      broker.unsubscribe("Project")
    }
  }, [env, broker, setEnv, api])
  return {
    clear: () => {
      setEnv(null)
    },
    env: env,
    jotaiStore
  }
}

type InnerModel = Immutable<{
  lang: UserLang
  selectedTab: Tabs
  setSelectedTab: (tab: number) => void
}>

export const useInnerModel = (): InnerModel => {
  const env = useAtomValue(EnvState.atom)
  const [config, setConfig] = useAtom(ProjectConfState.atom)
  const orderCustomField = useAtomValue(OrderCustomFieldState.atom)
  const selectedTab = orderCustomField ? config.selectedTab : Tabs.Settings
  return {
    lang: env.lang,
    selectedTab,
    setSelectedTab: (tab) =>
      setConfig(
        produce(config, (c) => {
          c.selectedTab = tab
        })
      )
  }
}
