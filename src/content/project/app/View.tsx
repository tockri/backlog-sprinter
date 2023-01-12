import React, { useEffect } from "react"
import { MessageBroker } from "../../../util/MessageBroker"
import { Modal } from "../../ui/Modal"
import { TabPanel } from "../../ui/TabPanel"
import { i18n } from "../common/i18n"
import { useProjectAppViewModel } from "./ViewModel"

import { ProjectProductBacklog } from "../productBacklog/View"
import { ProjectSettings } from "../settings/View"
import { PBFormInfo } from "../types"

type ProjectAppProps = {
  broker: MessageBroker<PBFormInfo>
}

export const ProjectApp: React.FC<ProjectAppProps> = (props) => {
  const { broker } = props
  const vm = useProjectAppViewModel()
  useEffect(() => {
    broker.subscribe("Project", async (formInfo) => {
      await vm.start(formInfo)
    })
    return () => {
      broker.unsubscribe("Project")
    }
  }, [broker, vm])
  if (vm.isReady) {
    const t = i18n(vm.lang)
    return (
      <Modal onClose={vm.clear} size="large" title={t.formTitle} height="calc(100vh - 200px)">
        <TabPanel
          tabs={[
            {
              label: "プロダクトバックログ",
              component: () => <ProjectProductBacklog />
            },
            {
              label: "ベロシティ",
              component: () => <div className="modal__content">べろしてぃ</div>
            },
            {
              label: "設定",
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
