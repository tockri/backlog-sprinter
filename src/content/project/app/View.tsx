import produce from "immer"
import { Provider, useAtom, useAtomValue } from "jotai"
import React from "react"
import { MessageBroker } from "../../../util/MessageBroker"
import { BacklogApiContext } from "../../backlog/BacklogApiForReact"
import { IssueType } from "../../backlog/ProjectInfo"
import { Loading } from "../../ui/Loading"
import { Modal } from "../../ui/Modal"
import { TabPanel } from "../../ui/TabPanel"
import { ProjectFormInfo } from "../types"
import { i18n } from "./i18n"
import { appSettingAtom, backlogApiAtom, formInfoAtom, issueTypesAtom, projectAtom } from "./State"

type ProjectAppProps = {
  broker: MessageBroker<ProjectFormInfo>
}

export const ProjectApp: React.FC<ProjectAppProps> = (props) => {
  const { broker } = props
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
  if (formInfo) {
    const t = i18n(formInfo.lang)
    return (
      <Modal onClose={() => setFormInfo(null)} size="large" title={t.formTitle} height="calc(100vh - 200px)">
        <Provider
          initialValues={[
            [formInfoAtom, formInfo],
            [backlogApiAtom, api]
          ]}
        >
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
  const formInfo = useAtomValue(formInfoAtom)
  const [appSetting, setAppSetting] = useAtom(appSettingAtom)
  const project = useAtomValue(projectAtom)
  const t = i18n(formInfo.lang)
  return (
    <TabPanel
      tabs={[
        {
          label: t.productBacklog,
          component: () => <div>Project ID:{project.id}</div>
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
      selectedIndex={appSetting.selectedTab}
      onTabClicked={(tab) => {
        setAppSetting((s) => {
          s.selectedTab = tab
        })
      }}
    />
  )
}

const Inner2: React.FC = () => {
  const [issueTypes, setIssueTypes] = useAtom(issueTypesAtom)

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
