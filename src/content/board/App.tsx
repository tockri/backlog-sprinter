import React, { useEffect } from "react"
import { ProjectInfoWithMilestones } from "../backlog/ProjectInfoApi"

import { MessageBroker } from "../../util/MessageBroker"
import { BacklogApiContext } from "../backlog/BacklogApiForReact"
import { Modal } from "../ui/Modal"
import { i18n, UserLang as i18nLang } from "./i18n"
import { MilestoneForm } from "./milestoneForm/Form"
import * as types from "./types"

export type FormInfo = types.MilestoneFormInfo
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
  projectInfo: ProjectInfoWithMilestones | null
}

export const BoardApp: React.FC<BoardProps> = (props) => {
  const { broker } = props
  const [state, setState] = React.useState<State>({ formInfo: null, projectInfo: null })
  const api = React.useContext(BacklogApiContext)
  useEffect(() => {
    broker.subscribe("Board", async (formInfo) => {
      if (!state.projectInfo) {
        const projectInfo = await api.projectInfo.getProjectInfoWithMilestones(formInfo.projectKey)
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
  }, [broker, state.projectInfo, api])

  if (state.formInfo && state.projectInfo) {
    const t = i18n(state.formInfo.lang)
    return (
      <Modal
        onClose={() => setState((s) => ({ ...s, formInfo: null }))}
        size="medium"
        title={t.formTitle}
        height={state.formInfo?.selectedMilestoneId > 0 ? 450 : undefined}
      >
        <MilestoneForm formInfo={state.formInfo} projectInfo={state.projectInfo} onSuccess={reloadOnMilestoneId} />
      </Modal>
    )
  } else {
    return <></>
  }
}
