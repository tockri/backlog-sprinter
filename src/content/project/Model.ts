import { produce } from "immer"
import { useAtom, useAtomValue } from "jotai"

import { BspEnv, BspEnvState } from "../state/BspEnvState"
import { OrderCustomFieldState } from "./state/OrderCustomFieldState"
import { ProjectConfState, Tabs } from "./state/ProjectConfState"

type AppModel = {
  clear: () => void
  env: BspEnv
}

export const useAppModel = (): AppModel => {
  const [env, setEnv] = useAtom(BspEnvState.atom)

  return {
    clear: () => {
      setEnv({ ...env, projectKey: "" })
    },
    env
  }
}

type InnerModel = {
  env: BspEnv
  selectedTab: Tabs
  setSelectedTab: (tab: number) => void
}

export const useInnerModel = (): InnerModel => {
  const env = useAtomValue(BspEnvState.atom)
  const [config, setConfig] = useAtom(ProjectConfState.atom)
  const orderCustomField = useAtomValue(OrderCustomFieldState.atom)
  const selectedTab = orderCustomField ? config.selectedTab : Tabs.Settings
  return {
    env,
    selectedTab,
    setSelectedTab: (tab) =>
      setConfig(
        produce(config, (c) => {
          c.selectedTab = tab
        })
      )
  }
}
