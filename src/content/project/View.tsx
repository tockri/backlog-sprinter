import React from "react"
import { Loading } from "../ui/Loading"
import { Modal } from "../ui/Modal"
import { TabPanel } from "../ui/TabPanel"
import { i18n } from "./i18n"
import { useAppModel, useInnerModel } from "./Model"
import { ProductBacklogView } from "./productBacklog/View"
import { ProjectSettings } from "./settings/View"
import { StatView } from "./stat/View"

export const ProjectApp: React.FC = () => {
  const model = useAppModel()
  const env = model.env
  if (env.projectKey && model.modalOpen) {
    const t = i18n(env.lang)
    return (
      <Modal onClose={model.clear} size="large" title={t.formTitle} height="calc(100vh - 200px)">
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
  const model = useInnerModel()
  const env = model.env
  const t = i18n(env.lang)

  return (
    <TabPanel
      tabs={[
        {
          label: t.productBacklog,
          component: () => <ProductBacklogView />
        },
        {
          label: t.stat,
          component: () => <StatView />
        },
        {
          label: t.setting,
          component: () => <ProjectSettings />
        }
      ]}
      selectedIndex={model.selectedTab}
      onTabClicked={model.setSelectedTab}
    />
  )
}
