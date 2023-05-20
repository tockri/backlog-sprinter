import { produce } from "immer"
import { useAtom, useAtomValue } from "jotai"

import { ModalState } from "@/content/state/ModalState"
import { BspEnv, BspEnvState } from "../state/BspEnvState"
import { OrderCustomFieldState } from "./state/OrderCustomFieldState"
import { ProjectConfState, Tabs } from "./state/ProjectConfState"

type AppModel = {
  clear: () => void
  env: BspEnv
  modalOpen: boolean
}

export const useAppModel = (): AppModel => {
  const env = useAtomValue(BspEnvState.atom)
  const [modalOpen, setModal] = useAtom(ModalState.atom)

  return {
    clear: () => {
      setModal(false)
    },
    env,
    modalOpen
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
