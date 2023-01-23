import React from "react"
import { MessageBroker } from "../../../util/MessageBroker"
import { Modal } from "../../ui/Modal"
import { TabPanel } from "../../ui/TabPanel"
import { useProjectAppLogic } from "./Logic"

import { useAtom } from "jotai"
import { ProjectProductBacklog } from "../productBacklog/View"
import { ProjectSettings } from "../settings/View"
import { PBFormInfo } from "../types"
import { i18n } from "./i18n"
import { formInfoAtom } from "./State"

type ProjectAppProps = {
  broker: MessageBroker<PBFormInfo>
}

export const ProjectApp: React.FC<ProjectAppProps> = (props) => {
  const { broker } = props
  const [formInfo, setFormInfo] = useAtom(formInfoAtom)
  React.useEffect(() => {
    if (!formInfo) {
      broker.subscribe("Project", (formInfo) => {
        setFormInfo(formInfo)
      })
    }
    return () => {
      broker.unsubscribe("Project")
    }
  }, [formInfo, broker])
  if (formInfo) {
    const t = i18n(formInfo.lang)
    return (
      <Modal onClose={() => setFormInfo(null)} size="large" title={t.formTitle} height="calc(100vh - 200px)">
        projectKey = {formInfo.projectKey}
      </Modal>
    )
  } else {
    return <></>
  }
}

export const ProjectApp_orig: React.FC<ProjectAppProps> = (props) => {
  const { broker } = props
  const vm = useProjectAppLogic()
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
