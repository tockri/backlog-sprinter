import React, { useEffect } from "react"
import { ProjectInfo, ProjectInfoData } from "../backlog/ProjectInfo"

import { Modal } from "../ui/Modal"
import { MessageBroker } from "../util/MessageBroker"
import { i18n, UserLang as i18nLang } from "./i18n"
import { MilestoneForm } from "./milestoneForm/Form"
import * as types from "./types"

export type FormInfo = types.FormInfo
export type Lang = i18nLang

type BoardProps = {
  broker: MessageBroker<FormInfo>
}

const reloadOnMilestoneId = (milestoneId: number) => {
  const url = new URL(location.href)
  url.searchParams.set("milestone", "" + milestoneId)
  location.href = url.href
}

type State = {
  formInfo: FormInfo | null
  projectInfo: ProjectInfoData | null
}

export const BoardApp: React.FC<BoardProps> = (props) => {
  const { broker } = props
  const [state, setState] = React.useState<State>({ formInfo: null, projectInfo: null })
  useEffect(() => {
    broker.subscribe("Board", async (formInfo) => {
      if (!state.projectInfo) {
        const projectInfo = await ProjectInfo.get(formInfo.projectKey)
        setState({
          formInfo,
          projectInfo
        })
      } else {
        setState((s) => ({ ...s, formInfo }))
      }
    })
    return () => {
      broker.unsubscribe("Board")
    }
  }, [broker, state.projectInfo])

  if (state.formInfo && state.projectInfo) {
    const t = i18n(state.formInfo.lang)
    return (
      <Modal
        onCloseEvent={() => setState((s) => ({ ...s, formInfo: null }))}
        size="medium"
        title={t.formTitle}
        additionalClass={state.formInfo?.selectedMilestoneId > 0 ? "bsp-milestone-large-form" : undefined}
      >
        <MilestoneForm formInfo={state.formInfo} projectInfo={state.projectInfo} onSuccess={reloadOnMilestoneId} />
      </Modal>
    )
  } else {
    return <></>
  }
}
