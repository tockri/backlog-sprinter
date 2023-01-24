import produce from "immer"
import { Provider, useAtom, useAtomValue } from "jotai"
import React from "react"
import { MessageBroker } from "../../../util/MessageBroker"
import { IssueType } from "../../backlog/ProjectInfo"
import { Loading } from "../../ui/Loading"
import { Modal } from "../../ui/Modal"
import { TabPanel } from "../../ui/TabPanel"
import { ProjectFormInfo } from "../types"
import { i18n } from "./i18n"
import { useAppModel, useInnerModel } from "./Model"
import { issueTypesAtom, orderCustomFieldAtom } from "./State"

type ProjectAppProps = {
  broker: MessageBroker<ProjectFormInfo>
}

export const ProjectApp: React.FC<ProjectAppProps> = ({ broker }) => {
  const model = useAppModel(broker)
  const formInfo = model.formInfo
  if (formInfo) {
    const t = i18n(formInfo.lang)
    return (
      <Modal onClose={model.clear} size="large" title={t.formTitle} height="calc(100vh - 200px)">
        <Provider initialValues={model.providerInitialValues}>
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
          component: () => <div>ぷろだくとー</div>
        },
        // {
        //   label: "ベロシティ",
        //   component: () => <DndTestView />
        // },
        {
          label: t.setting,
          component: () => <Inner2 />
        }
      ]}
      selectedIndex={model.selectedTab}
      onTabClicked={model.setSelectedTab}
    />
  )
}

const Inner2: React.FC = () => {
  const [issueTypes, setIssueTypes] = useAtom(issueTypesAtom)
  const orderCustomField = useAtomValue(orderCustomFieldAtom)

  const clicked = () => {
    const created: IssueType = {
      id: 1,
      projectId: 1,
      name: "created",
      color: "#ff0000",
      displayOrder: 0,
      templateSummary: "",
      templateDescription: ""
    }
    setIssueTypes(
      produce(issueTypes, (it) => {
        it.splice(0, 0, created)
      })
    )
  }
  return (
    <div>
      <div>カスタム属性：{orderCustomField?.name}</div>
      <button type="button" onClick={clicked}>
        Add
      </button>
      <ul>
        {issueTypes.map((it, idx) => (
          <li key={idx}>{it.name}</li>
        ))}
      </ul>
    </div>
  )
}
