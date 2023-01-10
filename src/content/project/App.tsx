import React, { useEffect } from "react"
import { MessageBroker } from "../../util/MessageBroker"
import { Modal } from "../ui/Modal"
import { TabPanel } from "../ui/TabPanel"
import { i18n } from "./i18n"
import { useProjectModel } from "./model"
import { PBFormInfo } from "./types"

type ProjectAppProps = {
  broker: MessageBroker<PBFormInfo>
}

export const ProjectApp: React.FC<ProjectAppProps> = (props) => {
  const { broker } = props
  const vm = useProjectModel()
  useEffect(() => {
    console.log({ vm })
    broker.subscribe("Project", async (formInfo) => {
      console.log({ formInfo }, "broker fired")
      vm.start(formInfo)
    })
    return () => {
      broker.unsubscribe("Project")
    }
  }, [broker, vm])
  const { formInfo, projectInfo } = vm.state
  if (formInfo && projectInfo) {
    const t = i18n(formInfo.lang)
    return (
      <Modal onCloseEvent={vm.clear} size="large" title={t.formTitle}>
        <TabPanel
          tabs={[
            {
              label: "プロダクトバックログ",
              component: () => <div className="modal__content">ばっくろぐ</div>
            },
            {
              label: "ベロシティ",
              component: () => <div className="modal__content">べろしてぃ</div>
            },
            {
              label: "設定",
              component: () => <div className="modal__content">せってい</div>
            }
          ]}
          selectedIndex={vm.state.selectedTab}
          onTabClicked={vm.selectTab}
        />
      </Modal>
    )
  } else {
    return (
      <>
        <span className="loading--circle -small"></span>
      </>
    )
  }
}
