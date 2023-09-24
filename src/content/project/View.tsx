import { useAtom, useAtomValue } from "jotai"
import React from "react"
import { BspEnvState } from "../state/BspEnvState"
import { ModalState } from "../state/ModalState"
import { Loading } from "../ui/Loading"
import { Modal } from "../ui/Modal"
import { TabPanel } from "../ui/TabPanel"
import { i18n } from "./i18n"
import { ProductBacklogView } from "./productBacklog/View"
import { ProjectSettings } from "./settings/View"
import { SprintView } from "./sprint/View"
import { StatView } from "./stat/View"
import { OrderCustomFieldState } from "./state/OrderCustomFieldState"
import { ProjectConfState, Tabs } from "./state/ProjectConfState"

export const ProjectApp: React.FC = () => {
  const env = useAtomValue(BspEnvState.atom)
  const [modalOpen, setModal] = useAtom(ModalState.atom)

  if (env.projectKey && modalOpen) {
    const t = i18n(env.lang)
    return (
      <Modal onClose={() => setModal(false)} size="large" title={t.formTitle} height="calc(100vh - 200px)">
        <React.Suspense fallback={<Loading />}>
          <Inner />
        </React.Suspense>
      </Modal>
    )
  } else {
    return <></>
  }
}

const Inner: React.FC = () => {
  const env = useAtomValue(BspEnvState.atom)
  const [config, setConfig] = useAtom(ProjectConfState.atom)
  const orderCustomField = useAtomValue(OrderCustomFieldState.atom)
  const selectedTab = orderCustomField ? config.selectedTab : Tabs.Settings
  const t = i18n(env.lang)

  return (
    <TabPanel
      tabs={[
        {
          label: t.productBacklog,
          component: ProductBacklogView
        },
        {
          label: t.sprint,
          component: SprintView
        },
        {
          label: t.stat,
          component: StatView
        },
        {
          label: t.setting,
          component: ProjectSettings
        }
      ]}
      selectedIndex={selectedTab}
      onTabClicked={(tab) => setConfig((curr) => ({ ...curr, selectedTab: tab }))}
    />
  )
}
