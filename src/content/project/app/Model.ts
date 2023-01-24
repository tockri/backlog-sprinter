import { Atom, useAtom, useAtomValue } from "jotai"
import React from "react"
import { MessageBroker } from "../../../util/MessageBroker"
import { BacklogApiContext } from "../../backlog/BacklogApiForReact"
import { ProjectFormInfo, UserLang } from "../types"
import { appSettingAtom, backlogApiAtom, formInfoAtom, orderCustomFieldAtom, Tabs } from "./State"

type AppModel = {
  clear: () => void
  formInfo: ProjectFormInfo | null
  providerInitialValues: Iterable<[Atom<unknown>, unknown]>
}

export const useAppModel = (broker: MessageBroker<ProjectFormInfo>): AppModel => {
  const [formInfo, setFormInfo] = React.useState<ProjectFormInfo | null>(null)
  const api = React.useContext(BacklogApiContext)
  React.useEffect(() => {
    if (!formInfo) {
      broker.subscribe("Project", (formInfo) => {
        setFormInfo(formInfo)
      })
    }
    return () => {
      broker.unsubscribe("Project")
    }
  }, [formInfo, broker, setFormInfo])
  return {
    clear: () => {
      setFormInfo(null)
    },
    formInfo,
    providerInitialValues: formInfo
      ? [
          [formInfoAtom, formInfo],
          [backlogApiAtom, api]
        ]
      : []
  }
}

type InnerModel = {
  lang: UserLang
  selectedTab: Tabs
  setSelectedTab: (tab: number) => void
}
export const useInnerModel = (): InnerModel => {
  const formInfo = useAtomValue(formInfoAtom)
  const [appSetting, setAppSetting] = useAtom(appSettingAtom)
  const orderCustomField = useAtomValue(orderCustomFieldAtom)
  const selectedTab = orderCustomField ? appSetting.selectedTab : Tabs.Settings
  return {
    lang: formInfo.lang,
    selectedTab,
    setSelectedTab: (tab) =>
      setAppSetting((c) => {
        c.selectedTab = tab
      })
  }
}
