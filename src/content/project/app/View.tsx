import React from "react"
import { MessageBroker } from "../../../util/MessageBroker"
import { Modal } from "../../ui/Modal"
import { TabPanel } from "../../ui/TabPanel"
import { useProjectAppViewModel } from "./ViewModel"

import { ProjectProductBacklog } from "../productBacklog/View"
import { ProjectSettings } from "../settings/View"
import { PBFormInfo } from "../types"
import { i18n } from "./i18n"

type ProjectAppProps = {
  broker: MessageBroker<PBFormInfo>
}

export const ProjectApp: React.FC<ProjectAppProps> = (props) => {
  const { broker } = props
  const vm = useProjectAppViewModel()
  React.useEffect(() => {
    if (!vm.isReady) {
      broker.subscribe("Project", (formInfo) => {
        vm.start(formInfo)
      })
    }
    return () => {
      broker.unsubscribe("Project")
    }
  }, [vm, broker])

  if (vm.isReady) {
    const t = i18n(vm.lang)
    return (
      <Modal onClose={vm.clear} size="large" title={t.formTitle} height="calc(100vh - 200px)">
        <TabPanel
          tabs={[
            {
              label: t.productBacklog,
              component: () => <ProjectProductBacklog />
            },
            // {
            //   label: "ベロシティ",
            //   component: () => <DndTestView />
            // },
            {
              label: t.setting,
              component: () => <ProjectSettings />
            }
          ]}
          selectedIndex={vm.selectedTab}
          onTabClicked={vm.selectTab}
        />
      </Modal>
    )
  } else {
    return <></>
  }
}
