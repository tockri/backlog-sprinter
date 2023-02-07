import { Immutable } from "immer"
import { Atom, useAtom, useAtomValue } from "jotai"
import React from "react"
import { MessageBroker } from "../../../util/MessageBroker"
import { BacklogApiContext } from "../../backlog/BacklogApiForReact"
import { ProjectEnv, UserLang } from "../types"
import { Api } from "./state/Api"
import { AppConfState, Tabs } from "./state/AppConfState"
import { EnvState } from "./state/EnvState"
import { OrderCustomFieldState } from "./state/OrderCustomFieldState"

type AppModel = {
  clear: () => void
  formInfo: ProjectEnv | null
  providerInitialValues: Iterable<[Atom<unknown>, unknown]>
}

export const useAppModel = (broker: MessageBroker<ProjectEnv>): AppModel => {
  const [env, setEnv] = React.useState<ProjectEnv | null>(null)
  const api = React.useContext(BacklogApiContext)
  React.useEffect(() => {
    if (!env) {
      broker.subscribe("Project", (formInfo) => {
        setEnv(formInfo)
      })
    }
    return () => {
      broker.unsubscribe("Project")
    }
  }, [env, broker, setEnv])
  return {
    clear: () => {
      setEnv(null)
    },
    formInfo: env,
    providerInitialValues: env
      ? [
          [EnvState.atom, env],
          [Api.atom, api]
        ]
      : []
  }
}

type InnerModel = Immutable<{
  lang: UserLang
  selectedTab: Tabs
  setSelectedTab: (tab: number) => void
}>

export const useInnerModel = (): InnerModel => {
  const env = useAtomValue(EnvState.atom)
  const [config, setConfig] = useAtom(AppConfState.atom)
  const orderCustomField = useAtomValue(OrderCustomFieldState.atom)
  const selectedTab = orderCustomField ? config.selectedTab : Tabs.Settings
  return {
    lang: env.lang,
    selectedTab,
    setSelectedTab: (tab) =>
      setConfig((c) => {
        c.selectedTab = tab
      })
  }
}
