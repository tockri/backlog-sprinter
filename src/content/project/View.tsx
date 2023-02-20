import { Provider } from "jotai"
import React from "react"
import { MessageBroker } from "../../util/MessageBroker"
import { BspEnv } from "../types"
import { Loading } from "../ui/Loading"
import { Modal } from "../ui/Modal"
import { TabPanel } from "../ui/TabPanel"
import { i18n } from "./i18n"
import { useAppModel, useInnerModel } from "./Model"
import { ProductBacklogView } from "./productBacklog/View"
import { ProjectSettings } from "./settings/View"
import { StatView } from "./stat/View"

type ProjectAppProps = {
  broker: MessageBroker<BspEnv>
}

export const ProjectApp: React.FC<ProjectAppProps> = ({ broker }) => {
  const model = useAppModel(broker)
  const env = model.env
  if (env) {
    const t = i18n(env.lang)
    return (
      <Modal onClose={model.clear} size="large" title={t.formTitle} height="calc(100vh - 200px)">
        <Provider store={model.jotaiStore}>
          <React.Suspense fallback={<Loading />}>
            <Inner />
          </React.Suspense>
        </Provider>
      </Modal>
    )
  } else {
    return <></>
  }
}

const Inner: React.FC = () => {
  const model = useInnerModel()
  const t = i18n(model.lang)
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
